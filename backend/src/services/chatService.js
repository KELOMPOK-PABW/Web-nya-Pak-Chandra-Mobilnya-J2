const chatRepository = require("../repository/chatRepository");
const productRepository = require("../repository/productRepository");
const productService = require("./productService");
const llmService = require("./llmService");

const CATALOG_SNAPSHOT_SIZE = 30;
const HISTORY_SIZE = 10;

const formatMessage = (msg, hydratedProducts, entities) => ({
  id: msg.id,
  session_id: msg.sessionId,
  role: msg.role,
  content: msg.content,
  intent: msg.intent || null,
  entities: entities || msg.entities || null,
  suggested_products: hydratedProducts || [],
  created_at: msg.createdAt,
});

const fetchProductsContext = async () => {
  try {
    return await productRepository.getAllProducts({ skip: 0, take: CATALOG_SNAPSHOT_SIZE });
  } catch (e) {
    return [];
  }
};

const hydrateProducts = (products, ids) => {
  if (!ids || ids.length === 0) return [];
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean).map(productService.formatProductByIdResponse);
};

/**
 * Fallback: when add_to_cart has entities.product but LLM returned no suggested_product_ids,
 * search catalog by name match.
 */
const findProductIdsByEntityName = (products, productName) => {
  if (!productName || !products || products.length === 0) return [];
  const name = productName.toLowerCase().trim();
  const matched = products.filter((p) => p.name?.toLowerCase().includes(name) || name.includes(p.name?.toLowerCase()));
  // Limit to top 1-2 most relevant
  return matched.slice(0, 2).map((p) => p.id);
};

const messagesToHistory = (messages) =>
  messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

const runLlmChat = async ({ userId, message, history, sessionId }) => {
  if (!message || !message.trim()) {
    throw new Error("Pesan tidak boleh kosong");
  }

  let session;
  let convo = Array.isArray(history) ? history.slice(-HISTORY_SIZE) : [];

  if (sessionId) {
    session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
    if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");
    const recent = await chatRepository.getRecentMessages(session.id, HISTORY_SIZE);
    convo = messagesToHistory(recent);
  } else {
    // Create a new session so the frontend can maintain continuity
    session = await chatRepository.createSession({
      userId: Number(userId),
      title: message.slice(0, 80),
    });
  }

  const productsContext = await fetchProductsContext();

  const llmResult = await llmService.classifyAndSuggest({
    message,
    history: convo,
    productsContext,
  });

  // Safety: add_to_cart without specific product entity → clear suggested IDs (prevent wrong auto-add)
  if (llmResult.intent === "add_to_cart" && !llmResult.entities?.product) {
    llmResult.suggested_product_ids = [];
  }

  // Fallback: add_to_cart with named product but no IDs from LLM → search catalog by name
  if (llmResult.intent === "add_to_cart" && llmResult.suggested_product_ids.length === 0 && llmResult.entities?.product) {
    const fallbackIds = findProductIdsByEntityName(productsContext, llmResult.entities.product);
    if (fallbackIds.length > 0) {
      llmResult.suggested_product_ids = fallbackIds;
    }
  }

  // Store the user message and assistant message for server-side history
  await chatRepository.addMessage({
    sessionId: session.id,
    role: "user",
    content: message,
  });

  await chatRepository.addMessage({
    sessionId: session.id,
    role: "assistant",
    content: llmResult.reply,
    intent: llmResult.intent,
    suggestedProductIds: llmResult.suggested_product_ids,
    entities: llmResult.entities,
  });

  await chatRepository.touchSession(session.id);

  return {
    session_id: session.id,
    intent: llmResult.intent,
    reply: llmResult.reply,
    entities: llmResult.entities,
    follow_up_suggestions: llmResult.follow_up_suggestions || [],
    suggested_products: hydrateProducts(productsContext, llmResult.suggested_product_ids),
  };
};

const sendMessage = async ({ userId, sessionId, message }) => {
  if (!message || !message.trim()) {
    throw new Error("Pesan tidak boleh kosong");
  }

  let session;
  if (sessionId) {
    session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
    if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");
  } else {
    session = await chatRepository.createSession({
      userId: Number(userId),
      title: message.slice(0, 80),
    });
  }

  const userMessage = await chatRepository.addMessage({
    sessionId: session.id,
    role: "user",
    content: message,
  });

  const recent = await chatRepository.getRecentMessages(session.id, HISTORY_SIZE);
  const history = messagesToHistory(recent.filter((m) => m.id !== userMessage.id));

  const productsContext = await fetchProductsContext();

  const llmResult = await llmService.classifyAndSuggest({
    message,
    history,
    productsContext,
  });

  // Safety: add_to_cart without specific product entity → clear suggested IDs
  if (llmResult.intent === "add_to_cart" && !llmResult.entities?.product) {
    llmResult.suggested_product_ids = [];
  }

  // Fallback: add_to_cart with named product but no IDs from LLM → search catalog by name
  if (llmResult.intent === "add_to_cart" && llmResult.suggested_product_ids.length === 0 && llmResult.entities?.product) {
    const fallbackIds = findProductIdsByEntityName(productsContext, llmResult.entities.product);
    if (fallbackIds.length > 0) {
      llmResult.suggested_product_ids = fallbackIds;
    }
  }

  const assistantMessage = await chatRepository.addMessage({
    sessionId: session.id,
    role: "assistant",
    content: llmResult.reply,
    intent: llmResult.intent,
    suggestedProductIds: llmResult.suggested_product_ids,
    entities: llmResult.entities,
  });

  await chatRepository.touchSession(session.id);

  const hydrated = hydrateProducts(productsContext, llmResult.suggested_product_ids);

  return {
    session_id: session.id,
    user_message: formatMessage(userMessage, []),
    assistant_message: {
      ...formatMessage(assistantMessage, hydrated, llmResult.entities),
      follow_up_suggestions: llmResult.follow_up_suggestions || [],
    },
  };
};

const getUserSessions = async (userId) => {
  const rows = await chatRepository.findSessionsByUser(Number(userId));
  return rows.map((s) => ({
    id: s.id,
    title: s.title || "Percakapan baru",
    message_count: s._count?.messages ?? 0,
    last_message: s.messages?.[0]?.content?.slice(0, 80) || null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }));
};

const getSessionMessages = async (userId, sessionId) => {
  const session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
  if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");

  const messages = await chatRepository.getSessionMessages(session.id, 100);
  const productsContext = await fetchProductsContext();

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    intent: msg.intent || null,
    entities: msg.entities || null,
    suggested_products: hydrateProducts(productsContext, msg.suggestedProductIds || []),
    created_at: msg.createdAt,
  }));
};

const deleteSession = async (userId, sessionId) => {
  const session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
  if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");

  await chatRepository.deleteSession(session.id, Number(userId));
  return { deleted: true };
};

module.exports = {
  runLlmChat,
  sendMessage,
  getUserSessions,
  getSessionMessages,
  deleteSession,
};
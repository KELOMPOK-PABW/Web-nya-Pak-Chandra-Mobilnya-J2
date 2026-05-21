const chatRepository = require("../repository/chatRepository");
const productRepository = require("../repository/productRepository");
const productService = require("./productService");
const llmService = require("./llmService");

const CATALOG_SNAPSHOT_SIZE = 30;
const HISTORY_SIZE = 10;

const formatMessage = (msg, hydratedProducts) => ({
  id: msg.id,
  session_id: msg.sessionId,
  role: msg.role,
  content: msg.content,
  intent: msg.intent || null,
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

const messagesToHistory = (messages) =>
  messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

const runLlmChat = async ({ userId, message, history, sessionId }) => {
  if (!message || !message.trim()) {
    throw new Error("Pesan tidak boleh kosong");
  }

  let convo = Array.isArray(history) ? history.slice(-HISTORY_SIZE) : [];

  if (sessionId) {
    const session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
    if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");
    const recent = await chatRepository.getRecentMessages(session.id, HISTORY_SIZE);
    convo = messagesToHistory(recent);
  }

  const productsContext = await fetchProductsContext();

  const llmResult = await llmService.classifyAndSuggest({
    message,
    history: convo,
    productsContext,
  });

  return {
    intent: llmResult.intent,
    reply: llmResult.reply,
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

  const assistantMessage = await chatRepository.addMessage({
    sessionId: session.id,
    role: "assistant",
    content: llmResult.reply,
    intent: llmResult.intent,
    suggestedProductIds: llmResult.suggested_product_ids,
  });

  await chatRepository.touchSession(session.id);

  const hydrated = hydrateProducts(productsContext, llmResult.suggested_product_ids);

  return {
    session_id: session.id,
    user_message: formatMessage(userMessage, []),
    assistant_message: formatMessage(assistantMessage, hydrated),
  };
};

module.exports = {
  runLlmChat,
  sendMessage,
};

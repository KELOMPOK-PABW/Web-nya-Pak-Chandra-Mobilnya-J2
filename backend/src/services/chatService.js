const chatRepository = require("../repository/chatRepository");
const productRepository = require("../repository/productRepository");
const productService = require("./productService");
const llmService = require("./llmService");
const { expandKeywords, detectKeywordsViaSynonyms } = require("../utils/synonyms");

const CATALOG_SNAPSHOT_SIZE = 50;
const CATALOG_FILTERED_SIZE = 100;
const HISTORY_SIZE = 10;
const MAX_SESSIONS_PER_USER = 5;

// Brand + product type keywords for catalog filtering.
// Covers Indonesian + English terms and major brand names so queries like
// "apple computer" or "sepatu nike" match all relevant tokens.
const PRODUCT_KEYWORDS = [
  // ── Product types (Indonesian + English) ──
  "laptop", "komputer", "computer", "smartphone", "hp", "handphone", "phone",
  "sepatu", "shoes", "sneakers", "baju", "clothes", "kaos", "kemeja", "dress",
  "tas", "bag", "jam", "watch", "parfum", "fragrance",
  "furniture", "meja", "kursi",
  "makeup", "skincare", "kecantikan",
  "motor", "mobil",
  "aksesoris", "accessories",
  "olahraga", "sports",
  "elektronik", "electronics", "tablet", "gaming",
  // ── Brand names ──
  "iphone", "macbook", "apple",
  "samsung", "xiaomi", "oppo", "vivo", "google", "microsoft",
  "asus", "lenovo", "acer", "dell", "hp",
  "sony", "nintendo", "playstation",
  "nike", "adidas", "puma", "converse", "h&m", "zara", "uniqlo",
  // ── Motorcycle brands ──
  "honda", "yamaha", "kawasaki", "suzuki", "ducati", "bmw",
];

/**
 * Find ALL brand/product-type keywords present in the message — including synonyms.
 *
 * Uses synonym-aware matching: "notebook" maps to "laptop", "pc" maps to "komputer",
 * so user queries using variant terms still trigger the right catalog filter.
 *
 * Returns an array of matched canonical keywords (empty = no match).
 * All matches are returned so multi-token queries like "apple computer" or "sepatu nike"
 * expand the catalog search scope.
 */
const detectKeywords = (message) => {
  return detectKeywordsViaSynonyms(message, PRODUCT_KEYWORDS);
};

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

const fetchProductsContext = async (message) => {
  try {
    const keywords = detectKeywords(message);
    const opts = { skip: 0, take: CATALOG_SNAPSHOT_SIZE };
    if (keywords.length > 0) {
      opts.keywords = keywords;
      opts.take = CATALOG_FILTERED_SIZE;
    }
    return await productRepository.getAllProducts(opts);
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

const enforceSessionLimit = async (userId) => {
  const count = await chatRepository.countSessionsByUser(Number(userId));
  if (count >= MAX_SESSIONS_PER_USER) {
    await chatRepository.deleteOldestSession(Number(userId));
  }
};

// ── Shared LLM pipeline ─────────────────────────────────────────────
// Calls the LLM, applies add_to_cart safety rules, stores the assistant
// message, touches the session, and hydrates suggested products.
const _callLlmAndPersist = async ({ session, message, history, productsContext, role }) => {
  const llmResult = await llmService.classifyAndSuggest({
    message,
    history,
    productsContext,
    role,
  });

  // Safety: add_to_cart without specific product entity → clear suggested IDs
  if (llmResult.intent === "add_to_cart" && !llmResult.entities?.product) {
    llmResult.suggested_product_ids = [];
  }

  // Helper: fallback search — first in-memory, then direct DB
  const _fallbackByProductEntity = async (productName) => {
    // Try in-memory catalog first
    const fromCatalog = findProductIdsByEntityName(productsContext, productName);
    if (fromCatalog.length > 0) return fromCatalog;

    // Not found in catalog — query DB directly with full name + first word
    try {
      const nameWords = productName.toLowerCase().trim().split(/\s+/);
      const searchTerms = [productName.trim(), nameWords[0]].filter(Boolean);
      const dbProducts = await productRepository.getAllProducts({
        skip: 0,
        take: 10,
        keywords: searchTerms,
      });
      return dbProducts.slice(0, 3).map((p) => p.id);
    } catch {
      return [];
    }
  };

  // Fallback: add_to_cart with named product but no IDs → search (catalog then DB)
  if (
    llmResult.intent === "add_to_cart" &&
    llmResult.suggested_product_ids.length === 0 &&
    llmResult.entities?.product
  ) {
    const fallbackIds = await _fallbackByProductEntity(llmResult.entities.product);
    if (fallbackIds.length > 0) {
      llmResult.suggested_product_ids = fallbackIds;
    }
  }

  // Fallback: search_product with named product but no IDs → search (catalog then DB)
  if (
    llmResult.intent === "search_product" &&
    llmResult.suggested_product_ids.length === 0 &&
    llmResult.entities?.product
  ) {
    const fallbackIds = await _fallbackByProductEntity(llmResult.entities.product);
    if (fallbackIds.length > 0) {
      llmResult.suggested_product_ids = fallbackIds;
    }
  }

  // Safety: add_to_cart with MULTIPLE ambiguous products → ask user to pick
  // (Frontend will show product cards with per-item add buttons instead of a single button)
  if (llmResult.intent === "add_to_cart" && llmResult.suggested_product_ids.length > 1) {
    llmResult.reply = "Ada beberapa produk yang cocok. Yang mana yang ingin Anda tambahkan ke keranjang?";
    // Keep suggested_product_ids so frontend renders selectable product cards
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

  // If fallback found products outside original context, fetch from DB
  let hydrated = hydrateProducts(productsContext, llmResult.suggested_product_ids);
  if (hydrated.length < llmResult.suggested_product_ids.length) {
    try {
      const missingIds = llmResult.suggested_product_ids.filter(
        (id) => !hydrated.some((h) => h.id === id)
      );
      for (const id of missingIds) {
        const product = await productRepository.findProductById(id);
        if (product) {
          hydrated.push(productService.formatProductByIdResponse(product));
        }
      }
    } catch {
      // Best-effort — keep what we have
    }
  }

  return {
    llmResult,
    assistantMessage,
    hydrated,
  };
};

// ── Resolve (or create) a chat session for a user ──────────────────
const _resolveSession = async ({ userId, sessionId, message }) => {
  if (sessionId) {
    const session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
    if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");
    return session;
  }

  await enforceSessionLimit(userId);
  return chatRepository.createSession({
    userId: Number(userId),
    title: message.slice(0, 80),
  });
};

// ── Public API ─────────────────────────────────────────────────────

const runLlmChat = async ({ userId, message, history, sessionId, role }) => {
  if (!message || !message.trim()) {
    throw new Error("Pesan tidak boleh kosong");
  }

  const session = await _resolveSession({ userId, sessionId, message });

  let convo = Array.isArray(history) ? history.slice(-HISTORY_SIZE) : [];
  if (sessionId) {
    const recent = await chatRepository.getRecentMessages(session.id, HISTORY_SIZE);
    convo = messagesToHistory(recent);
  }

  const productsContext = await fetchProductsContext(message);

  // Persist user message *after* building convo (so it doesn't appear in history for this turn)
  await chatRepository.addMessage({
    sessionId: session.id,
    role: "user",
    content: message,
  });

  const { llmResult, hydrated } = await _callLlmAndPersist({
    session,
    message,
    history: convo,
    productsContext,
    role,
  });

  return {
    session_id: session.id,
    intent: llmResult.intent,
    reply: llmResult.reply,
    entities: llmResult.entities,
    follow_up_suggestions: llmResult.follow_up_suggestions || [],
    suggested_products: hydrated,
  };
};

const sendMessage = async ({ userId, sessionId, message, role }) => {
  if (!message || !message.trim()) {
    throw new Error("Pesan tidak boleh kosong");
  }

  const session = await _resolveSession({ userId, sessionId, message });

  const userMessage = await chatRepository.addMessage({
    sessionId: session.id,
    role: "user",
    content: message,
  });

  const recent = await chatRepository.getRecentMessages(session.id, HISTORY_SIZE);
  const history = messagesToHistory(recent.filter((m) => m.id !== userMessage.id));

  const productsContext = await fetchProductsContext(message);

  const { llmResult, assistantMessage, hydrated } = await _callLlmAndPersist({
    session,
    message,
    history,
    productsContext,
    role,
  });

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
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }));
};

const createSession = async (userId, title) => {
  await enforceSessionLimit(userId);

  const session = await chatRepository.createSession({
    userId: Number(userId),
    title: title.trim(),
  });

  return {
    id: session.id,
    title: session.title || title.trim(),
    created_at: session.createdAt,
  };
};

const getSessionMessages = async (userId, sessionId) => {
  const session = await chatRepository.findSessionByIdForUser(Number(sessionId), Number(userId));
  if (!session) throw new Error("Akses ditolak: sesi bukan milik Anda");

  const messages = await chatRepository.getSessionMessages(session.id, 100);

  return messages.map((msg) => ({
    id: msg.id,
    sender: msg.role,
    message: msg.content,
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
  createSession,
  getSessionMessages,
  deleteSession,
};
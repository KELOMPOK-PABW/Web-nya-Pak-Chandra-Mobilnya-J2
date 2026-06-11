const chatService = require("../../src/services/chatService");
const chatRepository = require("../../src/repository/chatRepository");
const productRepository = require("../../src/repository/productRepository");
const llmService = require("../../src/services/llmService");

jest.mock("../../src/repository/chatRepository");
jest.mock("../../src/repository/productRepository");
jest.mock("../../src/services/llmService");

const catalog = [
  {
    id: 1,
    name: "Laptop A",
    description: "deskripsi",
    price: 5000000,
    stock: 3,
    imageUrl: "",
    category: { id: 1, name: "Elektronik" },
    seller: { id: 1, full_name: "Toko A" },
  },
  {
    id: 2,
    name: "HP Murah",
    description: "deskripsi",
    price: 1500000,
    stock: 10,
    imageUrl: "",
    category: { id: 2, name: "Gadget" },
    seller: { id: 1, full_name: "Toko A" },
  },
];

describe("chatService.sendMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    productRepository.getAllProducts.mockResolvedValue(catalog);
    chatRepository.getRecentMessages.mockResolvedValue([]);
    chatRepository.touchSession.mockResolvedValue({});
  });

  it("creates a new session when sessionId is missing and persists both messages with entities", async () => {
    chatRepository.createSession.mockResolvedValue({ id: 10, userId: 1, title: "halo" });
    chatRepository.addMessage
      .mockResolvedValueOnce({ id: 100, sessionId: 10, role: "user", content: "halo", createdAt: new Date() })
      .mockResolvedValueOnce({
        id: 101,
        sessionId: 10,
        role: "assistant",
        content: "Hai!",
        intent: "search_product",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "search_product",
      reply: "Hai!",
      suggested_product_ids: [],
      entities: { action: "search", product: "baju" },
    });

    const result = await chatService.sendMessage({ userId: 1, message: "halo" });

    expect(chatRepository.createSession).toHaveBeenCalledWith({ userId: 1, title: "halo" });
    expect(chatRepository.addMessage).toHaveBeenCalledTimes(2);
    expect(chatRepository.addMessage).toHaveBeenNthCalledWith(2, {
      sessionId: 10,
      role: "assistant",
      content: "Hai!",
      intent: "search_product",
      suggestedProductIds: [],
      entities: { action: "search", product: "baju" },
    });
    expect(result.session_id).toBe(10);
    expect(result.user_message.content).toBe("halo");
    expect(result.assistant_message.intent).toBe("search_product");
    expect(result.assistant_message.entities).toEqual({ action: "search", product: "baju" });
    expect(result.assistant_message.suggested_products).toEqual([]);
  });

  it("rejects when sessionId belongs to another user", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue(null);

    await expect(
      chatService.sendMessage({ userId: 1, sessionId: 99, message: "hi" })
    ).rejects.toThrow("Akses ditolak: sesi bukan milik Anda");
    expect(chatRepository.addMessage).not.toHaveBeenCalled();
  });

  it("hydrates suggested products from catalog by id", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 5, userId: 1 });
    chatRepository.addMessage
      .mockResolvedValueOnce({ id: 200, sessionId: 5, role: "user", content: "rekom laptop", createdAt: new Date() })
      .mockResolvedValueOnce({
        id: 201,
        sessionId: 5,
        role: "assistant",
        content: "Coba ini",
        intent: "search_product",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "search_product",
      reply: "Coba ini",
      suggested_product_ids: [1],
      entities: { product: "laptop", action: "search" },
    });

    const result = await chatService.sendMessage({
      userId: 1,
      sessionId: 5,
      message: "rekom laptop",
    });

    expect(result.assistant_message.suggested_products).toHaveLength(1);
    expect(result.assistant_message.suggested_products[0].id).toBe(1);
    expect(result.assistant_message.suggested_products[0].category.category_name).toBe("Elektronik");
    expect(result.assistant_message.entities).toEqual({ product: "laptop", action: "search" });
  });

  it("persists assistant message with intent, suggestedProductIds, and entities", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 5, userId: 1 });
    chatRepository.addMessage
      .mockResolvedValueOnce({ id: 300, sessionId: 5, role: "user", content: "x", createdAt: new Date() })
      .mockResolvedValueOnce({
        id: 301,
        sessionId: 5,
        role: "assistant",
        content: "y",
        intent: "search_product",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "search_product",
      reply: "y",
      suggested_product_ids: [2],
      entities: { product: "hp", action: "search" },
    });

    await chatService.sendMessage({ userId: 1, sessionId: 5, message: "x" });

    expect(chatRepository.addMessage).toHaveBeenNthCalledWith(2, {
      sessionId: 5,
      role: "assistant",
      content: "y",
      intent: "search_product",
      suggestedProductIds: [2],
      entities: { product: "hp", action: "search" },
    });
  });

  it("rejects empty message", async () => {
    await expect(chatService.sendMessage({ userId: 1, message: "   " })).rejects.toThrow(
      "Pesan tidak boleh kosong"
    );
  });
});

describe("chatService.runLlmChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    productRepository.getAllProducts.mockResolvedValue(catalog);
  });

  it("returns intent + entities + hydrated products with follow_up_suggestions", async () => {
    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "search_product",
      reply: "ok",
      suggested_product_ids: [2],
      follow_up_suggestions: ["Di bawah 100rb", "Warna hitam"],
      entities: { product: "hp", action: "search" },
    });

    const result = await chatService.runLlmChat({
      userId: 1,
      message: "ada hp murah?",
      history: [{ role: "user", content: "halo" }],
    });

    expect(result.intent).toBe("search_product");
    expect(result.entities).toEqual({ product: "hp", action: "search" });
    expect(result.suggested_products).toHaveLength(1);
    expect(result.suggested_products[0].id).toBe(2);
    expect(result.follow_up_suggestions).toEqual(["Di bawah 100rb", "Warna hitam"]);
    // runLlmChat persists messages for session continuity
    expect(chatRepository.addMessage).toHaveBeenCalledTimes(2);
  });

  it("loads history from session when sessionId provided", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 7, userId: 1 });
    chatRepository.getRecentMessages.mockResolvedValue([
      { id: 1, role: "user", content: "halo" },
      { id: 2, role: "assistant", content: "hai" },
    ]);
    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "search_product",
      reply: "ok",
      suggested_product_ids: [],
      entities: {},
    });

    await chatService.runLlmChat({ userId: 1, sessionId: 7, message: "lagi" });

    expect(chatRepository.getRecentMessages).toHaveBeenCalledWith(7, 10);
    const passedHistory = llmService.classifyAndSuggest.mock.calls[0][0].history;
    expect(passedHistory).toEqual([
      { role: "user", content: "halo" },
      { role: "assistant", content: "hai" },
    ]);
  });

  it("rejects when sessionId not owned by user", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue(null);
    await expect(
      chatService.runLlmChat({ userId: 1, sessionId: 99, message: "x" })
    ).rejects.toThrow("Akses ditolak: sesi bukan milik Anda");
  });

  it("returns make_payment intent with entities", async () => {
    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "make_payment",
      reply: "Silakan lanjutkan pembayaran.",
      suggested_product_ids: [],
      entities: { action: "pay", payment_method: "ewallet", order_id: 12 },
    });

    const result = await chatService.runLlmChat({
      userId: 1,
      message: "bayar order 12 pakai ewallet",
    });

    expect(result.intent).toBe("make_payment");
    expect(result.entities).toEqual({
      action: "pay",
      payment_method: "ewallet",
      order_id: 12,
    });
  });
});

describe("chatService.getUserSessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return sessions per API contract", async () => {
    const createdAt = new Date("2026-04-09T10:00:00Z");
    const updatedAt = new Date("2026-04-09T10:05:00Z");
    chatRepository.findSessionsByUser.mockResolvedValue([
      {
        id: 1,
        title: "Cari laptop murah",
        createdAt,
        updatedAt,
      },
    ]);

    const result = await chatService.getUserSessions(1);

    expect(result).toEqual([
      {
        id: 1,
        title: "Cari laptop murah",
        created_at: createdAt,
        updated_at: updatedAt,
      },
    ]);
  });
});

describe("chatService.createSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chatRepository.countSessionsByUser.mockResolvedValue(0);
  });

  it("should create a new session per API contract", async () => {
    const createdAt = new Date("2026-04-09T11:00:00Z");
    chatRepository.createSession.mockResolvedValue({
      id: 2,
      title: "Cari sepatu running",
      createdAt,
    });

    const result = await chatService.createSession(1, "Cari sepatu running");

    expect(chatRepository.createSession).toHaveBeenCalledWith({
      userId: 1,
      title: "Cari sepatu running",
    });
    expect(result).toEqual({
      id: 2,
      title: "Cari sepatu running",
      created_at: createdAt,
    });
  });
});

describe("chatService.getSessionMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return messages per API contract", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 1, userId: 1 });
    chatRepository.getSessionMessages.mockResolvedValue([
      {
        id: 1,
        role: "user",
        content: "Cari laptop murah",
        createdAt: new Date("2026-04-09T10:00:00Z"),
      },
      {
        id: 2,
        role: "assistant",
        content: "Berikut beberapa rekomendasi laptop...",
        createdAt: new Date("2026-04-09T10:00:02Z"),
      },
    ]);

    const result = await chatService.getSessionMessages(1, 1);

    expect(result).toEqual([
      {
        id: 1,
        sender: "user",
        message: "Cari laptop murah",
        created_at: new Date("2026-04-09T10:00:00Z"),
      },
      {
        id: 2,
        sender: "assistant",
        message: "Berikut beberapa rekomendasi laptop...",
        created_at: new Date("2026-04-09T10:00:02Z"),
      },
    ]);
  });

  it("should reject when session is not owned by user", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue(null);

    await expect(chatService.getSessionMessages(1, 99)).rejects.toThrow(
      "Akses ditolak: sesi bukan milik Anda"
    );
  });
});
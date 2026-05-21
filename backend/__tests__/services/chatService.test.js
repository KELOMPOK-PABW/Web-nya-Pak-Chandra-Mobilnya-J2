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

  it("creates a new session when sessionId is missing and persists both messages", async () => {
    chatRepository.createSession.mockResolvedValue({ id: 10, userId: 1, title: "halo" });
    chatRepository.addMessage
      .mockResolvedValueOnce({ id: 100, sessionId: 10, role: "user", content: "halo", createdAt: new Date() })
      .mockResolvedValueOnce({
        id: 101,
        sessionId: 10,
        role: "assistant",
        content: "Hai!",
        intent: "general_chat",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "general_chat",
      reply: "Hai!",
      suggested_product_ids: [],
    });

    const result = await chatService.sendMessage({ userId: 1, message: "halo" });

    expect(chatRepository.createSession).toHaveBeenCalledWith({ userId: 1, title: "halo" });
    expect(chatRepository.addMessage).toHaveBeenCalledTimes(2);
    expect(result.session_id).toBe(10);
    expect(result.user_message.content).toBe("halo");
    expect(result.assistant_message.intent).toBe("general_chat");
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
        intent: "product_recommendation",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "product_recommendation",
      reply: "Coba ini",
      suggested_product_ids: [1],
    });

    const result = await chatService.sendMessage({
      userId: 1,
      sessionId: 5,
      message: "rekom laptop",
    });

    expect(result.assistant_message.suggested_products).toHaveLength(1);
    expect(result.assistant_message.suggested_products[0].id).toBe(1);
    expect(result.assistant_message.suggested_products[0].category.category_name).toBe("Elektronik");
  });

  it("persists assistant message with intent and suggestedProductIds", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 5, userId: 1 });
    chatRepository.addMessage
      .mockResolvedValueOnce({ id: 300, sessionId: 5, role: "user", content: "x", createdAt: new Date() })
      .mockResolvedValueOnce({
        id: 301,
        sessionId: 5,
        role: "assistant",
        content: "y",
        intent: "product_search",
        createdAt: new Date(),
      });

    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "product_search",
      reply: "y",
      suggested_product_ids: [2],
    });

    await chatService.sendMessage({ userId: 1, sessionId: 5, message: "x" });

    expect(chatRepository.addMessage).toHaveBeenNthCalledWith(2, {
      sessionId: 5,
      role: "assistant",
      content: "y",
      intent: "product_search",
      suggestedProductIds: [2],
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

  it("returns intent + hydrated products without persisting", async () => {
    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "product_search",
      reply: "ok",
      suggested_product_ids: [2],
    });

    const result = await chatService.runLlmChat({
      userId: 1,
      message: "ada hp murah?",
      history: [{ role: "user", content: "halo" }],
    });

    expect(result.intent).toBe("product_search");
    expect(result.suggested_products).toHaveLength(1);
    expect(result.suggested_products[0].id).toBe(2);
    expect(chatRepository.addMessage).not.toHaveBeenCalled();
  });

  it("loads history from session when sessionId provided", async () => {
    chatRepository.findSessionByIdForUser.mockResolvedValue({ id: 7, userId: 1 });
    chatRepository.getRecentMessages.mockResolvedValue([
      { id: 1, role: "user", content: "halo" },
      { id: 2, role: "assistant", content: "hai" },
    ]);
    llmService.classifyAndSuggest.mockResolvedValue({
      intent: "general_chat",
      reply: "ok",
      suggested_product_ids: [],
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
});

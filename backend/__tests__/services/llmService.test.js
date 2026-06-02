const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: { generateContent: mockGenerateContent },
    })),
    Type: { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", INTEGER: "INTEGER", NUMBER: "NUMBER" },
  };
});

const llmService = require("../../src/services/llmService");

const sampleCatalog = [
  { id: 1, name: "Laptop A", price: 5000000, stock: 3, description: "" },
  { id: 2, name: "HP Murah", price: 1500000, stock: 10, description: "" },
];

describe("llmService.classifyAndSuggest", () => {
  const ORIGINAL_KEY = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockReset();
  });

  afterAll(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = ORIGINAL_KEY;
  });

  it("parses a valid Gemini response and filters product ids to the catalog", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "search_product",
        reply: "Berikut hasil pencarian:",
        suggested_product_ids: [1, 999],
        entities: { product: "laptop", action: "search" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "cari laptop",
      history: [],
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("search_product");
    expect(result.reply).toBe("Berikut hasil pencarian:");
    expect(result.suggested_product_ids).toEqual([1]);
    expect(result.entities).toEqual({ product: "laptop", action: "search" });
  });

  it("falls back to 'search_product' when intent is invalid", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "weird_intent",
        reply: "halo",
        suggested_product_ids: [],
        entities: {},
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "halo",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("search_product");
  });

  it("extracts entities for make_payment intent", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "make_payment",
        reply: "Silakan lanjutkan pembayaran.",
        suggested_product_ids: [],
        entities: {
          action: "pay",
          payment_method: "ewallet",
          order_id: 12,
          price: 75000,
        },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "bayar order 12 pakai ewallet",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("make_payment");
    expect(result.entities).toEqual({
      action: "pay",
      payment_method: "ewallet",
      order_id: 12,
      price: 75000,
    });
  });

  it("sanitizes null/empty entities to empty object", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "checkout_order",
        reply: "Silakan lanjutkan checkout.",
        suggested_product_ids: [],
        entities: null,
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "checkout sekarang",
      productsContext: sampleCatalog,
    });

    expect(result.entities).toEqual({});
  });

  it("throws 'Layanan AI sedang tidak tersedia' when SDK errors", async () => {
    mockGenerateContent.mockRejectedValue(new Error("network down"));

    await expect(
      llmService.classifyAndSuggest({ message: "x", productsContext: sampleCatalog })
    ).rejects.toThrow("Layanan AI sedang tidak tersedia");
  });

  it("throws when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(
      llmService.classifyAndSuggest({ message: "x", productsContext: sampleCatalog })
    ).rejects.toThrow("GEMINI_API_KEY belum diatur di environment");
  });

  it("throws when Gemini returns non-JSON text", async () => {
    mockGenerateContent.mockResolvedValue({ text: "not json at all" });

    await expect(
      llmService.classifyAndSuggest({ message: "x", productsContext: sampleCatalog })
    ).rejects.toThrow("Layanan AI mengembalikan format yang tidak valid");
  });

  it("handles add_to_cart intent with product entity", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "add_to_cart",
        reply: "Sabun sudah ditambahkan ke keranjang.",
        suggested_product_ids: [],
        entities: { product: "sabun mandi", action: "add" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "tambahkan sabun mandi ke keranjang",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("add_to_cart");
    expect(result.entities.product).toBe("sabun mandi");
    expect(result.entities.action).toBe("add");
  });

  it("handles track_order intent with order_id", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "track_order",
        reply: "Pesanan #7 sedang dalam perjalanan.",
        suggested_product_ids: [],
        entities: { order_id: 7, action: "track" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "lacak pesanan #7",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("track_order");
    expect(result.entities.order_id).toBe(7);
    expect(result.entities.action).toBe("track");
  });

  it("handles manage_product intent with stock entity", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "manage_product",
        reply: "Stok kaos polos berhasil diperbarui menjadi 50.",
        suggested_product_ids: [],
        entities: { product: "kaos polos", action: "update_stock", stock: 50 },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "update stok kaos polos jadi 50",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("manage_product");
    expect(result.entities.product).toBe("kaos polos");
    expect(result.entities.action).toBe("update_stock");
    expect(result.entities.stock).toBe(50);
  });

  it("handles manage_product intent with add_product action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "manage_product",
        reply: "Produk baru berhasil ditambahkan.",
        suggested_product_ids: [],
        entities: { product: "sepatu kets", action: "add_product", price: 150000 },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "tambah produk sepatu kets harga 150rb",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("manage_product");
    expect(result.entities.action).toBe("add_product");
    expect(result.entities.price).toBe(150000);
  });

  it("handles process_order intent with confirm_order action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "process_order",
        reply: "Pesanan #5 telah dikonfirmasi.",
        suggested_product_ids: [],
        entities: { order_id: 5, action: "confirm_order" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "konfirmasi pesanan #5",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("process_order");
    expect(result.entities.order_id).toBe(5);
    expect(result.entities.action).toBe("confirm_order");
  });

  it("handles process_order intent with ship_order action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "process_order",
        reply: "Pesanan #8 akan segera dikirim.",
        suggested_product_ids: [],
        entities: { order_id: 8, action: "ship_order", product: "kaos polos" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "kirim pesanan #8",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("process_order");
    expect(result.entities.action).toBe("ship_order");
    expect(result.entities.order_id).toBe(8);
  });

  it("handles update_shipping intent with delivered action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "update_shipping",
        reply: "Status pengiriman order #7 sudah sampai tujuan.",
        suggested_product_ids: [],
        entities: { order_id: 7, action: "delivered" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "order #7 sudah sampai tujuan",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("update_shipping");
    expect(result.entities.order_id).toBe(7);
    expect(result.entities.action).toBe("delivered");
  });

  it("handles update_shipping intent with pickup action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "update_shipping",
        reply: "Kurir akan pickup order #5.",
        suggested_product_ids: [],
        entities: { order_id: 5, action: "pickup" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "pickup order #5",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("update_shipping");
    expect(result.entities.action).toBe("pickup");
    expect(result.entities.order_id).toBe(5);
  });

  it("handles manage_user_admin intent with ban_user action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "manage_user_admin",
        reply: "User #42 telah dibanned.",
        suggested_product_ids: [],
        entities: { action: "ban_user", user_id: 42 },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "ban user #42",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("manage_user_admin");
    expect(result.entities.action).toBe("ban_user");
    expect(result.entities.user_id).toBe(42);
  });

  it("handles manage_user_admin intent with change_role action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "manage_user_admin",
        reply: "Role user #10 berhasil diubah menjadi seller.",
        suggested_product_ids: [],
        entities: { action: "change_role", user_id: 10, role: "seller" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "ubah role user #10 jadi seller",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("manage_user_admin");
    expect(result.entities.action).toBe("change_role");
    expect(result.entities.user_id).toBe(10);
    expect(result.entities.role).toBe("seller");
  });

  it("handles manage_user_admin intent with list_users action", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        intent: "manage_user_admin",
        reply: "Berikut daftar semua buyer.",
        suggested_product_ids: [],
        entities: { action: "list_users", role: "buyer" },
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "daftar semua buyer",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("manage_user_admin");
    expect(result.entities.action).toBe("list_users");
    expect(result.entities.role).toBe("buyer");
  });
});
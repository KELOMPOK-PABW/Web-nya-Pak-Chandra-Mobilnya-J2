const mockGenerateContent = jest.fn();

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: { generateContent: mockGenerateContent },
    })),
    Type: { OBJECT: "OBJECT", STRING: "STRING", ARRAY: "ARRAY", INTEGER: "INTEGER" },
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
        intent: "product_recommendation",
        reply: "Berikut rekomendasi:",
        suggested_product_ids: [1, 999],
      }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "rekomendasi laptop",
      history: [],
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("product_recommendation");
    expect(result.reply).toBe("Berikut rekomendasi:");
    expect(result.suggested_product_ids).toEqual([1]);
  });

  it("falls back to 'other' when intent is invalid", async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ intent: "weird_intent", reply: "halo", suggested_product_ids: [] }),
    });

    const result = await llmService.classifyAndSuggest({
      message: "halo",
      productsContext: sampleCatalog,
    });

    expect(result.intent).toBe("other");
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
});

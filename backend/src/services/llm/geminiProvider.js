const { GoogleGenAI, Type } = require("@google/genai");
const logger = require("../../utils/logger");
const {
  buildSystemInstruction,
  buildGeminiContents,
  validateAndNormalizeResponse,
} = require("./shared");

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      description: "Intent yang terdeteksi dari pesan pengguna",
    },
    reply: {
      type: Type.STRING,
      description: "Balasan singkat ramah dalam Bahasa Indonesia (1-3 kalimat)",
    },
    suggested_product_ids: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
      description:
        "Hingga 5 ID produk paling relevan dari katalog. Kosongkan [] jika intent bukan product search atau tidak ada yang cocok.",
    },
    entities: {
      type: Type.OBJECT,
      properties: {
        product: {
          type: Type.STRING,
          description: "Nama produk atau kategori yang dimaksud pengguna",
        },
        color: {
          type: Type.STRING,
          description: "Filter warna produk yang diminta pengguna",
        },
        price: {
          type: Type.NUMBER,
          description: "Harga atau rentang harga dalam IDR yang dimaksud",
        },
        stock: {
          type: Type.NUMBER,
          description: "Jumlah stok yang dimaksud pengguna",
        },
        action: {
          type: Type.STRING,
          description: "Aksi yang ingin dilakukan pengguna",
        },
        address: {
          type: Type.STRING,
          description: "Alamat pengiriman yang disebutkan pengguna",
        },
        payment_method: {
          type: Type.STRING,
          description: "Metode pembayaran yang dipilih pengguna",
        },
        order_id: {
          type: Type.NUMBER,
          description: "ID order yang dirujuk pengguna",
        },
        user_id: {
          type: Type.NUMBER,
          description: "ID user yang dirujuk pengguna (untuk admin)",
        },
        role: {
          type: Type.STRING,
          description: "Role user yang dimaksud (untuk admin change_role)",
        },
      },
      description:
        "Entitas yang diekstrak dari pesan pengguna. Hanya isi field yang benar-benar ditemukan; field yang tidak relevan boleh diisi null atau dikosongkan.",
    },
  },
  required: ["intent", "reply", "suggested_product_ids", "entities"],
};

const classifyAndSuggest = async ({ message, history = [], productsContext = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diatur di environment");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemInstruction(productsContext);
  const contents = buildGeminiContents(history, message);

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.4,
      },
    });

    const text = typeof response.text === "string" ? response.text : response.text?.();
    if (!text) {
      throw new Error("Layanan AI tidak mengembalikan jawaban");
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Layanan AI mengembalikan format yang tidak valid");
    }

    return validateAndNormalizeResponse(parsed, productsContext);
  } catch (error) {
    if (error.message && error.message.startsWith("Layanan AI")) throw error;
    if (error.message && error.message.startsWith("GEMINI_API_KEY")) throw error;

    // Log the real error so we can diagnose the root cause
    logger.error(
      { err: error, provider: "gemini", model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
      "Gemini API call failed"
    );

    throw new Error("Layanan AI sedang tidak tersedia");
  }
};

module.exports = { classifyAndSuggest };

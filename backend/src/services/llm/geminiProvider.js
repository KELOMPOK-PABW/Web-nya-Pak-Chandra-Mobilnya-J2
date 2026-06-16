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
    follow_up_suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "2-4 saran pertanyaan lanjutan dalam Bahasa Indonesia yang bisa diklik pengguna. Contoh: ['Yang di bawah 100rb', 'Warna hitam saja']. Kosongkan [] jika tidak relevan.",
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
  required: ["intent", "reply", "suggested_product_ids", "follow_up_suggestions", "entities"],
};

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Retryable error? 429 = rate limit, 500+ = server error */
const isRetryable = (err) => {
  if (!err) return false;
  const code = err.status || err.code || 0;
  return code === 429 || code === 500 || code === 502 || code === 503;
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

  const MAX_RETRIES = 2;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
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
      lastError = error;

      // Non-retryable errors (validation, logic) → fail fast
      if (
        (error.message && error.message.startsWith("Layanan AI")) ||
        (error.message && error.message.startsWith("GEMINI_API_KEY"))
      ) {
        throw error;
      }

      if (attempt < MAX_RETRIES && isRetryable(error)) {
        const delay = 1000 * (attempt + 1); // 1s, 2s
        logger.warn(
          { err: error, provider: "gemini", model, attempt, delay },
          "Gemini API retryable error — retrying"
        );
        await sleep(delay);
        continue;
      }

      // Log the real error so we can diagnose the root cause
      logger.error(
        { err: error, provider: "gemini", model, attempt },
        "Gemini API call failed"
      );

      throw new Error("Layanan AI sedang tidak tersedia");
    }
  }

  // Shouldn't reach here but TypeScript safety
  throw new Error("Layanan AI sedang tidak tersedia");
};

module.exports = { classifyAndSuggest };

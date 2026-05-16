const { GoogleGenAI, Type } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const INTENTS = [
  "product_search",
  "product_recommendation",
  "product_question",
  "order_status",
  "cart_help",
  "general_chat",
  "other",
];

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: { type: Type.STRING, enum: INTENTS },
    reply: { type: Type.STRING },
    suggested_product_ids: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
    },
  },
  required: ["intent", "reply", "suggested_product_ids"],
};

const buildSystemInstruction = (productsContext) => {
  const catalog = (productsContext || [])
    .map(
      (p) =>
        `- id=${p.id} | ${p.name} | Rp ${p.price} | stok=${p.stock} | kategori=${p.category?.name || "-"} | ${(p.description || "").slice(0, 80)}`
    )
    .join("\n");

  return `Anda adalah asisten belanja untuk marketplace berbahasa Indonesia.

Tugas Anda:
1. Tentukan intent dari pesan pengguna. Pilih SATU dari: ${INTENTS.join(", ")}.
2. Tulis balasan singkat yang ramah dalam Bahasa Indonesia (1-3 kalimat).
3. Jika intent berkaitan dengan produk (product_search, product_recommendation, product_question), pilih hingga 5 produk yang paling relevan DARI katalog di bawah ini, dan kembalikan ID-nya di field "suggested_product_ids". Jika tidak relevan, kembalikan array kosong [].

ATURAN PENTING:
- "suggested_product_ids" HANYA boleh berisi id yang ada di katalog. Jangan mengarang id.
- Jika katalog kosong atau tidak ada yang cocok, kembalikan array kosong.
- Jawaban WAJIB JSON sesuai schema.

Katalog produk saat ini:
${catalog || "(katalog kosong)"}
`;
};

const buildContents = (history, message) => {
  const contents = [];
  for (const h of history || []) {
    if (!h || !h.content) continue;
    const role = h.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: String(h.content) }] });
  }
  contents.push({ role: "user", parts: [{ text: String(message) }] });
  return contents;
};

const classifyAndSuggest = async ({ message, history = [], productsContext = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diatur di environment");
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = buildSystemInstruction(productsContext);
  const contents = buildContents(history, message);

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
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
    } catch (e) {
      throw new Error("Layanan AI mengembalikan format yang tidak valid");
    }

    const validIds = new Set((productsContext || []).map((p) => p.id));
    const suggested = Array.isArray(parsed.suggested_product_ids)
      ? parsed.suggested_product_ids
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && validIds.has(id))
      : [];

    return {
      intent: INTENTS.includes(parsed.intent) ? parsed.intent : "other",
      reply: typeof parsed.reply === "string" ? parsed.reply : "",
      suggested_product_ids: suggested,
    };
  } catch (error) {
    if (error.message && error.message.startsWith("Layanan AI")) throw error;
    if (error.message && error.message.startsWith("GEMINI_API_KEY")) throw error;
    throw new Error("Layanan AI sedang tidak tersedia");
  }
};

module.exports = {
  classifyAndSuggest,
  INTENTS,
};

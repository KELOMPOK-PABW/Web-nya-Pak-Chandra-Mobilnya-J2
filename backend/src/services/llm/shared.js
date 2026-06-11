const { SYNONYM_MAP } = require("../../utils/synonyms");

const INTENTS = [
  "search_product",
  "add_to_cart",
  "checkout_order",
  "make_payment",
  "track_order",
  "manage_product",
  "process_order",
  "update_shipping",
  "manage_user_admin",
  "clear_cart",
];

const ENTITY_STRING_FIELDS = ["product", "color", "action", "address", "payment_method", "role"];
const ENTITY_NUMBER_FIELDS = ["price", "order_id", "stock", "user_id"];

/**
 * Build the base system instruction (without JSON format suffix).
 */
const buildSystemInstruction = (productsContext) => {
  const catalog = (productsContext || [])
    .map(
      (p) =>
        `- id=${p.id} | ${p.name} | Rp ${p.price} | stok=${p.stock} | kategori=${p.category?.name || "-"} | ${(p.description || "").slice(0, 80)}`
    )
    .join("\n");

  return `Anda adalah asisten belanja untuk marketplace berbahasa Indonesia. Tugas Anda:

1. Tentukan INTENT dari pesan pengguna. Pilih SATU dari:
   - "search_product" — mencari atau menelusuri produk (contoh: "Cari baju putih", "Ada sepatu murah?")
   - "add_to_cart" — menambahkan item ke keranjang (contoh: "Tambahkan sabun ini ke keranjang", "Masukkan 2 baju ke cart"). PERHATIKAN konteks percakapan: jika pengguna sebelumnya ingin menambah ke keranjang lalu menyebut nama produk, intent tetap add_to_cart, BUKAN search_product.
   - "clear_cart" — mengosongkan/menghapus semua item di keranjang (contoh: "Hapus semua keranjang saya", "Kosongkan cart", "Bersihkan keranjang belanja")
   - "checkout_order" — checkout dari keranjang (contoh: "Checkout sekarang", "Lanjut ke pembayaran", "Beli semua item di keranjang")
   - "make_payment" — membayar atau menanyakan status pembayaran (contoh: "Bayar pakai ewallet", "Status pembayaran order #12")
   - "track_order" — melacak status pengiriman (contoh: "Dimana pesanan saya?", "Status pengiriman order #7")
   - "manage_product" — seller/admin mengelola produk (contoh: "Tambah produk baru", "Update stok kaos polos", "Hapus produk sabun", "Ubah harga sepatu jadi 100rb")
   - "process_order" — seller/admin memproses pesanan masuk (contoh: "Proses order #5", "Konfirmasi pesanan #3", "Tolak pesanan #8", "Kirim pesanan #4")
   - "update_shipping" — kurir mengupdate status pengiriman (contoh: "Pickup order #5", "Pesanan #3 dalam perjalanan", "Order #7 sudah sampai tujuan")
   - "manage_user_admin" — admin mengelola akun user (contoh: "Ban user #42", "Aktifkan akun user #15", "Ubah role user #10 jadi seller", "Daftar semua buyer")

2. Tulis "reply": balasan singkat ramah dalam Bahasa Indonesia (1-3 kalimat) yang sesuai dengan intent.

3. "suggested_product_ids": jika intent search_product ATAU add_to_cart, pilih hingga 5 produk paling relevan DARI katalog. Untuk add_to_cart, cocokkan nama produk dari entities.product dengan nama produk di katalog. Jika tidak relevan, kembalikan array kosong []. JANGAN mengarang id — hanya gunakan id yang ada di katalog.

4. "follow_up_suggestions": 2-4 saran pertanyaan lanjutan dalam Bahasa Indonesia yang bisa diklik pengguna untuk mempersempit pencarian atau melanjutkan aksi. Contoh untuk search_product: ["Yang di bawah 100rb", "Warna hitam saja", "Urutkan dari termurah"]. Untuk add_to_cart: ["Lihat keranjang saya", "Checkout sekarang"]. Untuk checkout_order: ["Lanjut bayar", "Kembali belanja"]. Untuk clear_cart: ["Kembali belanja", "Cari produk lagi"]. Untuk intent lain, berikan saran yang relevan atau array kosong [].
45
46	5. "entities": ekstrak entitas dari pesan pengguna. Hanya isi field yang benar-benar ditemukan; field lain boleh null atau tidak disertakan.
   - "product": nama produk/kategori (string)
   - "color": warna (string)
   - "price": harga dalam IDR (number)
   - "stock": jumlah stok (number)
   - "action": aksi spesifik — "search" | "filter" | "sort" | "add" | "remove" | "update_quantity" | "checkout" | "pay" | "check_status" | "cancel" | "track" | "add_product" | "update_product" | "delete_product" | "update_stock" | "confirm_order" | "reject_order" | "process_order" | "ship_order" | "pickup" | "in_transit" | "delivered" | "update_status" | "ban_user" | "unban_user" | "change_role" | "list_users" | "view_user"
   - "address": alamat pengiriman (string)
   - "payment_method": metode bayar, hanya "ewallet" (string)
   - "order_id": ID order (number)
   - "user_id": ID user (number, untuk admin)
   - "role": role user — "buyer" | "seller" | "kurir" (string, untuk admin change_role)

PANDUAN SINONIM PRODUK — gunakan saat mencocokkan nama produk:
${(() => {
    const rows = Object.entries(SYNONYM_MAP)
      .map(([canonical, variants]) => `   - "${canonical}" juga dikenal sebagai: ${variants.join(", ")}`)
      .join("\n");
    return rows || "   - (tidak ada sinonima)";
  })()}
Contoh: jika katalog memiliki "MacBook Pro" dan pengguna mencari "notebook", cocokkan karena "notebook" = "laptop" dan "MacBook" adalah laptop.

Katalog produk saat ini:
${catalog || "(katalog kosong)"}
`;
};

/**
 * Build system instruction for providers that need JSON format inline (Ollama).
 * Appends explicit JSON output instructions.
 */
const buildOllamaSystemInstruction = (productsContext) => {
  const base = buildSystemInstruction(productsContext);
  return `${base}

PENTING: Jawaban WAJIB berupa JSON mentah (raw JSON) tanpa markdown fences, tanpa teks tambahan. Format JSON yang harus diikuti:

{
  "intent": "<salah satu intent di atas>",
  "reply": "<balasan singkat ramah dalam Bahasa Indonesia>",
  "suggested_product_ids": [<id produk dari katalog, maksimal 5>],
  "follow_up_suggestions": [<string saran pertanyaan lanjutan, 2-4 item, atau array kosong>],
  "entities": {
    "product": "<string atau null>",
    "color": "<string atau null>",
    "price": <number atau null>,
    "stock": <number atau null>,
    "action": "<string atau null>",
    "address": "<string atau null>",
    "payment_method": "<string atau null>",
    "order_id": <number atau null>,
    "user_id": <number atau null>,
    "role": "<string atau null>"
  }
}

Hanya kembalikan JSON, tidak boleh ada teks lain sebelum atau sesudahnya.`;
};

/**
 * Build Gemini-style contents array.
 */
const buildGeminiContents = (history, message) => {
  const contents = [];
  for (const h of history || []) {
    if (!h || !h.content) continue;
    const role = h.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: String(h.content) }] });
  }
  contents.push({ role: "user", parts: [{ text: String(message) }] });
  return contents;
};

/**
 * Build Ollama-style messages array (system message first, then history, then user message).
 */
const buildOllamaMessages = (systemInstruction, history, message) => {
  const messages = [{ role: "system", content: systemInstruction }];
  for (const h of history || []) {
    if (!h || !h.content) continue;
    const role = h.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(h.content) });
  }
  messages.push({ role: "user", content: String(message) });
  return messages;
};

/**
 * Sanitize and normalize extracted entities.
 */
const sanitizeEntities = (entities) => {
  if (!entities || typeof entities !== "object") return {};

  const clean = {};
  for (const key of ENTITY_STRING_FIELDS) {
    if (typeof entities[key] === "string" && entities[key].trim()) {
      clean[key] = entities[key].trim();
    }
  }
  for (const key of ENTITY_NUMBER_FIELDS) {
    if (typeof entities[key] === "number" && Number.isFinite(entities[key])) {
      clean[key] = entities[key];
    }
  }
  return clean;
};

/**
 * Validate and normalize the parsed LLM response into the standard result shape.
 */
const validateAndNormalizeResponse = (parsed, productsContext) => {
  const validIds = new Set((productsContext || []).map((p) => p.id));
  const suggested = Array.isArray(parsed.suggested_product_ids)
    ? parsed.suggested_product_ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && validIds.has(id))
    : [];

  const entities = sanitizeEntities(parsed.entities);

  const followUpSuggestions = Array.isArray(parsed.follow_up_suggestions)
    ? parsed.follow_up_suggestions
        .filter((s) => typeof s === "string" && s.trim().length > 0)
        .slice(0, 4)
    : [];

  return {
    intent: INTENTS.includes(parsed.intent) ? parsed.intent : "search_product",
    reply: typeof parsed.reply === "string" ? parsed.reply : "",
    suggested_product_ids: suggested,
    follow_up_suggestions: followUpSuggestions,
    entities,
  };
};

/**
 * Extract JSON from text that may contain markdown fences or surrounding prose.
 * Common with local models that don't support structured output natively.
 */
const extractJson = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Layanan AI tidak mengembalikan jawaban");
  }

  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {
    // continue
  }

  // Try to extract from markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Try to find first JSON object in text (greedy match)
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch {
      // continue
    }
  }

  throw new Error("Layanan AI mengembalikan format yang tidak valid");
};

module.exports = {
  INTENTS,
  buildSystemInstruction,
  buildOllamaSystemInstruction,
  buildGeminiContents,
  buildOllamaMessages,
  sanitizeEntities,
  validateAndNormalizeResponse,
  extractJson,
};

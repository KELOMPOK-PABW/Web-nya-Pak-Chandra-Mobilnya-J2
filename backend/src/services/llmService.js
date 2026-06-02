const { GoogleGenAI, Type } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
];

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: INTENTS,
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
          enum: [
            "search",
            "filter",
            "sort",
            "add",
            "remove",
            "update_quantity",
            "checkout",
            "pay",
            "check_status",
            "cancel",
            "track",
            "add_product",
            "update_product",
            "delete_product",
            "update_stock",
            "confirm_order",
            "reject_order",
            "process_order",
            "ship_order",
            "pickup",
            "in_transit",
            "delivered",
            "update_status",
            "ban_user",
            "unban_user",
            "change_role",
            "list_users",
            "view_user",
          ],
          description: "Aksi yang ingin dilakukan pengguna",
        },
        address: {
          type: Type.STRING,
          description: "Alamat pengiriman yang disebutkan pengguna",
        },
        payment_method: {
          type: Type.STRING,
          enum: ["ewallet"],
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
          enum: ["buyer", "seller", "kurir"],
          description: "Role user yang dimaksud (untuk admin change_role)",
        },
      },
      description:
        "Entitas yang diekstrak dari pesan pengguna. Hanya isi field yang benar-benar ditemukan; field yang tidak relevan boleh diisi null atau dikosongkan.",
    },
  },
  required: ["intent", "reply", "suggested_product_ids", "entities"],
};

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
   - "add_to_cart" — menambahkan item ke keranjang (contoh: "Tambahkan sabun ini ke keranjang", "Masukkan 2 baju ke cart")
   - "checkout_order" — checkout dari keranjang (contoh: "Checkout sekarang", "Lanjut ke pembayaran", "Beli semua item di keranjang")
   - "make_payment" — membayar atau menanyakan status pembayaran (contoh: "Bayar pakai ewallet", "Status pembayaran order #12")
   - "track_order" — melacak status pengiriman (contoh: "Dimana pesanan saya?", "Status pengiriman order #7")
   - "manage_product" — seller/admin mengelola produk (contoh: "Tambah produk baru", "Update stok kaos polos", "Hapus produk sabun", "Ubah harga sepatu jadi 100rb")
   - "process_order" — seller/admin memproses pesanan masuk (contoh: "Proses order #5", "Konfirmasi pesanan #3", "Tolak pesanan #8", "Kirim pesanan #4")
   - "update_shipping" — kurir mengupdate status pengiriman (contoh: "Pickup order #5", "Pesanan #3 dalam perjalanan", "Order #7 sudah sampai tujuan")
   - "manage_user_admin" — admin mengelola akun user (contoh: "Ban user #42", "Aktifkan akun user #15", "Ubah role user #10 jadi seller", "Daftar semua buyer")

2. Tulis "reply": balasan singkat ramah dalam Bahasa Indonesia (1-3 kalimat) yang sesuai dengan intent.

3. "suggested_product_ids": jika intent search_product, pilih hingga 5 produk paling relevan DARI katalog. Jika tidak relevan, kembalikan array kosong []. JANGAN mengarang id — hanya gunakan id yang ada di katalog.

4. "entities": ekstrak entitas dari pesan pengguna. Hanya isi field yang benar-benar ditemukan; field lain boleh null atau tidak disertakan.
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

Jawaban WAJIB JSON sesuai schema.

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

const sanitizeEntities = (entities) => {
  if (!entities || typeof entities !== "object") return {};

  const clean = {};
  const stringFields = ["product", "color", "action", "address", "payment_method", "role"];
  const numberFields = ["price", "order_id", "stock", "user_id"];

  for (const key of stringFields) {
    if (typeof entities[key] === "string" && entities[key].trim()) {
      clean[key] = entities[key].trim();
    }
  }
  for (const key of numberFields) {
    if (typeof entities[key] === "number" && Number.isFinite(entities[key])) {
      clean[key] = entities[key];
    }
  }

  return clean;
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

    const entities = sanitizeEntities(parsed.entities);

    return {
      intent: INTENTS.includes(parsed.intent) ? parsed.intent : "search_product",
      reply: typeof parsed.reply === "string" ? parsed.reply : "",
      suggested_product_ids: suggested,
      entities,
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
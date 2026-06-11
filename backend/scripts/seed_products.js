/**
 * Seed script: scrape products from DummyJSON + Tokopedia Kaggle + Open Food Facts
 * and insert into database with realistic variants.
 *
 * Usage: node scripts/seed_products.js
 * Environment: expects DATABASE_URL in .env or process.env
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ============================================================
//  1. CONFIGURATION
// ============================================================

const DUMMYJSON_URL = "https://dummyjson.com/products";
const OFF_BASE = "https://world.openfoodfacts.net/api/v2/search";

// Map DummyJSON category slugs to local category names
const CATEGORY_MAP = {
  beauty: "Kecantikan",
  fragrances: "Parfum",
  "skin-care": "Kecantikan",
  furniture: "Rumah Tangga",
  groceries: "Makanan & Minuman",
  "home-decoration": "Rumah Tangga",
  "kitchen-accessories": "Rumah Tangga",
  laptops: "Elektronik",
  smartphones: "Elektronik",
  tablets: "Elektronik",
  "mobile-accessories": "Elektronik",
  "mens-shirts": "Pakaian",
  "mens-shoes": "Pakaian",
  tops: "Pakaian",
  "womens-dresses": "Pakaian",
  "womens-shoes": "Pakaian",
  "womens-bags": "Pakaian",
  "womens-jewellery": "Pakaian",
  sunglasses: "Pakaian",
  "mens-watches": "Aksesoris",
  "womens-watches": "Aksesoris",
  "sports-accessories": "Olahraga",
  motorcycle: "Otomotif",
  vehicle: "Otomotif",
};

// All local category names
const ALL_CATEGORIES = [
  { name: "Kecantikan", desc: "Produk kecantikan, perawatan kulit, dan makeup" },
  { name: "Parfum", desc: "Parfum dan wewangian" },
  { name: "Rumah Tangga", desc: "Perabot rumah, dekorasi, dan perlengkapan dapur" },
  { name: "Makanan & Minuman", desc: "Makanan ringan, minuman, dan bahan pokok" },
  { name: "Elektronik", desc: "Produk elektronik dan aksesoris" },
  { name: "Pakaian", desc: "Pakaian pria, wanita, dan aksesoris fashion" },
  { name: "Olahraga", desc: "Perlengkapan olahraga" },
  { name: "Otomotif", desc: "Produk otomotif dan kendaraan" },
  { name: "Aksesoris", desc: "Jam tangan dan aksesoris" },
  { name: "Pertukangan", desc: "Alat perkakas, hardware, dan perlengkapan bangunan" },
];

// Map Kaggle Tokopedia categories to local category names
const TOKOPEDIA_CATEGORY_MAP = {
  fashion: "Pakaian",
  elektronik: "Elektronik",
  handphone: "Elektronik",
  olahraga: "Olahraga",
  pertukangan: "Pertukangan",
};

// Price ranges (IDR) per Tokopedia product category
const TOKOPEDIA_PRICE_RANGES = {
  fashion:        [25000, 500000],
  elektronik:     [50000, 15000000],
  handphone:      [500000, 12000000],
  olahraga:       [20000, 500000],
  pertukangan:    [10000, 500000],
};

// Variant suffixes per category — generates N variants per base product
const VARIANT_PATTERNS = {
  // 2 variants each → 38 + 76 = 114
  Elektronik: [" - Garansi Resmi", " - Bonus Case + Tempered Glass"],
  // 2 variants each → 38 + 76 = 114
  Pakaian: [" - Hitam", " - Putih"],
  // 9 variants each → 11 + 99 = 110
  Aksesoris: [
    " - Emas", " - Perak", " - Rose Gold",
    " - Hitam", " - Putih", " - Coklat",
    " - Kulit Asli", " - Stainless Steel", " - Tali Karet",
  ],
  // 12 variants each → 8 + 96 = 104
  Kecantikan: [
    " - Natural", " - Glowing", " - Matte",
    " - 10ml", " - 20ml", " - 30ml",
    " - Bright", " - Medium", " - Dark",
    " - Waterproof", " - Oil Control", " - SPF 30",
  ],
  // 2 variants each → 40 + 80 = 120
  "Rumah Tangga": [" - Ukuran Besar", " - Ukuran Kecil"],
  // 5 variants each → 17 + 85 = 102
  Olahraga: [
    " - Ukuran S", " - Ukuran M", " - Ukuran L",
    " - Ukuran XL", " - Warna Hitam",
  ],
  // 10 variants each → 10 + 100 = 110
  Otomotif: [
    " - Original", " - Racing", " - Premium",
    " - Hitam Doff", " - Silver", " - Carbon Fiber",
    " - Model A", " - Model B", " - Model C",
    " - Limited Edition",
  ],
};

// For Parfum: need 20 variants per product → 5 + 100 = 105
const PARFUM_VARIANTS = [
  " - EDP 15ml", " - EDP 30ml", " - EDP 50ml", " - EDP 100ml",
  " - EDT 15ml", " - EDT 30ml", " - EDT 50ml", " - EDT 100ml",
  " - Travel Spray", " - Roll-On 10ml", " - Gift Set",
  " - Miniature 5ml", " - Intense", " - Sport",
  " - Night Edition", " - Classic", " - Premium",
  " - Gold Edition", " - Crystal", " - Limited Edition",
];

// Open Food Facts categories to scrape (50 products each)
const OFF_CATEGORIES = [
  "beverages",
  "snacks",
  "dairy",
  "chocolates",
  "cereals",
  "pasta-sauces",
  "canned-foods",
  "biscuits",
  "bread",
  "cheeses",
  "oils-fats",
  "spices",
  "teas",
  "coffee",
  "desserts",
  "fruits-vegetables",
  "sauces",
];

// Price ranges (IDR) per OFF category tag
const OFF_PRICE_RANGES = {
  beverages:        [3000, 25000],
  snacks:           [5000, 35000],
  dairy:            [8000, 45000],
  chocolates:       [5000, 50000],
  cereals:          [10000, 60000],
  "pasta-sauces":   [8000, 35000],
  "canned-foods":   [5000, 30000],
  biscuits:         [5000, 25000],
  bread:            [5000, 25000],
  cheeses:          [10000, 55000],
  "oils-fats":      [15000, 45000],
  spices:           [5000, 20000],
  teas:             [5000, 30000],
  coffee:           [10000, 150000],
  desserts:         [5000, 40000],
  "fruits-vegetables": [3000, 20000],
  sauces:           [5000, 25000],
};

// ============================================================
//  2. HELPERS
// ============================================================

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function truncate(str, max) {
  return (str || "").slice(0, max);
}

/**
 * Sanitize text for safe MySQL/Prisma insertion.
 * Strips emoji, non-BMP characters, control characters (except \n \t),
 * and replaces malformed content that can cause hex-escape errors.
 */
function sanitizeText(str) {
  if (!str) return "";
  // Remove surrogate pairs (emoji, non-BMP Unicode)
  let cleaned = str.replace(/[\uD800-\uDFFF]/g, "");
  // Remove control characters except \n (0x0A), \t (0x09), \r (0x0D)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Strip backslashes to avoid MySQL hex-escape misinterpretation
  cleaned = cleaned.replace(/\\/g, " ");
  // Replace any remaining weird chars with space
  cleaned = cleaned.replace(/[^\x20-\x7E\x0A\x0D\x09\u00A0-\uD7FF\uE000-\uFFFD]/g, " ");
  // Collapse multiple spaces
  cleaned = cleaned.replace(/  +/g, " ");
  // Trim
  cleaned = cleaned.trim();
  return cleaned;
}

// ============================================================
//  3. CSV PARSER (Kaggle Tokopedia dataset)
// ============================================================

/**
 * Parse a CSV file line-by-line, handling quoted fields (commas & newlines inside quotes).
 * Returns array of objects keyed by header row.
 *
 * @param {string} filePath - Path to CSV file
 * @param {object} [opts]
 * @param {number} [opts.skipLines] - Number of header lines before actual CSV data
 * @returns {Promise<Array<object>>}
 */
async function parseCSV(filePath, opts = {}) {
  const fs = require("fs");
  const readline = require("readline");

  const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = [];
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;
  let rowIndex = 0;

  for await (const rawLine of rl) {
    // Remove trailing \r if present
    let line = rawLine;
    if (line.endsWith("\r")) line = line.slice(0, -1);

    // Skip empty lines
    if (line.length === 0 && !inQuotes) continue;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote ("")
          currentField += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        currentRow.push(currentField);
        currentField = "";
      } else {
        currentField += ch;
      }
    }

    if (inQuotes) {
      // Line break inside quoted field — add newline and continue
      currentField += "\n";
    } else {
      // End of row
      currentRow.push(currentField);
      currentField = "";
      inQuotes = false;

      if (rowIndex === 0) {
        headers = currentRow.map((h) => h.trim());
      } else if (currentRow.length === headers.length) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
          let val = currentRow[i] || "";
          // Unescape double-quotes inside the value
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
          obj[headers[i]] = val;
        }
        rows.push(obj);
      }
      currentRow = [];

      if (rowIndex >= 0) rowIndex++;
    }
  }

  // Handle last row if file doesn't end with newline
  if (currentField || currentRow.length > 0) {
    if (inQuotes) currentField += "\n";
    currentRow.push(currentField);
    if (rowIndex > 0 && currentRow.length === headers.length) {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        let val = currentRow[i] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        obj[headers[i]] = val;
      }
      rows.push(obj);
    }
  }

  return rows;
}

// ============================================================
//  4. API FETCHERS (DummyJSON & Open Food Facts)
// ============================================================

async function fetchDummyJSON() {
  console.log("\n[1/5] Fetching all DummyJSON products...");
  const res = await fetch(`${DUMMYJSON_URL}?limit=0`);
  if (!res.ok) throw new Error(`DummyJSON HTTP ${res.status}`);
  const data = await res.json();
  console.log(`  ✓ ${data.products.length} products from DummyJSON`);
  return data.products;
}

async function fetchOpenFoodFacts(categoryTag) {
  const results = [];
  let page = 1;
  const perPage = 50;

  while (results.length < perPage) {
    const url = `${OFF_BASE}?categories_tags=${categoryTag}&fields=product_name,brands,code,image_url,categories_tags,quantity&page_size=${perPage}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ OFF ${categoryTag} page ${page}: HTTP ${res.status}`);
      break;
    }
    const data = await res.json();
    const products = data.products || [];
    if (products.length === 0) break;

    for (const p of products) {
      if (!p.product_name || !p.brands) continue;
      const name = p.product_name.trim();
      if (name.length < 3) continue;

      results.push({
        name: name,
        brand: p.brands || "",
        image: p.image_url || "",
        quantity: p.quantity || "",
        categoryTag: categoryTag,
        categories: p.categories_tags || [],
      });

      if (results.length >= perPage) break;
    }

    page++;
    // Safety: max 5 pages
    if (page > 5) break;
  }

  return results;
}

// ============================================================
//  4. VARIANT GENERATOR
// ============================================================

function generateVariants(baseProduct, categoryNames) {
  const variants = [];

  // Determine which variant pattern to use
  let patterns;
  if (categoryNames.includes("Parfum")) {
    patterns = PARFUM_VARIANTS;
  } else {
    patterns = VARIANT_PATTERNS[categoryNames[0]] || [];
  }

  // For each variant suffix, create a new product entry
  for (const suffix of patterns) {
    const variantPrice = Math.round(baseProduct.basePrice * (0.85 + Math.random() * 0.3));

    variants.push({
      name: truncate(baseProduct.name + suffix, 190),
      desc: baseProduct.desc,
      price: variantPrice,
      stock: randomInt(10, 200),
      stockStatus: "tersedia",
      imageUrl: baseProduct.imageUrl,
      storeId: baseProduct.storeId,
      categoryId: baseProduct.categoryId,
    });
  }

  return variants;
}

// ============================================================
//  5. DATABASE OPERATIONS (create/insert helpers)
// ============================================================

async function ensureCategories() {
  const existing = await prisma.category.findMany();
  const existingNames = new Set(existing.map((c) => c.categoryName));
  const map = {};

  for (const c of existing) map[c.categoryName] = c.id;

  for (const cat of ALL_CATEGORIES) {
    if (!existingNames.has(cat.name)) {
      await prisma.category.create({ data: { categoryName: cat.name } });
      console.log(`  Created category: ${cat.name}`);
    }
  }

  // Re-read to get all IDs
  const all = await prisma.category.findMany();
  const result = {};
  for (const c of all) result[c.categoryName] = c.id;
  return result;
}

async function insertProducts(products, label) {
  const existing = await prisma.product.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((p) => p.name));

  // Valid Prisma fields for Product model
  const VALID_FIELDS = ["name", "desc", "price", "stock", "stockStatus", "imageUrl", "storeId", "categoryId"];

  let created = 0;
  let skipped = 0;
  let batch = [];

  for (const p of products) {
    if (existingNames.has(p.name)) {
      skipped++;
      continue;
    }
    existingNames.add(p.name);

    // Strip internal fields before insert
    const clean = {};
    for (const key of VALID_FIELDS) {
      if (key in p) clean[key] = p[key];
    }
    batch.push(clean);
    created++;

    // Batch insert in groups of 50
    if (batch.length >= 50) {
      await prisma.product.createMany({ data: batch });
      batch = [];
    }
  }

  if (batch.length > 0) {
    await prisma.product.createMany({ data: batch });
  }

  console.log(`  → ${label}: ${created} created, ${skipped} skipped`);
  return created;
}

// ============================================================
//  5. TOKOPEDIA PRODUCT LOADER (from Kaggle CSV)
// ============================================================

const DEFAULT_TOKOPEDIA_CSV = "scripts/data/tokopedia-product-reviews-2019.csv";

/**
 * Load unique products from the Tokopedia Product Reviews Kaggle dataset CSV.
 * Extracts unique products by product_id, maps categories, generates prices
 * based on category ranges, and picks sample review text as description.
 *
 * @param {string} [csvPath] - Path to the CSV file
 * @param {object} categoryMap - Local category ID map { categoryName: id }
 * @param {Array} stores - Available stores to assign products to
 * @returns {Promise<Array>} Array of product objects ready for insertProducts
 */
async function loadTokopediaProducts(csvPath, categoryMap, stores) {
  const fs = require("fs");

  // Resolve path
  const filePath = csvPath || process.env.TOKOPEDIA_CSV_PATH || DEFAULT_TOKOPEDIA_CSV;

  if (!fs.existsSync(filePath)) {
    console.log(`  ⬜ Tokopedia CSV tidak ditemukan: ${filePath}`);
    console.log(`  💡 Download dari https://www.kaggle.com/datasets/farhan999/tokopedia-product-reviews`);
    console.log(`     dan taruh di ${filePath}`);
    return [];
  }

  console.log(`  📂 Loading ${filePath}...`);
  const rows = await parseCSV(filePath);
  console.log(`  ✓ ${rows.length} total rows in CSV`);

  // Group by product_id to get unique products
  const productMap = new Map();
  const reviewSamples = new Map(); // product_id → sample review text

  for (const row of rows) {
    const pid = row.product_id || row.productId;
    if (!pid) continue;

    const pname = (row.product_name || row.productName || "").trim();
    if (!pname || pname.length < 3) continue;

    if (!productMap.has(pid)) {
      const rawCat = (row.category || "").trim().toLowerCase();
      const localCat = TOKOPEDIA_CATEGORY_MAP[rawCat];

      if (!localCat) {
        // Unknown category — skip
        productMap.set(pid, null);
        continue;
      }

      const categoryId = categoryMap[localCat];
      if (!categoryId) {
        productMap.set(pid, null);
        continue;
      }

      productMap.set(pid, {
        name: sanitizeText(truncate(pname, 190)),
        categoryId,
        localCategory: localCat,
        rawCategory: rawCat,
      });
    }

    // Collect sample review text for description (first non-empty review)
    if (!reviewSamples.has(pid)) {
      const text = (row.text || "").trim();
      if (text.length > 10) {
        reviewSamples.set(pid, text);
      }
    }
  }

  // Filter out null entries (unknown category) and build product objects
  const products = [];
  for (const [pid, info] of productMap) {
    if (!info) continue;

    const store = stores[Math.floor(Math.random() * stores.length)];
    const [minPrice, maxPrice] = TOKOPEDIA_PRICE_RANGES[info.rawCategory] || [50000, 500000];
    const price = randomInt(minPrice, maxPrice);

    // Use review text as description, or generate one
    const sampleReview = reviewSamples.get(pid);
    const rawDesc = sampleReview
      ? truncate(sampleReview, 190)
      : `Produk ${info.name} berkualitas tersedia di Tokopedia`;
    const desc = sanitizeText(rawDesc);

    products.push({
      name: info.name,
      desc,
      price,
      stock: randomInt(10, 200),
      stockStatus: "tersedia",
      imageUrl: "",
      storeId: store.id,
      categoryId: info.categoryId,
    });
  }

  console.log(`  → ${products.length} unique products extracted across ${Object.keys(TOKOPEDIA_CATEGORY_MAP).length} categories`);

  // Per-category breakdown
  const catCounts = {};
  for (const p of products) {
    const cat = Object.keys(TOKOPEDIA_CATEGORY_MAP).find(
      (k) => TOKOPEDIA_CATEGORY_MAP[k] === Object.keys(categoryMap).find(
        (ck) => categoryMap[ck] === p.categoryId
      )
    ) || "unknown";
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(catCounts)) {
    const localName = TOKOPEDIA_CATEGORY_MAP[cat] || cat;
    console.log(`    • ${localName}: ${count} products`);
  }

  return products;
}

// ============================================================
//  6. MAIN
// ============================================================

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║           🌟 PRODUCT SEEDER v3.0               ║");
  console.log("║  DummyJSON + Tokopedia + Open Food Facts     ║");
  console.log("╚══════════════════════════════════════════════╝");

  // --- Step 0: Validate stores exist ---
  console.log("\n[0/6] Checking stores...");
  const stores = await prisma.store.findMany();
  if (stores.length === 0) {
    throw new Error("No stores found in database! Create at least one store first.");
  }
  console.log(`  ✓ ${stores.length} stores available`);
  for (const s of stores) {
    console.log(`    • ID ${s.id}: ${s.storeName}`);
  }

  // --- Step 1: Ensure categories ---
  console.log("\n[1/6] Ensuring categories...");
  const categoryMap = await ensureCategories();
  console.log(`  ✓ ${Object.keys(categoryMap).length} categories ready`);
  for (const [name, id] of Object.entries(categoryMap)) {
    console.log(`    • ${name} (ID: ${id})`);
  }

  // --- Step 2: Load Tokopedia CSV products ---
  const tokopediaCsvPath = process.env.TOKOPEDIA_CSV_PATH || DEFAULT_TOKOPEDIA_CSV;
  console.log("\n[2/6] Loading Tokopedia products from Kaggle dataset...");
  const tokopediaProducts = await loadTokopediaProducts(tokopediaCsvPath, categoryMap, stores);
  const tokopediaCreated = await insertProducts(tokopediaProducts, "Tokopedia Products");
  let totalCreated = tokopediaCreated;

  // --- Step 3: Fetch DummyJSON all products ---
  const djProducts = await fetchDummyJSON();

  // --- Step 4: Process DummyJSON base + variants ---
  console.log("\n[4/6] Processing DummyJSON products with variants...");

  const djToInsert = [];

  for (const p of djProducts) {
    const localCat = CATEGORY_MAP[p.category];
    if (!localCat) continue;

    const categoryId = categoryMap[localCat];
    const store = stores[Math.floor(Math.random() * stores.length)];

    // Price: USD → IDR (× 16000) with some randomness
    const basePrice = Math.round(p.price * 15500 + Math.random() * 5000);

    // Description: use original or fallback
    const desc = truncate(p.description || `Produk ${p.title} berkualitas dari brand ${p.brand || "ternama"}`, 190);

    // Image: first image or thumbnail
    const imageUrl = (p.images && p.images.length > 0 ? p.images[0] : p.thumbnail) || "";

    const baseProduct = {
      name: truncate(p.title || "", 190),
      desc: desc,
      price: basePrice,
      stock: p.stock > 0 ? p.stock : randomInt(5, 100),
      stockStatus: "tersedia",
      imageUrl: imageUrl,
      storeId: store.id,
      categoryId: categoryId,
      // Keep original data for variant generation
      _basePrice: basePrice,
      _images: p.images || [],
    };

    djToInsert.push(baseProduct);

    // Generate variants for this product
    const variants = generateVariants(
      {
        name: truncate(p.title || "", 180),
        desc: desc,
        basePrice: basePrice,
        imageUrl: imageUrl,
        storeId: store.id,
        categoryId: categoryId,
      },
      [localCat]
    );

    for (const v of variants) {
      djToInsert.push(v);
    }
  }

  // Also handle Parfum separately (they use different variant pattern)
  // Already handled via PARFUM_VARIANTS in generateVariants

  const djCreated = await insertProducts(djToInsert, "DummyJSON + Variants");
  totalCreated += djCreated;

  // --- Step 5: Fetch Open Food Facts ---
  console.log("\n[5/6] Fetching Open Food Facts products...");

  let offAll = [];
  for (const cat of OFF_CATEGORIES) {
    const products = await fetchOpenFoodFacts(cat);
    offAll = offAll.concat(
      products.map((p) => {
        const store = stores[Math.floor(Math.random() * stores.length)];
        const [minPrice, maxPrice] = OFF_PRICE_RANGES[cat] || [5000, 30000];
        const price = randomInt(minPrice, maxPrice);

        // Build description
        const qty = p.quantity ? ` (${p.quantity})` : "";
        const desc = truncate(`${p.brand}${qty} — ${p.name}`, 190);

        return {
          name: truncate(`${p.name} ${qty}`.trim(), 190),
          desc: desc,
          price: price,
          stock: randomInt(20, 500),
          stockStatus: "tersedia",
          imageUrl: p.image || "",
          storeId: store.id,
          categoryId: categoryMap["Makanan & Minuman"],
        };
      })
    );

    if (products.length > 0) {
      console.log(`  ✓ ${cat}: ${products.length} products`);
    }
  }

  const offCreated = await insertProducts(offAll, "Open Food Facts");
  totalCreated += offCreated;

  // --- Step 6: Summary ---
  console.log("\n[6/6] Generating final summary...");
  console.log("\n════════════════════════════════════════════════");
  console.log("            📊 FINAL SUMMARY");
  console.log("════════════════════════════════════════════════");

  const total = await prisma.product.count();
  console.log(`  Total products in DB  : ${total}`);
  console.log(`  Newly created         : ${totalCreated}`);

  console.log(`\n  Breakdown by source:`);
  console.log(`    • Tokopedia CSV    : ${tokopediaCreated} products`);
  console.log(`    • DummyJSON+Variant: ${djCreated} products`);
  console.log(`    • Open Food Facts  : ${offCreated} products`);

  const cats = await prisma.category.findMany();
  console.log(`\n  Per-category breakdown:`);
  for (const c of cats) {
    const count = await prisma.product.count({ where: { categoryId: c.id } });
    const target = count >= 100 ? "✓" : "✗";
    console.log(`    ${target} ${c.categoryName}: ${count} products`);
  }

  const below100 = [];
  for (const c of cats) {
    const count = await prisma.product.count({ where: { categoryId: c.id } });
    if (count < 100) below100.push(`${c.categoryName} (${count})`);
  }

  if (below100.length > 0) {
    console.log(`\n  ⚠ Below 100 target: ${below100.join(", ")}`);
  } else {
    console.log(`\n  ✅ All categories have 100+ products!`);
  }

  console.log("\nDone! 🎉");
}

main()
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

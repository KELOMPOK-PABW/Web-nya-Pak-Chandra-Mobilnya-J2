/**
 * Seed script: scrape real products from DummyJSON API and insert into database.
 *
 * Usage: node scripts/seed_products.js
 *
 * Environment: expects DATABASE_URL in .env or process.env
 *   - Uses existing seller (default: id=6 "Toko Sinar Jaya")
 *   - Creates new categories from API data
 *   - Skips products that already exist (by name)
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DUMMYJSON_URL = "https://dummyjson.com/products";
const DEFAULT_SELLER_ID = 6;
const LIMIT = 100;

// Map DummyJSON category slugs to our category names
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

const CATEGORY_DESCRIPTIONS = {
  Kecantikan: "Produk kecantikan, perawatan kulit, dan makeup",
  Parfum: "Parfum dan wewangian",
  "Rumah Tangga": "Perabot rumah, dekorasi, dan perlengkapan dapur",
  "Makanan & Minuman": "Makanan ringan, minuman, dan bahan pokok",
  Elektronik: "Produk elektronik dan aksesoris",
  Pakaian: "Pakaian pria, wanita, dan aksesoris fashion",
  Olahraga: "Perlengkapan olahraga",
  Otomotif: "Produk otomotif dan kendaraan",
  Aksesoris: "Jam tangan dan aksesoris",
};

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

async function fetchProducts() {
  console.log(`Fetching ${LIMIT} products from DummyJSON...`);
  const res = await fetch(`${DUMMYJSON_URL}?limit=${LIMIT}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  console.log(`  Got ${data.products.length} products`);
  return data.products;
}

async function ensureCategories(apiProducts) {
  // Get unique category names we need
  const neededNames = new Set();
  for (const p of apiProducts) {
    const mapped = CATEGORY_MAP[p.category];
    if (mapped) neededNames.add(mapped);
  }

  // Find existing categories
  const existing = await prisma.category.findMany();
  const existingNames = new Set(existing.map((c) => c.name));

  // Create missing categories
  for (const name of neededNames) {
    if (!existingNames.has(name)) {
      const desc = CATEGORY_DESCRIPTIONS[name] || "";
      await prisma.category.create({
        data: { name, description: desc },
      });
      console.log(`  Created category: ${name}`);
    }
  }

  // Return map of name -> id
  const all = await prisma.category.findMany();
  const map = {};
  for (const c of all) map[c.name] = c.id;
  return map;
}

async function seedProducts(apiProducts, categoryMap) {
  // Get existing product names to avoid duplicates
  const existing = await prisma.product.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((p) => p.name));

  let created = 0;
  let skipped = 0;

  for (const p of apiProducts) {
    if (existingNames.has(p.title)) {
      skipped++;
      continue;
    }

    const categoryName = CATEGORY_MAP[p.category];
    const categoryId = categoryName ? categoryMap[categoryName] : null;

    // Truncate description to fit VARCHAR(191) column
    const description = (p.description || "").slice(0, 190);

    // Use first gallery image if available, otherwise fall back to thumbnail
    const imageUrl = (p.images && p.images.length > 0 ? p.images[0] : p.thumbnail) || "";

    // Convert USD price to IDR (multiply by 16000 for realistic rupiah price)
    const priceIdr = Math.round(p.price * 16000);

    await prisma.product.create({
      data: {
        name: (p.title || "").slice(0, 190),
        description: description,
        price: priceIdr,
        stock: p.stock || 0,
        stockStatus: p.stock > 0 ? "tersedia" : "habis",
        imageUrl: imageUrl,
        sellerId: DEFAULT_SELLER_ID,
        categoryId: categoryId,
      },
    });

    created++;
  }

  return { created, skipped };
}

async function main() {
  console.log("=== Product Seeder ===\n");

  // 1. Fetch products from API
  const apiProducts = await fetchProducts();

  // 2. Ensure categories exist
  console.log("\nEnsuring categories...");
  const categoryMap = await ensureCategories(apiProducts);
  console.log(`  ${Object.keys(categoryMap).length} categories available`);

  // 3. Seed products
  console.log("\nSeeding products...");
  const { created, skipped } = await seedProducts(apiProducts, categoryMap);
  console.log(`  Created: ${created} new products`);
  console.log(`  Skipped: ${skipped} duplicates`);

  // 4. Summary
  const total = await prisma.product.count();
  const cats = await prisma.category.findMany();
  console.log(`\n=== Summary ===`);
  console.log(`  Total products: ${total}`);
  console.log(`  Total categories: ${cats.length}`);
  for (const c of cats) {
    const count = await prisma.product.count({ where: { categoryId: c.id } });
    console.log(`    ${c.name}: ${count} products`);
  }
}

main()
  .catch((err) => {
    console.error("\nERROR:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

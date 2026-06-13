const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function ensureDemoUser() {
  const email = "demo@example.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: "Demo User",
        email,
        phone: "081234567890",
        passwordHash: "demo-password-hash",
      },
    });
    console.log(`Created demo user id=${user.id}`);
  }
  return user;
}

async function ensureDemoStore(user) {
  // Store.userId is unique; create only if not exists for this user
  let store = await prisma.store.findFirst({ where: { userId: user.id } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        userId: user.id,
        storeName: "Demo Store",
        phone: "081234567890",
      },
    });
    console.log(`Created demo store id=${store.id}`);
  }
  return store;
}

async function ensureCategories(names) {
  const map = {};
  for (const name of names) {
    let cat = await prisma.category.findFirst({ where: { categoryName: name } });
    if (!cat) {
      cat = await prisma.category.create({ data: { categoryName: name } });
      console.log(`Created category: ${name} (id=${cat.id})`);
    }
    map[name] = cat.id;
  }
  return map;
}

async function insertDemoProducts(store, categoryMap) {
  const samples = [
    {
      name: "Headphone Wireless Demo",
      desc: "Headphone nirkabel dengan kualitas suara baik dan mikrofon built-in.",
      price: 199000,
      stock: 50,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Headphone",
      storeId: store.id,
      categoryId: categoryMap["Elektronik"],
    },
    {
      name: "Kopi Robusta 250gr",
      desc: "Kopi robusta lokal, panggang medium, aroma kuat.",
      price: 45000,
      stock: 200,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Kopi",
      storeId: store.id,
      categoryId: categoryMap["Makanan & Minuman"],
    },
    {
      name: "Kaos Polos Hitam",
      desc: "Kaos bahan katun ukuran S/M/L/XL, nyaman dan awet.",
      price: 75000,
      stock: 120,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Kaos",
      storeId: store.id,
      categoryId: categoryMap["Pakaian"],
    },
    {
      name: "Powerbank 10000mAh",
      desc: "Powerbank portabel 10000mAh, fast charging.",
      price: 129000,
      stock: 80,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Powerbank",
      storeId: store.id,
      categoryId: categoryMap["Elektronik"],
    },
    {
      name: "Susu UHT 1L",
      desc: "Susu UHT segar 1 liter, cocok untuk sarapan.",
      price: 22000,
      stock: 300,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Susu",
      storeId: store.id,
      categoryId: categoryMap["Makanan & Minuman"],
    },
    {
      name: "Jaket Hoodie Navy",
      desc: "Hoodie hangat dengan resleting, cocok untuk cuaca dingin.",
      price: 189000,
      stock: 40,
      stockStatus: "tersedia",
      imageUrl: "https://via.placeholder.com/400x300?text=Hoodie",
      storeId: store.id,
      categoryId: categoryMap["Pakaian"],
    },
  ];

  let created = 0;
  for (const p of samples) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (exists) continue;
    await prisma.product.create({ data: p });
    created++;
  }
  console.log(`Inserted ${created} demo products (skipped duplicates)`);
}

async function main() {
  console.log("Running demo product inserter...");

  const user = await ensureDemoUser();
  const store = await ensureDemoStore(user);
  const categories = await ensureCategories(["Elektronik", "Makanan & Minuman", "Pakaian"]);

  await insertDemoProducts(store, categories);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

require('../src/config/env');
const prisma = require('../src/config/database');

async function main() {
  // create a store for user id 1 if not exists
  let store = await prisma.store.findUnique({ where: { userId: 1 } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        userId: 1,
        storeName: 'Test Store',
        phone: '08123456789',
      },
    });
    console.log('Created store id:', store.id);
  } else {
    console.log('Store already exists id:', store.id);
  }

  // attach product id 1 to this store
  const product = await prisma.product.update({
    where: { id: 1 },
    data: { storeId: store.id },
  });
  console.log('Updated product storeId:', product.storeId);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, name: true, price: true, stock: true, storeId: true, categoryId: true, createdAt: true }
  });

  console.log('Latest products:');
  for (const p of prods) {
    console.log(`${p.id}	${p.name}	IDR ${p.price}	stock:${p.stock}	store:${p.storeId}	cat:${p.categoryId}	${p.createdAt.toISOString()}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });

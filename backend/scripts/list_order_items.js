// list_order_items.js
// Usage: node scripts/list_order_items.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.orderItem.findMany({ take: 20 });
  console.log('Found', items.length, 'order items');
  items.forEach(i => console.log(`id=${i.id} orderId=${i.orderId} productName=${i.productNameSnap || ''} status=${i.status}`));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

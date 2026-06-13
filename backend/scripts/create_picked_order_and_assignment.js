// create_picked_order_and_assignment.js
// Usage: node scripts/create_picked_order_and_assignment.js
// Creates: buyer, seller, store, product, order, orderItem (menunggu_kurir), kurirAssignment with pickupAt set

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding picked order and assignment...');

  const buyer = await prisma.user.create({ data: { fullName: 'PickTest Buyer', email: `pickbuyer+${Date.now()}@example.com`, passwordHash: 'test' } });
  const seller = await prisma.user.create({ data: { fullName: 'PickTest Seller', email: `pickseller+${Date.now()}@example.com`, passwordHash: 'test' } });

  const store = await prisma.store.create({ data: { userId: seller.id, storeName: 'PickTest Store', phone: '0812000001' } });

  const product = await prisma.product.create({ data: { categoryId: null, storeId: store.id, name: 'PickTest Product', desc: 'Seed for return test', price: 50000, stock: 5, stockStatus: 'tersedia' } });

  const cart = await prisma.cart.create({ data: { userId: buyer.id } });
  const address = await prisma.address.create({ data: { userId: buyer.id, address: 'Jl Pick 2', city: 'Jakarta', postalCode: '11111' } });

  const order = await prisma.order.create({ data: { buyerId: buyer.id, cartId: cart.id, addressId: address.id, totalAmount: 50000, paymentStatus: 'paid' } });

  const orderItem = await prisma.orderItem.create({ data: { orderId: order.id, productListId: product.id, sellerId: seller.id, productNameSnap: product.name, priceSnap: product.price, qty: 1, status: 'menunggu_kurir' } });

  let kurirUser = await prisma.user.findUnique({ where: { id: 1 } });
  if (!kurirUser) {
    kurirUser = await prisma.user.create({ data: { fullName: 'Kurir Auto', email: `kurir+${Date.now()}@example.com`, passwordHash: 'test' } });
  }

  const assignment = await prisma.kurirAssignment.create({ data: { orderItemId: orderItem.id, kurirId: kurirUser.id, assignedAt: new Date(), pickupAt: new Date() } });

  console.log('Seeded:');
  console.log(' orderItem id:', orderItem.id);
  console.log(' assignment id:', assignment.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

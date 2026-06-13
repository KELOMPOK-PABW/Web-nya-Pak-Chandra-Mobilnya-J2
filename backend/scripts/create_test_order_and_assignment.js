// create_test_order_and_assignment.js
// Usage: node scripts/create_test_order_and_assignment.js
// Creates: buyer user, seller user, store, product, cart, address, order, orderItem, kurirAssignment

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // Create buyer
  const buyer = await prisma.user.create({
    data: {
      fullName: 'Test Buyer',
      email: `buyer+${Date.now()}@example.com`,
      passwordHash: 'test',
    },
  });

  // Create seller
  const seller = await prisma.user.create({
    data: {
      fullName: 'Test Seller',
      email: `seller+${Date.now()}@example.com`,
      passwordHash: 'test',
    },
  });

  // Create store for seller
  const store = await prisma.store.create({
    data: {
      userId: seller.id,
      storeName: 'Test Store',
      phone: '0812000000',
    },
  });

  // Create product
  const product = await prisma.product.create({
    data: {
      categoryId: null,
      storeId: store.id,
      name: 'Test Product',
      desc: 'Seeded product',
      price: 100000,
      stock: 10,
      stockStatus: 'tersedia',
    },
  });

  // Create cart for buyer
  const cart = await prisma.cart.create({ data: { userId: buyer.id } });

  // Create address for buyer
  const address = await prisma.address.create({
    data: {
      userId: buyer.id,
      address: 'Jl Test 1',
      city: 'Jakarta',
      postalCode: '12345',
    },
  });

  // Create order
  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      cartId: cart.id,
      addressId: address.id,
      totalAmount: 100000,
      paymentStatus: 'paid',
    },
  });

  // Create order item
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productListId: product.id,
      sellerId: seller.id,
      productNameSnap: product.name,
      priceSnap: product.price,
      qty: 1,
      status: 'menunggu_kurir',
    },
  });

  // Ensure there is a courier user (id=1 exists as earlier)
  // Use existing kurir user id=1 if present
  let kurirUser = await prisma.user.findUnique({ where: { id: 1 } });
  if (!kurirUser) {
    kurirUser = await prisma.user.create({
      data: { fullName: 'Kurir Test', email: `kurir+${Date.now()}@example.com`, passwordHash: 'test' },
    });
  }

  // Create kurirAssignment
  const existing = await prisma.kurirAssignment.findFirst({ where: { orderItemId: orderItem.id } });
  let assignment;
  if (!existing) {
    assignment = await prisma.kurirAssignment.create({
      data: {
        orderItemId: orderItem.id,
        kurirId: kurirUser.id,
        assignedAt: new Date(),
      },
    });
  }

  console.log('Created:');
  console.log(' buyer id:', buyer.id);
  console.log(' seller id:', seller.id);
  console.log(' product id:', product.id);
  console.log(' order id:', order.id);
  console.log(' orderItem id:', orderItem.id);
  console.log(' kurir id used:', kurirUser.id);
  console.log(' assignment id:', assignment ? assignment.id : existing.id);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

// seed_courier_assignment.js
// Usage: node scripts/seed_courier_assignment.js <orderItemId> <courierUserId>
// Example: node scripts/seed_courier_assignment.js 101 3

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/seed_courier_assignment.js <orderItemId> <courierUserId>');
    process.exit(1);
  }
  const orderItemId = Number(args[0]);
  const courierId = Number(args[1]);
  if (Number.isNaN(orderItemId) || Number.isNaN(courierId)) {
    console.error('orderItemId and courierUserId must be numbers');
    process.exit(1);
  }

  // Validate order item exists
  const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
  if (!orderItem) {
    console.error(`Order item with id=${orderItemId} not found`);
    process.exit(1);
  }

  // Validate courier user exists
  const user = await prisma.user.findUnique({ where: { id: courierId } });
  if (!user) {
    console.error(`User with id=${courierId} not found`);
    process.exit(1);
  }

  // Create assignment
  const existing = await prisma.kurirAssignment.findFirst({ where: { orderItemId } });
  if (existing) {
    console.log('An assignment already exists for this order item:', existing);
    process.exit(0);
  }

  const assignment = await prisma.kurirAssignment.create({
    data: {
      orderItemId,
      kurirId: courierId,
      assignedAt: new Date(),
    },
  });

  console.log('Created assignment:', assignment);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

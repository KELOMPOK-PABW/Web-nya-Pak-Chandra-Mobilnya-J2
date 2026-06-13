// list_users.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 50 });
  console.log('Found', users.length, 'users');
  users.forEach(u => console.log(`id=${u.id} email=${u.email} fullName=${u.fullName} roles=${u.roles}`));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

// Creates a minimal product for testing
// load env similar to app
require('../src/config/env');
const prisma = require('../src/config/database');
async function main() {
  const product = await prisma.product.create({
    data: {
      name: 'Test Product 1',
      desc: 'Product for integration test',
      price: 10000,
      stock: 10,
      stockStatus: 'tersedia',
      imageUrl: null,
    },
  });
  console.log('Created product id:', product.id);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

require('../src/config/env');
const prisma = require('../src/config/database');

async function main(){
  try{
    const payment = await prisma.payment.update({ where: { id: 1 }, data: { status: 'pending', paidAt: null } });
    console.log('Reset payment:', payment);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
}

main();

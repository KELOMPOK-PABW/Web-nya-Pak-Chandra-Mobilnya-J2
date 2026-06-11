require('../src/config/env');
const paymentService = require('../src/services/paymentService');

async function main(){
  try{
    const res = await paymentService.createPayment({ order_id: 3 });
    console.log('Result:', res);
  }catch(err){
    console.error('Error caught:', err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();

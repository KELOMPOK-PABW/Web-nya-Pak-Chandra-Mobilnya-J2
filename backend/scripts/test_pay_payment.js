require('../src/config/env');
const paymentService = require('../src/services/paymentService');

async function main(){
  try{
    const res = await paymentService.payPayment(1);
    console.log('Pay result:', res);
  }catch(err){
    console.error('Pay error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();

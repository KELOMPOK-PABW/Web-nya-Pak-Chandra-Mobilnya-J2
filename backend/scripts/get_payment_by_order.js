require('../src/config/env');
const paymentService = require('../src/services/paymentService');
const paymentRepository = require('../src/repository/paymentRepository');

async function main(){
  try{
    const payment = await paymentRepository.findPaymentByOrderId(3);
    console.log('Payment:', payment);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
}

main();

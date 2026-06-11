require('../src/config/env');
const walletService = require('../src/services/walletService');

async function main(){
  try{
    const res = await walletService.topup(1, 20000);
    console.log('Topup result:', res);
  }catch(err){
    console.error('Topup error:', err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();

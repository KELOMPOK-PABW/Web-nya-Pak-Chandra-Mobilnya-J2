require('../src/config/env');
const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/database');

async function main(){
  const dir = path.join(__dirname, '..', 'database', 'stored_procedures');
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.sql'));
  for(const file of files){
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log('Installing', file);
    try{
      // remove DELIMITER statements since prisma can't handle them; split by CREATE PROCEDURE
      const cleaned = sql.replace(/DELIMITER\s+\$\$/g,'').replace(/\$\$/g,'').replace(/DELIMITER\s+;/g,'');
      // Execute the full SQL; use $executeRawUnsafe
      await prisma.$executeRawUnsafe(cleaned);
      console.log('Installed', file);
    }catch(err){
      console.error('Failed to install', file, err.message);
    }
  }
  process.exit(0);
}

main();

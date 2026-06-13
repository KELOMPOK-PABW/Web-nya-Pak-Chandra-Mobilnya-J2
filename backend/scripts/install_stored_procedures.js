require('../src/config/env');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function cleanSql(sql){
  // remove DELIMITER lines and replace $$ terminators with semicolon
  let out = sql.replace(/DELIMITER\s+\$\$/gi, '');
  out = out.replace(/DELIMITER\s+;/gi, '');
  out = out.replace(/\$\$/g, ';');
  return out;
}

async function main(){
  const dir = path.join(__dirname, '..', 'database', 'stored_procedures');
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.sql'));

  // build combined SQL, resolving SOURCE directives in index.sql if present
  const indexPath = path.join(dir, 'index.sql');
  // connect using mysql2 so we can execute procedure DDL (multipleStatements)
  const dbUrl = process.env.DATABASE_URL;
  if(!dbUrl){
    console.error('No DATABASE_URL set; aborting stored procedure install.');
    process.exit(1);
  }
  const parsed = new URL(dbUrl);
  const user = parsed.username;
  const password = decodeURIComponent(parsed.password || '');
  const host = parsed.hostname;
  const port = parsed.port ? parseInt(parsed.port,10) : 3306;
  const database = parsed.pathname.replace(/^\//, '');

  const conn = await mysql.createConnection({
    host, user, password, port, database, multipleStatements: true
  });

  try{
    console.log('Installing stored procedures...');

    // execute files referenced in index.sql first (if exists)
    if(fs.existsSync(indexPath)){
      const indexSql = fs.readFileSync(indexPath, 'utf8');
      for(const line of indexSql.split(/\r?\n/)){
        const m = line.match(/^\s*SOURCE\s+(.+)$/i);
        if(m){
          let rel = m[1].trim();
          rel = rel.replace(/;$/, '');
          const refPath = path.join(__dirname, '..', rel);
          if(fs.existsSync(refPath)){
            const content = fs.readFileSync(refPath, 'utf8');
            const cleaned = cleanSql(content);
            try{
              console.log('Executing', refPath);
              await conn.query(cleaned);
              console.log('OK', refPath);
            }catch(err){
              console.error('Failed', refPath, err.message);
            }
          } else {
            console.warn('Referenced file not found:', refPath);
          }
        }
      }
    }

    // then execute any remaining files individually
    for(const file of files){
      if(file === 'index.sql') continue;
      const p = path.join(dir, file);
      try{
        const raw = fs.readFileSync(p, 'utf8');
        const cleaned = cleanSql(raw);
        console.log('Executing', p);
        await conn.query(cleaned);
        console.log('OK', p);
      }catch(err){
        console.error('Failed', p, err.message);
      }
    }

    console.log('Stored procedures installation attempt finished.');
  }catch(err){
    console.error('Installer error', err.message);
  }finally{
    await conn.end();
  }
}

main();

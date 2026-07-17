require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query('SELECT DISTINCT name FROM products');
  const names = rows.map(r => r.name);
  fs.writeFileSync('all-names.json', JSON.stringify(names, null, 2));
  
  await client.end();
}

main().catch(console.error);

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query('SELECT name, model, size FROM products LIMIT 10');
  console.log(rows);
  await client.end();
}

main().catch(console.error);

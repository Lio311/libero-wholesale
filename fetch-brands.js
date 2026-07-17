require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query('SELECT id, name, brand FROM products');
  console.log(JSON.stringify(rows, null, 2));

  await client.end();
}

main();

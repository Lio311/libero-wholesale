require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query('SELECT DISTINCT name FROM products');
  const brands = await client.query('SELECT DISTINCT brand FROM products');

  console.log("Names:");
  console.log(rows.map(r => r.name));
  
  console.log("\nBrands:");
  console.log(brands.rows.map(r => r.brand));

  await client.end();
}

main().catch(console.error);

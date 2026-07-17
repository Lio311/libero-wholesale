require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT id FROM products');
  for (const row of res.rows) {
    const qty = Math.floor(Math.random() * 185) + 15;
    await client.query('UPDATE products SET stock_quantity = $1 WHERE id = $2', [qty, row.id]);
  }
  console.log(`Updated ${res.rowCount} products`);
  await client.end();
}
run().catch(console.error);

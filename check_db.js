const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const sql = neon(process.env.DATABASE_URL);
  const products = await sql`SELECT id, name, barcode, stock_quantity, is_synced FROM products LIMIT 5`;
  console.log(products);
}
check().catch(console.error);

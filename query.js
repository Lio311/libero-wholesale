const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const p = await sql`SELECT id, name, size, barcode, is_synced FROM products WHERE name = 'Fiore di Cotone'`;
  console.log(p);
}
run();

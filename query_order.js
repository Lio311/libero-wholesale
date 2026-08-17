const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const all = await sql`SELECT id, name, size FROM products WHERE barcode IS NOT NULL AND barcode != ''`;
  const idx = all.findIndex(p => p.name === 'Fiore di Cotone' && p.size === '50ml');
  console.log(`Fiore di Cotone 50ml is at index ${idx} out of ${all.length}`);
}
run();

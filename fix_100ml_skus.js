const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const updates = [
    { name: 'Bergamundi', sku: '8032779258025' },
    { name: 'Citrus Paradisi', sku: '8032779258339' },
    { name: 'Fiore di Cotone', sku: '8032779258032' },
    { name: 'Reunion Vanilla', sku: '8032779258520' },
    { name: 'Royal Anbar', sku: '8032779258643' },
    { name: 'Spleen Fever', sku: '8032779258650' },
    { name: 'Sweet Carousel', sku: '8032779258018' },
    { name: 'Whisky Nobile', sku: '8032779258322' }
  ];

  for (const item of updates) {
    console.log(`Updating ${item.name} 100ml to ${item.sku}...`);
    await sql`UPDATE products SET barcode = ${item.sku}, is_synced = false WHERE name = ${item.name} AND size = '100ml'`;
  }
  console.log("Done!");
}
run();

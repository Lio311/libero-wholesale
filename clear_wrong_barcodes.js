const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const badBarcodes = [
    '13770031002331',
    '5070000674506',
    '5070000674582',
    '5081304448434',
    '690251056217',
    '3700458606508',
    '13770015534216',
    '3616305275745'
  ];
  
  for (const b of badBarcodes) {
    await sql`UPDATE products SET barcode = NULL, is_synced = false WHERE barcode = ${b}`;
  }
  console.log("Cleared wrong barcodes.");
}
run();

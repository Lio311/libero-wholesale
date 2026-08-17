const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const updates = [
    { barcode: '13770031002331', newSize: '5ml', newName: 'Ambre Nomade' },
    { barcode: '5070000674506', newSize: '75ml', newName: 'Tales From Zanzibar' },
    { barcode: '5070000674582', newSize: '75ml', newName: 'Trouble In Paradise' },
    { barcode: '5081304448434', newSize: '100ml', newName: 'Fragrance Du Bois New York Fifth Avenue' },
    { barcode: '690251056217', newSize: '100ml', newName: 'Jo Malone London Rose & White Musk Absolu' },
    { barcode: '3700458606508', newSize: '75ml', newName: 'Memo Abu Dhabi Eau De Parfum' },
    { barcode: '13770015534216', newSize: '5ml', newName: 'Moonwalk SeaCoco' },
    { barcode: '3616305275745', newSize: '100ml', newName: 'Gucci Flora Gardenia Intense' }
  ];

  for (const item of updates) {
    console.log(`Fixing ${item.barcode}...`);
    await sql`UPDATE products SET size = ${item.newSize}, name = ${item.newName}, is_synced = false WHERE barcode = ${item.barcode}`;
  }
  console.log("Done!");
}
run();

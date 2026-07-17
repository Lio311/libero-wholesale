require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query('SELECT id FROM products');
    for (const row of res.rows) {
      const randomBarcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      await client.query('UPDATE products SET barcode = $1 WHERE id = $2', [randomBarcode, row.id]);
    }
    console.log(`Updated ${res.rowCount} products with random barcodes`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();

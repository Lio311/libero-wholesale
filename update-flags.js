require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT id, price FROM products');
  for (const row of res.rows) {
    const isBackToStock = Math.random() > 0.7; // 30% chance
    const isOnSale = Math.random() > 0.7; // 30% chance
    const isOfficialImporter = Math.random() > 0.5; // 50% chance
    const hasPriceDrop = Math.random() > 0.7; // 30% chance

    let priceDropPrice = null;
    let priceDropExpiresAt = null;

    if (hasPriceDrop && row.price) {
      priceDropPrice = (row.price * 0.85).toFixed(2); // 15% off
      const d = new Date();
      d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 1); // Random expiration up to 30 days
      priceDropExpiresAt = d.toISOString();
    }

    await client.query(
      'UPDATE products SET is_back_to_stock = $1, is_on_sale = $2, is_official_importer = $3, price_drop_price = $4, price_drop_expires_at = $5 WHERE id = $6',
      [isBackToStock, isOnSale, isOfficialImporter, priceDropPrice, priceDropExpiresAt, row.id]
    );
  }
  console.log(`Updated ${res.rowCount} products with random flags`);
  await client.end();
}
run().catch(console.error);

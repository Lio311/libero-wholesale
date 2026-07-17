require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  try {
    await client.query(`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_back_to_stock" boolean DEFAULT false NOT NULL;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_on_sale" boolean DEFAULT false NOT NULL;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_official_importer" boolean DEFAULT false NOT NULL;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_drop_price" numeric(10, 2);
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_drop_expires_at" timestamp;
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tester_ratio" integer;
    `);
    console.log("Added columns successfully.");
  } catch (err) {
    console.log("Columns might already exist or error: ", err.message);
  }

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

    const hasTester = Math.random() > 0.8; // 20% chance
    const testerRatio = hasTester ? (Math.random() > 0.5 ? 6 : 12) : null;

    await client.query(
      'UPDATE products SET is_back_to_stock = $1, is_on_sale = $2, is_official_importer = $3, price_drop_price = $4, price_drop_expires_at = $5, tester_ratio = $6 WHERE id = $7',
      [isBackToStock, isOnSale, isOfficialImporter, priceDropPrice, priceDropExpiresAt, testerRatio, row.id]
    );
  }
  console.log(`Updated ${res.rowCount} products with random flags`);
  await client.end();
}
run().catch(console.error);

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, updating sizes for brands...");

  // Update sizes to 50ml
  const res50 = await client.query(
    "UPDATE products SET size = '50ml' WHERE brand IN ('Bergamoss', 'Bohoboco', 'Theodoros Kalotinis', 'Dudar Milano')"
  );
  console.log(`Updated ${res50.rowCount} products to 50ml`);

  // Update sizes to 30ml
  const res30 = await client.query(
    "UPDATE products SET size = '30ml' WHERE brand = 'IPiccirilli'"
  );
  console.log(`Updated ${res30.rowCount} products to 30ml`);

  await client.end();
}

main().catch(console.error);

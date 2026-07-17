require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, updating brand name...");

  const res = await client.query(
    "UPDATE products SET brand = 'IPiccirilli', brand_he = 'IPiccirilli' WHERE brand = 'I Piccirilli'"
  );

  console.log(`Updated ${res.rowCount} products from "I Piccirilli" to "IPiccirilli"`);
  await client.end();
}

main().catch(console.error);

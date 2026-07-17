require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, checking issues...");

  let res = await client.query("SELECT id, name, brand FROM products WHERE name ILIKE '%Vanilla Black Pepper%' OR name ILIKE '%Olibanum Gardenia%' OR name ILIKE '%Eternal Lily Amber%' OR name ILIKE '%Milano%' OR name ILIKE '%Bohoboco%'");
  console.log("Problematic Products:", res.rows);

  await client.end();
}

main().catch(console.error);

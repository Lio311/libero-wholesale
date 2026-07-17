require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, checking Farmacia products...");

  let res = await client.query("SELECT id, name, brand, size FROM products WHERE brand = 'Farmacia SS. Annunziata' OR name ILIKE '%Reunion%' OR brand = 'Theodoros Kalotinis' ORDER BY name");
  console.log("Products:");
  console.table(res.rows.filter(r => r.name.toLowerCase().includes('reunion') || r.brand.includes('Farmacia') || r.brand.includes('Theodoros')));

  await client.end();
}

main().catch(console.error);

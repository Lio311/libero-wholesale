require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, fixing Farmacia duplicates...");

  // Get all Farmacia products
  const { rows } = await client.query("SELECT id, name FROM products WHERE brand = 'Farmacia SS. Annunziata' ORDER BY name, id");
  
  // Group by name
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.name]) grouped[row.name] = [];
    grouped[row.name].push(row);
  }

  for (const name in grouped) {
    const prods = grouped[name];
    if (prods.length === 2) {
      // Set first to 50ml and second to 100ml
      await client.query("UPDATE products SET size = '50ml' WHERE id = $1::uuid", [prods[0].id]);
      await client.query("UPDATE products SET size = '100ml' WHERE id = $1::uuid", [prods[1].id]);
      console.log(`Updated sizes for ${name}: 50ml and 100ml`);
    } else if (prods.length > 2) {
       console.log(`WARNING: More than 2 duplicates for ${name}`);
    }
  }

  console.log("Farmacia sizes fixed!");
  await client.end();
}

main().catch(console.error);

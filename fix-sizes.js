require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const parsedProducts = require('./parsed-products.json');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, updating sizes from JSON...");

  let updateCount = 0;
  for (const prod of parsedProducts) {
    if (prod.size) {
      // Find product by model (which is cleanName)
      const res = await client.query(
        "UPDATE products SET size = $1 WHERE name ILIKE $2 OR model ILIKE $2",
        [prod.size, prod.model]
      );
      if (res.rowCount > 0) {
        updateCount++;
      }
    }
  }

  console.log("Updated sizes for " + updateCount + " products");
  await client.end();
}

main().catch(console.error);

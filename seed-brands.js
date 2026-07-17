require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // Create table if it doesn't exist to bypass drizzle-kit interactive prompt
  await client.query(`
    CREATE TABLE IF NOT EXISTS "brands" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255) NOT NULL,
      "name_he" varchar(255),
      "logo_url" varchar(1024),
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "brands_name_unique" UNIQUE("name")
    );
  `);
  console.log("Brands table ensured.");

  // Get all unique brands
  const { rows } = await client.query("SELECT DISTINCT brand, brand_he FROM products WHERE brand IS NOT NULL AND brand != ''");
  
  let count = 0;
  for (const row of rows) {
    // Insert into brands table, on conflict do nothing
    const res = await client.query(`
      INSERT INTO brands (name, name_he) 
      VALUES ($1, $2) 
      ON CONFLICT (name) DO NOTHING
    `, [row.brand, row.brand_he]);
    if (res.rowCount > 0) count++;
  }
  
  console.log(`Seeded ${count} new brands`);
  await client.end();
}

main().catch(console.error);

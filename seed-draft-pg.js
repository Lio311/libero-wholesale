require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to DB, adding is_draft column...");
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false NOT NULL;`);
    console.log("Column added successfully!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  await client.query("UPDATE products SET name_he = $1 WHERE name = $2", ["פיווין דה מלן", "Pivoine de Malene"]);
  console.log("Updated product name to פיווין דה מלן");
  
  await client.end();
}

main().catch(console.error);

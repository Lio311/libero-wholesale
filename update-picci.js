require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  await client.query("UPDATE products SET brand_he = $1 WHERE brand_he = $2", ["פיצ'ירילי", "אי פיצ'ירילי"]);
  console.log("Updated brand name to פיצ'ירילי");
  
  await client.end();
}

main().catch(console.error);

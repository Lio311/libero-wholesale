require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const all = await sql`SELECT id, name, size FROM products WHERE name ILIKE '%Gardenia%'`;
  console.log("Gardenia matches:", all);
}
run().catch(console.error);

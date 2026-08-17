const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function run() {
  const res = await sql`SELECT id, name, barcode, stock_quantity, is_draft FROM products WHERE name ILIKE '%Bergamundi%'`;
  console.log(res);
}
run();

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function run() {
  const res = await sql`SELECT id, name, barcode FROM products WHERE barcode = '8032779258698'`;
  console.log(res);
}
run();

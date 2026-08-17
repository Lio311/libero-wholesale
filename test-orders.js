require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  
  const orders = await sql`SELECT id, order_number, store_id, total_amount, created_at FROM orders ORDER BY order_number DESC LIMIT 5`;
  console.log('RECENT ORDERS:', orders);
}
run();

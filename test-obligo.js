require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  
  // Check the store "הבדיקות של ליאור"
  const stores = await sql`SELECT * FROM stores WHERE name = 'הבדיקות של ליאור' OR clerk_user_id IS NOT NULL`;
  console.log('STORES:', stores);
  
  // Check order 43
  const orders = await sql`SELECT * FROM orders WHERE order_number = 43`;
  console.log('ORDER 43:', orders);
}
run();

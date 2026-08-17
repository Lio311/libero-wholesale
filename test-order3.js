require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  
  const order = await sql`SELECT clerk_user_id FROM orders WHERE order_number = 3`;
  console.log('ORDER 3:', order);
}
run();

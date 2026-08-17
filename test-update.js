require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const totalAmount = 100.55;
    const storeId = 'bb3e5340-eff6-4b35-8f58-ceed385a6564'; // Lior tests
    const res = await sql`UPDATE stores SET current_balance = current_balance + ${totalAmount} WHERE id = ${storeId}`;
    console.log('Update res:', res);
  } catch (e) {
    console.error('Update Error:', e);
  }
}
run();

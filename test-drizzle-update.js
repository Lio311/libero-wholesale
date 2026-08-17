require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');

async function run() {
  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient);
  
  try {
    const totalAmount = 50.11;
    const storeId = 'bb3e5340-eff6-4b35-8f58-ceed385a6564'; // Lior tests
    const res = await db.execute(
      sql`UPDATE stores SET current_balance = current_balance + ${totalAmount} WHERE id = ${storeId}`
    );
    console.log('Update res:', res);
  } catch (e) {
    console.error('Update Error:', e);
  }
}
run();

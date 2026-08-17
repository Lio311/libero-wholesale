require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log("Updating Gardenia...");
  const gardenia = await sql`
    UPDATE products 
    SET barcode = '5214002848033', status = 'active', is_synced = false
    WHERE id = '45515ae6-1a3e-478d-8b29-43e602940018'
    RETURNING id, name, size, barcode, status;
  `;
  console.log("Gardenia updated:", gardenia);
}
run().catch(console.error);

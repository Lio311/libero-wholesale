import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
async function run() {
  const barcodes = ['3770015534193', '3770015534216', '3770015534179', '3770015534186', '3770015534223'];
  const result = await sql`
    SELECT name, barcode, brand, stock_quantity, is_synced 
    FROM products 
    WHERE barcode = ANY(${barcodes}::text[])
    ORDER BY name;
  `;
  console.table(result);
}
run();

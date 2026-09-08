import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
async function run() {
  const result = await sql`SELECT id, name, contact_name FROM stores LIMIT 5;`;
  console.log(result);
}
run();

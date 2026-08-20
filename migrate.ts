import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const query = fs.readFileSync('drizzle/0003_black_jigsaw.sql', 'utf8');

async function main() {
  const statements = query.split('--> statement-breakpoint');
  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Running:', statement);
      await sql.query(statement);
    }
  }
  console.log('Done');
}

main().catch(console.error);

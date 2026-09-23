import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/lib/db/schema';
import { eq, like, or, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const barcodesToUpdate = [
    '5214002848200', // Lemon Tart
    '9508745417738', // Vanilla
    '5214002848026', // Velvet Chocolate
    '652638006208',  // Lily (assuming it's also one of them based on price)
  ];

  console.log(`Updating prices to 129 for barcodes:`, barcodesToUpdate);

  const result = await db.update(schema.products)
    .set({ price: '129.00' })
    .where(inArray(schema.products.barcode, barcodesToUpdate))
    .returning({
      name: schema.products.nameHe,
      price: schema.products.price,
      barcode: schema.products.barcode
    });

  console.log('Updated products:', result);
}

main().catch(console.error);

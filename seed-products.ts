import { db } from './src/lib/db';
import { products, orderItems, orders, searchLogs } from './src/lib/db/schema';
import * as fs from 'fs';
import { sql } from 'drizzle-orm';

const rawData = fs.readFileSync('./parsed-products.json', 'utf8');
const parsedProducts = JSON.parse(rawData);

async function seed() {
  console.log(`Seeding ${parsedProducts.length} products...`);
  
  try {
      await db.execute(sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "size" text;`);
      await db.delete(orderItems);
      await db.delete(orders);
      await db.delete(products);
      console.log("Cleared old products");
  } catch(e) {
      console.error("Failed to clear old products:", e);
  }

  let added = 0;
  for (const item of parsedProducts) {
    if (!item.model) continue;
    
    try {
      await db.insert(products).values({
        name: item.model,
        brand: item.brand,
        size: item.size,
        stockQuantity: item.stock || 0,
        price: "100.00", 
      });
      added++;
    } catch (e) {
      console.error("Failed to add", item.model, e);
    }
  }
  console.log(`Successfully added ${added} products.`);
  process.exit(0);
}

seed().catch(console.error);

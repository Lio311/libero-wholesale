import { db } from './src/lib/db';
import { products } from './src/lib/db/schema';
import * as fs from 'fs';

const rawData = fs.readFileSync('./parsed-products.json', 'utf8');
const parsedProducts = JSON.parse(rawData);

async function seed() {
  console.log(`Seeding ${parsedProducts.length} products...`);
  let added = 0;
  for (const item of parsedProducts) {
    if (!item.name) continue;
    const cleanName = item.name.replace(/\s*-\s*$/, '').trim();
    if (!cleanName || cleanName === 'ml' || cleanName === 'V' || cleanName === 'X' || cleanName.includes('מקדם') || cleanName.includes('Annunziata') || cleanName.includes('Theodoros') || cleanName.includes('Memoirs')) continue;
    
    try {
      await db.insert(products).values({
        name: cleanName,
        stockQuantity: item.stock || 0,
        price: "100.00", 
      });
      added++;
    } catch (e) {
      console.error("Failed to add", cleanName, e);
    }
  }
  console.log(`Successfully added ${added} products.`);
  process.exit(0);
}

seed().catch(console.error);

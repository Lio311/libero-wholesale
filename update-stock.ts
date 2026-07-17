import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./src/lib/db";
import { products } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const allProducts = await db.select().from(products);
  let count = 0;
  for (const p of allProducts) {
    // Generate random stock between 15 and 200
    const qty = Math.floor(Math.random() * 185) + 15;
    await db.update(products).set({ stockQuantity: qty }).where(eq(products.id, p.id));
    count++;
  }
  console.log(`Updated ${count} products with random stock quantities.`);
  process.exit(0);
}

run();

import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const WC_URL = "https://libero-il.co.il";
  const WC_CK = process.env.LIBERO_WC_CK;
  const WC_CS = process.env.LIBERO_WC_CS;

  if (!WC_CK || !WC_CS) {
    console.error("WooCommerce credentials not configured in .env.local");
    process.exit(1);
  }

  console.log(`Fetching products from WooCommerce (${WC_URL})...`);
  let page = 1;
  let allWcProducts: any[] = [];
  let hasMore = true;

  const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    const fetchUrl = `${WC_URL}/wp-json/wc/v3/products?per_page=100&page=${page}`;
    const res = await fetch(fetchUrl, { headers });
    
    if (!res.ok) {
       console.error("WooCommerce API Error:", res.status, await res.text());
       break;
    }
    
    const wcProducts = await res.json();
    if (wcProducts.length === 0) {
      hasMore = false;
    } else {
      allWcProducts = [...allWcProducts, ...wcProducts];
      page++;
    }
  }

  console.log(`Fetched ${allWcProducts.length} products from WooCommerce. Updating local database...`);
  
  let updatedCount = 0;
  
  for (const wcProd of allWcProducts) {
     const sku = wcProd.sku;
     const stock = wcProd.stock_quantity || 0;
     
     if (sku) {
        const result = await db.update(products)
          .set({ stockQuantity: stock, isSynced: true })
          .where(eq(products.barcode, sku))
          .returning({ updatedId: products.id });
          
        if (result.length > 0) {
          updatedCount += result.length;
        }
     }
  }

  console.log(`Successfully synced stock for ${updatedCount} products.`);
  process.exit(0);
}

run().catch(console.error);

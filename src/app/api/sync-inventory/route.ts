import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// You can protect this route with a secret key if needed.
// For example, appending ?secret=YOUR_SECRET to the URL.
export const maxDuration = 60; // Max execution time for Vercel Hobby tier

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    // Optional: Protect the route
    if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;

    if (!WC_CK || !WC_CS) {
      return NextResponse.json({ error: "WooCommerce credentials not configured" }, { status: 500 });
    }

    let page = 1;
    let allWcProducts: any[] = [];
    let hasMore = true;

    // Use Basic Auth for WooCommerce REST API
    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };

    while (hasMore) {
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

    let updatedCount = 0;
    
    // Process updates in chunks to avoid rate limiting and connection timeouts
    const chunkSize = 50;
    for (let i = 0; i < allWcProducts.length; i += chunkSize) {
      const chunk = allWcProducts.slice(i, i + chunkSize);
      
      const updatePromises = chunk.map(async (wcProd) => {
        const sku = wcProd.sku;
        const stock = wcProd.stock_quantity || 0;
        
        if (sku) {
          const result = await db.update(products)
            .set({ stockQuantity: stock, isSynced: true })
            .where(eq(products.barcode, sku))
            .returning({ updatedId: products.id });
            
          return result.length;
        }
        return 0;
      });
      
      const results = await Promise.all(updatePromises);
      updatedCount += results.reduce((a, b) => a + b, 0);
    }

    return NextResponse.json({ 
      success: true, 
      fetchedFromWc: allWcProducts.length, 
      updatedInDb: updatedCount,
      message: `Successfully synced ${updatedCount} products.` 
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

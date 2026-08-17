import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// You can protect this route with a secret key if needed.
// For example, appending ?secret=YOUR_SECRET to the URL.
export const maxDuration = 60; // Max execution time for Vercel Hobby tier
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;

    if (!WC_CK || !WC_CS) {
      return NextResponse.json({ error: "WooCommerce credentials not configured" }, { status: 500 });
    }

    let startPage = parseInt(url.searchParams.get("page") || "1", 10);
    let totalUpdated = parseInt(url.searchParams.get("updated") || "0", 10);
    
    let allWcProducts: any[] = [];
    let hasMore = true;
    let pagesProcessed = 0;
    const maxPagesPerRun = 3; // Process 3 pages (300 products) per request to avoid timeout

    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };

    let currentPage = startPage;

    while (hasMore && pagesProcessed < maxPagesPerRun) {
      const fetchUrl = `${WC_URL}/wp-json/wc/v3/products?per_page=100&page=${currentPage}`;
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
        currentPage++;
        pagesProcessed++;
      }
    }

    let updatedCount = 0;
    
    // Process updates in chunks to avoid rate limiting
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
    
    totalUpdated += updatedCount;

    if (hasMore) {
      // Redirect to the next page to continue processing without timing out
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("updated", totalUpdated.toString());
      return NextResponse.redirect(url.toString(), { status: 302 });
    }

    return NextResponse.json({ 
      success: true, 
      updatedInDb: totalUpdated,
      message: `Successfully synced ${totalUpdated} products across ${currentPage - 1} pages.` 
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

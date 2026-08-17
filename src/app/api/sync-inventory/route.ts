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

    let startIdx = parseInt(url.searchParams.get("start") || "0", 10);
    let totalUpdated = parseInt(url.searchParams.get("updated") || "0", 10);
    const maxLocalPerRun = 50; // Process 50 local products per request

    // 1. Fetch only local products that have a barcode (SKU)
    const localProducts = await db.select({
      id: products.id,
      barcode: products.barcode,
      name: products.name
    }).from(products);
    
    const productsWithBarcode = localProducts.filter(p => p.barcode && p.barcode.trim() !== '');
    const productsWithoutBarcode = localProducts.filter(p => !p.barcode || p.barcode.trim() === '');
    
    // Mark products without barcodes as unsynced (only run on first chunk)
    if (startIdx === 0 && productsWithoutBarcode.length > 0) {
      for (const p of productsWithoutBarcode) {
        await db.update(products)
          .set({ isSynced: false })
          .where(eq(products.id, p.id));
      }
    }

    if (productsWithBarcode.length === 0) {
      return NextResponse.json({ success: true, message: "No local products with barcodes found." });
    }

    const chunkToProcess = productsWithBarcode.slice(startIdx, startIdx + maxLocalPerRun);

    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };

    let updatedCount = 0;
    const concurrentLimit = 10;
    
    for (let i = 0; i < chunkToProcess.length; i += concurrentLimit) {
      const batch = chunkToProcess.slice(i, i + concurrentLimit);
      
      const fetchPromises = batch.map(async (localProd) => {
        try {
          const fetchUrl = `${WC_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(localProd.barcode!)}`;
          const res = await fetch(fetchUrl, { headers });
          if (!res.ok) return 0;
          
          const wcData = await res.json();
          if (wcData && wcData.length > 0) {
            const matchedProduct = wcData[0];
            const stock = matchedProduct.stock_quantity || 0;
            
            await db.update(products)
              .set({ stockQuantity: stock, isSynced: true })
              .where(eq(products.id, localProd.id));
              
            return 1;
          } else {
            // Product not found in WooCommerce, mark as unsynced
            await db.update(products)
              .set({ isSynced: false })
              .where(eq(products.id, localProd.id));
            return 0;
          }
        } catch (err) {
          console.error(`Failed to fetch/update product ${localProd.barcode}:`, err);
          return 0;
        }
      });
      
      const results = await Promise.all(fetchPromises);
      updatedCount += results.reduce<number>((a, b) => a + b, 0);
    }
    
    totalUpdated += updatedCount;
    
    const nextStart = startIdx + maxLocalPerRun;
    
    if (nextStart < productsWithBarcode.length) {
      url.searchParams.set("start", nextStart.toString());
      url.searchParams.set("updated", totalUpdated.toString());
      return NextResponse.redirect(url.toString(), { status: 302 });
    }

    return NextResponse.json({ 
      success: true, 
      updatedInDb: totalUpdated,
      totalChecked: productsWithBarcode.length,
      message: `Successfully synced ${totalUpdated} products out of ${productsWithBarcode.length} local products with barcodes.` 
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // 1. Fetch ALL local products (even those without barcodes)
    const localProducts = await db.select({
      id: products.id,
      barcode: products.barcode,
      name: products.name
    }).from(products);

    if (localProducts.length === 0) {
      return NextResponse.json({ success: true, message: "No local products found." });
    }

    const chunkToProcess = localProducts.slice(startIdx, startIdx + maxLocalPerRun);

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
          let fetchUrl = "";
          let usedSearch = false;
          
          if (localProd.barcode && localProd.barcode.trim() !== '') {
            fetchUrl = `${WC_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(localProd.barcode)}`;
          } else {
            fetchUrl = `${WC_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(localProd.name)}`;
            usedSearch = true;
          }
          
          const res = await fetch(fetchUrl, { headers });
          if (!res.ok) return 0;
          
          const wcData = await res.json();
          if (wcData && wcData.length > 0) {
            let matchedProduct = null;
            
            if (usedSearch) {
              // Filter out "mini" perfumes to avoid pulling wrong SKU/stock
              const filteredWcData = wcData.filter((w: any) => {
                const wcName = w.name ? w.name.toLowerCase() : '';
                return !wcName.includes('mini') && !wcName.includes('מיני');
              });
              
              if (filteredWcData.length > 0) {
                // Exact name match (case insensitive) if we used search
                matchedProduct = filteredWcData.find((w: any) => 
                  w.name && w.name.trim().toLowerCase() === localProd.name.trim().toLowerCase()
                ) || filteredWcData[0]; // Fallback to first non-mini search result
              }
            } else {
              matchedProduct = wcData[0];
            }
            
            if (matchedProduct) {
              const stock = matchedProduct.stock_quantity || 0;
              const updateData: any = { stockQuantity: stock, isSynced: true };
              
              // If we searched by name and found a SKU, save it as barcode
              if (usedSearch && matchedProduct.sku) {
                updateData.barcode = matchedProduct.sku;
              }
              
              await db.update(products)
                .set(updateData)
                .where(eq(products.id, localProd.id));
                
              return 1;
            }
          }
          return 0;
        } catch (err) {
          console.error(`Failed to fetch/update product ${localProd.name}:`, err);
          return 0;
        }
      });
      
      const results = await Promise.all(fetchPromises);
      updatedCount += results.reduce<number>((a, b) => a + b, 0);
    }
    
    totalUpdated += updatedCount;
    
    const nextStart = startIdx + maxLocalPerRun;
    
    if (nextStart < localProducts.length) {
      url.searchParams.set("start", nextStart.toString());
      url.searchParams.set("updated", totalUpdated.toString());
      return NextResponse.redirect(url.toString(), { status: 302 });
    }

    return NextResponse.json({ 
      success: true, 
      updatedInDb: totalUpdated,
      totalChecked: localProducts.length,
      message: `Successfully synced ${totalUpdated} products out of ${localProducts.length} local products.` 
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

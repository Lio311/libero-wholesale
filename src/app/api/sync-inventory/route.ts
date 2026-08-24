import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { wc } from "@/lib/woocommerce";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Sync inventory from WooCommerce → local DB.
 * 
 * Strategy: Fetch ALL WooCommerce products once, build a SKU→stock map,
 * then update local products in bulk. This avoids the broken redirect chain
 * and N+1 API calls per product.
 * 
 * Runs as a Vercel cron job (see vercel.json).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    // Allow Vercel cron (no secret needed) or manual trigger with secret
    if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
      // Check for Vercel cron header (Vercel sends this automatically)
      const authHeader = req.headers.get("authorization");
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 1. Fetch all WooCommerce products in one pass
    console.log("[Sync] Fetching all WooCommerce products...");
    const wcProducts = await wc.fetchAllProducts();
    
    if (wcProducts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No products found in WooCommerce (check API credentials)." 
      });
    }

    // 2. Build SKU → stock map from WooCommerce
    const wcStockMap = new Map<string, number>();
    for (const wcProd of wcProducts) {
      if (wcProd.sku) {
        wcStockMap.set(wcProd.sku, wcProd.stock_quantity ?? 0);
      }
    }
    console.log(`[Sync] WooCommerce: ${wcProducts.length} products, ${wcStockMap.size} with SKU`);

    // 3. Fetch all local products
    const localProducts = await db.select({
      id: products.id,
      barcode: products.barcode,
      name: products.name,
      stockQuantity: products.stockQuantity,
    }).from(products);

    // 4. Update local stock from WooCommerce data
    let updatedCount = 0;
    let notFoundCount = 0;
    let noBarcodeCount = 0;

    // Process in concurrent batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < localProducts.length; i += BATCH_SIZE) {
      const batch = localProducts.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (localProd) => {
        if (!localProd.barcode || localProd.barcode.trim() === "") {
          await db.update(products)
            .set({ isSynced: false })
            .where(eq(products.id, localProd.id));
          return "no_barcode";
        }

        const wcStock = wcStockMap.get(localProd.barcode);
        
        if (wcStock !== undefined) {
          await db.update(products)
            .set({ stockQuantity: wcStock, isSynced: true })
            .where(eq(products.id, localProd.id));
          return "updated";
        } else {
          await db.update(products)
            .set({ isSynced: false })
            .where(eq(products.id, localProd.id));
          return "not_found";
        }
      });

      const results = await Promise.all(promises);
      for (const result of results) {
        if (result === "updated") updatedCount++;
        else if (result === "not_found") notFoundCount++;
        else if (result === "no_barcode") noBarcodeCount++;
      }
    }

    const message = `Synced ${updatedCount}/${localProducts.length} products. ` +
      `Not found in WC: ${notFoundCount}. No barcode: ${noBarcodeCount}.`;
    console.log(`[Sync] ${message}`);

    return NextResponse.json({ 
      success: true, 
      updatedInDb: updatedCount,
      totalLocal: localProducts.length,
      wcProductCount: wcProducts.length,
      notFoundInWc: notFoundCount,
      noBarcode: noBarcodeCount,
      message,
    });
  } catch (error) {
    console.error("[Sync] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

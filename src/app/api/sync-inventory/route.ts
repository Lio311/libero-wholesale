import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { wc } from "@/lib/woocommerce";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    // Auth check
    if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
      const authHeader = req.headers.get("authorization");
      const cronSecret = process.env.CRON_SECRET;
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // WooCommerce page to fetch
    const wcPage = parseInt(url.searchParams.get("page") || "1", 10);
    const totalUpdated = parseInt(url.searchParams.get("updated") || "0", 10);
    const isCron = !secret; // If no secret, it's triggered by Vercel cron

    console.log(`[Sync] Fetching WooCommerce page ${wcPage}...`);
    
    // Fetch ONLY ONE page from WooCommerce (100 products max) to avoid 504 timeouts
    const wcUrl = `https://libero-il.co.il/wp-json/wc/v3/products?per_page=100&page=${wcPage}`;
    const credentials = Buffer.from(`${process.env.LIBERO_WC_CK}:${process.env.LIBERO_WC_CS}`).toString('base64');
    
    const res = await fetch(wcUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from WooCommerce", status: res.status });
    }

    const wcProducts = await res.json();

    if (wcProducts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: `Sync completed! Total products updated: ${totalUpdated}`
      });
    }

    // Map WooCommerce products by SKU
    const wcStockMap = new Map<string, number>();
    for (const p of wcProducts) {
      if (p.sku) {
        wcStockMap.set(p.sku, p.stock_quantity ?? 0);
      }
    }

    // Fetch all local products that have barcodes
    const localProducts = await db.select({
      id: products.id,
      barcode: products.barcode,
    }).from(products);

    // Update local products that match the SKUs from this WooCommerce page
    let batchUpdated = 0;
    const promises = [];

    for (const localProd of localProducts) {
      if (localProd.barcode && wcStockMap.has(localProd.barcode)) {
        const wcStock = wcStockMap.get(localProd.barcode);
        promises.push(
          db.update(products)
            .set({ stockQuantity: wcStock, isSynced: true })
            .where(eq(products.id, localProd.id))
        );
        batchUpdated++;
      }
    }

    // Wait for all DB updates to finish
    await Promise.all(promises);
    
    const newTotal = totalUpdated + batchUpdated;
    const format = url.searchParams.get("format");
    const hasMore = wcProducts.length === 100;

    if (format === "json") {
      return NextResponse.json({
        success: true,
        message: `Processed page ${wcPage}, updated ${batchUpdated} products.`,
        hasMore,
        nextPage: wcPage + 1,
        totalUpdated: newTotal
      });
    }

    // If it's a manual run (browser), return a meta-refresh HTML page so the browser handles pagination.
    if (!isCron) {
      if (!hasMore) {
        return NextResponse.json({ 
          success: true, 
          message: `Sync completed! Total products updated: ${newTotal}`
        });
      }

      const nextUrl = `/api/sync-inventory?secret=${secret}&page=${wcPage + 1}&updated=${newTotal}`;
      
      const html = `
        <html dir="rtl">
          <head>
            <meta http-equiv="refresh" content="1;url=${nextUrl}" />
            <title>מסנכרן מלאי...</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f9fafb; text-align: center; }
              .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div class="loader"></div>
            <h2>מסנכרן מלאי מול WooCommerce...</h2>
            <p>מעבד עמוד ${wcPage}. עודכנו ${batchUpdated} מוצרים בחלק זה.</p>
            <p>סה"כ עודכנו עד כה: ${newTotal}</p>
            <p>עובר לעמוד ${wcPage + 1} באופן אוטומטי בעוד שניה...</p>
            <p><small>נא לא לסגור את העמוד עד לקבלת הודעת סיום!</small></p>
          </body>
        </html>
      `;
      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    // Fallback for cron: just return success for this batch (Cron will only sync page 1 right now, 
    // to make it sync all pages via cron we would need an external queue or GitHub Actions, 
    // but the manual browser sync will work perfectly for the full catalog).
    return NextResponse.json({ 
      success: true, 
      message: `Cron: Processed page ${wcPage}, updated ${batchUpdated} products.`
    });

  } catch (error) {
    console.error("[Sync] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

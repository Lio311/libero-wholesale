import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productChanges } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    
    // Auth check: Try to see if user is a logged-in admin first
    let isAuthorizedAdmin = false;
    try {
      const user = await currentUser();
      const isAdmin = await checkIsAdmin(user?.emailAddresses?.[0]?.emailAddress);
      if (isAdmin) {
        isAuthorizedAdmin = true;
      }
    } catch (e) {
      // Ignore auth error in case this is called via Vercel Cron without context
    }

    // If not an admin, check secrets
    if (!isAuthorizedAdmin) {
      if (process.env.SYNC_SECRET && secret !== process.env.SYNC_SECRET) {
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    const startPage = parseInt(url.searchParams.get("page") || "1", 10);
    const totalUpdated = parseInt(url.searchParams.get("updated") || "0", 10);
    
    // If not triggered by a manual secret, we treat it as an automated/admin request
    const isCron = !secret && !isAuthorizedAdmin; 
    
    const BATCH_SIZE = 50;
    let currentPage = startPage;
    let currentTotalUpdated = totalUpdated;
    let hasMore = true;
    
    const startTime = Date.now();
    const credentials = Buffer.from(`${process.env.LIBERO_WC_CK}:${process.env.LIBERO_WC_CS}`).toString('base64');

    while (hasMore) {
      // Safety break for Vercel 60s limit (stop at 45s)
      if (Date.now() - startTime > 45000) {
        console.log("[Sync] Approaching time limit, stopping sync loop.");
        break;
      }

      console.log(`[Sync] Processing local products page ${currentPage}...`);
      const offset = (currentPage - 1) * BATCH_SIZE;

      // Fetch local products for this batch
      const localProductsBatch = await db.select({
        id: products.id,
        barcode: products.barcode,
        stockQuantity: products.stockQuantity,
      }).from(products)
        .where(isNotNull(products.barcode))
        .limit(BATCH_SIZE)
        .offset(offset);

      if (localProductsBatch.length === 0) {
        hasMore = false;
        break;
      }

      // We chunk the WooCommerce API calls to avoid rate limits (e.g. 10 at a time)
      let batchUpdated = 0;
      const updatePromises: Promise<any>[] = [];
      const logPromises: Promise<any>[] = [];
      
      const CHUNK_SIZE = 10;
      for (let i = 0; i < localProductsBatch.length; i += CHUNK_SIZE) {
        const chunk = localProductsBatch.slice(i, i + CHUNK_SIZE);
        
        // Fetch stock for the chunk in parallel
        await Promise.all(chunk.map(async (localProd) => {
          if (!localProd.barcode) return;
          
          try {
            const wcUrl = `https://libero-il.co.il/wp-json/wc/v3/products?sku=${encodeURIComponent(localProd.barcode)}`;
            const res = await fetch(wcUrl, {
              headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (res.ok) {
              const wcData = await res.json();
              if (wcData && wcData.length > 0) {
                const wcProduct = wcData[0];
                const wcStock = wcProduct.stock_quantity ?? 0;
                
                // If stock is different or needs sync
                if (localProd.stockQuantity !== wcStock) {
                  // Check if back in stock
                  if (localProd.stockQuantity === 0 && wcStock > 0) {
                    logPromises.push(
                      db.insert(productChanges).values({
                        productId: localProd.id,
                        changeType: 'back_in_stock',
                        newValue: wcStock.toString()
                      })
                    );
                  }

                  updatePromises.push(
                    db.update(products)
                      .set({ stockQuantity: wcStock, isSynced: true })
                      .where(eq(products.id, localProd.id))
                  );
                  batchUpdated++;
                } else {
                  // Just mark as synced if it wasn't
                  updatePromises.push(
                    db.update(products)
                      .set({ isSynced: true })
                      .where(eq(products.id, localProd.id))
                  );
                }
              }
            }
          } catch (err) {
            console.error(`[Sync] Failed to fetch stock for SKU ${localProd.barcode}:`, err);
          }
        }));
      }

      // Wait for all DB updates and logs to finish for this batch
      if (updatePromises.length > 0) await Promise.all(updatePromises);
      if (logPromises.length > 0) await Promise.all(logPromises);

      currentTotalUpdated += batchUpdated;
      hasMore = localProductsBatch.length === BATCH_SIZE;

      // If it's a manual UI request, break after one page so the UI can show progress and loop
      if (!isCron) {
        break;
      }
      
      // Otherwise, cron continues to the next page
      if (hasMore) {
        currentPage++;
      }
    }

    const format = url.searchParams.get("format");

    if (format === "json") {
      return NextResponse.json({
        success: true,
        message: `Processed up to page ${currentPage}, total updated ${currentTotalUpdated} products.`,
        hasMore,
        nextPage: hasMore ? currentPage + 1 : null,
        totalUpdated: currentTotalUpdated
      });
    }

    // If it's a manual run (browser) without json format, return meta-refresh HTML
    if (!isCron) {
      if (!hasMore) {
        return NextResponse.json({ 
          success: true, 
          message: `Sync completed! Total products updated: ${currentTotalUpdated}`
        });
      }

      const nextUrl = `/api/sync-inventory?secret=${secret}&page=${currentPage + 1}&updated=${currentTotalUpdated}`;
      
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
            <p>מעבד עמוד ${currentPage}. עודכנו מוצרים בחלק זה.</p>
            <p>סה"כ עודכנו עד כה: ${currentTotalUpdated}</p>
            <p>עובר לעמוד הבא באופן אוטומטי בעוד שניה...</p>
            <p><small>נא לא לסגור את העמוד עד לקבלת הודעת סיום!</small></p>
          </body>
        </html>
      `;
      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    // Fallback for cron success response
    return NextResponse.json({ 
      success: true, 
      message: `Cron sync completed up to page ${currentPage}. Total updated: ${currentTotalUpdated}`
    });

  } catch (error) {
    console.error("[Sync] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productChanges, products, stores, emailLogs } from "@/lib/db/schema";
import { eq, gte, and, not, inArray, desc } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { DailyMarketingEmail, ProductChangeInfo } from "@/components/emails/DailyMarketingEmail";
import { render } from "@react-email/components";
import * as React from "react";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow manual trigger if secret is provided in query, otherwise check cron secret
    const url = new URL(req.url);
    const secretQuery = url.searchParams.get("secret");
    
    if (secretQuery !== process.env.SYNC_SECRET) {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // 1. Get recent changes
    const recentChanges = await db
      .select({
        id: productChanges.id,
        productId: productChanges.productId,
        changeType: productChanges.changeType,
        oldValue: productChanges.oldValue,
        newValue: productChanges.newValue,
        createdAt: productChanges.createdAt,
        name: products.name,
        nameHe: products.nameHe,
        imageUrl: products.imageUrl,
      })
      .from(productChanges)
      .innerJoin(products, eq(productChanges.productId, products.id))
      .where(gte(productChanges.createdAt, yesterday))
      .orderBy(desc(productChanges.createdAt));

    if (recentChanges.length === 0) {
      return NextResponse.json({ success: true, message: "No product changes in the last 24 hours. No emails sent." });
    }

    // Deduplicate changes (if multiple price changes happened, maybe keep the latest one or all of them. Here we just take unique product-changeType combos)
    const uniqueChangesMap = new Map<string, typeof recentChanges[0]>();
    for (const change of recentChanges) {
      const key = `${change.productId}-${change.changeType}`;
      if (!uniqueChangesMap.has(key)) {
        uniqueChangesMap.set(key, change);
      }
    }
    const finalChangesList = Array.from(uniqueChangesMap.values()) as ProductChangeInfo[];

    // 2. Get active stores who haven't opted out
    const activeStores = await db.select({
      id: stores.id,
      email: stores.email,
      name: stores.name
    })
    .from(stores)
    .where(
      and(
        eq(stores.status, 'active'),
        eq(stores.marketingOptOut, false)
      )
    );

    if (activeStores.length === 0) {
      return NextResponse.json({ success: true, message: "No active stores to send emails to." });
    }

    // 3. Filter stores that already received an email in the last 24h (to strictly enforce 1 per day if accidentally triggered twice)
    const recentLogs = await db.select({ storeId: emailLogs.storeId })
      .from(emailLogs)
      .where(gte(emailLogs.sentAt, yesterday));
    
    const sentStoreIds = new Set(recentLogs.map(l => l.storeId));
    
    const eligibleStores = activeStores.filter(store => !sentStoreIds.has(store.id));

    if (eligibleStores.length === 0) {
      return NextResponse.json({ success: true, message: "All active stores already received an email in the last 24 hours." });
    }

    // 4. Generate HTML & send
    let sentCount = 0;
    const html = await render(React.createElement(DailyMarketingEmail, { changes: finalChangesList }));
    
    for (const store of eligibleStores) {
      if (!store.email) continue;
      
      const res = await sendEmail({
        to: store.email,
        subject: "Libero Wholesale - עדכונים חמים על מוצרים ומחירים!",
        html: html,
        logOptions: { type: 'marketing', storeId: store.id }
      });
      
      if (res.success) {
        sentCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} marketing emails.` 
    });

  } catch (error) {
    console.error("Daily Email Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

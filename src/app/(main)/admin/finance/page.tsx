import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { FinanceClient } from "./FinanceClient";

export const dynamic = 'force-dynamic';

export default async function AdminFinancePage() {
  const allStores = await db.query.stores.findMany({
    orderBy: [desc(stores.currentBalance)],
  });

  const totalReceivables = allStores.reduce((acc, store) => acc + Number(store.currentBalance), 0);
  const totalCreditExposure = allStores.reduce((acc, store) => acc + Number(store.creditLimit), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">מבט פיננסי ואובליגו</h1>
        <p className="text-muted-foreground mt-2">
          מעקב אחר חובות פתוחים, חריגות ממסגרת אשראי, ותנאי תשלום של חנויות.
        </p>
      </div>

      <FinanceClient 
        stores={allStores} 
        totalReceivables={totalReceivables} 
        totalCreditExposure={totalCreditExposure} 
      />
    </div>
  );
}

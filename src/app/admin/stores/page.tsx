import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { StoresClient } from "./StoresClient";

export const dynamic = 'force-dynamic';

export default async function AdminStoresPage() {
  const allStores = await db.query.stores.findMany({
    orderBy: [desc(stores.createdAt)],
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ניהול לקוחות וחברות</h1>
        <p className="text-muted-foreground mt-2">
          אשר חשבונות חדשים, הגדר מסגרות אשראי וסנכרן נתונים מול קומקס.
        </p>
      </div>

      <StoresClient stores={allStores} />
    </div>
  );
}

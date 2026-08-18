import { db } from "@/lib/db";
import { searchLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AnalyticsClient } from "./AnalyticsClient";

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const logs = await db.query.searchLogs.findMany({
    orderBy: [desc(searchLogs.createdAt)],
    limit: 500, // Look at last 500 searches
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">סטטיסטיקות חיפוש ומלאי</h1>
        <p className="text-muted-foreground mt-2">
          מעקב אחר מנוע החיפוש הדו-לשוני, מונחים חסרים, ואחוזי הצלחה.
        </p>
      </div>

      <AnalyticsClient logs={logs} />
    </div>
  );
}

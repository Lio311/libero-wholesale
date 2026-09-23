import { db } from "@/lib/db";
import { emailLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { MarketingLogsClient } from "./MarketingLogsClient";

export const dynamic = 'force-dynamic';

export default async function MarketingLogsPage() {
  const logs = await db.query.emailLogs.findMany({
    orderBy: [desc(emailLogs.sentAt)],
    with: {
      store: true
    },
    limit: 1000 // Get last 1000 logs to prevent overloading
  });

  return (
    <div className="p-4 md:p-8 max-w-[1920px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">יומן דיוורים והודעות</h1>
        <p className="text-muted-foreground mt-2">
          מעקב אחר רשימת המיילים שנשלחו מהמערכת (דיוור שיווקי, עדכוני מנהל והודעות ללקוחות).
        </p>
      </div>

      <MarketingLogsClient initialLogs={logs} />
    </div>
  );
}

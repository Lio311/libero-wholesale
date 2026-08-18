import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AccountClient } from "./AccountClient";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { userId } = await auth();
  
  let store = null;
  
  // If user is authenticated, find their associated store
  if (userId) {
    const userStore = await db.query.stores.findFirst({
      where: eq(stores.clerkUserId, userId)
    });
    store = userStore || null;
  } else {
    // For local development demonstration without real auth attached:
    // Just fetch the first store
    const firstStore = await db.query.stores.findFirst();
    store = firstStore || null;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">אזור אישי</h1>
        <p className="text-muted-foreground mt-2">
          צפה בפרטי העסק שלך, מסגרת האשראי, אובליגו עדכני ותנאי תשלום.
        </p>
      </div>

      <AccountClient store={store} />
    </div>
  );
}

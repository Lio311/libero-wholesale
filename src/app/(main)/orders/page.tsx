import { db } from "@/lib/db";
import { orders, stores } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { OrdersClient } from "./OrdersClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Find the store belonging to this user
  const userStore = await db.query.stores.findFirst({
    where: eq(stores.clerkUserId, userId)
  });

  const conditions = [eq(orders.clerkUserId, userId)];
  
  if (userStore) {
    conditions.push(eq(orders.storeId, userStore.id));
  }

  const history = await db.query.orders.findMany({
    where: or(...conditions),
    orderBy: [desc(orders.createdAt)],
    limit: 50,
    with: {
      orderItems: {
        with: {
          product: true
        }
      }
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">היסטוריית הזמנות</h1>
        <p className="text-muted-foreground mt-2">
          צפה בהזמנות הקודמות שלך ועקוב אחרי סטטוסים.
        </p>
      </div>

      <OrdersClient orders={history} />
    </div>
  );
}

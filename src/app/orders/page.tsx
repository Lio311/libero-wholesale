import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { OrdersClient } from "./OrdersClient";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  // In a real app, we'd filter by storeId belonging to the current Clerk user.
  // For demonstration, we fetch the latest orders.
  const history = await db.query.orders.findMany({
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
          צפה בהזמנות הקודמות שלך, עקוב אחרי סטטוסים וייצא נתונים לאקסל.
        </p>
      </div>

      <OrdersClient orders={history} />
    </div>
  );
}

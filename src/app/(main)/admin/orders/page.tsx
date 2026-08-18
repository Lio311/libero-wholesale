import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminOrdersClient } from "./AdminOrdersClient";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      store: true,
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
        <h1 className="text-3xl font-bold tracking-tight">ניהול הזמנות</h1>
        <p className="text-muted-foreground mt-2">
          צפה בכל ההזמנות במערכת, עדכן סטטוסים ונהל את תהליך האספקה.
        </p>
      </div>

      <AdminOrdersClient initialOrders={allOrders} />
    </div>
  );
}

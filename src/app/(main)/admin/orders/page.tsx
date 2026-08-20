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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניהול הזמנות</h1>
          <p className="text-muted-foreground mt-2">
            צפה בכל ההזמנות במערכת, עדכן סטטוסים ונהל את תהליך האספקה.
          </p>
        </div>
        <a href="/admin/orders/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          יצירת הזמנה חדשה
        </a>
      </div>

      <AdminOrdersClient initialOrders={allOrders} />
    </div>
  );
}

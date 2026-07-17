import { db } from "@/lib/db";
import { orders, stores, products } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { AdminClient } from "./AdminClient";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch real data from DB
  const recentOrdersList = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit: 10,
  });

  const storesList = await db.query.stores.findMany();
  const productsList = await db.query.products.findMany();

  // Aggregate stats
  const totalRevenue = recentOrdersList.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  const activeOrdersCount = recentOrdersList.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const totalCustomers = storesList.length;
  const lowStockItems = productsList.filter(p => p.stockQuantity < 10).length; // Arbitrary low stock threshold

  // Map stores to orders for the UI
  const ordersWithStores = recentOrdersList.map(order => {
    const store = storesList.find(s => s.id === order.storeId);
    return {
      ...order,
      store: store || null
    };
  });

  const stats = {
    totalRevenue,
    activeOrders: activeOrdersCount,
    totalCustomers,
    lowStockItems
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">לוח בקרה למנהל</h1>
        <p className="text-muted-foreground mt-2">
          מבט כולל על המערכת, הזמנות, לקוחות ומלאי בחיבור ישיר לקומקס.
        </p>
      </div>

      <AdminClient stats={stats} recentOrders={ordersWithStores} />
    </div>
  );
}

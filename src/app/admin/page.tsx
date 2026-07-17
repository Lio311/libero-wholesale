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

  const allOrdersList = await db.query.orders.findMany();
  const storesList = await db.query.stores.findMany();
  const productsList = await db.query.products.findMany();

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthOrders = allOrdersList.filter(o => new Date(o.createdAt) >= startOfThisMonth);
  const lastMonthOrders = allOrdersList.filter(o => {
    const d = new Date(o.createdAt);
    return d >= startOfLastMonth && d < startOfThisMonth;
  });

  const thisMonthRevenue = thisMonthOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
  const lastMonthRevenue = lastMonthOrders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

  let revenueGrowth = 0;
  if (lastMonthRevenue > 0) {
    revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  } else if (thisMonthRevenue > 0) {
    revenueGrowth = 100;
  }

  const activeOrdersCount = allOrdersList.filter(o => o.status === 'pending' || o.status === 'processing').length;
  
  const totalCustomers = storesList.length;
  const newCustomers = storesList.filter(s => new Date(s.createdAt) >= startOfThisMonth).length;

  const lowStockItems = productsList.filter(p => p.stockQuantity < 10).length;

  // Map stores to orders for the UI
  const ordersWithStores = recentOrdersList.map(order => {
    const store = storesList.find(s => s.id === order.storeId);
    return {
      ...order,
      store: store || null
    };
  });

  const stats = {
    totalRevenue: thisMonthRevenue,
    revenueGrowth,
    activeOrders: activeOrdersCount,
    totalCustomers,
    newCustomers,
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

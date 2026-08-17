import { db } from "./src/lib/db";
import { stores, orders } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const allStores = await db.query.stores.findMany();
    for (const store of allStores) {
      const storeOrders = await db.query.orders.findMany({
        where: eq(orders.storeId, store.id)
      });
      const total = storeOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
      await db.execute(`UPDATE stores SET current_balance = ${total} WHERE id = '${store.id}'`);
      console.log(`Updated store ${store.name} balance to ${total}`);
    }
    console.log("Done");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();

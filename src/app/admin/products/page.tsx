import { db } from "@/lib/db";
import { products, brands } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ProductsClient } from "./ProductsClient";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
  });

  const allBrands = await db.query.brands.findMany();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ניהול מוצרים</h1>
        <p className="text-muted-foreground mt-2">
          עדכן מחירי סיטונאות, מלאי, ופרטי בשמים. השינויים מסונכרנים עם קומקס.
        </p>
      </div>

      <ProductsClient products={allProducts} brands={allBrands} />
    </div>
  );
}

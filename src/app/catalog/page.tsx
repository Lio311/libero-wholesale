import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CatalogClient } from "./CatalogClient";

export const dynamic = 'force-dynamic'; // Prevent static building since we query DB directly here

export default async function CatalogPage() {
  // Fetch initial top 20 products
  const initialProducts = await db.query.products.findMany({
    where: (products, { eq }) => eq(products.status, 'active'),
    orderBy: [desc(products.createdAt)],
    limit: 20,
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">הקטלוג הסיטונאי</h1>
        <p className="text-muted-foreground mt-2">
          צפה בכל המוצרים, מלאים מעודכנים בזמן אמת ומחירים סיטונאים.
        </p>
      </div>

      <CatalogClient initialProducts={initialProducts} />
    </div>
  );
}

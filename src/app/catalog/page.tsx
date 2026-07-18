import { db } from "@/lib/db";
import { products, brands } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { CatalogClient } from "./CatalogClient";

export const dynamic = 'force-dynamic'; // Prevent static building since we query DB directly here

export default async function CatalogPage() {
  // Fetch initial top 20 products
  const initialProducts = await db.query.products.findMany({
    where: (products, { and, eq }) => and(
      eq(products.status, 'active'),
      eq(products.isDraft, false)
    ),
    orderBy: [desc(products.createdAt)],
  });

  const allBrands = await db.query.brands.findMany();

  // Find the most recently updated product
  const latestUpdatedProduct = await db.query.products.findFirst({
    where: (products, { and, eq }) => and(
      eq(products.status, 'active'),
      eq(products.isDraft, false)
    ),
    orderBy: [desc(products.updatedAt)],
  });

  let lastUpdateStr = "";
  if (latestUpdatedProduct && latestUpdatedProduct.updatedAt) {
    const d = new Date(latestUpdatedProduct.updatedAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    lastUpdateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight">קטלוג מוצרים</h1>
        {lastUpdateStr && (
          <p className="text-muted-foreground mt-2">
            עודכן לאחרונה {lastUpdateStr}
          </p>
        )}
      </div>

      <CatalogClient initialProducts={initialProducts} brands={allBrands} />
    </div>
  );
}

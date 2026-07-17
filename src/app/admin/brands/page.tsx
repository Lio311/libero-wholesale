import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { BrandsClient } from "./BrandsClient";

export const dynamic = 'force-dynamic';

export default async function AdminBrandsPage() {
  const allBrands = await db.query.brands.findMany({
    orderBy: [desc(brands.createdAt)]
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ניהול מותגים</h1>
        <p className="text-muted-foreground mt-2">הוסף, ערוך ומחק מותגים כולל תמונות לוגו</p>
      </div>
      <BrandsClient initialBrands={allBrands} />
    </div>
  );
}

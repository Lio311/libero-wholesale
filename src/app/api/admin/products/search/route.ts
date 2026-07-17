import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ilike, or, and, eq, not } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.emailAddresses.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0].emailAddress;
    const isAdmin = await checkIsAdmin(email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    const searchResults = await db.query.products.findMany({
      where: and(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.nameHe, `%${query}%`),
          ilike(products.barcode, `%${query}%`)
        ),
        eq(products.status, 'active'),
        eq(products.isDraft, false)
      ),
      limit: 10,
    });

    return NextResponse.json({ products: searchResults });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

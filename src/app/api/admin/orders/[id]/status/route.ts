import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkIsAdmin } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();
    if (!user || !user.emailAddresses.length) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0].emailAddress;
    const isAdmin = await checkIsAdmin(email);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

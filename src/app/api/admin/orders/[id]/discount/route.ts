import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { discountAmount } = await req.json();

    if (discountAmount === undefined || isNaN(Number(discountAmount))) {
      return NextResponse.json({ error: "Invalid discount amount" }, { status: 400 });
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    const sum = items.reduce((acc, item) => acc + Number(item.totalPrice), 0);
    const finalAmount = Math.max(0, sum - Number(discountAmount));

    await db.update(orders).set({
      discountAmount: discountAmount.toString(),
      totalAmount: finalAmount.toString()
    }).where(eq(orders.id, id));

    return NextResponse.json({ success: true, finalAmount });
  } catch (error) {
    console.error("Error updating order discount:", error);
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if order exists
    const orderExists = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!orderExists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get order items to restore stock
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    // We should use a transaction
    await db.transaction(async (tx) => {
      // Restore stock for each item
      for (const item of items) {
        await tx.update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`
          })
          .where(eq(products.id, item.productId));
      }

      // Delete order items
      await tx.delete(orderItems).where(eq(orderItems.orderId, id));

      // Delete order
      await tx.delete(orders).where(eq(orders.id, id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

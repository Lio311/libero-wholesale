import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";
import { wc } from "@/lib/woocommerce";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Restore stock for each item (local + WooCommerce)
    for (const item of items) {
      // Restore local stock
      await db.update(products)
        .set({
          stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`
        })
        .where(eq(products.id, item.productId));

      // Restore WooCommerce stock (fire-and-forget)
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId),
      });
      if (product?.barcode) {
        wc.adjustStockBySku(product.barcode, item.quantity).catch((err) =>
          console.error(`[AdminDeleteOrder] Failed to sync WC stock for ${product.barcode}:`, err)
        );
      }
    }

    // Delete order items
    await db.delete(orderItems).where(eq(orderItems.orderId, id));

    // Delete order
    await db.delete(orders).where(eq(orders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

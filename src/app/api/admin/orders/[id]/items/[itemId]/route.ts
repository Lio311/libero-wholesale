import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import { wc } from "@/lib/woocommerce";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, itemId } = await params;
    const { quantity } = await req.json();

    if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const newQty = Number(quantity);
    let stockDelta = 0;
    let productId = "";

    // Using transaction for stock sync
    await db.transaction(async (tx) => {
      const item = await tx.query.orderItems.findFirst({
        where: and(eq(orderItems.id, itemId), eq(orderItems.orderId, id)),
      });

      if (!item) throw new Error("Order item not found");

      const diff = newQty - item.quantity;
      stockDelta = -diff; // delta for WC: if diff > 0, we deduct (negative delta)
      productId = item.productId;
      const newTotalPrice = newQty * Number(item.unitPrice);

      // Update stock: if diff > 0, we deduct from stock. If diff < 0, we add to stock.
      // So stockQuantity = stockQuantity - diff
      await tx.update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} - ${diff}` })
        .where(eq(products.id, item.productId));

      // Update order item
      await tx.update(orderItems)
        .set({ quantity: newQty, totalPrice: newTotalPrice.toString() })
        .where(eq(orderItems.id, itemId));

      // Recalculate order total
      const allItems = await tx.query.orderItems.findMany({ where: eq(orderItems.orderId, id) });
      const order = await tx.query.orders.findFirst({ where: eq(orders.id, id) });
      
      const sum = allItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
      const finalAmount = Math.max(0, sum - Number(order?.discountAmount || 0));

      await tx.update(orders)
        .set({ totalAmount: finalAmount.toString(), itemsCount: allItems.length })
        .where(eq(orders.id, id));
    });

    // Sync stock change to WooCommerce (outside transaction, fire-and-forget)
    if (productId && stockDelta !== 0) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      });
      if (product?.barcode) {
        wc.adjustStockBySku(product.barcode, stockDelta).catch((err) =>
          console.error(`[AdminUpdateItem] Failed to sync WC stock for ${product.barcode}:`, err)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating order item:", error);
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, itemId } = await params;

    let restoredProductId = "";
    let restoredQuantity = 0;

    await db.transaction(async (tx) => {
      const item = await tx.query.orderItems.findFirst({
        where: and(eq(orderItems.id, itemId), eq(orderItems.orderId, id)),
      });

      if (!item) throw new Error("Order item not found");

      restoredProductId = item.productId;
      restoredQuantity = item.quantity;

      // Restore stock
      await tx.update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}` })
        .where(eq(products.id, item.productId));

      // Delete order item
      await tx.delete(orderItems).where(eq(orderItems.id, itemId));

      // Recalculate order total
      const allItems = await tx.query.orderItems.findMany({ where: eq(orderItems.orderId, id) });
      const order = await tx.query.orders.findFirst({ where: eq(orders.id, id) });
      
      const sum = allItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
      const finalAmount = Math.max(0, sum - Number(order?.discountAmount || 0));

      await tx.update(orders)
        .set({ totalAmount: finalAmount.toString(), itemsCount: allItems.length })
        .where(eq(orders.id, id));
    });

    // Sync stock restoration to WooCommerce (fire-and-forget)
    if (restoredProductId && restoredQuantity > 0) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, restoredProductId),
      });
      if (product?.barcode) {
        wc.adjustStockBySku(product.barcode, restoredQuantity).catch((err) =>
          console.error(`[AdminDeleteItem] Failed to sync WC stock for ${product.barcode}:`, err)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting order item:", error);
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}

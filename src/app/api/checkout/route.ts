import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { items, customerDetails, storeId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customerDetails || !customerDetails.customerName || !customerDetails.customerPhone || !customerDetails.customerEmail) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    const itemsCount = items.length;

    for (const item of items) {
      totalAmount += Number(item.product.price) * item.quantity;
    }

    // Create order
    const [newOrder] = await db.insert(orders).values({
      storeId: storeId || null,
      clerkUserId: userId || null,
      status: "pending",
      totalAmount: totalAmount.toString(),
      itemsCount,
      customerName: customerDetails.customerName,
      businessName: customerDetails.businessName || null,
      customerEmail: customerDetails.customerEmail,
      customerPhone: customerDetails.customerPhone,
      deliveryAddress: customerDetails.deliveryAddress || null,
      notes: customerDetails.notes || null,
    }).returning();

    // Create order items
    for (const item of items) {
      const lineTotal = Number(item.product.price) * item.quantity;
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price.toString(),
        totalPrice: lineTotal.toString(),
      });
      
      // Update stock quantity
      await db.execute(
        sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.product.id}`
      );
    }

    // TODO: Send emails and generate PDF invoice (Phase 3)

    return NextResponse.json({ success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

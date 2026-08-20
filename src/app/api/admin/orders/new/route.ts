import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, stores } from "@/lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const isAdmin = await checkIsAdmin(user?.emailAddresses?.[0]?.emailAddress);

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, items, customerDetails } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order is empty" }, { status: 400 });
    }

    let subTotal = 0;
    const itemsCount = items.length;

    for (const item of items) {
      subTotal += Number(item.unitPrice) * item.quantity;
    }
    
    const totalAmount = subTotal * 1.18; // Add VAT

    const storeRecord = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
    });

    if (!storeRecord) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Create order
    const [newOrder] = await db.insert(orders).values({
      storeId: storeId,
      clerkUserId: storeRecord.clerkUserId,
      status: "pending",
      totalAmount: totalAmount.toString(),
      itemsCount,
      customerName: storeRecord.contactName,
      businessName: storeRecord.name,
      customerEmail: storeRecord.email,
      customerPhone: storeRecord.phone,
      deliveryAddress: storeRecord.address,
    }).returning();

    // Create order items
    for (const item of items) {
      const lineTotal = Number(item.unitPrice) * item.quantity;
      
      const testerQty = item.testerQuantity !== undefined && item.testerQuantity !== null 
        ? item.testerQuantity 
        : null; // null means fallback to default pdf logic if not provided

      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        testerQuantity: testerQty,
        unitPrice: item.unitPrice.toString(),
        totalPrice: lineTotal.toString(),
      });
      
      // Update stock quantity for the sold products
      await db.execute(
        sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.productId}`
      );
    }

    // Update store balance
    await db.execute(
      sql`UPDATE stores SET current_balance = current_balance + ${totalAmount} WHERE id = ${storeId}`
    );

    return NextResponse.json({ success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber });
  } catch (error) {
    console.error("Admin Create Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

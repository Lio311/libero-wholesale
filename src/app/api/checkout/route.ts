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

    let subTotal = 0;
    const itemsCount = items.length;

    for (const item of items) {
      subTotal += Number(item.product.price) * item.quantity;
    }
    
    const totalAmount = subTotal * 1.18;

    // Validate obligo if storeId exists
    if (storeId) {
      const storeRecord = await db.query.stores.findFirst({
        where: eq(stores.id, storeId),
      });

      if (storeRecord) {
        const creditLimit = Number(storeRecord.creditLimit);
        const currentBalance = Number(storeRecord.currentBalance);
        
        // If credit limit is greater than 0, enforce it
        if (creditLimit > 0) {
          const availableCredit = creditLimit - currentBalance;
          if (totalAmount > availableCredit) {
            return NextResponse.json(
              { error: `חריגה ממסגרת האובליגו. המסגרת הפנויה היא ₪${availableCredit.toFixed(2)}` },
              { status: 400 }
            );
          }
        }
      }
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

    // Update store balance if storeId exists
    if (storeId) {
      await db.execute(
        sql`UPDATE stores SET current_balance = current_balance + ${totalAmount} WHERE id = ${storeId}`
      );
    }

    // TODO: Send emails and generate PDF invoice (Phase 3)

    return NextResponse.json({ success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

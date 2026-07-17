import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/admin";
import { randomUUID } from "crypto";

export async function POST(
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
    const body = await req.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check if order exists
    const orderExists = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!orderExists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get the product
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }

    // Check if item already exists in order
    const existingItem = await db.query.orderItems.findFirst({
      where: and(eq(orderItems.orderId, id), eq(orderItems.productId, productId)),
    });

    const unitPrice = product.isOnSale && product.priceDropPrice 
      ? Number(product.priceDropPrice) 
      : Number(product.price);

    let finalItem;

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = newQuantity * unitPrice;
      
      await db.update(orderItems)
        .set({
          quantity: newQuantity,
          totalPrice: newTotalPrice.toString()
        })
        .where(eq(orderItems.id, existingItem.id));

      finalItem = { ...existingItem, quantity: newQuantity, totalPrice: newTotalPrice.toString(), product };
    } else {
      // Create new item
      const newItemId = randomUUID();
      const newTotalPrice = quantity * unitPrice;
      
      await db.insert(orderItems).values({
        id: newItemId,
        orderId: id,
        productId,
        quantity,
        unitPrice: unitPrice.toString(),
        totalPrice: newTotalPrice.toString()
      });

      finalItem = {
        id: newItemId,
        orderId: id,
        productId,
        quantity,
        unitPrice: unitPrice.toString(),
        totalPrice: newTotalPrice.toString(),
        product
      };
    }

    // Deduct stock
    await db.update(products)
      .set({ stockQuantity: sql`${products.stockQuantity} - ${quantity}` })
      .where(eq(products.id, productId));

    // Update order totals
    // Get all items to calculate new totals
    const allItems = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
    });

    const newSum = allItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
    const newItemsCount = allItems.length;
    const finalAmount = Math.max(0, newSum - Number(orderExists.discountAmount || 0));

    await db.update(orders)
      .set({
        totalAmount: finalAmount.toString(),
        itemsCount: newItemsCount
      })
      .where(eq(orders.id, id));

    return NextResponse.json({ success: true, item: finalItem, orderTotalAmount: finalAmount.toString(), itemsCount: newItemsCount });
  } catch (error) {
    console.error("Error adding item to order:", error);
    return NextResponse.json(
      { error: "Failed to add item to order" },
      { status: 500 }
    );
  }
}

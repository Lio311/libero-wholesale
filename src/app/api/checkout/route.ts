import { NextResponse } from "next/server";
import * as React from 'react';
import { db } from "@/lib/db";
import { orders, orderItems, products, stores } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { wc } from "@/lib/woocommerce";
import { getNotificationEmails, sendEmail, getAppUrl } from "@/lib/email";
import { render } from "@react-email/components";
import { NewOrderNotificationEmail } from "@/components/emails/NewOrderNotification";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmation";
import { generateOrderPDFBuffer } from "@/lib/pdf";

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

    // Create order items and update stock (local + WooCommerce)
    const orderItemsForPdf: any[] = [];
    for (const item of items) {
      const lineTotal = Number(item.product.price) * item.quantity;
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price.toString(),
        totalPrice: lineTotal.toString(),
      });

      orderItemsForPdf.push({
        productName: item.product.name || item.product.nameHe || 'מוצר',
        barcode: item.product.barcode || null,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: lineTotal,
        testerRatio: item.product.testerRatio || null,
        testerQuantity: null,
      });
      
      // Update local stock
      await db.execute(
        sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.product.id}`
      );

      // Sync stock deduction to WooCommerce
      if (item.product.barcode) {
        wc.adjustStockBySku(item.product.barcode, -item.quantity).catch((err) =>
          console.error(`[Checkout] Failed to sync WC stock for ${item.product.barcode}:`, err)
        );
      }
    }

    // Update store balance if storeId exists
    if (storeId) {
      await db.execute(
        sql`UPDATE stores SET current_balance = current_balance + ${totalAmount} WHERE id = ${storeId}`
      );
    }

    // Generate PDF and send emails
    await (async () => {
      try {
        const origin = getAppUrl();

        // Generate PDF buffer
        let pdfBuffer: Uint8Array | null = null;
        try {
          pdfBuffer = await generateOrderPDFBuffer(newOrder, orderItemsForPdf, origin);
        } catch (pdfErr) {
          console.error("Failed to generate order PDF:", pdfErr);
        }

        const pdfAttachment = pdfBuffer
          ? [{ filename: `order-${newOrder.orderNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' as const }]
          : undefined;

        // 1. Send admin/supplier notification email with PDF
        const adminEmails = await getNotificationEmails();
        if (adminEmails.length > 0) {
          const adminHtml = await render(React.createElement(NewOrderNotificationEmail, { order: newOrder }));
          await sendEmail({
            to: adminEmails,
            subject: `הזמנה חדשה התקבלה - #${newOrder.orderNumber}`,
            html: adminHtml,
            attachments: pdfAttachment,
            logOptions: { type: 'admin', storeId: newOrder.storeId }
          }).catch(err => console.error("Failed to send admin notification email:", err));
        }

        // 2. Send customer confirmation email with PDF
        if (newOrder.customerEmail) {
          const customerHtml = await render(React.createElement(OrderConfirmationEmail, { order: newOrder, items: orderItemsForPdf }));
          await sendEmail({
            to: newOrder.customerEmail,
            subject: `אישור הזמנה - #${newOrder.orderNumber}`,
            html: customerHtml,
            attachments: pdfAttachment,
            logOptions: { type: 'customer', storeId: newOrder.storeId }
          }).catch(err => console.error("Failed to send customer confirmation email:", err));
        }
      } catch (emailErr) {
        console.error("Failed to render/send emails:", emailErr);
      }
    })();

    return NextResponse.json({ success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


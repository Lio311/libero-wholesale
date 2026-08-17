import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateOrderPDFBuffer } from '@/lib/pdf';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkIsAdmin } from '@/lib/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const isAdmin = await checkIsAdmin(user?.emailAddresses?.[0]?.emailAddress);

    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    
    // Fetch order
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    
    if (!orderData) {
      return new NextResponse('Order not found', { status: 404 });
    }
    
    if (!isAdmin && orderData.clerkUserId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Fetch items with product data
    const itemsData = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productName: products.name,
        barcode: products.barcode,
        testerRatio: products.testerRatio,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
      
    // Generate PDF
    const pdfBuffer = await generateOrderPDFBuffer(orderData, itemsData);
    
    // Return PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="order-${orderData.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

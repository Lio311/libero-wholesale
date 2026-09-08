import { NextResponse } from "next/server";
import * as React from 'react';
import { getNotificationEmails, sendEmail } from "@/lib/email";
import { render } from "@react-email/components";
import { NewOrderNotificationEmail } from "@/components/emails/NewOrderNotification";
import { NewCustomerNotificationEmail } from "@/components/emails/NewCustomerNotification";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const adminEmails = await getNotificationEmails();
    
    if (adminEmails.length === 0) {
      return NextResponse.json({ error: "No admin emails configured." }, { status: 400 });
    }

    const mockOrder = {
      id: 999,
      orderNumber: "TEST-001",
      storeId: 1,
      clerkUserId: "test_user",
      status: "pending",
      totalAmount: "150.00",
      itemsCount: 2,
      customerName: "ישראל ישראלי",
      businessName: "חנות טסט",
      customerEmail: "israel@example.com",
      customerPhone: "050-1234567",
      deliveryAddress: "רחוב בדיקה 1, תל אביב",
      notes: "נא לשים ליד הדלת",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Render and send the New Order Email
    const orderHtml = await render(React.createElement(NewOrderNotificationEmail, { order: mockOrder as any }));
    
    await sendEmail({
      to: adminEmails,
      subject: "בדיקת מערכת: הזמנה חדשה התקבלה - #TEST-001",
      html: orderHtml
    });

    // Render and send the New Customer Email
    const customerHtml = await render(React.createElement(NewCustomerNotificationEmail, { 
      customerName: "ישראל ישראלי",
      businessName: "חנות טסט",
      email: "israel@example.com",
      phone: "050-1234567"
    }));

    await sendEmail({
      to: adminEmails,
      subject: "בדיקת מערכת: לקוח חדש ממתין לאישור - חנות טסט",
      html: customerHtml
    });

    return NextResponse.json({ 
      success: true, 
      message: `Test emails sent successfully to: ${adminEmails.join(', ')}`,
      note: "Check your inbox (and spam folder)!"
    });
  } catch (error) {
    console.error("Test Email Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

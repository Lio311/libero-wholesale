import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Tailwind,
} from '@react-email/components';

export function OrderConfirmationEmail({ order, items }: { order: any, items: any[] }) {
  return (
    <Html dir="rtl" lang="he">
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-4" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
          <Container dir="rtl" className="bg-white border border-gray-200 rounded-lg p-8 mx-auto max-w-2xl shadow-sm" style={{ direction: 'rtl' }}>
            <Heading className="text-3xl font-bold text-center text-black mb-6" style={{ direction: 'rtl' }}>
              הזמנתך התקבלה!
            </Heading>
            <Text className="text-lg text-gray-700 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              שלום {order.customerName},
            </Text>
            <Text className="text-gray-600 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              תודה רבה על הזמנתך מ-Libero Wholesale. ההזמנה שלך (מספר {order.orderNumber}) התקבלה בהצלחה ונמצאת בטיפול.
            </Text>
            
            <Section className="bg-gray-50 rounded-lg p-6 my-6 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4" style={{ direction: 'rtl', textAlign: 'right' }}>
                פרטי הזמנה
              </Heading>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>שם עסק:</strong> {order.businessName}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>כתובת משלוח:</strong> {order.deliveryAddress}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>סך הכל:</strong> ₪{Number(order.totalAmount).toFixed(2)}</Text>
            </Section>

            <Text className="text-gray-600 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              מצורף למייל זה סיכום הזמנה בפורמט PDF.
            </Text>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm text-gray-400 text-center" style={{ direction: 'rtl' }}>
              מסמך זה נשלח אוטומטית ממערכת Libero Wholesale. אין להשיב למייל זה.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

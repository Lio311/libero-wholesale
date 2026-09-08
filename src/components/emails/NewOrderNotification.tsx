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
  Link
} from '@react-email/components';

export function NewOrderNotificationEmail({ order }: { order: any }) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.libero-wholesale.co.il'}/admin/orders`;

  return (
    <Html dir="rtl">
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-4">
          <Container className="bg-white border border-gray-200 rounded-lg p-8 mx-auto max-w-2xl shadow-sm">
            <Heading className="text-2xl font-bold text-center text-black mb-6">
              הזמנה חדשה התקבלה!
            </Heading>

            <Section className="bg-gray-50 rounded-lg p-6 my-6 text-right">
              <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4">
                פרטי הזמנה #{order.orderNumber}
              </Heading>
              <Text className="m-1"><strong>לקוח / עסק:</strong> {order.businessName || order.customerName}</Text>
              <Text className="m-1"><strong>סך הכל:</strong> ₪{Number(order.totalAmount).toFixed(2)}</Text>
              <Text className="m-1"><strong>מספר פריטים:</strong> {order.itemsCount}</Text>
            </Section>

            <Section className="text-center mt-6">
              <Link
                href={dashboardUrl}
                className="bg-black text-white px-6 py-3 rounded-md font-bold text-sm no-underline inline-block"
                style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}
              >
                לצפייה בכל ההזמנות במערכת
              </Link>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm text-gray-400 text-center">
              הודעה זו נשלחה אוטומטית ממערכת Libero Wholesale.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

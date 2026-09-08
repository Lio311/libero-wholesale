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

export function NewCustomerNotificationEmail({ store }: { store: any }) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.libero-wholesale.co.il'}/admin/stores`;

  return (
    <Html dir="rtl" lang="he">
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-4" style={{ direction: 'rtl', textAlign: 'right' }}>
          <Container className="bg-white border border-gray-200 rounded-lg p-8 mx-auto max-w-2xl shadow-sm" style={{ direction: 'rtl' }}>
            <Heading className="text-2xl font-bold text-center text-black mb-6" style={{ direction: 'rtl' }}>
              לקוח חדש מבקש להצטרף
            </Heading>
            <Text className="text-lg text-gray-700 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              לקוח חדש מילא את טופס ההרשמה וממתין לאישורך כדי להתחיל להזמין.
            </Text>

            <Section className="bg-gray-50 rounded-lg p-6 my-6 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
              <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4" style={{ direction: 'rtl', textAlign: 'right' }}>
                פרטי הלקוח
              </Heading>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>שם העסק:</strong> {store.name}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>שם איש קשר:</strong> {store.contactName}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>אימייל:</strong> {store.email}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>טלפון:</strong> {store.phone}</Text>
              <Text className="m-1" style={{ direction: 'rtl', textAlign: 'right' }}><strong>כתובת:</strong> {store.address}</Text>
            </Section>

            <Section className="text-center mt-6" style={{ direction: 'rtl' }}>
              <Link
                href={dashboardUrl}
                className="bg-black text-white px-6 py-3 rounded-md font-bold text-sm no-underline inline-block"
                style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}
              >
                לניהול לקוחות ואישור
              </Link>
            </Section>

            <Hr className="border-gray-200 my-6" />

            <Text className="text-sm text-gray-400 text-center" style={{ direction: 'rtl' }}>
              הודעה זו נשלחה אוטומטית ממערכת Libero Wholesale.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

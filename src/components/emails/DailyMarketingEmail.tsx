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
  Link,
  Img
} from '@react-email/components';
import { getAppUrl } from '@/lib/email';

export interface ProductChangeInfo {
  id: string;
  name: string;
  nameHe?: string | null;
  imageUrl?: string | null;
  changeType: 'new_product' | 'price_change' | 'draft_to_active' | 'back_in_stock';
  oldValue?: string | null;
  newValue?: string | null;
}

export function DailyMarketingEmail({
  changes,
  storeId
}: {
  changes: ProductChangeInfo[];
  storeId?: string;
}) {
  const catalogUrl = `${getAppUrl()}/catalog`;
  
  // Group changes by type
  const newProducts = changes.filter(c => c.changeType === 'new_product' || c.changeType === 'draft_to_active');
  const priceChanges = changes.filter(c => c.changeType === 'price_change');
  const backInStock = changes.filter(c => c.changeType === 'back_in_stock');

  return (
    <Html dir="rtl" lang="he">
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans p-4" style={{ direction: 'rtl', textAlign: 'right' }}>
          <Container className="bg-white border border-gray-200 rounded-lg p-8 mx-auto max-w-2xl shadow-sm" style={{ direction: 'rtl' }}>
            <Heading className="text-2xl font-bold text-center text-black mb-6" style={{ direction: 'rtl' }}>
              עדכונים חמים מ-Libero Wholesale!
            </Heading>

            {newProducts.length > 0 && (
              <Section className="mb-8">
                <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
                  מוצרים חדשים באתר 🆕
                </Heading>
                {newProducts.map((p, idx) => (
                  <div key={p.id + idx} className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
                    {p.imageUrl ? (
                      <Img src={p.imageUrl} alt={p.nameHe || p.name} width={64} height={64} className="rounded object-contain bg-gray-50 border border-gray-100" style={{ borderRadius: '4px', objectFit: 'contain' }} />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs" style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>אין תמונה</div>
                    )}
                    <div style={{ marginRight: '16px', textAlign: 'right' }}>
                      <Text className="m-0 font-bold" style={{ margin: 0, fontWeight: 'bold' }}>{p.nameHe || p.name}</Text>
                      {p.nameHe && <Text className="m-0 text-sm text-gray-500" style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{p.name}</Text>}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {priceChanges.length > 0 && (
              <Section className="mb-8">
                <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
                  עדכוני מחירים 💸
                </Heading>
                {priceChanges.map((p, idx) => {
                  const isDrop = p.oldValue && p.newValue && parseFloat(p.newValue) < parseFloat(p.oldValue);
                  return (
                    <div key={p.id + idx} className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
                      {p.imageUrl ? (
                        <Img src={p.imageUrl} alt={p.nameHe || p.name} width={64} height={64} className="rounded object-contain bg-gray-50 border border-gray-100" style={{ borderRadius: '4px', objectFit: 'contain' }} />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs" style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>אין תמונה</div>
                      )}
                      <div style={{ marginRight: '16px', textAlign: 'right' }}>
                        <Text className="m-0 font-bold" style={{ margin: 0, fontWeight: 'bold' }}>{p.nameHe || p.name}</Text>
                        <Text className="m-0 text-sm" style={{ margin: 0, fontSize: '14px' }}>
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginLeft: '8px' }}>₪{p.oldValue}</span>
                          <span style={{ color: isDrop ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>₪{p.newValue}</span>
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </Section>
            )}

            {backInStock.length > 0 && (
              <Section className="mb-8">
                <Heading as="h3" className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 text-right" style={{ direction: 'rtl', textAlign: 'right' }}>
                  חזרו למלאי ✨
                </Heading>
                {backInStock.map((p, idx) => (
                  <div key={p.id + idx} className="flex items-center gap-4 mb-4" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', direction: 'rtl' }}>
                    {p.imageUrl ? (
                      <Img src={p.imageUrl} alt={p.nameHe || p.name} width={64} height={64} className="rounded object-contain bg-gray-50 border border-gray-100" style={{ borderRadius: '4px', objectFit: 'contain' }} />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs" style={{ width: '64px', height: '64px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>אין תמונה</div>
                    )}
                    <div style={{ marginRight: '16px', textAlign: 'right' }}>
                      <Text className="m-0 font-bold" style={{ margin: 0, fontWeight: 'bold' }}>{p.nameHe || p.name}</Text>
                      <Text className="m-0 text-sm text-green-600 font-medium" style={{ margin: 0, fontSize: '14px', color: '#16a34a' }}>במלאי כעת!</Text>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            <Section className="text-center mt-8" style={{ direction: 'rtl' }}>
              <Link
                href={catalogUrl}
                className="bg-black text-white px-6 py-3 rounded-md font-bold text-sm no-underline inline-block"
                style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}
              >
                לצפייה בקטלוג המלא
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

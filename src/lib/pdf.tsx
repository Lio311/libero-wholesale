import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, renderToStream, Link } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

let fontsRegistered = false;

async function registerFonts(origin: string) {
  if (fontsRegistered) return;
  
  try {
    const regularRes = await fetch(`${origin}/fonts/Heebo-Regular.ttf`);
    const boldRes = await fetch(`${origin}/fonts/Heebo-Bold.ttf`);
    
    const regularArrayBuffer = await regularRes.arrayBuffer();
    const boldArrayBuffer = await boldRes.arrayBuffer();
    
    const regularDataUrl = `data:font/ttf;base64,${Buffer.from(regularArrayBuffer).toString('base64')}`;
    const boldDataUrl = `data:font/ttf;base64,${Buffer.from(boldArrayBuffer).toString('base64')}`;
    
    Font.register({
      family: 'Heebo',
      fonts: [
        { src: regularDataUrl, fontWeight: 'normal' },
        { src: boldDataUrl, fontWeight: 'bold' }
      ]
    });
    fontsRegistered = true;
  } catch (error) {
    console.error('Failed to load fonts from network:', error);
  }
}

const reverseHebrew = (text: string | null | undefined) => {
  if (!text) return text || '';
  return String(text);
};

const RText = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  const content = React.Children.toArray(children).join('');
  return <Text style={style}>{reverseHebrew(content)}</Text>;
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Heebo',
    fontSize: 12,
    textAlign: 'right',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f4f4f5',
    padding: 4,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row-reverse',
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
    textAlign: 'right',
  },
  tableColDesc: { width: '35%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColMakat: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColQty: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColPrice: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColTotal: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  totalBox: {
    width: '50%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f4f4f5',
  }
});

const OrderPDF = ({ order, items, origin }: { order: any, items: any[], origin: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <RText style={styles.title}>Libero Wholesale</RText>
          <RText style={styles.subtitle}>סיכום הזמנה / הצעת מחיר (להפקת חשבונית)</RText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row-reverse' }}>
            <RText style={{ fontWeight: 'bold' }}>:מספר הזמנה</RText>
            <RText style={{ fontWeight: 'bold', marginRight: 4 }}>{order.orderNumber}</RText>
          </View>
          <View style={{ flexDirection: 'row-reverse' }}>
            <RText>:תאריך</RText>
            <RText style={{ marginRight: 4 }}>{new Date(order.createdAt).toLocaleDateString('he-IL')}</RText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <RText style={styles.sectionTitle}>פרטי לקוח</RText>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
            <RText>:שם העסק</RText>
            <RText style={{ marginRight: 4 }}>{order.businessName}</RText>
          </View>
          <View style={{ flexDirection: 'row-reverse', flex: 1, justifyContent: 'flex-end' }}>
            <RText>:איש קשר</RText>
            <RText style={{ marginRight: 4 }}>{order.customerName}</RText>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
            <RText>:אימייל</RText>
            <RText style={{ marginRight: 4 }}>{order.customerEmail}</RText>
          </View>
          <View style={{ flexDirection: 'row-reverse', flex: 1, justifyContent: 'flex-end' }}>
            <RText>:טלפון</RText>
            <RText style={{ marginRight: 4 }}>{order.customerPhone}</RText>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flexDirection: 'row-reverse', flex: 1 }}>
            <RText>:כתובת משלוח</RText>
            <RText style={{ marginRight: 4 }}>{order.deliveryAddress}</RText>
          </View>
        </View>
        {order.notes ? (
          <View style={{ marginTop: 4, flexDirection: 'row-reverse' }}>
            <RText>:הערות</RText>
            <RText style={{ marginRight: 4 }}>{order.notes}</RText>
          </View>
        ) : <View />}
      </View>

      <View style={styles.section}>
        <RText style={styles.sectionTitle}>פירוט מוצרים</RText>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColDesc, { backgroundColor: '#f4f4f5' }]}><RText style={styles.tableCellHeader}>פריט</RText></View>
            <View style={[styles.tableColMakat, { backgroundColor: '#f4f4f5' }]}><RText style={styles.tableCellHeader}>מק״ט / ברקוד</RText></View>
            <View style={[styles.tableColQty, { backgroundColor: '#f4f4f5' }]}><RText style={styles.tableCellHeader}>כמות</RText></View>
            <View style={[styles.tableColPrice, { backgroundColor: '#f4f4f5' }]}><RText style={styles.tableCellHeader}>מחיר יחידה</RText></View>
            <View style={[styles.tableColTotal, { backgroundColor: '#f4f4f5' }]}><RText style={styles.tableCellHeader}>סה"כ</RText></View>
          </View>
          {items.map((item, i) => (
            <View key={i}>
              <View style={styles.tableRow}>
                <View style={styles.tableColDesc}>
                  <Link src={`${origin}/catalog`} style={{ textDecoration: 'none', color: '#000' }}>
                    <RText style={styles.tableCell}>{item.productName}</RText>
                  </Link>
                </View>
                <View style={styles.tableColMakat}><RText style={styles.tableCell}>{item.barcode || '—'}</RText></View>
                <View style={styles.tableColQty}><RText style={styles.tableCell}>{item.quantity}</RText></View>
                <View style={styles.tableColPrice}><RText style={styles.tableCell}>₪ {Number(item.unitPrice).toFixed(2)}</RText></View>
                <View style={styles.tableColTotal}><RText style={styles.tableCell}>₪ {Number(item.totalPrice).toFixed(2)}</RText></View>
              </View>
              {Boolean(item.testerRatio) && item.quantity >= item.testerRatio ? (
                <View style={styles.tableRow}>
                  <View style={styles.tableColDesc}>
                    <Link src={`${origin}/catalog`} style={{ textDecoration: 'none', color: '#16a34a' }}>
                      <RText style={[styles.tableCell, { color: '#16a34a', fontWeight: 'bold' }]}>טסטר מתנה: {item.productName}</RText>
                    </Link>
                  </View>
                  <View style={styles.tableColMakat}><RText style={styles.tableCell}>{item.barcode || '—'}</RText></View>
                  <View style={styles.tableColQty}><RText style={[styles.tableCell, { color: '#16a34a', fontWeight: 'bold' }]}>{Math.floor(item.quantity / item.testerRatio)}</RText></View>
                  <View style={styles.tableColPrice}><RText style={styles.tableCell}>₪ 0.00</RText></View>
                  <View style={styles.tableColTotal}><RText style={styles.tableCell}>₪ 0.00</RText></View>
                </View>
              ) : <View />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.row}>
            <RText style={{ fontWeight: 'normal' }}>:סכום ביניים</RText>
            <RText style={{ fontWeight: 'normal' }}>₪ {(Number(order.totalAmount) / 1.18).toFixed(2)}</RText>
          </View>
          <View style={styles.row}>
            <RText style={{ fontWeight: 'normal' }}>:(18%) מע"מ</RText>
            <RText style={{ fontWeight: 'normal' }}>₪ {(Number(order.totalAmount) - (Number(order.totalAmount) / 1.18)).toFixed(2)}</RText>
          </View>
          <View style={[styles.row, { marginTop: 5, borderTopWidth: 1, borderTopColor: '#e4e4e7', borderTopStyle: 'solid', paddingTop: 5 }]}>
            <RText style={{ fontWeight: 'bold' }}>:סה"כ לתשלום (כולל מע"מ)</RText>
            <RText style={{ fontWeight: 'bold' }}>₪ {Number(order.totalAmount).toFixed(2)}</RText>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 50, textAlign: 'center', fontSize: 10, color: '#71717a' }}>
        <RText>.מסמך זה מיועד להפקת חשבונית ואינו מהווה חשבונית מס</RText>
        <RText>.Libero Wholesale תודה שבחרתם</RText>
      </View>
    </Page>
  </Document>
);

export async function generateOrderPDFBuffer(order: any, items: any[], origin: string): Promise<Uint8Array> {
  await registerFonts(origin);
  
  const stream = await renderToStream(<OrderPDF order={order} items={items} origin={origin} />);
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (data: Buffer) => {
      chunks.push(new Uint8Array(data));
    });
    stream.on('end', () => {
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(result);
    });
    stream.on('error', (err: Error) => {
      reject(err);
    });
  });
}

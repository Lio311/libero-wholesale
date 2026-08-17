import { Document, Page, Text, View, StyleSheet, Font, renderToStream } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

let fontsRegistered = false;

async function registerFonts() {
  if (fontsRegistered) return;
  
  try {
    // Attempt to load from network to avoid Vercel filesystem tracing issues
    const [regularRes, boldRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/gh/OdedEzer/heebo@master/fonts/ttf/Heebo-Regular.ttf'),
      fetch('https://cdn.jsdelivr.net/gh/OdedEzer/heebo@master/fonts/ttf/Heebo-Bold.ttf')
    ]);
    
    if (regularRes.ok && boldRes.ok) {
      const regularBuffer = await regularRes.arrayBuffer();
      const boldBuffer = await boldRes.arrayBuffer();
      
      Font.register({
        family: 'Heebo',
        fonts: [
          { src: regularBuffer, fontWeight: 'normal' },
          { src: boldBuffer, fontWeight: 'bold' }
        ]
      });
      fontsRegistered = true;
      return;
    }
  } catch (e) {
    console.warn('Network font load failed, using local fs fallback:', e);
  }
  
  // Fallback to local FS (mostly for local dev)
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: path.join(process.cwd(), 'public', 'fonts', 'Heebo-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(process.cwd(), 'public', 'fonts', 'Heebo-Bold.ttf'), fontWeight: 'bold' }
    ]
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Heebo',
    fontSize: 12,
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
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
    flexDirection: 'row',
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
    flexDirection: 'row',
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableColDesc: { width: '35%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColMakat: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColQty: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColPrice: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColTotal: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  totalBox: {
    width: '40%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f4f4f5',
  }
});

const OrderPDF = ({ order, items }: { order: any, items: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Libero Wholesale</Text>
          <Text style={styles.subtitle}>סיכום הזמנה / הצעת מחיר (להפקת חשבונית)</Text>
        </View>
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={{ fontWeight: 'bold' }}>מספר הזמנה: {order.orderNumber}</Text>
          <Text>תאריך: {new Date(order.createdAt).toLocaleDateString('he-IL')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>פרטי לקוח</Text>
        <View style={styles.row}>
          <Text>שם העסק: {order.businessName}</Text>
          <Text>איש קשר: {order.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text>אימייל: {order.customerEmail}</Text>
          <Text>טלפון: {order.customerPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text>כתובת משלוח: {order.deliveryAddress}</Text>
        </View>
        {order.notes && (
          <View style={{ marginTop: 4 }}>
            <Text>הערות: {order.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>פירוט מוצרים</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColDesc, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>פריט</Text></View>
            <View style={[styles.tableColMakat, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>מק״ט / ברקוד</Text></View>
            <View style={[styles.tableColQty, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>כמות</Text></View>
            <View style={[styles.tableColPrice, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>מחיר יחידה</Text></View>
            <View style={[styles.tableColTotal, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>סה"כ</Text></View>
          </View>
          {items.map((item, i) => (
            <View key={i}>
              <View style={styles.tableRow}>
                <View style={styles.tableColDesc}><Text style={styles.tableCell}>{item.productName}</Text></View>
                <View style={styles.tableColMakat}><Text style={styles.tableCell}>{item.barcode || '—'}</Text></View>
                <View style={styles.tableColQty}><Text style={styles.tableCell}>{item.quantity}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>₪{Number(item.unitPrice).toFixed(2)}</Text></View>
                <View style={styles.tableColTotal}><Text style={styles.tableCell}>₪{Number(item.totalPrice).toFixed(2)}</Text></View>
              </View>
              {item.testerRatio && item.quantity >= item.testerRatio && (
                <View style={styles.tableRow}>
                  <View style={styles.tableColDesc}><Text style={[styles.tableCell, { color: '#16a34a', fontWeight: 'bold' }]}>טסטר מתנה: {item.productName}</Text></View>
                  <View style={styles.tableColMakat}><Text style={styles.tableCell}>{item.barcode || '—'}</Text></View>
                  <View style={styles.tableColQty}><Text style={[styles.tableCell, { color: '#16a34a', fontWeight: 'bold' }]}>{Math.floor(item.quantity / item.testerRatio)}</Text></View>
                  <View style={styles.tableColPrice}><Text style={styles.tableCell}>₪0.00</Text></View>
                  <View style={styles.tableColTotal}><Text style={styles.tableCell}>₪0.00</Text></View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.row}>
            <Text style={{ fontWeight: 'normal' }}>סכום ביניים:</Text>
            <Text style={{ fontWeight: 'normal' }}>₪{(Number(order.totalAmount) / 1.18).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontWeight: 'normal' }}>מע"מ (18%):</Text>
            <Text style={{ fontWeight: 'normal' }}>₪{(Number(order.totalAmount) - (Number(order.totalAmount) / 1.18)).toFixed(2)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 5, borderTop: '1px solid #e4e4e7', paddingTop: 5 }]}>
            <Text style={{ fontWeight: 'bold' }}>סה"כ לתשלום (כולל מע"מ):</Text>
            <Text style={{ fontWeight: 'bold' }}>₪{Number(order.totalAmount).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 50, textAlign: 'center', fontSize: 10, color: '#71717a' }}>
        <Text>מסמך זה מיועד להפקת חשבונית ואינו מהווה חשבונית מס.</Text>
        <Text>תודה שבחרתם Libero Wholesale.</Text>
      </View>
    </Page>
  </Document>
);

export async function generateOrderPDFBuffer(order: any, items: any[]): Promise<Uint8Array> {
  await registerFonts();
  
  const stream = await renderToStream(<OrderPDF order={order} items={items} />);
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

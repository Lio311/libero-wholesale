import { Document, Page, Text, View, StyleSheet, Font, renderToStream, Image } from '@react-pdf/renderer';
import path from 'path';

// Register Hebrew Font
Font.register({
  family: 'Heebo',
  fonts: [
    { src: path.resolve('./public/fonts/Heebo-Regular.ttf'), fontWeight: 'normal' },
    { src: path.resolve('./public/fonts/Heebo-Bold.ttf'), fontWeight: 'bold' }
  ]
});

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
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f4f4f5',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderLeftWidth: 0,
    borderTopWidth: 0,
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
  tableColDesc: { width: '50%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColQty: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColPrice: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  tableColTotal: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e4e4e7', borderLeftWidth: 0, borderTopWidth: 0 },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start', // Since RTL, flex-start pushes it to left side conceptually if nested, wait.
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
          <Text style={styles.subtitle}>סיכום הזמנה / הצעת מחיר</Text>
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
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColDesc, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>פריט</Text></View>
            <View style={[styles.tableColQty, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>כמות</Text></View>
            <View style={[styles.tableColPrice, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>מחיר יחידה</Text></View>
            <View style={[styles.tableColTotal, { backgroundColor: '#f4f4f5' }]}><Text style={styles.tableCellHeader}>סה"כ</Text></View>
          </View>
          {/* Table Rows */}
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColDesc}><Text style={styles.tableCell}>{item.productName}</Text></View>
              <View style={styles.tableColQty}><Text style={styles.tableCell}>{item.quantity}</Text></View>
              <View style={styles.tableColPrice}><Text style={styles.tableCell}>₪{Number(item.unitPrice).toFixed(2)}</Text></View>
              <View style={styles.tableColTotal}><Text style={styles.tableCell}>₪{Number(item.totalPrice).toFixed(2)}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.row}>
            <Text style={{ fontWeight: 'bold' }}>סה"כ לתשלום (כולל מע"מ):</Text>
            <Text style={{ fontWeight: 'bold' }}>₪{Number(order.totalAmount).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 50, textAlign: 'center', fontSize: 10, color: '#71717a' }}>
        <Text>מסמך זה מהווה אישור הזמנה ואינו מהווה חשבונית מס.</Text>
        <Text>תודה שבחרתם Libero Wholesale.</Text>
      </View>
    </Page>
  </Document>
);

export async function generateOrderPDFBuffer(order: any, items: any[]): Promise<Buffer> {
  const stream = await renderToStream(<OrderPDF order={order} items={items} />);
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on('data', (data) => {
      buffers.push(data);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

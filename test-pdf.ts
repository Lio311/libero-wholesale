import { renderToStream } from '@react-pdf/renderer';
import { generateOrderPDFBuffer } from './src/lib/pdf';

async function test() {
  const order = {
    orderNumber: "123",
    createdAt: new Date().toISOString(),
    businessName: "Test",
    customerName: "Test",
    customerEmail: "test@test.com",
    customerPhone: "123",
    deliveryAddress: "Test",
    notes: "",
    totalAmount: "100"
  };
  const items = [{
    productName: "Test",
    barcode: "123",
    quantity: 1,
    unitPrice: 10,
    totalPrice: 10,
    testerRatio: 0
  }];
  
  try {
    const buf = await generateOrderPDFBuffer(order, items, "https://libero-wholesale.vercel.app");
    console.log("SUCCESS length:", buf.length);
  } catch (err) {
    console.error(err);
  }
}
test();

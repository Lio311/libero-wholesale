require('dotenv').config({ path: '.env.local' });
async function test() {
  const WC_URL = "https://libero-il.co.il";
  const WC_CK = process.env.LIBERO_WC_CK;
  const WC_CS = process.env.LIBERO_WC_CS;
  
  const searchUrl = `${WC_URL}/wp-json/wc/v3/products?consumer_key=${WC_CK}&consumer_secret=${WC_CS}&search=Aliksir`;
  const res = await fetch(searchUrl);
  const data = await res.json();
  console.log(data.length ? data.map(p => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock_quantity })) : data);
}
test().catch(console.error);

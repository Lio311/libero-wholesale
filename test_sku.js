require('dotenv').config({ path: '.env.local' });
async function run() {
    const WC_URL = "https://libero-il.co.il";
    const WC_CK = process.env.LIBERO_WC_CK;
    const WC_CS = process.env.LIBERO_WC_CS;
    const credentials = Buffer.from(`${WC_CK}:${WC_CS}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
    const res = await fetch(`${WC_URL}/wp-json/wc/v3/products?sku=8032779258728`, { headers });
    const data = await res.json();
    console.log(data);
}
run();

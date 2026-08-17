require('dotenv').config({ path: '.env.local' });

const ck = process.env.LIBERO_WC_CK;
const cs = process.env.LIBERO_WC_CS;
const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

async function searchProduct(keyword) {
  try {
    const response = await fetch(`https://libero-il.co.il/wp-json/wc/v3/products?search=${encodeURIComponent(keyword)}&per_page=50`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const data = await response.json();
    
    console.log(`\n=== Results for "${keyword}" ===`);
    if (!data || data.length === 0) {
      console.log("No products found.");
      return;
    }
    
    data.forEach(p => {
      console.log(`- Title: ${p.name}`);
      console.log(`  SKU: ${p.sku}`);
      console.log(`  ID: ${p.id}`);
      // Check variations if it's a variable product
      if (p.type === 'variable') {
         console.log(`  Variations: ${p.variations.join(', ')}`);
      }
    });
  } catch (error) {
    console.error(`Error searching ${keyword}:`, error.message);
  }
}

async function searchProductByIds(ids) {
  if (ids.length === 0) return;
  try {
    const response = await fetch(`https://libero-il.co.il/wp-json/wc/v3/products?include=${ids.join(',')}&per_page=50`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const data = await response.json();
    
    console.log(`\n=== Variations Details ===`);
    data.forEach(p => {
      console.log(`- Variation Title: ${p.name}`);
      console.log(`  Variation SKU: ${p.sku}`);
      console.log(`  Attributes:`, p.attributes);
    });
  } catch(error) {
     console.error("Error fetching variations", error.message);
  }
}

async function run() {
  await searchProduct("Ambre Nomade");
  await searchProduct("Tales From Zanzibar");
  await searchProduct("Trouble In Paradise");
  await searchProduct("New York");
  await searchProduct("London");
  await searchProduct("Abu Dhabi");
  await searchProduct("Moonwalk");
  await searchProduct("Gardenia");
  
  // also search variations of some keywords just in case
  await searchProduct("Zanzibar");
  await searchProduct("Trouble");
}
run();

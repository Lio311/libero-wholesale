const { neon } = require('@neondatabase/serverless');
const https = require('https');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function getHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function searchWc(name) {
  const searchUrl = `https://libero-il.co.il/?s=${encodeURIComponent(name)}&post_type=product`;
  const searchHtml = await getHtml(searchUrl);
  const links = [...new Set([...searchHtml.matchAll(/href="(https:\/\/libero-il.co.il\/product\/[^"]+)"/g)].map(m => m[1]))];
  
  console.log(`\nSearch results for "${name}":`);
  if (links.length === 0) {
     console.log("No products found.");
     return;
  }
  
  for (const link of links) {
    console.log("- " + decodeURIComponent(link));
  }
}

async function run() {
  // First REVERT the local DB to the original names and sizes
  console.log("Reverting changes...");
  await sql`UPDATE products SET size = '85ml', name = 'Ambre Nomade' WHERE barcode = '13770031002331'`;
  await sql`UPDATE products SET size = '50ml', name = 'Tales From Zanzibar' WHERE barcode = '5070000674506'`;
  await sql`UPDATE products SET size = '50ml', name = 'Trouble In Paradise' WHERE barcode = '5070000674582'`;
  await sql`UPDATE products SET size = '50ml', name = 'New York' WHERE barcode = '5081304448434'`;
  await sql`UPDATE products SET size = '50ml', name = 'London' WHERE barcode = '690251056217'`;
  await sql`UPDATE products SET size = '50ml', name = 'Abu Dhabi' WHERE barcode = '3700458606508'`;
  await sql`UPDATE products SET size = '100ml', name = 'Moonwalk SeaCoco' WHERE barcode = '13770015534216'`;
  await sql`UPDATE products SET size = '50ml', name = 'Gardenia' WHERE barcode = '3616305275745'`;
  
  console.log("Searching WooCommerce for the correct products...");
  await searchWc("Ambre Nomade");
  await searchWc("Tales From Zanzibar");
  await searchWc("Moonwalk SeaCoco");
}
run();

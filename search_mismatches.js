const https = require('https');

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
  
  console.log(`\n=== Results for "${name}" ===`);
  if (links.length === 0) {
     console.log("No products found.");
     return;
  }
  
  for (const link of links) {
    const productHtml = await getHtml(link);
    const skuMatch = productHtml.match(/"sku":"([^"]+)"/i);
    const titleMatch = productHtml.match(/<h1[^>]*product_title[^>]*>([^<]+)<\/h1>/i);
    
    if (skuMatch && titleMatch) {
       console.log(`- Title: ${titleMatch[1].trim()}`);
       console.log(`  SKU: ${skuMatch[1]}`);
       console.log(`  Link: ${decodeURIComponent(link)}`);
    }
  }
}

async function run() {
  await searchWc("Ambre Nomade");
  await searchWc("Tales From Zanzibar");
  await searchWc("Trouble In Paradise");
  await searchWc("New York");
  await searchWc("London");
  await searchWc("Abu Dhabi");
  await searchWc("Moonwalk");
  await searchWc("Gardenia");
}
run();

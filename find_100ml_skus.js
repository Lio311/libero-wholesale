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

async function findSku(name) {
  const searchUrl = `https://libero-il.co.il/?s=${encodeURIComponent(name)}&post_type=product`;
  const searchHtml = await getHtml(searchUrl);
  
  // Find all product links
  const links = [...searchHtml.matchAll(/href="(https:\/\/libero-il.co.il\/product\/[^"]+)"/g)].map(m => m[1]);
  // Unique links
  const uniqueLinks = [...new Set(links)];
  
  // Look for a link that has "100ml" in the URL
  const ml100Link = uniqueLinks.find(l => l.includes('100ml'));
  
  if (!ml100Link) {
    return { name, error: "No 100ml link found" };
  }
  
  const productHtml = await getHtml(ml100Link);
  
  const skuMatch = productHtml.match(/"sku":"([^"]+)"/i);
  if (skuMatch) {
     return { name, link: ml100Link, sku: skuMatch[1] };
  }
  return { name, link: ml100Link, error: "SKU not found on page" };
}

async function run() {
  const missing = [
    "Bergamundi",
    "Citrus Paradisi",
    "Fiore di Cotone",
    "Reunion Vanilla",
    "Royal Anbar",
    "Spleen Fever",
    "Sweet Carousel",
    "Whisky Nobile"
  ];
  
  for (const name of missing) {
    const res = await findSku(name);
    console.log(res);
  }
}
run();

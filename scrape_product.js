const https = require('https');

async function getSku(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // The SKU is usually in <span class="sku">...</span> or similar
        const skuMatch = data.match(/<span class="sku">([^<]+)<\/span>/i);
        if (skuMatch) {
          resolve(skuMatch[1].trim());
        } else {
            // Check for JSON-LD product data
            const jsonLdMatch = data.match(/"sku":"([^"]+)"/i);
            if (jsonLdMatch) resolve(jsonLdMatch[1]);
            else resolve("Not found");
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fiore di Cotone:", await getSku("https://libero-il.co.il/product/fiore-di-cotone-50-ml/"));
  console.log("Sweet Carousel:", await getSku("https://libero-il.co.il/product/sweet-carousel-50-ml/"));
  console.log("Bergamundi:", await getSku("https://libero-il.co.il/product/bergamundi-50-ml/"));
}
run();

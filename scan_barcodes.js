const { neon } = require('@neondatabase/serverless');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fetchWcProduct(sku) {
  return new Promise((resolve, reject) => {
    https.get(`https://libero-wholesale.vercel.app/api/admin/match-skus?sku=${encodeURIComponent(sku)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fetching local products...");
  const products = await sql`SELECT id, name, size, barcode FROM products WHERE barcode IS NOT NULL AND barcode != ''`;
  console.log(`Found ${products.length} products with barcodes.`);

  const mismatches = [];
  const notFound = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`Scanning ${i+1}/${products.length}: ${p.name} ${p.size} (${p.barcode})... `);
    
    const wcData = await fetchWcProduct(p.barcode);
    
    if (!wcData || !Array.isArray(wcData)) {
      console.log("ERROR FETCHING");
      continue;
    }
    
    if (wcData.length === 0) {
      console.log("NOT FOUND IN WOOCOMMERCE");
      notFound.push(p);
      continue;
    }
    
    const wcProduct = wcData[0];
    const wcName = wcProduct.name.toLowerCase();
    
    // Check name
    // Local name might be "Fiore di Cotone", wcName might be "פרמאסיה פיורי די קוטון farmacia fiore di cotone 50ml"
    let isMismatch = false;
    let notes = [];
    
    const localNameLower = p.name.toLowerCase().trim();
    const isNameMatch = wcName.includes(localNameLower) || 
                        localNameLower.split(' ').every(word => wcName.includes(word));
                        
    if (!isNameMatch) {
      notes.push(`Name mismatch: Local "${p.name}" vs WC "${wcProduct.name}"`);
      isMismatch = true;
    }
    
    // Check size
    const localSize = p.size.toLowerCase().replace(' ', ''); // "50ml"
    const sizeNumber = localSize.replace('ml', ''); // "50"
    
    // WC name usually ends with size, e.g. "100ml" or "100 ml"
    // Also WooCommerce API might have attributes for volume, but name is reliable enough to check.
    const hasSizeInName = wcName.includes(localSize) || wcName.includes(`${sizeNumber} ml`) || wcName.includes(` ${sizeNumber}m`);
    
    if (!hasSizeInName && !wcName.includes(sizeNumber)) { // Fallback if size number is present somewhere
        // double check attributes
        const wcAttrs = wcProduct.attributes || [];
        const sizeAttr = wcAttrs.find(a => a.name.toLowerCase().includes('volume') || a.name.toLowerCase().includes('ml') || a.name.toLowerCase().includes('נפח'));
        let attrMatch = false;
        if (sizeAttr && sizeAttr.options) {
            attrMatch = sizeAttr.options.some(opt => opt.toLowerCase().includes(sizeNumber));
        }
        
        if (!attrMatch) {
            notes.push(`Size mismatch: Local "${p.size}" not found in WC "${wcProduct.name}"`);
            isMismatch = true;
        }
    }

    if (isMismatch) {
      console.log("MISMATCH!");
      mismatches.push({ local: p, wcName: wcProduct.name, notes });
    } else {
      console.log("OK");
    }
    
    // Slight delay to not overwhelm the proxy/woocommerce
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log("\n--- SCAN COMPLETE ---");
  console.log(`\nNot Found in WooCommerce (${notFound.length}):`);
  notFound.forEach(p => console.log(`- ${p.name} ${p.size} (Barcode: ${p.barcode})`));
  
  console.log(`\nMismatches (${mismatches.length}):`);
  mismatches.forEach(m => {
    console.log(`- ${m.local.name} ${m.local.size} (Barcode: ${m.local.barcode})`);
    m.notes.forEach(n => console.log(`  * ${n}`));
  });
}

run();

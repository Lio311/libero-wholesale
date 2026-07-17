const fs = require('fs');
const text = fs.readFileSync('pdf-text.txt', 'utf8');
const lines = text.split('\n');

let results = [];
let currentBrand = 'Bohoboco';

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  let brandMatch = line.match(/(?:-?\s*[\d\.]+\s*-\s*מקדם\s+([A-Za-z][A-Za-z\s\.]+))|(?:([A-Za-z][A-Za-z\s\.]+)\s*-\s*[\d\.]*מקדם)/);
  if (brandMatch) {
    let b = (brandMatch[1] || brandMatch[2]).trim();
    if (b.length > 0) {
      currentBrand = b;
    }
  }

  let brandMatch2 = line.match(/([A-Za-z][A-Za-z\s\.]+)\s*-\s*[\d\.]+מקדם/);
  if (brandMatch2) {
    currentBrand = brandMatch2[1].trim();
  }
  
  const matches = [...line.matchAll(/([0-9\.\%\s]+)([A-Za-z][A-Za-z\s\-\'\|]+(?:50ml|100ml|30ml|85ml)?)\s+(\d+)/g)];
  for (const m of matches) {
    const numsStr = m[1].trim();
    const name = m[2].trim();
    
    if (name.includes('מקדם') || name === 'ml' || name === 'V' || name === 'X' || name.includes('Annunziata') || name.includes('Theodoros') || name.includes('Memoirs')) continue;
    
    const afterPercentMatch = numsStr.match(/%\s+([\d\s]+)/);
    let stock = 0;
    if (afterPercentMatch) {
        const afterPercentTokens = afterPercentMatch[1].trim().split(/\s+/);
        if (afterPercentTokens.length >= 2) {
            stock = parseInt(afterPercentTokens[1], 10) || 0;
        } else if (afterPercentTokens.length === 1) {
            stock = parseInt(afterPercentTokens[0], 10) || 0;
        }
    }
    
    let size = '';
    let cleanName = name;
    let sizeMatch = name.match(/-\s*(\d+ml)$/i) || name.match(/\s(\d+ml)$/i);
    if (sizeMatch) {
        size = sizeMatch[1];
        cleanName = name.replace(sizeMatch[0], '').trim();
    }
    
    cleanName = cleanName.replace(/\s*-\s*$/, '').trim();

    results.push({ 
        brand: currentBrand, 
        model: cleanName,
        size: size,
        stock: stock 
    });
  }
}

fs.writeFileSync('parsed-products.json', JSON.stringify(results, null, 2));
console.log(`Parsed ${results.length} products`);

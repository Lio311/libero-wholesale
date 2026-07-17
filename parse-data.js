const fs = require('fs');
const text = fs.readFileSync('pdf-text.txt', 'utf8');

let results = [];
// Match any sequence of numbers/symbols followed by English name followed by ID
const matches = [...text.matchAll(/([0-9\.\%\s]+)([A-Za-z][A-Za-z\s\-\'\|]+(?:50ml|100ml|30ml|85ml)?)\s+(\d+)/g)];

for (const m of matches) {
    const numsStr = m[1].trim();
    const name = m[2].trim();
    
    const afterPercentMatch = numsStr.match(/%\s+([\d\s]+)/);
    let lastOrder = 0;
    if (afterPercentMatch) {
        const afterPercentTokens = afterPercentMatch[1].trim().split(/\s+/);
        if (afterPercentTokens.length >= 2) {
            lastOrder = parseInt(afterPercentTokens[1], 10) || 0;
        }
    }
    
    results.push({ name, stock: lastOrder });
}

fs.writeFileSync('parsed-products.json', JSON.stringify(results, null, 2));
console.log(`Parsed ${results.length} products`);

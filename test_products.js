const fs = require('fs');
const current = JSON.parse(fs.readFileSync('current-products.json', 'utf8'));
console.log(current.length);

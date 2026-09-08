const fs = require('fs');
const files = [
  'fix-brands.js',
  'fix-specific-brands.js',
  'parsed-products.json',
  'translate-names.js',
  'update-sizes-bulk.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/Dudar/g, 'Duduar');
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

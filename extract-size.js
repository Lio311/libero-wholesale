require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, extracting sizes...");

  const { rows } = await client.query('SELECT id, name, model FROM products');
  
  let updateCount = 0;
  for (const row of rows) {
    let newName = row.name;
    let newModel = row.model;
    let size = null;

    // Check name
    let sizeMatch = newName.match(/-\s*(\d+ml)$/i) || newName.match(/\s(\d+ml)$/i);
    if (sizeMatch) {
      size = sizeMatch[1];
      newName = newName.replace(sizeMatch[0], '').trim();
    } else if (newModel) {
      // Check model
      sizeMatch = newModel.match(/-\s*(\d+ml)$/i) || newModel.match(/\s(\d+ml)$/i);
      if (sizeMatch) {
        size = sizeMatch[1];
        newModel = newModel.replace(sizeMatch[0], '').trim();
      }
    }
    
    if (size) {
        await client.query(
            'UPDATE products SET name = $1, model = $2, size = $3 WHERE id = $4',
            [newName, newModel, size, row.id]
        );
        updateCount++;
    }
  }

  console.log("Extracted sizes for " + updateCount + " products");
  await client.end();
}

main().catch(console.error);

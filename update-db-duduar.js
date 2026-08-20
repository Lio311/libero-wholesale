const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixDuduarInDb() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Updating brand name in database...');
    const result = await sql`UPDATE products SET brand = 'Duduar Milano' WHERE brand = 'Dudar Milano'`;
    console.log(`Updated ${result.length} products.`);
    
    // Also update brand_he if it was incorrect, though it seems it's currently stored under brand_he sometimes
    const resultHe = await sql`UPDATE products SET brand_he = 'Duduar Milano' WHERE brand_he = 'Dudar Milano'`;
    console.log(`Updated ${resultHe.length} products (brand_he).`);
    
  } catch (error) {
    console.error('Error updating DB:', error);
  }
}

fixDuduarInDb();

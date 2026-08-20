const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixDuduarInDbHe() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log('Updating Hebrew brand name in database...');
    const result = await sql`UPDATE products SET brand_he = 'דודואר מילאנו' WHERE brand_he = 'דודר מילאנו'`;
    console.log(`Updated ${result.length} products with Hebrew brand name.`);
  } catch (error) {
    console.error('Error updating DB:', error);
  }
}

fixDuduarInDbHe();

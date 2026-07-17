require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, fixing specific issues...");

  // Delete non-existent products
  await client.query("DELETE FROM products WHERE name = 'Milano'");
  await client.query("DELETE FROM products WHERE name = 'Bohoboco'");

  // Fix Bohoboco products
  await client.query("UPDATE products SET brand = 'Bohoboco', brand_he = 'Bohoboco' WHERE name IN ('Vanilla Black Pepper', 'Eternal Lily Amber', 'Olibanum Gardenia')");

  // Check and fix other potential victims of the broad ILIKE query
  await client.query("UPDATE products SET brand = 'Farmacia SS. Annunziata', brand_he = 'Farmacia SS. Annunziata' WHERE name = 'Reunion vanilla'");
  await client.query("UPDATE products SET brand = 'Memoirs Of A Perfume Collector', brand_he = 'Memoirs Of A Perfume Collector' WHERE name = 'Vanilla Skies'");
  
  // What about "Apple" matching "Happy Apple"?
  await client.query("UPDATE products SET brand = 'Dudar Milano', brand_he = 'Dudar Milano' WHERE name = 'Happy Apple'");

  // What about "Rose" matching "Oderose", "Musky Rose"?
  // Oderose -> Elisire
  await client.query("UPDATE products SET brand = 'Elisire', brand_he = 'Elisire' WHERE name = 'Oderose'");
  // Musky Rose -> Theodoros Kalotinis
  await client.query("UPDATE products SET brand = 'Theodoros Kalotinis', brand_he = 'Theodoros Kalotinis' WHERE name = 'Musky Rose'");

  // What about "Cherry" matching "Cherry Powder", "Wet Cherry Liquor", "Cherry Lane"?
  // Wet Cherry Liquor -> Bohoboco
  await client.query("UPDATE products SET brand = 'Bohoboco', brand_he = 'Bohoboco' WHERE name = 'Wet Cherry Liquor'");
  // Cherry Lane -> Memoirs Of A Perfume Collector
  await client.query("UPDATE products SET brand = 'Memoirs Of A Perfume Collector', brand_he = 'Memoirs Of A Perfume Collector' WHERE name = 'Cherry Lane'");

  console.log("Fixes applied successfully.");
  await client.end();
}

main().catch(console.error);

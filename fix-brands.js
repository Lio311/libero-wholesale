require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const brandMapping = [
  {
    brand: "Bohoboco",
    products: [
      "Wet Cherry Liquor", "Vanilla Black Pepper", "Sea Salt Caramel", "Sandalwood Neroli", "Red Wine Brown Sugar", "Plum Spray Paint", "Oriental Saffron", "Olibanum Gardenia", "Mango Yuzu Gasoline", "Magic Mushrooms", "Jasmine White Leather", "Geranium Balsamic Note", "Eucalyptus Patchouli", "Eternal Lily Amber", "Dark Vinyl Musk", "Coffee White Flowers"
    ]
  },
  {
    brand: "Farmacia SS. Annunziata",
    products: [
      "Whisky nobile", "Sweet carousel", "Spleen Fever", "Sparkling notturno", "Royal Anbar", "Reunion vanilla", "Fiore di cotone", "Citrus Paradisi", "Bergamundi", "Anniversary"
    ]
  },
  {
    brand: "Fomowa",
    products: [
      "Vanille des Rois", "Red Keela Split", "Pannaco Tahaa", "Moonwalk SeaCoco", "Akatsuki Melba"
    ]
  },
  {
    brand: "Memoirs Of A Perfume Collector",
    products: [
      "Muscat", "Doha", "Abu Dhabi", "Tokyo", "New York", "London", "Riyadh", "Cherry Lane", "Vanilla Skies", "Chapter | Miel", "Chapter | Piña Colada", "Golden Hour", "Belgravia Iris", "Midnight Rio", "California Love", "Trouble In Paradise", "Tales From Zanzibar", "Pacific Grapefruit", "Origins Of The Collector", "Musk Mantra", "Meet Me Where The Sky Touches The Sea", "Indian Vetiver", "Chai Desert", "Bond Street Leather", "Beyond The Pashtun Summit", "Atlantic Fig", "A Night In Marrakesh"
    ]
  },
  {
    brand: "Bergamoss",
    products: [
      "Mango Sticky Rice", "Let's make love on Christmas", "Nettarina Frizzante", "Pivoine de Malène"
    ]
  },
  {
    brand: "Theodoros Kalotinis",
    products: [
      "Mango Colada", "Granita Neroli", "Banne De Coco", "Velvet Chocolate", "Vanilla", "Tobacco Maniac", "Tiramisu", "Symposium", "Sexiest Fougere", "Sea God", "Santal Wood", "Royal Orchid", "Pistachio Latte", "Pear Gelato", "Peach Macaron", "Musky Rose", "Matcha Ice Cream", "Marzipan Gourmand", "Lily", "Lemon Tart", "Leather Iris", "Jasmine Of Athens", "I Am Beautiful", "Hazelnut Praline", "Gingerbread Dough", "Gardenia", "Creme Brule", "Coffee Addict", "Cinnamon Rolls", "Cherry Powder", "Caramel Oud", "Bubble Gum Factory", "Apple Pie", "Alluring Fig", "Aegean Salt & Citrus", "1989"
    ]
  },
  {
    brand: "Dudar Milano",
    products: [
      "Vodkaviar", "Vani' Caviar", "Tabaco", "Pinada", "Peccatorum", "Not A Cake", "Neros", "Litchi Daiquiri", "Happy Apple", "Deliziosa", "Crystal Sea", "Coco Island"
    ]
  },
  {
    brand: "Elisire",
    products: [
      "Desired", "In Fabula", "Eau Papaguena", "Oderose", "Hautbois", "Extrait Noir", "Extrait Blanc", "Érose", "Aliksir", "Poudre Desir", "Jasmin Paradis", "Elixir Absolu", "Ambre Nomade"
    ]
  },
  {
    brand: "I Piccirilli",
    products: [
      "Rossa Latte", "Shocking Bull", "Marechiaro", "Mandarino Malandrino", "Jasmilk", "Dune", "Cocobay"
    ]
  }
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, updating brands...");

  await client.query(`UPDATE products SET tester_ratio = 6, is_official_importer = true`);
  console.log("Updated all products with tester_ratio = 6 and is_official_importer = true");

  for (const group of brandMapping) {
    for (const prod of group.products) {
      const res = await client.query(
        "UPDATE products SET brand = $1, brand_he = $1 WHERE model ILIKE $2 OR name ILIKE $2",
        [group.brand, "%" + prod + "%"]
      );
      if (res.rowCount > 0) {
        console.log("Updated " + res.rowCount + " products to brand " + group.brand + " (matched " + prod + ")");
      } else {
        const res2 = await client.query(
            "UPDATE products SET brand = $1, brand_he = $1 WHERE name ILIKE $2",
            [group.brand, prod]
        );
        if (res2.rowCount > 0) {
             console.log("Updated " + res2.rowCount + " products to brand " + group.brand + " (matched " + prod + " exactly)");
        } else {
             console.log("No match found for " + prod);
        }
      }
    }
  }

  console.log("Brand update complete!");
  await client.end();
}

main().catch(console.error);

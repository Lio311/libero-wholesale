require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const brandTranslations = {
  "Bohoboco": "בוהובוקו",
  "Elisire": "אליסיר",
  "Fomowa": "פומווה",
  "IPiccirilli": "אי פיצ'ירילי",
  "Theodoros Kalotinis": "תאודורוס קלוטיניס",
  "Dudar Milano": "דודר מילאנו",
  "Farmacia SS. Annunziata": "פרמצ'יה סס אנונציאטה",
  "Bergamoss": "ברגמוס",
  "Memoirs Of A Perfume Collector": "ממוארס אוף א פרפיום קולקטור"
};

const nameTranslations = {
  "Eucalyptus Patchouli": "אקליפטוס פצ'ולי",
  "Coffee Addict": "קופי אדיקט",
  "Trouble In Paradise": "טראבל אין פרדייס",
  "Litchi Daiquiri": "ליצ'י דאקירי",
  "Citrus": "סיטרוס",
  "Pacific Grapefruit": "פסיפיק גרייפפרוט",
  "Eternal Lily Amber": "איטרנל לילי אמבר",
  "Lily": "לילי",
  "Geranium Balsamic Note": "גרניום בלסמיק נוט",
  "Ambre Nomade": "אמבר נומאד",
  "In Fabula": "אין פבולה",
  "Pannaco Tahaa": "פנאקו טהאה",
  "Marzipan Gourmand": "מרציפן גורמנד",
  "Riyadh": "ריאד",
  "Musky Rose": "מאסקי רוז",
  "Happy Apple": "הפי אפל",
  "Mandarino Malandrino": "מנדרינו מלנדרינו",
  "Midnight Rio": "מידנייט ריו",
  "Indian Vetiver": "אינדיאן וטיבר",
  "Shocking Bull": "שוקינג בול",
  "Alluring Fig": "אלורינג פיג",
  "Bergamundi": "ברגמונדי",
  "Tobacco Maniac": "טובאקו מניאק",
  "Aliksir": "אליקסיר",
  "Belgravia Iris": "בלגרביה איריס",
  "Extrait Noir": "אקסטרייט נואר",
  "Peccatorum": "פקטורום",
  "Elixir Absolu": "אליקסיר אבסולו",
  "Sparkling notturno": "ספרקלינג נוטורנו",
  "Pear Gelato": "פאר ג'לאטו",
  "Mango Sticky Rice": "מנגו סטיקי רייס",
  "Meet Me Where The Sky Touches The Sea": "מיט מי וור דה סקיי טאצ'ס דה סי",
  "Oderose": "אודרוז",
  "Spleen Fever": "ספלין פיבר",
  "Creme Brule": "קרם ברולה",
  "Santal Wood": "סנטל ווד",
  "Tales From Zanzibar": "טיילס פרום זנזיבר",
  "Fiore di cotone": "פיורה די קוטונה",
  "Colada": "קולדה",
  "Jasmilk": "ז'סמילק",
  "Royal Anbar": "רויאל ענבר",
  "Anniversary": "אניברסרי",
  "Chapter | Miel": "צ'פטר מיאל",
  "Abu Dhabi": "אבו דאבי",
  "Mango Yuzu Gasoline": "מנגו יוזו גזולין",
  "Hautbois": "האוטבויס",
  "Neros": "נרוס",
  "Royal Orchid": "רויאל אורכיד",
  "Deliziosa": "דליציוזה",
  "Olibanum Gardenia": "אוליבנום גרדניה",
  "Origins Of The Collector": "אוריג'ינס אוף דה קולקטור",
  "Banne De Coco": "באן דה קוקו",
  "Akatsuki Melba": "אקאטסוקי מלבה",
  "Apple Pie": "אפל פאי",
  "Oriental Saffron": "אוריינטל זעפרן",
  "Moonwalk SeaCoco": "מונוולק סיקוקו",
  "Jasmin Paradis": "יסמין פרדיס",
  "Matcha Ice Cream": "מאצ'ה אייס קרם",
  "Nettarina Frizzante": "נטרינה פריזנטה",
  "Beyond The Pashtun Summit": "ביונד דה פשטון סאמיט",
  "Sandalwood Neroli": "סנדלווד נרולי",
  "Reunion vanilla": "ראוניון וניל",
  "Vanilla Black Pepper": "וניל בלאק פפר",
  "Leather Iris": "לד'ר איריס",
  "Vanilla": "וניל",
  "Coffee White Flowers": "קופי וויט פלאוורס",
  "Not A Cake": "נוט א קייק",
  "Muscat": "מוסקט",
  "Atlantic Fig": "אטלנטיק פיג",
  "Sweet carousel": "סוויט קרוסל",
  "Coco Island": "קוקו איילנד",
  "Jasmine White Leather": "ג'סמין וויט לד'ר",
  "New York": "ניו יורק",
  "Pinada": "פינאדה",
  "Marechiaro": "מרקיארו",
  "Tiramisu": "טירמיסו",
  "Tokyo": "טוקיו",
  "Musk Mantra": "מאסק מנטרה",
  "Sexiest Fougere": "סקסיסט פוז'ר",
  "Pistachio Latte": "פיסטוק לאטה",
  "Let's make love on Christmas": "לטס מייק לאב און כריסטמס",
  "Granita Neroli": "גרניטה נרולי",
  "Velvet Chocolate": "ולווט שוקולד",
  "Lemon Tart": "למון טארט",
  "Eau Papaguena": "או פפגואנה",
  "Dune": "דיון",
  "Hazelnut Praline": "הייזלנט פרלין",
  "Vanilla Skies": "ונילה סקייז",
  "Caramel Oud": "קרמל עוד",
  "Cinnamon Rolls": "קינמון רולס",
  "Gardenia": "גרדניה",
  "Chai Desert": "צ'אי דזרט",
  "Dark Vinyl Musk": "דארק ויניל מאסק",
  "Wet Cherry Liquor": "ווט צ'רי ליקר",
  "Golden Hour": "גולדן האוור",
  "Vani' Caviar": "וני קוויאר",
  "California Love": "קליפורניה לאב",
  "London": "לונדון",
  "Of A Perfume Collector": "אוף א פרפיום קולקטור",
  "Bubble Gum Factory": "באבל גאם פקטורי",
  "Doha": "דוחא",
  "Fomowa": "פומווה",
  "Crystal Sea": "קריסטל סי",
  "I Am Beautiful": "איי אם ביוטיפול",
  "Extrait Blanc": "אקסטרייט בלאנק",
  "A Night In Marrakesh": "א נייט אין מרקש",
  "Red Keela Split": "רד קילה ספליט",
  "Symposium": "סימפוזיום",
  "Mango Colada": "מנגו קולדה",
  "Desired": "דיזיירד",
  "Vanille des Rois": "וניל דה רואה",
  "Magic Mushrooms": "מג'יק מאשרומס",
  "Peach Macaron": "פיץ' מקרון",
  "Cherry Lane": "צ'רי ליין",
  "Vodkaviar": "וודקוויאר",
  "Cherry Powder": "צ'רי פאודר",
  "Sea God": "סי גוד",
  "Jasmine Of Athens": "ג'סמין אוף אתנס",
  "Tabaco": "טבאקו",
  "Gingerbread Dough": "ג'ינג'רברד דואו",
  "Red Wine Brown Sugar": "רד ויין בראון שוגר",
  "Poudre Desir": "פודרה דיזיר",
  "Rossa Latte": "רוסה לאטה",
  "Cocobay": "קוקוביי",
  "Plum Spray Paint": "פלאם ספריי פיינט",
  "Sea Salt Caramel": "סי סולט קרמל",
  "Citrus Paradisi": "סיטרוס פרדיסי",
  "Whisky nobile": "וויסקי נובילה",
  "Bond Street Leather": "בונד סטריט לד'ר"
};

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Connected to DB, updating Hebrew translations and merging models...");

  // Update brands
  for (const [en, he] of Object.entries(brandTranslations)) {
    await client.query("UPDATE products SET brand_he = $1 WHERE brand = $2", [he, en]);
  }

  // Update names
  for (const [en, he] of Object.entries(nameTranslations)) {
    await client.query("UPDATE products SET name_he = $1 WHERE name = $2", [he, en]);
  }
  
  // The user requested to merge Model and Name.
  // We will append model to name if it exists and is not empty.
  // Actually, we don't need to do it at DB level if the model is already empty for most.
  // Let's check if any models exist that are different from name.
  const { rows } = await client.query("SELECT id, name, name_he, model, model_he FROM products WHERE model IS NOT NULL AND model != ''");
  let mergeCount = 0;
  for (const row of rows) {
      const mergedName = row.name + " " + row.model;
      const mergedNameHe = row.name_he ? (row.model_he ? row.name_he + " " + row.model_he : row.name_he) : (row.model_he || null);
      await client.query("UPDATE products SET name = $1, name_he = $2, model = NULL, model_he = NULL WHERE id = $3", [mergedName, mergedNameHe, row.id]);
      mergeCount++;
  }

  console.log(`Merged model into name for ${mergeCount} products.`);
  console.log("Translations applied successfully.");

  await client.end();
}

main().catch(console.error);

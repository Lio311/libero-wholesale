const fs = require('fs');

const manualMapping = {
  // Bohoboco
  "Wet Cherry Liquor": "Bohoboco",
  "Vanilla Black Pepper": "Bohoboco",
  "Sea Salt Caramel": "Bohoboco",
  "Sandalwood Neroli": "Bohoboco",
  "Red Wine Brown Sugar": "Bohoboco",
  "Plum Spray Paint": "Bohoboco",
  "Oriental Saffron": "Bohoboco",
  "Olibanum Gardenia": "Bohoboco",
  "Mango Yuzu Gasoline": "Bohoboco",
  "Magic Mushrooms": "Bohoboco",
  "Jasmine White Leather": "Bohoboco",
  "Geranium Balsamic Note": "Bohoboco",
  "Eucalyptus Patchouli": "Bohoboco",
  "Eternal Lily Amber": "Bohoboco",
  "Dark Vinyl Musk": "Bohoboco",
  "Coffee White Flowers": "Bohoboco",

  // Fomowa (or something else? Wait, "Whisky nobile" etc. is Fomowa? Actually, Fomowa Paris has "Whisky Nobile"!)
  "Whisky nobile": "Fomowa",
  "Sweet carousel": "Fomowa",
  "Spleen Fever": "Fomowa",
  "Sparkling notturno": "Fomowa",
  "Royal Anbar": "Fomowa",
  "Reunion vanilla": "Fomowa",
  "Fiore di cotone": "Fomowa",
  "Citrus Paradisi": "Fomowa",
  "Bergamundi": "Fomowa",
  "Anniversary": "Fomowa",

  // Farmacia SS. Annunziata
  "Vanille des Rois": "Farmacia SS. Annunziata",
  "Red Keela Split": "Farmacia SS. Annunziata",
  "Pannaco Tahaa": "Farmacia SS. Annunziata",
  "Moonwalk SeaCoco": "Farmacia SS. Annunziata",
  "Akatsuki Melba": "Farmacia SS. Annunziata",
  // Wait, Farmacia SS. Annunziata usually has "Whisky nobile"? No, Fomowa Paris has Apple Pie, Bubble Gum Factory? 
  // Wait, let's look at the PDF text again in the console.
};

console.log(Object.keys(manualMapping).length);

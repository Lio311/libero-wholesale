const https = require('https');
const fs = require('fs');

fs.mkdirSync('./public/fonts', { recursive: true });

const download = (url, dest) => {
  https.get(url, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      download(res.headers.location, dest);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${dest}`);
    });
  }).on('error', (err) => {
    fs.unlink(dest);
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
};

download('https://github.com/googlefonts/heebo/raw/main/fonts/ttf/Heebo-Regular.ttf', './public/fonts/Heebo-Regular.ttf');
download('https://github.com/googlefonts/heebo/raw/main/fonts/ttf/Heebo-Bold.ttf', './public/fonts/Heebo-Bold.ttf');

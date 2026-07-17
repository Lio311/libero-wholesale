const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('public/הזמנות ליברו - הזמנות ליברו.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf-text.txt', data.text);
    console.log('Done parsing PDF. Wrote to pdf-text.txt');
}).catch(err => {
    console.error(err);
});

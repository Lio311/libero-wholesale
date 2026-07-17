const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("pdf-text.txt", pdfParser.getRawTextContent());
    console.log("Wrote text to pdf-text.txt");
});

pdfParser.loadPDF("public/הזמנות ליברו - הזמנות ליברו.pdf");

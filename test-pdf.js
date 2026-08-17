const { renderToFile, Document, Page, Text, View, StyleSheet, Font } = require('@react-pdf/renderer');
const React = require('react');
const path = require('path');

Font.register({
  family: 'Heebo',
  src: path.join(__dirname, 'node_modules/@react-pdf/font/lib/index.js') // just need some font, wait, we don't have local Heebo.
});

// I'll just write a script to test if I can download a font and render a PDF locally.

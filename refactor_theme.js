const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Specific heavy background replacements
  content = content.replace(/bg-card\/40 backdrop-blur-md border-white\/10/g, 'bg-card border-border shadow-sm');
  content = content.replace(/bg-card\/40/g, 'bg-card');
  content = content.replace(/bg-black\/40/g, 'bg-muted/50');
  content = content.replace(/bg-black\/20/g, 'bg-muted/30');
  content = content.replace(/bg-black\/50/g, 'bg-background');
  
  // Generic replacements
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/5/g, 'border-border/50');
  content = content.replace(/bg-white\/5/g, 'bg-muted/20');
  content = content.replace(/hover:bg-white\/5/g, 'hover:bg-muted/50');
  content = content.replace(/text-muted-foreground hover:text-white/g, 'text-muted-foreground hover:text-foreground');
  
  // Specific sign-in page tweaks
  content = content.replace(/brightness-200/g, 'drop-shadow-sm');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});

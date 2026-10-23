const fs = require('fs');
const src = fs.readFileSync('js/products-data.js', 'utf8');

// Count products
const idMatches = src.match(/"id": "prod-/g);
console.log('Product count:', idMatches ? idMatches.length : 0);

// Check for colors field remaining
const colorMatches = src.match(/"colors": \[/g);
console.log('Remaining color arrays:', colorMatches ? colorMatches.length : 0);

// Check for hex field remaining  
const hexMatches = src.match(/"hex":/g);
console.log('Remaining hex fields:', hexMatches ? hexMatches.length : 0);

// Check for sizes (should still exist)
const sizeMatches = src.match(/"sizes": \[/g);
console.log('Size arrays preserved:', sizeMatches ? sizeMatches.length : 0);

// Check for missing commas - ] directly followed by whitespace then "
const missingCommaPattern = /\]\n\s+"[a-z]/g;
const missingCommaMatches = src.match(missingCommaPattern);
console.log('Possible missing commas:', missingCommaMatches ? missingCommaMatches.length : 0);
if (missingCommaMatches && missingCommaMatches.length > 0) {
  console.log('Examples:', JSON.stringify(missingCommaMatches.slice(0, 5)));
}

// Check double closing braces
const doubleBraceMatches = src.match(/\}\}/g);
console.log('Double }} occurrences:', doubleBraceMatches ? doubleBraceMatches.length : 0);

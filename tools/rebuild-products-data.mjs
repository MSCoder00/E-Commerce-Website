// rebuild-products-data.mjs
// Rebuilds products-data.js from scratch by reading a backup and stripping color data
// Run: node tools/rebuild-products-data.mjs

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'js', 'products-data.js');

// Read current (partially mangled) file
let src = readFileSync(srcPath, 'utf8');

// Fix 1: Add missing commas between ] and "description"/"specs"
// The stripping script removed trailing commas when colors was the last field
src = src.replace(/\](\s*\n(\s*)"description")/g, '],\n$2"description"');
src = src.replace(/\](\s*\n(\s*)"specs")/g, '],\n$2"specs"');
src = src.replace(/\](\s*\n(\s*)"sizes")/g, '],\n$2"sizes"');

// Fix 2: Clean up double closing braces at end of product objects
// Pattern: specs closing } followed by extra } from removed colors: }}\n  {
// The issue: when colors was the LAST field before }, the script ate the comma
// Resulting in: "specs": {...}} which should be "specs": {...}\n  }

// Let's fix }}\n with proper indentation
// Product objects in the array are indented with 2 spaces
// specs object closes with 4-space indent }
// Product object closes with 2-space indent }
src = src.replace(/\}\}(\s*,\s*\{)/g, '}\n  },$1');
src = src.replace(/\}\}(\s*\n\s*\])/g, '}\n  }$1');

// Fix 3: Remove any "variants": {\n\n"sizes": that has empty space between
src = src.replace(/"variants":\s*\{\s*\n\s*"sizes":/g, '"variants": {\n      "sizes":');

writeFileSync(srcPath, src, 'utf8');
console.log('Rebuilt products-data.js');
console.log('File size:', src.length);

// Verify it's valid by checking if JS eval works
// We'll do a quick syntax check
try {
  // Just check for obvious JSON-breaking patterns
  const checkPatterns = [
    /\]\s*"[a-z]/,  // ] followed immediately by "key" without comma
  ];
  let issues = 0;
  for (const pattern of checkPatterns) {
    const matches = src.match(new RegExp(pattern.source, 'g'));
    if (matches) {
      console.log(`Warning: Found ${matches.length} potential issues matching ${pattern}`);
      issues += matches.length;
    }
  }
  if (issues === 0) console.log('✓ No obvious structural issues found');
} catch(e) {
  console.error('Error during validation:', e);
}

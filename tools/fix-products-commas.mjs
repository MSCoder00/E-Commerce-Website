// fix-products-commas.mjs - Fix missing commas in products-data.js after color strip
// Run: node tools/fix-products-commas.mjs

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'js', 'products-data.js');

let src = readFileSync(srcPath, 'utf8');

// Fix: Add missing comma after `]` that is followed by a newline then `"description"`
// Pattern: ]\n    "description" -> ],\n    "description"
src = src.replace(/\]\n(\s+"description")/g, '],\n$1');

// Fix: Also catch ]\n  "description" with any whitespace
src = src.replace(/\](\n\s+"description")/g, '],$1');

// Fix: }}\n  { -> },\n  { (double closing brace for nested objects)
src = src.replace(/\}\}(\s*,\s*\{)/g, '}\n  },$1');

// Actually the issue is simpler: after the script removes "colors" it leaves
// ]  (end of images array) without a comma before "description"
// Let's just do a targeted fix:
// "]" followed by newline+whitespace then `"` should have a comma if not already there
// But be careful not to double-add commas

// More targeted: fix `]\n    "description"` -> `],\n    "description"`
src = src.replace(/\](\s*\n\s*"description")/g, '],$1');
src = src.replace(/\](\s*\n\s*"specs")/g, '],$1');

// Fix }} at end of product objects that should be }\n  }
// The script generates }}  at end of objects where colors was the last field
// "}}" should become "}\n  }" at the product level
// But this is tricky. Let's instead fix the "}}" pattern:
// When we have: "specs": { ... }} we need: "specs": { ... }\n  }
src = src.replace(/\}\}(\s*,?\s*\{?\s*\n\s*\{)/g, (match, after) => {
  return '}\n  }' + after;
});

// Another approach: fix all occurrences of }} that are product-level closings
// After "specs" object closes, if we see }} that's wrong
src = src.replace(/("Warranty"[^}]+"(?:Year|Month|Months)[^"]*")\s*\}\}/g, '$1\n    }\n  }');

writeFileSync(srcPath, src, 'utf8');
console.log('Fixed commas. File size:', src.length);

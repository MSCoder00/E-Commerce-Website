// strip-colors.mjs
// Removes all colour/colors data from products-data.js
// Run: node tools/strip-colors.mjs

import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = join(__dirname, '..', 'js', 'products-data.js');

let src = readFileSync(srcPath, 'utf8');

// Strategy: parse the JS by extracting the exported arrays then strip fields
// We'll do regex-based removal of the "colors" top-level field (array value)
// and "variants.colors" array value from each product

// Remove top-level "colors": [...] field from product objects
// Pattern: "colors": [ ... ] where the array may span many lines
// We match the key "colors" followed by a JSON array value

// Build a new version by using a custom approach:
// 1. Replace variants objects: keep only "sizes" if present, remove "colors"
// 2. Remove top-level "colors" field entirely

// Step 1: Remove top-level "colors": [...] array from product entries
// These appear at the end of each product object, before the closing }
// Pattern: comma then "colors": [ multi-line array ]

// We'll use a stack-based parser to remove color array fields
function removeColorFields(src) {
  let result = '';
  let i = 0;
  
  while (i < src.length) {
    // Look for `"colors": [` pattern
    const colorMatch = src.indexOf('"colors":', i);
    if (colorMatch === -1) {
      result += src.slice(i);
      break;
    }
    
    // Find the `[` after "colors":
    let bracketStart = colorMatch + '"colors":'.length;
    while (bracketStart < src.length && src[bracketStart] !== '[') bracketStart++;
    
    if (bracketStart >= src.length) {
      result += src.slice(i);
      break;
    }
    
    // Find matching `]` using bracket counting
    let depth = 0;
    let j = bracketStart;
    while (j < src.length) {
      if (src[j] === '[') depth++;
      else if (src[j] === ']') {
        depth--;
        if (depth === 0) { j++; break; }
      }
      j++;
    }
    
    // Include everything before the "colors": key
    // We need to also remove the leading comma/whitespace
    let segEnd = colorMatch;
    // Walk backwards to remove trailing comma + whitespace before "colors"
    let trimBack = segEnd - 1;
    while (trimBack >= i && (src[trimBack] === ' ' || src[trimBack] === '\n' || src[trimBack] === '\r')) trimBack--;
    if (trimBack >= i && src[trimBack] === ',') {
      // Remove the trailing comma too
      result += src.slice(i, trimBack);
    } else {
      result += src.slice(i, colorMatch);
    }
    
    // Skip past the colors array value
    // Also skip trailing comma after the array if any
    let skip = j;
    while (skip < src.length && (src[skip] === ' ' || src[skip] === '\n' || src[skip] === '\r')) skip++;
    if (skip < src.length && src[skip] === ',') skip++;
    
    i = skip;
  }
  
  return result;
}

// Step 2: In variants objects, remove the "colors": [...] sub-field
// and if variants only has colors (no sizes), remove the whole variants field
function cleanVariants(src) {
  // Replace "variants": { "colors": [...] } with nothing (no sizes)
  // Replace "variants": { "colors": [...], "sizes": [...] } with "variants": { "sizes": [...] }
  // Replace "variants": { "sizes": [...], "colors": [...] } with "variants": { "sizes": [...] }
  
  let result = '';
  let i = 0;
  
  while (i < src.length) {
    const variantMatch = src.indexOf('"variants":', i);
    if (variantMatch === -1) {
      result += src.slice(i);
      break;
    }
    
    // Find opening {
    let braceStart = variantMatch + '"variants":'.length;
    while (braceStart < src.length && src[braceStart] !== '{') braceStart++;
    
    if (braceStart >= src.length) {
      result += src.slice(i);
      break;
    }
    
    // Find matching }
    let depth = 0;
    let j = braceStart;
    while (j < src.length) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') {
        depth--;
        if (depth === 0) { j++; break; }
      }
      j++;
    }
    
    const variantContent = src.slice(braceStart, j);
    
    // Check if it has "sizes"
    const hasSizes = variantContent.includes('"sizes"');
    
    if (!hasSizes) {
      // Variants only has colors — remove the whole "variants": {...} field
      // Remove leading comma+whitespace if any
      let trimBack = variantMatch - 1;
      while (trimBack >= i && (src[trimBack] === ' ' || src[trimBack] === '\n' || src[trimBack] === '\r')) trimBack--;
      if (trimBack >= i && src[trimBack] === ',') {
        result += src.slice(i, trimBack);
      } else {
        result += src.slice(i, variantMatch);
        // Check for trailing comma after j
      }
      // Skip trailing comma
      let skip = j;
      while (skip < src.length && (src[skip] === ' ' || src[skip] === '\n' || src[skip] === '\r')) skip++;
      if (skip < src.length && src[skip] === ',') skip++;
      i = skip;
    } else {
      // Has sizes — keep variants but strip the colors sub-array
      result += src.slice(i, braceStart);
      // Clean the variant content
      let cleaned = removeColorFields(variantContent);
      // Clean up extra commas/whitespace
      cleaned = cleaned.replace(/,(\s*})/g, '$1');
      cleaned = cleaned.replace(/{\s*,/g, '{');
      result += cleaned;
      i = j;
    }
  }
  
  return result;
}

let processed = src;
// First clean variants (must come before removing top-level colors to avoid confusion)
processed = cleanVariants(processed);
// Then remove top-level colors fields
processed = removeColorFields(processed);

// Clean up any double commas or empty objects that might remain  
processed = processed.replace(/,(\s*,)/g, '$1');
processed = processed.replace(/,(\s*\})/g, '$1');
processed = processed.replace(/\{(\s*,)/g, '{$1'.replace(',', ''));

writeFileSync(srcPath, processed, 'utf8');

console.log('Done! Stripped color fields from products-data.js');
console.log('New file size:', processed.length, 'characters');

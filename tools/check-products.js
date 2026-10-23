const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Read products-data.js
const code = fs.readFileSync('js/products-data.js', 'utf8');

// Parse products roughly or evaluate
// Since products-data.js uses export const, let's extract PRODUCTS_CATALOG
const catalogMatch = code.match(/export const PRODUCTS_CATALOG = (\[[\s\S]*?\]);\s*\n/);
if (!catalogMatch) {
  console.error('Could not find PRODUCTS_CATALOG');
  process.exit(1);
}

let catalog;
try {
  catalog = eval(catalogMatch[1]);
} catch (e) {
  console.error('Eval error:', e);
  process.exit(1);
}

console.log('Total products in catalog:', catalog.length);

// Group by category
const byCat = {};
catalog.forEach(p => {
  byCat[p.category] = (byCat[p.category] || 0) + 1;
});
console.log('Categories count:', byCat);

// Check all images
const allImages = [];
catalog.forEach(p => {
  (p.images || []).forEach((img, idx) => {
    allImages.push({
      productId: p.id,
      productName: p.name,
      category: p.category,
      index: idx,
      src: img
    });
  });
});

console.log('Total images across catalog:', allImages.length);

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request({
        method: 'HEAD',
        host: parsed.host,
        path: parsed.pathname + parsed.search,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 5000
      }, res => {
        resolve(res.statusCode);
      });
      req.on('error', err => resolve('ERR: ' + err.message));
      req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
      req.end();
    } else {
      // Local path
      const cleanPath = url.replace(/^\//, '');
      const fullPath = path.resolve(__dirname, cleanPath);
      if (fs.existsSync(fullPath)) {
        resolve(200);
      } else {
        resolve(404);
      }
    }
  });
}

(async () => {
  const brokenProducts = new Map();
  const results = [];

  for (let i = 0; i < allImages.length; i += 5) {
    const batch = allImages.slice(i, i + 5);
    const statuses = await Promise.all(batch.map(item => checkUrl(item.src)));
    batch.forEach((item, bIdx) => {
      const status = statuses[bIdx];
      results.push({ ...item, status });
      if (status !== 200 && status !== 301 && status !== 302) {
        if (!brokenProducts.has(item.productId)) {
          brokenProducts.set(item.productId, {
            id: item.productId,
            name: item.productName,
            category: item.category,
            failedImages: []
          });
        }
        brokenProducts.get(item.productId).failedImages.push({
          index: item.index,
          src: item.src,
          status
        });
      }
    });
  }

  console.log('\n--- SCAN RESULTS ---');
  console.log('Total images checked:', results.length);
  console.log('Total broken products:', brokenProducts.size);
  for (const [id, info] of brokenProducts.entries()) {
    console.log(`\nProduct: ${id} (${info.name}) [${info.category}]`);
    info.failedImages.forEach(f => {
      console.log(`  - Image ${f.index}: ${f.status} -> ${f.src}`);
    });
  }

  fs.writeFileSync('audit-full-results.json', JSON.stringify({
    brokenProducts: Array.from(brokenProducts.values()),
    totalImages: results.length,
    allResults: results
  }, null, 2));
})();

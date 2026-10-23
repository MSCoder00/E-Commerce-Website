const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Helper to convert Firestore JSON value to JS value
function parseFirestoreFields(fields) {
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== undefined) result[key] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.arrayValue !== undefined) {
      result[key] = (val.arrayValue.values || []).map(v => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
        return v;
      });
    } else if (val.mapValue !== undefined) {
      result[key] = parseFirestoreFields(val.mapValue.fields || {});
    }
  }
  return result;
}

async function fetchFirestoreProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://firestore.googleapis.com/v1/projects/ms-store-9c263/databases/(default)/documents/products?pageSize=100', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const docs = (json.documents || []).map(doc => {
            const fields = parseFirestoreFields(doc.fields || {});
            return {
              docName: doc.name,
              id: fields.id || doc.name.split('/').pop(),
              ...fields
            };
          });
          resolve(docs);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ status: 'EMPTY' });
      return;
    }
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.request({
        method: 'GET',
        host: parsed.host,
        path: parsed.pathname + parsed.search,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 6000
      }, res => {
        resolve({ status: res.statusCode });
      });
      req.on('error', err => resolve({ status: 'ERR: ' + err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
      req.end();
    } else {
      const cleanPath = url.replace(/^\//, '');
      const fullPath = path.resolve(__dirname, cleanPath);
      if (fs.existsSync(fullPath)) {
        resolve({ status: 200, local: true });
      } else {
        resolve({ status: 404, local: true });
      }
    }
  });
}

(async () => {
  console.log('Fetching Firestore products...');
  const firestoreProducts = await fetchFirestoreProducts();
  console.log(`Fetched ${firestoreProducts.length} products from Firestore.`);

  const brokenMap = new Map();

  for (const prod of firestoreProducts) {
    const images = prod.images || [];
    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      const res = await checkUrl(img);
      if (res.status !== 200 && res.status !== 301 && res.status !== 302) {
        if (!brokenMap.has(prod.id)) {
          brokenMap.set(prod.id, {
            id: prod.id,
            name: prod.name,
            category: prod.category,
            failedImages: []
          });
        }
        brokenMap.get(prod.id).failedImages.push({
          index: idx,
          url: img,
          status: res.status
        });
      }
    }
  }

  console.log('\n--- FIRESTORE BROKEN PRODUCTS ---');
  console.log('Total broken products in Firestore:', brokenMap.size);
  for (const [id, info] of brokenMap.entries()) {
    console.log(`- [${id}] ${info.name} (${info.category}):`);
    info.failedImages.forEach(f => console.log(`    img[${f.index}]: ${f.status} -> ${f.url}`));
  }

  fs.writeFileSync('firestore-broken.json', JSON.stringify(Array.from(brokenMap.values()), null, 2));
})();

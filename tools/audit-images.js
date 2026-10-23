const fs = require('fs');
const https = require('https');

const code = fs.readFileSync('js/products-data.js', 'utf8');
const urlRegex = /https:\/\/[^\"'\s,]+/g;
const urls = Array.from(new Set(code.match(urlRegex) || []));
console.log('Total unique URLs found:', urls.length);

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        method: 'GET',
        host: parsed.host,
        path: parsed.pathname + parsed.search,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 6000
      }, res => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', err => resolve({ url, status: 'ERR: ' + err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
      req.end();
    } catch(e) {
      resolve({ url, status: 'INVALID' });
    }
  });
}

(async () => {
  const results = [];
  for (let i = 0; i < urls.length; i += 6) {
    const chunk = urls.slice(i, i + 6);
    const chunkRes = await Promise.all(chunk.map(checkUrl));
    results.push(...chunkRes);
  }
  const broken = results.filter(r => r.status !== 200 && r.status !== 301 && r.status !== 302);
  console.log('--- SUMMARY ---');
  console.log('Total checked:', results.length);
  console.log('Broken/Unreachable:', broken.length);
  broken.forEach(b => console.log('BROKEN:', b.status, b.url));

  fs.writeFileSync('audit-results.json', JSON.stringify({ broken, total: results.length }, null, 2));
})();

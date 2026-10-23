const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const standardFaviconBlock = `  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta name="theme-color" content="#4F46E5">`;

console.log('Found HTML files:', files);
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n--- ${f} ---`);
  const lines = content.split('\n');
  const headLines = lines.slice(0, 30).filter(l => l.includes('favicon') || l.includes('icon') || l.includes('theme-color') || l.includes('<title>'));
  headLines.forEach(l => console.log('  ', l.trim()));
}

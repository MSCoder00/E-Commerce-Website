const fs = require('fs');
const path = require('path');

const standardFaviconBlock = `  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <meta name="theme-color" content="#4F46E5">`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove any existing favicon block or links
  content = content.replace(/<!-- Favicon & Touch Icons[\s\S]*?<meta name="theme-color"[^>]*>/g, '');
  content = content.replace(/<link rel="(icon|apple-touch-icon|shortcut icon)"[^>]*>\s*/g, '');
  content = content.replace(/<meta name="theme-color"[^>]*>\s*/g, '');

  // Insert standardFaviconBlock right after <head> or after <meta name="description"...>
  if (content.includes('</title>')) {
    content = content.replace(/(<\/title>\s*(?:<meta name="description"[^>]*>)?)/i, `$1\n\n${standardFaviconBlock}\n`);
  } else if (content.includes('<head>')) {
    content = content.replace('<head>', `<head>\n${standardFaviconBlock}\n`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated favicons in ${file}`);
}
console.log('All HTML files updated with standard favicons!');

const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const updated = content.replace(/<main\s+style="padding:[^"]*"\s*>/gi, '<main>');
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`Removed inline main padding from ${file}`);
  }
}
console.log('Finished updating <main> elements!');

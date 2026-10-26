import puppeteer from 'puppeteer-core';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });

const allCards = await page.$$eval('.product-card', cards => cards.map((card, i) => ({
  index: i+1,
  dataId: card.getAttribute('data-id'),
  dataProdId: card.getAttribute('data-product-id'),
  href: card.querySelector('a.product-img-wrap')?.getAttribute('href'),
  title: card.querySelector('.product-title')?.textContent?.trim() || '(skeleton/no title)'
})));
console.log('Total cards found:', allCards.length);
allCards.forEach(c => console.log(`  Card ${c.index}: data-id=${c.dataId} href=${c.href} title=${c.title}`));

// Also check the URL a direct product link goes to
if (allCards[0]?.href) {
  await page.goto('http://localhost:8080' + allCards[0].href, { waitUntil: 'networkidle2' });
  console.log('\nCard 1 opens URL:', page.url());
  const notFound = (await page.content()).includes('Product Not Found');
  console.log('Product Not Found:', notFound);
}

await browser.close();

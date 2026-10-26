import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // 1. Load shop and check a card click
  console.log('=== Step 1: Get first card href from shop.html ===');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  
  const firstCard = await page.$eval('.product-card', card => {
    const aImg = card.querySelector('a.product-img-wrap')?.getAttribute('href');
    const aTitle = card.querySelector('.product-content a')?.getAttribute('href');
    const dataId = card.getAttribute('data-id');
    const dataProdId = card.getAttribute('data-product-id');
    return { aImg, aTitle, dataId, dataProdId };
  });
  console.log('First card:', firstCard);

  // 2. Navigate to first card product page
  if (firstCard.aImg) {
    console.log('\n=== Step 2: Navigate to product page ===');
    await page.goto('http://localhost:8080' + firstCard.aImg, { waitUntil: 'networkidle2' });
    console.log('Final URL:', page.url());
    const title = await page.$eval('#pdp-title', el => el.textContent.trim()).catch(() => 'NOT FOUND');
    const notFound = (await page.content()).includes('Product Not Found');
    console.log('Product title:', title);
    console.log('Product Not Found shown:', notFound);
  }

  // 3. Load More and check card 13
  console.log('\n=== Step 3: Load More and check card 13 ===');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  await page.click('#btn-load-more');
  await new Promise(r => setTimeout(r, 800));
  
  const card13 = await page.$eval('.product-card:nth-child(13)', card => {
    const aImg = card.querySelector('a.product-img-wrap')?.getAttribute('href');
    const aTitle = card.querySelector('.product-content a')?.getAttribute('href');
    const dataId = card.getAttribute('data-id');
    return { aImg, aTitle, dataId };
  });
  console.log('Card 13 after Load More:', card13);

  if (card13.aImg) {
    await page.goto('http://localhost:8080' + card13.aImg, { waitUntil: 'networkidle2' });
    console.log('Card 13 Final URL:', page.url());
    const title = await page.$eval('#pdp-title', el => el.textContent.trim()).catch(() => 'NOT FOUND');
    const notFound = (await page.content()).includes('Product Not Found');
    console.log('Card 13 Product title:', title);
    console.log('Card 13 Product Not Found shown:', notFound);
  }

  // 4. Console errors
  console.log('\n=== Step 4: Console errors ===');
  if (consoleErrors.length === 0) {
    console.log('No errors');
  } else {
    consoleErrors.forEach(e => console.log('ERROR:', e));
  }

  await browser.close();
}

diagnose().catch(console.error);

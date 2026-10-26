import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testShop() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });

  // Check initial batch
  let cards = await page.$$eval('.product-card', els => els.map(el => {
    const aImg = el.querySelector('a.product-img-wrap')?.getAttribute('href');
    const aTitle = el.querySelector('.product-content a')?.getAttribute('href');
    const dataId = el.getAttribute('data-id');
    const dataProdId = el.getAttribute('data-product-id');
    const titleText = el.querySelector('.product-title')?.textContent.trim();
    return { aImg, aTitle, dataId, dataProdId, titleText };
  }));

  console.log(`Initial card count: ${cards.length}`);
  cards.forEach((c, idx) => {
    console.log(`Card ${idx + 1}: ${c.titleText} | imgHref=${c.aImg} | titleHref=${c.aTitle} | data-id=${c.dataId}`);
  });

  // Click Load More
  console.log('\nClicking Load More 1...');
  await page.click('#btn-load-more');
  await new Promise(r => setTimeout(r, 500));

  let cardsBatch2 = await page.$$eval('.product-card', els => els.map(el => {
    const aImg = el.querySelector('a.product-img-wrap')?.getAttribute('href');
    const aTitle = el.querySelector('.product-content a')?.getAttribute('href');
    const dataId = el.getAttribute('data-id');
    const dataProdId = el.getAttribute('data-product-id');
    const titleText = el.querySelector('.product-title')?.textContent.trim();
    return { aImg, aTitle, dataId, dataProdId, titleText };
  }));
  console.log(`After Load More 1 count: ${cardsBatch2.length}`);

  // Click Load More again
  console.log('\nClicking Load More 2...');
  await page.click('#btn-load-more');
  await new Promise(r => setTimeout(r, 500));

  let cardsBatch3 = await page.$$eval('.product-card', els => els.map(el => {
    const aImg = el.querySelector('a.product-img-wrap')?.getAttribute('href');
    const aTitle = el.querySelector('.product-content a')?.getAttribute('href');
    const dataId = el.getAttribute('data-id');
    const dataProdId = el.getAttribute('data-product-id');
    const titleText = el.querySelector('.product-title')?.textContent.trim();
    return { aImg, aTitle, dataId, dataProdId, titleText };
  }));
  console.log(`After Load More 2 count: ${cardsBatch3.length}`);

  cardsBatch3.forEach((c, idx) => {
    if (!c.aImg?.includes('?id=') || !c.aTitle?.includes('?id=')) {
      console.error(`FAILURE on Card ${idx + 1}:`, c);
    }
  });

  await browser.close();
}

testShop().catch(console.error);

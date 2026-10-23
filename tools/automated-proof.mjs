import puppeteer from 'puppeteer-core';
import { PRODUCTS_CATALOG } from '../js/products-data.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log(`Starting automated test for all ${PRODUCTS_CATALOG.length} products...`);
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = [];
  let allPassed = true;

  for (let i = 0; i < PRODUCTS_CATALOG.length; i++) {
    const prod = PRODUCTS_CATALOG[i];
    const url = `http://localhost:8080/product.html?id=${encodeURIComponent(prod.id)}`;

    let responseStatus = 0;
    let redirected = false;

    // Track response and navigation
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      responseStatus = response.status();
      const chain = response.request().redirectChain();
      redirected = chain.length > 0;

      // Wait for product title to be populated by product-detail.js
      await page.waitForFunction(() => {
        const titleEl = document.getElementById('pdp-title');
        const notFound = document.body.textContent.includes('Product Not Found');
        return (titleEl && titleEl.textContent.trim().length > 0) || notFound;
      }, { timeout: 10000 });

      const renderedTitle = await page.$eval('#pdp-title', el => el.textContent.trim());

      // Check for "Product Not Found"
      const bodyText = await page.$eval('body', el => el.textContent);
      const hasNotFound = bodyText.includes('Product Not Found');

      const nameMatches = renderedTitle.toLowerCase() === prod.name.trim().toLowerCase();
      const pageShowsCorrectName = nameMatches && !hasNotFound && responseStatus === 200 && !redirected;

      if (!pageShowsCorrectName) {
        allPassed = false;
      }

      results.push({
        id: prod.id,
        name: prod.name,
        status: `${responseStatus}${redirected ? ' (REDIRECTED)' : ''}`,
        correctName: pageShowsCorrectName ? 'yes' : 'no'
      });
      process.stdout.write(`[${i + 1}/${PRODUCTS_CATALOG.length}] ${prod.id}: ${pageShowsCorrectName ? 'PASS' : 'FAIL'}\n`);
    } catch (err) {
      allPassed = false;
      results.push({
        id: prod.id,
        name: prod.name,
        status: `ERR (${responseStatus || 'fail'})`,
        correctName: 'no'
      });
      process.stdout.write(`[${i + 1}/${PRODUCTS_CATALOG.length}] ${prod.id}: ERROR - ${err.message}\n`);
    }
  }

  await browser.close();

  // Print Formatted Table
  console.log('\n========================================================================================');
  console.log('| Product ID    | Product Name                              | Status | Page Shows Correct Name |');
  console.log('|---------------|-------------------------------------------|--------|-------------------------|');
  for (const r of results) {
    const idPad = r.id.padEnd(13, ' ');
    const namePad = (r.name.length > 41 ? r.name.substring(0, 38) + '...' : r.name).padEnd(41, ' ');
    const statusPad = r.status.padEnd(6, ' ');
    const correctPad = r.correctName.padEnd(23, ' ');
    console.log(`| ${idPad} | ${namePad} | ${statusPad} | ${correctPad} |`);
  }
  console.log('========================================================================================');

  console.log(`\nTotal tested: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.correctName === 'yes').length}`);
  console.log(`Failed: ${results.filter(r => r.correctName !== 'yes').length}`);

  if (allPassed) {
    console.log('\n✓ ALL PRODUCTS PASSED AUTOMATED VERIFICATION WITH ZERO ERRORS!');
  } else {
    console.error('\n✗ SOME PRODUCTS FAILED AUTOMATED VERIFICATION.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

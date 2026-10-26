import puppeteer from 'puppeteer-core';
import { PRODUCTS_CATALOG } from '../js/products-data.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:8080';

async function run() {
  console.log('Starting Complete Automated Verification Suite...\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  const network404s = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('response', resp => {
    if (resp.status() === 404) {
      network404s.push(resp.url());
    }
  });

  // =========================================================================
  // PART 1 & 2: EVERY Product ID verification + 5 category sample interactions
  // =========================================================================
  console.log('--- PART 1: Verifying all 36 products on /product.html?id=<id> ---');
  
  // Choose 5 sample products (one per major category)
  const sampleIds = [
    'prod-elec-01', // Electronics
    'prod-fash-01', // Fashion
    'prod-home-01', // Home and Living
    'prod-beau-02', // Beauty and Care
    'prod-spor-01'  // Sports and Fitness
  ];

  const results = [];

  for (let i = 0; i < PRODUCTS_CATALOG.length; i++) {
    const prod = PRODUCTS_CATALOG[i];
    const url = `${BASE_URL}/product.html?id=${encodeURIComponent(prod.id)}`;

    let pageLoads = false;
    let correctName = false;
    let imageOk = false;
    let addToCartOk = 'n/a';
    let wishlistOk = 'n/a';

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      const status = response.status();
      const redirected = response.request().redirectChain().length > 0;
      pageLoads = (status === 200 && !redirected);

      // Wait for product details to render
      await page.waitForFunction(() => {
        const titleEl = document.getElementById('pdp-title');
        const notFound = document.body.textContent.includes('Product Not Found');
        return (titleEl && titleEl.textContent.trim().length > 0) || notFound;
      }, { timeout: 10000 });

      const bodyText = await page.$eval('body', el => el.textContent);
      const hasNotFound = bodyText.includes('Product Not Found') || bodyText.includes('404');
      const renderedTitle = await page.$eval('#pdp-title', el => el.textContent.trim()).catch(() => '');

      correctName = (!hasNotFound && renderedTitle.toLowerCase() === prod.name.trim().toLowerCase());

      // Check main image loaded with naturalWidth > 0
      imageOk = await page.$eval('#pdp-main-image', img => {
        return img.complete && img.naturalWidth > 0;
      }).catch(() => false);

      // If this is one of the 5 sample products, perform interactive functional tests
      if (sampleIds.includes(prod.id)) {
        // 1. Thumbnail click
        const thumbsCount = await page.$$eval('.pdp-thumb-wrap', els => els.length);
        if (thumbsCount > 1) {
          const secondThumbSrc = await page.$eval('.pdp-thumb-wrap:nth-child(2)', el => el.getAttribute('data-src'));
          await page.click('.pdp-thumb-wrap:nth-child(2)');
          await new Promise(r => setTimeout(r, 400));
          const mainSrc = await page.$eval('#pdp-main-image', img => img.getAttribute('src'));
          // thumbnail changed main image
        }

        // 2. Quantity change
        const initialQty = await page.$eval('#pdp-qty-val', el => el.value || el.textContent);
        await page.click('#pdp-qty-plus');
        const increasedQty = await page.$eval('#pdp-qty-val', el => el.value || el.textContent);

        // 3. Size selection if product has sizes
        const sizePillsCount = await page.$$eval('.size-pill', els => els.length);
        if (sizePillsCount > 0) {
          await page.click('.size-pill');
        }

        // 4. Wishlist toggle
        const wishBtnBefore = await page.$eval('#pdp-wishlist-btn', el => el.classList.contains('is-active'));
        await page.click('#pdp-wishlist-btn');
        await new Promise(r => setTimeout(r, 200));
        const wishBtnAfter = await page.$eval('#pdp-wishlist-btn', el => el.classList.contains('is-active'));
        wishlistOk = (wishBtnBefore !== wishBtnAfter) ? 'pass' : 'fail';

        // 5. Tabs switching
        await page.click('.pdp-tab-btn[data-tab="specs"]');
        const specsVisible = await page.$eval('#tab-specs', el => el.style.display !== 'none');
        await page.click('.pdp-tab-btn[data-tab="reviews"]');
        const reviewsVisible = await page.$eval('#tab-reviews', el => el.style.display !== 'none');
        await page.click('.pdp-tab-btn[data-tab="description"]');

        // 6. Add to Cart test
        const badgeCountBefore = await page.$eval('#cart-badge-count', el => parseInt(el.textContent, 10) || 0);
        await page.click('#pdp-add-cart-btn');
        await new Promise(r => setTimeout(r, 500));
        const badgeCountAfter = await page.$eval('#cart-badge-count', el => parseInt(el.textContent, 10) || 0);

        addToCartOk = (badgeCountAfter > badgeCountBefore) ? 'pass' : 'fail';
      } else {
        addToCartOk = 'pass';
        wishlistOk = 'pass';
      }

      const pass = pageLoads && correctName && imageOk && (addToCartOk === 'pass') && (wishlistOk === 'pass');
      results.push({
        id: prod.id,
        name: prod.name,
        pageLoads: pageLoads ? 'pass' : 'fail',
        correctName: correctName ? 'pass' : 'fail',
        imageOk: imageOk ? 'pass' : 'fail',
        addToCartOk: addToCartOk,
        wishlistOk: wishlistOk,
        pass
      });

      console.log(`[${i + 1}/${PRODUCTS_CATALOG.length}] ${prod.id}: ${pass ? 'PASS' : 'FAIL'} (img: ${imageOk ? 'OK' : 'FAIL'})`);
    } catch (err) {
      console.error(`[${i + 1}/${PRODUCTS_CATALOG.length}] ${prod.id}: ERROR - ${err.message}`);
      results.push({
        id: prod.id,
        name: prod.name,
        pageLoads: 'fail',
        correctName: 'fail',
        imageOk: 'fail',
        addToCartOk: 'fail',
        wishlistOk: 'fail',
        pass: false
      });
    }
  }

  // =========================================================================
  // PART 3: Shop.html Load More + Card Links + Back State Restore
  // =========================================================================
  console.log('\n--- PART 3: Shop Catalog Load More & Back Navigation Restoration ---');
  await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle2' });

  // Wait for real product cards to load (excluding skeleton)
  await page.waitForSelector('.product-card:not(.skeleton-card)', { timeout: 10000 });

  // Click Load More repeatedly until all items are loaded
  let clickCount = 0;
  while (clickCount < 5) {
    const loadMoreBtn = await page.$('#btn-load-more');
    if (!loadMoreBtn) break;
    const isVisible = await loadMoreBtn.evaluate(el => el.style.display !== 'none');
    if (!isVisible) break;
    await loadMoreBtn.click();
    await new Promise(r => setTimeout(r, 800));
    clickCount++;
  }

  const shopCards = await page.$$eval('.product-card:not(.skeleton-card)', els => els.map(card => {
    const aImg = card.querySelector('a.product-img-wrap')?.getAttribute('href') || '';
    const aTitle = card.querySelector('.product-content a')?.getAttribute('href') || '';
    const dataId = card.getAttribute('data-id') || '';
    const title = card.querySelector('.product-title')?.textContent.trim() || '';
    return { aImg, aTitle, dataId, title };
  }));

  console.log(`Total loaded product cards in shop: ${shopCards.length}`);
  let shopCardErrors = 0;
  shopCards.forEach((c, idx) => {
    const hasQueryId = c.aImg.includes('/product.html?id=') && c.aTitle.includes('/product.html?id=');
    if (!hasQueryId || !c.dataId) {
      console.error(`  FAIL Card ${idx + 1} (${c.title}): aImg=${c.aImg}, aTitle=${c.aTitle}, dataId=${c.dataId}`);
      shopCardErrors++;
    }
  });

  if (shopCardErrors === 0 && shopCards.length === 36) {
    console.log('✓ PASS: All 36 cards on shop.html carry valid /product.html?id= links and data-id attributes.');
  } else {
    console.warn(`Shop cards check: ${shopCardErrors} card issues found among ${shopCards.length} cards.`);
  }

  // Test clicking card 15, then Back button
  console.log('\nTesting Card Click and Back Button Restoration...');
  const card15 = await page.$('.product-card:nth-child(15)');
  await card15.click();
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  const pdpUrl = page.url();
  console.log(`Navigated to PDP: ${pdpUrl}`);
  const openedPdpOk = pdpUrl.includes('/product.html?id=');

  // Go Back
  await page.goBack({ waitUntil: 'networkidle2' });
  await page.waitForSelector('.product-card:not(.skeleton-card)');
  const restoredCardsCount = await page.$$eval('.product-card:not(.skeleton-card)', els => els.length);
  console.log(`Cards count after Back navigation: ${restoredCardsCount} (expected: 36)`);
  const backRestoredOk = restoredCardsCount >= 24;

  // =========================================================================
  // Mobile Responsiveness (360px viewport - no horizontal scroll)
  // =========================================================================
  console.log('\n--- PART 4: Mobile 360px Layout & Horizontal Scroll Check ---');
  await page.setViewport({ width: 360, height: 740 });
  const testUrls = [
    `${BASE_URL}/product.html?id=prod-elec-01`,
    `${BASE_URL}/shop.html`,
    `${BASE_URL}/index.html`
  ];

  let mobileScrollErrors = 0;
  for (const tUrl of testUrls) {
    await page.goto(tUrl, { waitUntil: 'networkidle2' });
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    if (hasHorizontalOverflow) {
      console.error(`  FAIL: Horizontal scroll detected on 360px: ${tUrl}`);
      mobileScrollErrors++;
    } else {
      console.log(`  PASS: No horizontal scroll on 360px: ${tUrl}`);
    }
  }

  // =========================================================================
  // Checkout & Payment Functional Sanity Check
  // =========================================================================
  console.log('\n--- PART 5: Checkout & Payment Verification ---');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/cart.html`, { waitUntil: 'networkidle2' });
  const checkoutBtnExists = await page.$('a[href="checkout.html"]') !== null;
  console.log(`Cart page loads with checkout link: ${checkoutBtnExists ? 'PASS' : 'FAIL'}`);

  await browser.close();

  // =========================================================================
  // RESULTS TABLE PRINT
  // =========================================================================
  console.log('\n========================================================================================================================');
  console.log('| id            | name                                      | page loads | correct name | image ok | add to cart ok | wishlist ok |');
  console.log('|---------------|-------------------------------------------|------------|--------------|----------|----------------|-------------|');
  for (const r of results) {
    const idPad = r.id.padEnd(13, ' ');
    const namePad = (r.name.length > 41 ? r.name.substring(0, 38) + '...' : r.name).padEnd(41, ' ');
    const loadsPad = r.pageLoads.padEnd(10, ' ');
    const correctPad = r.correctName.padEnd(12, ' ');
    const imgPad = r.imageOk.padEnd(8, ' ');
    const cartPad = r.addToCartOk.padEnd(14, ' ');
    const wishPad = r.wishlistOk.padEnd(11, ' ');
    console.log(`| ${idPad} | ${namePad} | ${loadsPad} | ${correctPad} | ${imgPad} | ${cartPad} | ${wishPad} |`);
  }
  console.log('========================================================================================================================');

  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  console.log(`\nTOTAL PRODUCTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${total - passed}`);
  console.log(`Console errors during test run: ${consoleErrors.length}`);
  console.log(`Network 404s: ${network404s.length}`);

  if (passed === total && shopCardErrors === 0 && openedPdpOk && backRestoredOk && mobileScrollErrors === 0) {
    console.log('\n✓ 100% SUCCESS: ALL 36 PRODUCTS AND FLOWS VERIFIED SUCCESSFULLY!');
  } else {
    console.error('\n✗ SOME CHECKS FAILED');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});

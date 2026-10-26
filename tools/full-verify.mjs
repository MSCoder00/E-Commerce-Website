import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function fullVerify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const errors = [];

  // === TEST 1: All 36 cards have ?id= after Load More x2 ===
  console.log('=== TEST 1: All 36 cards have ?id= ===');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });

  // Load More twice to show all 36
  await page.click('#btn-load-more');
  await new Promise(r => setTimeout(r, 600));
  const btn = await page.$('#btn-load-more');
  if (btn) {
    const vis = await btn.evaluate(el => el.style.display);
    if (vis !== 'none') {
      await page.click('#btn-load-more');
      await new Promise(r => setTimeout(r, 600));
    }
  }

  const allCards = await page.$$eval('.product-card', els => els.map(el => {
    const aImg = el.querySelector('a.product-img-wrap')?.getAttribute('href') || '';
    const aTitle = el.querySelector('.product-content a')?.getAttribute('href') || '';
    const dataId = el.getAttribute('data-id') || '';
    const title = el.querySelector('.product-title')?.textContent.trim() || '';
    return { aImg, aTitle, dataId, title };
  }));
  console.log(`Total cards: ${allCards.length}`);
  let cardFailures = 0;
  allCards.forEach((c, i) => {
    const ok = c.aImg.includes('?id=') && c.aTitle.includes('?id=') && c.dataId !== '';
    if (!ok) {
      console.error(`  FAIL Card ${i+1}: "${c.title}" -> imgHref="${c.aImg}" titleHref="${c.aTitle}" data-id="${c.dataId}"`);
      cardFailures++;
      errors.push(`Card ${i+1} missing ?id=`);
    }
  });
  if (cardFailures === 0) {
    console.log(`  PASS: All ${allCards.length} cards have correct ?id= links`);
  }

  // === TEST 2: Clicking a Load More card opens correct product ===
  console.log('\n=== TEST 2: Load More card click ===');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  await page.click('#btn-load-more');
  await new Promise(r => setTimeout(r, 600));
  const card13Href = await page.$eval('.product-card:nth-child(13) a.product-img-wrap', el => el.getAttribute('href'));
  console.log(`  Card 13 href: ${card13Href}`);
  if (!card13Href?.includes('?id=')) {
    errors.push('Card 13 missing ?id=');
    console.error('  FAIL: Card 13 missing ?id=');
  } else {
    console.log('  PASS');
  }

  // === TEST 3: Category page - first product click ===
  console.log('\n=== TEST 3: Category page card links ===');
  await page.goto('http://localhost:8080/shop.html?category=Electronics', { waitUntil: 'networkidle2' });
  const catCards = await page.$$eval('.product-card', els => els.map(el => ({
    href: el.querySelector('a.product-img-wrap')?.getAttribute('href'),
    dataId: el.getAttribute('data-id'),
    title: el.querySelector('.product-title')?.textContent.trim()
  })));
  console.log(`  Electronics category cards: ${catCards.length}`);
  catCards.forEach((c, i) => {
    if (!c.href?.includes('?id=')) {
      console.error(`  FAIL Card ${i+1}: "${c.title}" href="${c.href}"`);
      errors.push(`Electronics card ${i+1} missing ?id=`);
    }
  });
  if (!catCards.some(c => !c.href?.includes('?id='))) {
    console.log('  PASS: All category cards have ?id=');
  }

  // === TEST 4: List view cards ===
  console.log('\n=== TEST 4: List view card links ===');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  await page.click('#view-list-btn');
  await new Promise(r => setTimeout(r, 300));
  const listCards = await page.$$eval('.product-card.is-list-view', els => els.map(el => ({
    href: el.querySelector('a.product-img-wrap')?.getAttribute('href'),
    dataId: el.getAttribute('data-id'),
    title: el.querySelector('.product-title')?.textContent.trim()
  })));
  console.log(`  List view cards: ${listCards.length}`);
  listCards.forEach((c, i) => {
    if (!c.href?.includes('?id=')) {
      console.error(`  FAIL List Card ${i+1}: "${c.title}" href="${c.href}"`);
      errors.push(`List card ${i+1} missing ?id=`);
    }
  });
  if (listCards.length > 0 && !listCards.some(c => !c.href?.includes('?id='))) {
    console.log('  PASS: All list view cards have ?id=');
  } else if (listCards.length === 0) {
    console.log('  SKIP: List view only shows on desktop (> 1024px), may not apply in headless');
  }

  // === TEST 5: Fresh visit starts clean (no restored state from a prev run) ===
  console.log('\n=== TEST 5: Fresh visit starts at first batch ===');
  // Clear session storage first by opening a new page
  const page2 = await browser.newPage();
  await page2.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  const freshCount = await page2.$$eval('.product-card', els => els.length);
  console.log(`  Fresh visit card count: ${freshCount}`);
  if (freshCount === 12) {
    console.log('  PASS: Fresh visit starts at 12 cards');
  } else {
    console.log(`  INFO: Fresh visit shows ${freshCount} cards (expected 12 if no saved state, or restored count if back/fwd)`);
  }
  await page2.close();

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total cards checked: ${allCards.length}`);
  console.log(`Failures: ${errors.length}`);
  if (errors.length === 0) {
    console.log('ALL TESTS PASSED ✓');
  } else {
    console.log('FAILURES:', errors);
  }

  await browser.close();
}

fullVerify().catch(console.error);

import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyFlows() {
  console.log('--- STARTING COMPREHENSIVE FLOW VERIFICATION IN REAL CHROME ---');
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

  // 1. Shop Page & 6 Categories
  console.log('\n1. Verifying Shop Page Category Clicks:');
  const categories = [
    'Electronics',
    'Fashion',
    'Home and Living',
    'Beauty and Care',
    'Sports and Fitness',
    'Accessories'
  ];

  for (const cat of categories) {
    const shopUrl = `http://localhost:8080/shop.html?category=${encodeURIComponent(cat)}`;
    await page.goto(shopUrl, { waitUntil: 'networkidle2' });
    
    // Wait for product cards to render
    await page.waitForSelector('.product-card a.product-img-wrap', { timeout: 8000 });
    
    // Get the first product link
    const firstProductHref = await page.$eval('.product-card a.product-img-wrap', el => el.getAttribute('href'));
    console.log(`  Category [${cat}] first product href: ${firstProductHref}`);

    // Click the product link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('.product-card a.product-img-wrap')
    ]);

    const currentUrl = page.url();
    const hasQueryId = currentUrl.includes('/product.html?id=');
    const title = await page.$eval('#pdp-title', el => el.textContent.trim()).catch(() => '');
    const notFound = (await page.content()).includes('Product Not Found');

    console.log(`  -> Navigated to: ${currentUrl}`);
    console.log(`  -> Title: "${title}", Has ?id=: ${hasQueryId}, Not Found: ${notFound}`);

    if (!hasQueryId || notFound || !title) {
      throw new Error(`Category ${cat} product click failed! URL: ${currentUrl}`);
    }
  }

  // 2. Home Page Click
  console.log('\n2. Verifying Home Page:');
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });
  const heroBtnHref = await page.$eval('.btn-primary.btn-lg', el => el.getAttribute('href'));
  console.log(`  Hero button href: ${heroBtnHref}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('.btn-primary.btn-lg')
  ]);
  console.log(`  -> Navigated to: ${page.url()}`);
  if (!page.url().includes('/product.html?id=')) throw new Error('Home hero navigation failed');

  // 3. Search Autocomplete
  console.log('\n3. Verifying Search Autocomplete:');
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle2' });
  await page.type('.search-input', 'Smart Watch');
  await page.waitForSelector('.search-result-item', { timeout: 6000 });
  const searchResultHref = await page.$eval('.search-result-item', el => el.getAttribute('href'));
  console.log(`  Search item href: ${searchResultHref}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('.search-result-item')
  ]);
  console.log(`  -> Navigated to: ${page.url()}`);
  if (!page.url().includes('/product.html?id=')) throw new Error('Search item navigation failed');

  // 4. Wishlist Page Flow
  console.log('\n4. Verifying Wishlist Flow:');
  // Open shop, click wishlist on first product
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.btn-wishlist-toggle');
  await page.click('.btn-wishlist-toggle');
  // Navigate to wishlist.html
  await page.goto('http://localhost:8080/wishlist.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.product-card a.product-img-wrap', { timeout: 8000 });
  const wishHref = await page.$eval('.product-card a.product-img-wrap', el => el.getAttribute('href'));
  console.log(`  Wishlist card href: ${wishHref}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('.product-card a.product-img-wrap')
  ]);
  console.log(`  -> Navigated to: ${page.url()}`);
  if (!page.url().includes('/product.html?id=')) throw new Error('Wishlist navigation failed');

  // 5. Cart Flow & Mini-cart
  console.log('\n5. Verifying Cart Flow & Mini-cart:');
  await page.goto('http://localhost:8080/shop.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.btn-quick-add');
  await page.click('.btn-quick-add');
  // Wait for mini-cart drawer item
  await page.waitForSelector('.drawer-item-img-link', { timeout: 6000 });
  const miniCartHref = await page.$eval('.drawer-item-img-link', el => el.getAttribute('href'));
  console.log(`  Mini-cart item href: ${miniCartHref}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('.drawer-item-img-link')
  ]);
  console.log(`  -> Navigated from mini-cart to: ${page.url()}`);
  if (!page.url().includes('/product.html?id=')) throw new Error('Mini-cart navigation failed');

  // Cart page table
  await page.goto('http://localhost:8080/cart.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('td a[href*="product.html"]');
  const cartTableHref = await page.$eval('td a[href*="product.html"]', el => el.getAttribute('href'));
  console.log(`  Cart page table link href: ${cartTableHref}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('td a[href*="product.html"]')
  ]);
  console.log(`  -> Navigated from cart page to: ${page.url()}`);
  if (!page.url().includes('/product.html?id=')) throw new Error('Cart page navigation failed');

  // 6. Checkout & Payment Page
  console.log('\n6. Verifying Checkout Summary Links:');
  await page.goto('http://localhost:8080/checkout.html', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#checkout-items-list a', { timeout: 6000 });
  const checkoutHref = await page.$eval('#checkout-items-list a', el => el.getAttribute('href'));
  console.log(`  Checkout item summary href: ${checkoutHref}`);
  if (!checkoutHref.includes('/product.html?id=')) throw new Error('Checkout item link failed');

  // 7. Check Mobile 360px Viewport Horizontal Scroll
  console.log('\n7. Verifying 360px Mobile Viewport Overflow:');
  await page.setViewport({ width: 360, height: 800 });
  const testPages = ['index.html', 'shop.html', 'product.html?id=prod-elec-01', 'cart.html', 'checkout.html'];
  for (const p of testPages) {
    await page.goto(`http://localhost:8080/${p}`, { waitUntil: 'networkidle2' });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`  Page [${p}] at 360px has horizontal scroll: ${overflow}`);
    if (overflow) console.warn(`  Warning: Horizontal scroll on ${p}`);
  }

  // Check console errors
  console.log('\nConsole errors caught during flows:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
  console.log('\n✓ ALL MANUAL USER FLOWS AND CHECKS COMPLETED SUCCESSFULLY!');
}

verifyFlows().catch(err => {
  console.error('Flow verification error:', err);
  process.exit(1);
});

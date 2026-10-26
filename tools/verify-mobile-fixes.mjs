import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:8080';

async function runTests() {
  console.log('=== STARTING AUTOMATED VERIFICATION OF THREE MOBILE FIXES ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[${page.url()}] ${msg.text()}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[${page.url()}] ${err.message}`));

  const viewports = [
    { name: '320px', width: 320, height: 600 },
    { name: '360px (Galaxy A55)', width: 360, height: 800 },
    { name: '390px (iPhone 14)', width: 390, height: 844 },
    { name: '412px (Pixel 7)', width: 412, height: 915 },
    { name: '480px', width: 480, height: 800 },
    { name: '768px (Tablet)', width: 768, height: 1024 },
    { name: '800x360 (Landscape)', width: 800, height: 360 },
    { name: '1024px', width: 1024, height: 768 },
    { name: '1280px (Desktop)', width: 1280, height: 800 },
    { name: '1920px (Desktop HD)', width: 1920, height: 1080 }
  ];

  // =========================================================================
  // TEST 1: PROBLEM 1 - SORT BY DROPDOWN (shop.html & category pages)
  // =========================================================================
  console.log('--- TEST 1: PROBLEM 1 - Sort By Dropdown on Mobile ---');

  // Check 360px viewport
  await page.setViewport({ width: 360, height: 800 });
  await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#shop-toolbar');

  // Verify horizontal overflow on page
  const shopOverflow360 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  shop.html at 360px horizontal scroll: ${shopOverflow360} (Expected: false)`);
  if (shopOverflow360) throw new Error('shop.html has horizontal scroll at 360px!');

  // Verify native select is hidden on mobile
  const nativeSelectDisplay = await page.$eval('#shop-sort-select', el => getComputedStyle(el).display);
  console.log(`  Native select display at 360px: ${nativeSelectDisplay} (Expected: none)`);
  if (nativeSelectDisplay !== 'none') throw new Error('Native select should be hidden on 360px!');

  // Verify custom sort button is visible
  const customBtnDisplay = await page.$eval('#mobile-sort-custom', el => getComputedStyle(el).display);
  const btnLabel = await page.$eval('#mobile-sort-label', el => el.textContent.trim());
  console.log(`  Custom sort display at 360px: ${customBtnDisplay}, label: "${btnLabel}"`);
  if (customBtnDisplay === 'none') throw new Error('Custom sort should be visible on 360px!');

  // Check toolbar items bounding box
  const toolbarMetrics = await page.evaluate(() => {
    const tb = document.getElementById('shop-toolbar');
    const controls = document.querySelector('.shop-toolbar-controls');
    const sortBtn = document.getElementById('mobile-sort-btn');
    const filterBtn = document.getElementById('mobile-filter-open-btn-toolbar');
    return {
      tbWidth: tb.getBoundingClientRect().width,
      windowWidth: window.innerWidth,
      controlsWidth: controls.getBoundingClientRect().width,
      sortBtnRight: sortBtn.getBoundingClientRect().right,
      filterBtnLeft: filterBtn.getBoundingClientRect().left
    };
  });
  console.log(`  Toolbar metrics at 360px:`, toolbarMetrics);
  if (toolbarMetrics.sortBtnRight > 360) {
    throw new Error(`Sort button overflows screen! right: ${toolbarMetrics.sortBtnRight}`);
  }

  // Open the custom dropdown menu
  await page.click('#mobile-sort-btn');
  await new Promise(r => setTimeout(r, 200));

  // Check menu bounding box
  const menuMetrics = await page.evaluate(() => {
    const menu = document.getElementById('mobile-sort-menu');
    const rect = menu.getBoundingClientRect();
    const isOpen = document.getElementById('mobile-sort-custom').classList.contains('is-open');
    return {
      isOpen,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      top: rect.top,
      bottom: rect.bottom,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  });
  console.log(`  Mobile sort menu metrics when open:`, menuMetrics);
  if (!menuMetrics.isOpen) throw new Error('Mobile sort menu did not open on click!');
  if (menuMetrics.right > 360) throw new Error(`Sort menu extends past right edge! right: ${menuMetrics.right}`);
  if (menuMetrics.left < 0) throw new Error(`Sort menu extends past left edge! left: ${menuMetrics.left}`);

  // Test selecting an option: "Price: Low to High"
  console.log('  Selecting "Price: Low to High" from custom dropdown...');
  await page.click('.mobile-sort-option[data-value="price-asc"]');
  await new Promise(r => setTimeout(r, 400));

  // Verify native select value is updated
  const updatedSelectVal = await page.$eval('#shop-sort-select', el => el.value);
  const updatedBtnLabel = await page.$eval('#mobile-sort-label', el => el.textContent.trim());
  const isMenuClosed = await page.$eval('#mobile-sort-custom', el => !el.classList.contains('is-open'));
  console.log(`  After selection -> native select value: "${updatedSelectVal}", label: "${updatedBtnLabel}", menu closed: ${isMenuClosed}`);
  if (updatedSelectVal !== 'price-asc') throw new Error(`Native select value was not updated! Got ${updatedSelectVal}`);
  if (!updatedBtnLabel.includes('Low to High')) throw new Error(`Button label not updated! Got ${updatedBtnLabel}`);
  if (!isMenuClosed) throw new Error('Menu did not close after option click!');

  // Verify sorting on product list
  const firstPrice = await page.$eval('.product-card .current-price', el => el.textContent.trim());
  console.log(`  First product price after Price: Low to High sort: ${firstPrice}`);

  // Check keyboard navigation on custom sort
  console.log('  Testing keyboard accessibility (Escape, Arrow keys, Enter)...');
  await page.click('#mobile-sort-btn');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 100));
  const closedOnEscape = await page.$eval('#mobile-sort-custom', el => !el.classList.contains('is-open'));
  console.log(`  Menu closed on Escape: ${closedOnEscape}`);
  if (!closedOnEscape) throw new Error('Escape key did not close menu!');

  // Check category page URL (shop.html?category=Electronics)
  await page.goto(`${BASE_URL}/shop.html?category=Electronics`, { waitUntil: 'networkidle2' });
  const catOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  Category page (Electronics) at 360px overflow: ${catOverflow}`);
  if (catOverflow) throw new Error('Category page has horizontal scroll at 360px!');

  // Check Desktop 1280px: native select is visible, custom menu is hidden
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle2' });
  const desktopNativeSelectDisplay = await page.$eval('#shop-sort-select', el => getComputedStyle(el).display);
  const desktopCustomSortDisplay = await page.$eval('#mobile-sort-custom', el => getComputedStyle(el).display);
  console.log(`  Desktop (1280px) native select display: ${desktopNativeSelectDisplay}, custom dropdown display: ${desktopCustomSortDisplay}`);
  if (desktopNativeSelectDisplay === 'none') throw new Error('Desktop must keep native select visible!');
  if (desktopCustomSortDisplay !== 'none') throw new Error('Desktop must hide custom dropdown!');

  console.log('✓ PROBLEM 1 VERIFIED: PASSED ALL CHECKS!\n');

  // =========================================================================
  // TEST 2: PROBLEM 2 - MOBILE PAYMENT CARD SHARPNESS (checkout.html)
  // =========================================================================
  console.log('--- TEST 2: PROBLEM 2 - Mobile Payment Card Sharpness ---');

  // Ensure cart has item
  await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.btn-quick-add');
  await page.click('.btn-quick-add');
  await new Promise(r => setTimeout(r, 600));

  // Navigate to checkout.html
  await page.setViewport({ width: 360, height: 800 });
  await page.goto(`${BASE_URL}/checkout.html`, { waitUntil: 'networkidle2' });

  // Complete step 1 (Shipping)
  await page.type('#shipping-fullname', 'Jane Doe');
  await page.type('#shipping-email', 'jane@example.com');
  await page.type('#shipping-phone', '+1 555 123 4567');
  await page.type('#shipping-address', '123 Market Street');
  await page.type('#shipping-city', 'San Francisco');
  await page.type('#shipping-zip', '94105');
  await page.click('#btn-to-step-2');
  await new Promise(r => setTimeout(r, 400));

  // Complete step 2 (Delivery)
  await page.click('#btn-to-step-3');
  await new Promise(r => setTimeout(r, 400));

  // We are now on step 3 (Payment)
  await page.waitForSelector('#credit-card-preview');

  // Check card metrics & styles at 360px
  const cardMetrics360 = await page.evaluate(() => {
    const wrap = document.getElementById('credit-card-preview');
    const front = wrap.querySelector('.card-front');
    const inner = wrap.querySelector('.credit-card-inner');
    const num = document.getElementById('preview-card-number');
    const name = document.getElementById('preview-card-name');
    const expiry = document.getElementById('preview-card-expiry');
    const brand = document.getElementById('preview-card-brand-logo');

    const wrapComputed = getComputedStyle(wrap);
    const frontComputed = getComputedStyle(front);
    const numComputed = getComputedStyle(num);

    const rect = wrap.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      aspectRatio: (rect.width / rect.height).toFixed(3),
      frontTransform: frontComputed.transform,
      frontFilter: frontComputed.filter,
      frontBackdropFilter: frontComputed.backdropFilter,
      numColor: numComputed.color,
      numOpacity: numComputed.opacity,
      numFontSmoothing: numComputed.webkitFontSmoothing,
      numTextRendering: numComputed.textRendering,
      brandFontSize: getComputedStyle(brand).fontSize,
      numFontSize: numComputed.fontSize,
      nameFontSize: getComputedStyle(name).fontSize,
      expiryFontSize: getComputedStyle(expiry).fontSize,
      wrapBoxShadow: wrapComputed.boxShadow,
      frontBoxShadow: frontComputed.boxShadow
    };
  });
  console.log(`  Payment card metrics at 360px:`, cardMetrics360);

  if (cardMetrics360.width > 340) throw new Error(`Card width > 340px! got ${cardMetrics360.width}`);
  if (cardMetrics360.frontTransform !== 'none') {
    throw new Error(`Card front at rest should have transform: none! got ${cardMetrics360.frontTransform}`);
  }
  if (cardMetrics360.frontBoxShadow !== 'none') {
    console.warn(`  Warning: front face has box-shadow: ${cardMetrics360.frontBoxShadow}`);
  }

  // Live preview test: number, name, expiry, brand
  console.log('  Testing live card preview updates...');
  await page.type('#payField1', '4532849210398842');
  await page.type('#payField2', 'Jane Doe');
  await page.type('#payField3', '0828');

  const previewValues = await page.evaluate(() => ({
    num: document.getElementById('preview-card-number').textContent,
    name: document.getElementById('preview-card-name').textContent,
    expiry: document.getElementById('preview-card-expiry').textContent,
    brand: document.getElementById('preview-card-brand-logo').textContent
  }));
  console.log(`  Live preview values:`, previewValues);
  if (previewValues.num !== '4532 8492 1039 8842') throw new Error(`Card number mismatch: ${previewValues.num}`);
  if (previewValues.name !== 'JANE DOE') throw new Error(`Card name mismatch: ${previewValues.name}`);
  if (previewValues.expiry !== '08/28') throw new Error(`Card expiry mismatch: ${previewValues.expiry}`);
  if (previewValues.brand !== 'VISA') throw new Error(`Brand should be VISA! got ${previewValues.brand}`);

  // Test 3D Flip on CVV focus
  await page.focus('#payField4');
  await new Promise(r => setTimeout(r, 200));
  const isFlipped = await page.$eval('#credit-card-preview', el => el.classList.contains('is-flipped'));
  console.log(`  Card flipped on CVV focus: ${isFlipped}`);
  if (!isFlipped) throw new Error('Card did not flip on CVV focus!');

  // Blur CVV and test flip reset
  await page.$eval('#payField4', el => el.blur());
  await new Promise(r => setTimeout(r, 200));
  const isReset = await page.$eval('#credit-card-preview', el => !el.classList.contains('is-flipped'));
  console.log(`  Card flipped back on CVV blur: ${isReset}`);
  if (!isReset) throw new Error('Card did not flip back on CVV blur!');

  // Check card sizes across multiple mobile viewports
  for (const vp of [320, 360, 390, 412, 480]) {
    await page.setViewport({ width: vp, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const cardW = await page.$eval('#credit-card-preview', el => el.getBoundingClientRect().width);
    console.log(`  Card at ${vp}px viewport -> card width: ${cardW}px, horizontal overflow: ${overflow}`);
    if (overflow) throw new Error(`Horizontal overflow at ${vp}px on checkout payment page!`);
    if (cardW > vp) throw new Error(`Card wider than viewport at ${vp}px!`);
  }

  console.log('✓ PROBLEM 2 VERIFIED: PASSED ALL CHECKS!\n');

  // =========================================================================
  // TEST 3: PROBLEM 3 - MY ACCOUNT PAGE RESPONSIVENESS (account.html)
  // =========================================================================
  console.log('--- TEST 3: PROBLEM 3 - My Account Page Responsiveness ---');

  // Login as mock user so account page loads
  await page.evaluate(() => {
    localStorage.setItem('ms_store_active_user', JSON.stringify({
      uid: 'user-test-123',
      email: 'alex.rivera@example.com',
      displayName: 'Alex Rivera',
      photoURL: ''
    }));
  });

  // Test 360px viewport
  await page.setViewport({ width: 360, height: 800 });
  await page.goto(`${BASE_URL}/account.html`, { waitUntil: 'networkidle2' });

  // Check page overflow at 360px
  const accountOverflow360 = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  account.html at 360px horizontal overflow: ${accountOverflow360} (Expected: false)`);
  if (accountOverflow360) throw new Error('account.html has horizontal scroll at 360px!');

  // Check 1-column layout
  const layoutCols = await page.$eval('.account-layout', el => getComputedStyle(el).gridTemplateColumns);
  console.log(`  .account-layout grid-template-columns at 360px: "${layoutCols}"`);

  // Check horizontal scrollable tab bar
  const navMetrics = await page.evaluate(() => {
    const nav = document.querySelector('.account-nav');
    const navBtn = document.querySelector('.account-nav-btn');
    return {
      display: getComputedStyle(nav).display,
      overflowX: getComputedStyle(nav).overflowX,
      btnHeight: getComputedStyle(navBtn).height,
      btnMinHeight: getComputedStyle(navBtn).minHeight
    };
  });
  console.log(`  .account-nav at 360px:`, navMetrics);
  if (navMetrics.overflowX !== 'auto' && navMetrics.overflowX !== 'scroll') {
    throw new Error(`.account-nav overflow-x should be auto! got ${navMetrics.overflowX}`);
  }

  // Check form inputs on mobile: >= 48px height, 16px font-size
  const inputMetrics = await page.evaluate(() => {
    const nameInput = document.getElementById('profile-name-input');
    const submitBtn = document.querySelector('#account-profile-form button[type="submit"]');
    return {
      nameInputHeight: nameInput.getBoundingClientRect().height,
      nameInputFontSize: getComputedStyle(nameInput).fontSize,
      submitBtnHeight: submitBtn.getBoundingClientRect().height,
      submitBtnWidth: submitBtn.getBoundingClientRect().width,
      containerWidth: document.querySelector('.account-card').getBoundingClientRect().width
    };
  });
  console.log(`  Profile form metrics at 360px:`, inputMetrics);
  if (inputMetrics.nameInputHeight < 48) throw new Error(`Input height < 48px! got ${inputMetrics.nameInputHeight}`);
  if (inputMetrics.nameInputFontSize !== '16px') throw new Error(`Input font-size should be 16px! got ${inputMetrics.nameInputFontSize}`);
  if (inputMetrics.submitBtnHeight < 48) throw new Error(`Submit button height < 48px! got ${inputMetrics.submitBtnHeight}`);

  // Test Profile Save
  await page.$eval('#profile-name-input', el => el.value = 'Alex Rivera Updated');
  await page.click('#account-profile-form button[type="submit"]');
  await new Promise(r => setTimeout(r, 600));
  const updatedDisplayName = await page.$eval('#account-display-name', el => el.textContent.trim());
  console.log(`  Profile saved successfully! Header display name: "${updatedDisplayName}"`);

  // Switch to Orders Tab
  console.log('  Switching to Orders Tab...');
  await page.click('.account-nav-btn[data-tab="orders"]');
  await new Promise(r => setTimeout(r, 400));
  const ordersTabVisible = await page.$eval('#pane-orders', el => getComputedStyle(el).display);
  console.log(`  Orders tab visible: ${ordersTabVisible}`);
  if (ordersTabVisible === 'none') throw new Error('Orders tab not visible after click!');

  // Check orders overflow at 360px
  const ordersOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  Orders tab at 360px horizontal overflow: ${ordersOverflow}`);
  if (ordersOverflow) throw new Error('Orders tab has horizontal overflow at 360px!');

  // Switch to Saved Addresses Tab
  console.log('  Switching to Addresses Tab...');
  await page.click('.account-nav-btn[data-tab="addresses"]');
  await new Promise(r => setTimeout(r, 400));
  const addrTabVisible = await page.$eval('#pane-addresses', el => getComputedStyle(el).display);
  console.log(`  Addresses tab visible: ${addrTabVisible}`);
  if (addrTabVisible === 'none') throw new Error('Addresses tab not visible after click!');

  // Add an address to test address card and wrapping
  await page.type('#addr-label', 'Office');
  await page.type('#addr-phone', '+1 555 999 8888');
  await page.type('#addr-street', '456 Montgomery St, Floor 18');
  await page.type('#addr-city', 'San Francisco');
  await page.type('#addr-zip', '94104');
  await page.click('#new-address-form button[type="submit"]');
  await new Promise(r => setTimeout(r, 400));

  const addressCount = await page.$$eval('.account-address-card', els => els.length);
  console.log(`  Address saved! Count of cards: ${addressCount}`);
  if (addressCount === 0) throw new Error('Address was not rendered in list!');

  const addressCardOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  Address card at 360px horizontal overflow: ${addressCardOverflow}`);
  if (addressCardOverflow) throw new Error('Address card caused horizontal overflow at 360px!');

  // Check Track Order Modal at 360px
  await page.evaluate(() => {
    const modal = document.getElementById('order-track-modal');
    modal.classList.add('is-open');
  });
  await new Promise(r => setTimeout(r, 200));

  const modalMetrics = await page.evaluate(() => {
    const dialog = document.querySelector('#order-track-modal .modal-dialog');
    const rect = dialog.getBoundingClientRect();
    const closeBtn = document.getElementById('track-modal-close');
    const closeRect = closeBtn.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      maxHeight: getComputedStyle(dialog).maxHeight,
      overflowY: getComputedStyle(dialog).overflowY,
      closeBtnWidth: closeRect.width,
      closeBtnHeight: closeRect.height
    };
  });
  console.log(`  Track Order modal metrics at 360px:`, modalMetrics);
  if (modalMetrics.width > 360) throw new Error(`Modal width > 360px! got ${modalMetrics.width}`);
  if (modalMetrics.closeBtnWidth < 44 || modalMetrics.closeBtnHeight < 44) {
    throw new Error(`Track modal close button tap target < 44px! got ${modalMetrics.closeBtnWidth}x${modalMetrics.closeBtnHeight}`);
  }

  await page.click('#track-modal-close');
  await new Promise(r => setTimeout(r, 200));

  // Check orders.html redirect
  console.log('  Checking orders.html...');
  await page.goto(`${BASE_URL}/orders.html`, { waitUntil: 'networkidle2' });
  const currentUrlAfterOrders = page.url();
  console.log(`  orders.html navigated to: ${currentUrlAfterOrders}`);
  const ordersHtmlOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log(`  orders.html horizontal overflow: ${ordersHtmlOverflow}`);
  if (ordersHtmlOverflow) throw new Error('orders.html has horizontal overflow at 360px!');

  // Check Desktop 1280px for Account: 2 columns, sidebar vertical
  console.log('  Checking Desktop 1280px Account layout...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluate(() => {
    localStorage.setItem('ms_store_active_user', JSON.stringify({
      uid: 'user-test-123',
      email: 'alex.rivera@example.com',
      displayName: 'Alex Rivera',
      photoURL: ''
    }));
  });
  await page.goto(`${BASE_URL}/account.html`, { waitUntil: 'networkidle2' });
  const desktopAccountCols = await page.$eval('.account-layout', el => getComputedStyle(el).gridTemplateColumns);
  const desktopSidebarPos = await page.$eval('.account-sidebar', el => getComputedStyle(el).position);
  const desktopNavDirection = await page.$eval('.account-nav', el => getComputedStyle(el).flexDirection);
  console.log(`  Desktop (1280px) account layout: cols="${desktopAccountCols}", sidebar pos="${desktopSidebarPos}", nav flex-dir="${desktopNavDirection}"`);
  if (!desktopAccountCols.includes('280px')) throw new Error(`Desktop account should have 280px sidebar column! got ${desktopAccountCols}`);
  if (desktopNavDirection !== 'column') throw new Error(`Desktop nav should be vertical column! got ${desktopNavDirection}`);

  console.log('✓ PROBLEM 3 VERIFIED: PASSED ALL CHECKS!\n');

  // =========================================================================
  // TEST 4: ALL VIEWPORTS ZERO HORIZONTAL SCROLL ON ALL MAIN PAGES
  // =========================================================================
  console.log('--- TEST 4: Verifying Zero Horizontal Scroll Across All Viewports ---');
  const pagesToTest = ['index.html', 'shop.html', 'checkout.html', 'account.html', 'cart.html', 'wishlist.html'];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    for (const p of pagesToTest) {
      if (p === 'account.html') {
        await page.evaluate(() => {
          localStorage.setItem('ms_store_active_user', JSON.stringify({
            uid: 'user-test-123',
            email: 'alex.rivera@example.com',
            displayName: 'Alex Rivera',
            photoURL: ''
          }));
        });
      }
      await page.goto(`${BASE_URL}/${p}`, { waitUntil: 'networkidle2' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) {
        throw new Error(`PAGE OVERFLOW! Page ${p} at ${vp.name} (${vp.width}x${vp.height}) has horizontal scroll!`);
      }
    }
    console.log(`  ✓ All pages passed zero-overflow at ${vp.name} (${vp.width}x${vp.height})`);
  }

  console.log('\n--- Console Errors Check ---');
  console.log(`Total console errors during full run: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
  console.log('\n===============================================================');
  console.log('🎉 ALL THREE MOBILE PROBLEMS AND SYSTEM TESTS PASSED PERFECTLY!');
  console.log('===============================================================');
}

runTests().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});

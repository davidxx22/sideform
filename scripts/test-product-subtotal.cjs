const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('../tooling/node_modules/playwright');
(async () => {
  const server = http.createServer(require('../api/storefront'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1100 });
      await page.goto(`http://127.0.0.1:${server.address().port}/products/shell-utility-jacket?variant=800`);
      const info = page.locator('.sf-product-page');
      const subtotal = info.locator('sf-product-subtotal');
      const quantity = info.locator('input[name="quantity"]');
      const unitPrice = await info.locator('[id^="price-"]').first().innerText();
      assert(!await subtotal.isVisible());
      await info.locator('quantity-input button[name="plus"]').click();
      await page.waitForFunction(() => document.querySelector('sf-product-subtotal').textContent.includes('$256.00 USD'));
      assert.equal((await subtotal.innerText()).trim(), 'Subtotal (2 items): $256.00 USD');
      const sub = await subtotal.boundingBox(), stock = await info.locator('.sf-stock-status').boundingBox();
      const button = await info.locator('product-form [name="add"]').boundingBox();
      assert(sub.y >= button.y + button.height && stock.y >= sub.y + sub.height);
      assert.equal(await info.locator('[id^="price-"]').first().innerText(), unitPrice);
      await quantity.fill('3'); await quantity.dispatchEvent('input');
      assert((await subtotal.innerText()).includes('$384.00 USD'));
      const white = info.locator('variant-selects input[value="White"]');
      await info.locator(`label[for="${await white.getAttribute('id')}"]`).click();
      await page.waitForFunction(() => document.querySelector('sf-photo-gallery img').src.includes('-white-front'));
      await page.waitForLoadState('networkidle');
      const refreshedQuantity = Number(await quantity.inputValue());
      if (refreshedQuantity <= 1) assert(!await subtotal.isVisible());
      else assert((await subtotal.innerText()).includes(`$${(128 * refreshedQuantity).toFixed(2)} USD`));
      await quantity.fill('2'); await quantity.dispatchEvent('input');
      assert((await subtotal.innerText()).includes('$256.00 USD'));
      if (width === 390) await info.locator('.product__info-container').screenshot({ path: 'artifacts/product-subtotal-390.png' });
      await quantity.fill('1'); await quantity.dispatchEvent('input');
      assert(!await subtotal.isVisible());
      await quantity.fill(''); await quantity.dispatchEvent('input');
      assert(!await subtotal.isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      console.log('PASS subtotal calculation, placement, variant change and reset', width);
    }
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });

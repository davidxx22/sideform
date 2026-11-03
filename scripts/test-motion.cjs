const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const { chromium, webkit } = require('../tooling/node_modules/playwright');
(async () => {
 const server = http.createServer(require('../api/storefront'));
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const origin = 'http://127.0.0.1:' + server.address().port;
 const report = [];
 try {
  for (const engine of ['chromium', 'webkit']) {
   const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }));
   try {
    for (const width of [390, 1440]) {
     const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'no-preference' });
     const errors = [];
     page.on('pageerror', e => errors.push(e.message));
     await page.addInitScript(() => {
      window.sfMotionCalls = [];
      const native = Element.prototype.animate;
      Element.prototype.animate = function(frames, options) {
       if ([720, 1000].includes(options?.duration)) window.sfMotionCalls.push({ element: this, frames, options });
       return native.call(this, frames, options);
      };
     });
     await page.goto(origin);
     await page.waitForFunction(() => sfMotionCalls.some(c => c.element.matches('.sf-campaign__copy > *')));
     // Keyboard focus immediately cancels an entrance on its actionable element.
     await page.locator('.sf-campaign__copy .button').focus();
     assert.equal(await page.locator('.sf-campaign__copy .button').evaluate(e => e.getAnimations().filter(a => a.effect?.getTiming().duration === 720).length), 0);
     await page.locator('.sf-category-grid').scrollIntoViewIfNeeded();
     await page.waitForFunction(() => sfMotionCalls.some(c => c.element.closest('.sf-category-grid > li')));
     await page.locator('.sf-arrivals-section').scrollIntoViewIfNeeded();
     await page.waitForFunction(() => sfMotionCalls.some(c => c.element.closest('.sf-arrivals-section .product-grid > li')));
     await page.waitForTimeout(1100);
     const beforeReplay = await page.evaluate(() => sfMotionCalls.filter(c => c.element.closest('.sf-arrivals-section .product-grid > li')).length);
     await page.evaluate(() => scrollTo(0, 0));
     await page.waitForTimeout(150);
     await page.locator('.sf-arrivals-section .product-grid > li').first().scrollIntoViewIfNeeded();
     await page.waitForFunction(before => sfMotionCalls.filter(c => c.element.closest('.sf-arrivals-section .product-grid > li')).length > before, beforeReplay);
     await page.waitForTimeout(1100);
     const resting = await page.evaluate(() => sfMotionCalls.length);
     await page.waitForTimeout(200);
     assert.equal(await page.evaluate(() => sfMotionCalls.length), resting, 'No repeat or flicker while resting in view');
     assert(await page.evaluate(() => sfMotionCalls.filter(c => c.element.tagName === 'IMG').every(c => c.frames.every(f => 'scale' in f && !('opacity' in f) && !('translate' in f)))), 'Images only zoom; no fade or vertical flick');
     assert.equal(await page.locator('.sf-arrivals-section .product-grid > li').first().evaluate(e => getComputedStyle(e).opacity), '1');
     // Product cards inserted by section/AJAX updates are discovered automatically.
     await page.locator('.sf-arrivals-section .product-grid').evaluate(grid => {
      const clone = grid.firstElementChild.cloneNode(true);
      clone.dataset.motionTest = 'true';
      grid.append(clone);
     });
     await page.locator('[data-motion-test]').scrollIntoViewIfNeeded();
     await page.waitForFunction(() => sfMotionCalls.some(c => c.element.closest('[data-motion-test]')));
     await page.emulateMedia({ reducedMotion: 'reduce' });
     await page.waitForTimeout(100);
     assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.effect?.getTiming().duration >= 720).length), 0);
     await page.reload();
     await page.locator('.sf-arrivals-section').scrollIntoViewIfNeeded();
     await page.waitForTimeout(150);
     assert.equal(await page.evaluate(() => sfMotionCalls.length), 0, 'Reduced motion skips entrances');
     await page.emulateMedia({ reducedMotion: 'no-preference' });
     await page.waitForFunction(() => sfMotionCalls.length > 0);
     for (const route of ['/collections/all', '/products/grid-cargo-pant']) {
      await page.goto(origin + route);
      await page.waitForFunction(() => sfMotionCalls.length > 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
     }
     assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
     assert.deepEqual(errors, []);
     await page.close();
     const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width, height: 844 } });
     await noJS.goto(origin);
     assert.equal(await noJS.locator('.sf-campaign__copy h1').evaluate(e => getComputedStyle(e).opacity), '1');
     assert.equal(await noJS.locator('.sf-arrivals-section').evaluate(e => getComputedStyle(e).opacity), '1');
     await noJS.close();
     report.push({ engine, width, pageLoad: true, scrollReplay: true, stableInView: true, imageZoomOnly: true, dynamicCards: true, keyboard: true, reducedMotion: true, preferenceChange: true, noJSVisible: true });
     console.log('PASS motion', engine, width);
    }
   } finally { await browser.close(); }
  }
  fs.writeFileSync('artifacts/motion-validation.json', JSON.stringify(report, null, 2));
 } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });

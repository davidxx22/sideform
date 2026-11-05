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
       if (options?.duration === 720) window.sfMotionCalls.push({ element: this, frames, options });
       return native.call(this, frames, options);
      };
     });
     await page.goto(origin);
     await page.waitForFunction(() => sfMotionCalls.some(c => c.element.matches('.sf-campaign__copy > *')));
     // Keyboard focus immediately cancels an entrance on its actionable element.
     await page.locator('.sf-campaign__copy .button').focus();
     assert.equal(await page.locator('.sf-campaign__copy .button').evaluate(e => e.getAnimations().filter(a => a.effect?.getTiming().duration === 720).length), 0);
     const category = page.locator('.sf-category-grid > li:has(.sf-category-card--jackets)');
     await category.scrollIntoViewIfNeeded();
     await page.waitForFunction(() => document.querySelector('.sf-category-grid > li:has(.sf-category-card--jackets)')?.hasAttribute('data-sf-photo-visible'));
     const arrival = '.sf-arrivals-section .product-grid > li';
     await page.locator(arrival).first().scrollIntoViewIfNeeded();
     await page.waitForFunction(sel => document.querySelector(sel)?.hasAttribute('data-sf-photo-visible'), arrival);
     assert.equal(await page.locator(arrival).first().evaluate(e => getComputedStyle(e).transitionDuration), width <= 700 ? '0.36s' : '0.48s');
     assert.equal(await page.locator(arrival).first().locator('.product-card-wrapper').evaluate(e => getComputedStyle(e).transitionDuration), width <= 700 ? '0.38s' : '0.56s');
     assert.equal(await page.locator(arrival).first().locator('img').first().evaluate(e => getComputedStyle(e).scale), 'none');
     await page.evaluate(() => scrollTo(0, 0));
     await page.waitForFunction(sel => !document.querySelector(sel)?.hasAttribute('data-sf-photo-visible'), arrival);
     await page.locator(arrival).first().scrollIntoViewIfNeeded();
     await page.waitForFunction(sel => document.querySelector(sel)?.hasAttribute('data-sf-photo-visible'), arrival);
     await page.locator('.sf-arrivals-section .product-grid').evaluate(grid => {
      const clone = grid.firstElementChild.cloneNode(true);
      clone.removeAttribute('data-sf-photo-visible');
      clone.removeAttribute('data-sf-photo-reveal');
      clone.dataset.motionTest = 'true';
      grid.append(clone);
     });
     await page.locator('[data-motion-test]').scrollIntoViewIfNeeded();
     await page.waitForFunction(() => document.querySelector('[data-motion-test]')?.hasAttribute('data-sf-photo-visible'));
     await page.emulateMedia({ reducedMotion: 'reduce' });
     await page.waitForTimeout(100);
     assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.effect?.getTiming().duration >= 720).length), 0);
     assert.equal(await page.locator('[data-sf-photo-reveal]').count(), 0);
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
     report.push({ engine, width, pageLoad: true, scrollReplay: true, imageFadeAndCardRise: true, dynamicCards: true, keyboard: true, reducedMotion: true, preferenceChange: true, noJSVisible: true });
     console.log('PASS motion', engine, width);
    }
   } finally { await browser.close(); }
  }
  fs.writeFileSync('artifacts/motion-validation.json', JSON.stringify(report, null, 2));
 } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const http = require('node:http');
const { chromium, webkit } = require('../tooling/node_modules/playwright');
const handler = require('../api/storefront');

(async () => {
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const name of ['chromium', 'webkit']) {
      const browser = await (name === 'webkit' ? webkit.launch() : chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }));
      try {
        const page = await browser.newPage({ hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
        for (const width of [320, 390, 414, 768, 896, 989, 1024]) {
          await page.setViewportSize({ width, height: width === 896 ? 414 : 896 });
          await page.goto(origin + '/products/offset-heavy-tee?variant=100');
          const gallery = page.locator('sf-photo-gallery');
          await gallery.locator('img').first().evaluate(img => img.decode());
          const strip = await gallery.locator('.sf-photo-gallery__grid').boundingBox();
          const controls = gallery.locator('.sf-gallery-controls');
          if (width >= 990) { assert(!await controls.isVisible()); continue; }
          const frame = await controls.boundingBox();
          assert(Math.abs(frame.x - strip.x) < 1);
          assert(Math.abs(frame.y - strip.y) < 1);
          assert(Math.abs(frame.width - strip.width) < 1);
          assert(Math.abs(frame.height - strip.height) < 1);
          for (const step of ['-1', '1']) {
            const arrow = await gallery.locator(`[data-sf-gallery-step="${step}"]`).boundingBox();
            assert(Math.abs(arrow.y + arrow.height / 2 - frame.y - frame.height / 2) < 1);
            assert(Math.abs(step === '-1' ? arrow.x - frame.x : arrow.x + arrow.width - frame.x - frame.width) < 1);
          }
          const counter = await gallery.locator('.sf-gallery-counter').boundingBox();
          assert(Math.abs(counter.x + counter.width / 2 - frame.x - frame.width / 2) < 1);
          assert(Math.abs(frame.y + frame.height - counter.y - counter.height - 14) < 1);
          await gallery.locator('[data-sf-gallery-step="1"]').click();
          await page.waitForFunction(() => document.querySelector('[data-sf-gallery-counter]').textContent === '2/4');
          console.log(`PASS ${name} carousel geometry and navigation ${width}`);
          if (width === 414) await gallery.screenshot({ path: `artifacts/iphone11-carousel-${name}.png` });
        }
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });

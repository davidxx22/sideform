const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { chromium, webkit } = require('../tooling/node_modules/playwright');
const catalog = require('../catalog/catalog.json');
(async () => {
 const server = http.createServer(require('../api/storefront'));
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const origin = `http://127.0.0.1:${server.address().port}`;
 const report = [];
 try {
  for (const engine of (process.env.SF_TEST_ENGINE ? [process.env.SF_TEST_ENGINE] : ['chromium', 'webkit'])) {
   const browser = await (engine === 'webkit' ? webkit.launch() : chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}));
   try {
    const page = await browser.newPage({viewport:{width:engine === 'webkit'?414:1440,height:1000},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror', e=>{errors.push(e.message);console.error(e.stack)});
    for (const product of catalog) {
     await page.goto(origin+'/products/'+product.handle);
     for (const color of ['White','Grey','Black']) {
      const input = page.locator(`variant-selects:visible input[value="${color}"]`);
      await page.locator(`variant-selects:visible label[for="${await input.getAttribute('id')}"]`).click();
      await page.waitForFunction(color=>{const g=document.querySelector('sf-photo-gallery');return g.dataset.color===color&&!g.hasAttribute('aria-busy')},color.toLowerCase());
      const photos = await page.locator('.sf-photo-gallery__grid img').evaluateAll(async images => {
       await Promise.all(images.map(img=>{img.loading='eager';return Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode timed out')),15000))])}));
       return images.map(img=>({src:img.currentSrc,valid:img.complete&&img.naturalWidth>0}));
      });
      assert.equal(photos.length,4);
      assert(photos.every(p=>p.valid&&p.src.includes(`-${color.toLowerCase()}-`)&&p.src.includes('.webp')));
     }
     console.log('PASS WebP colors',engine,product.handle);
    }
    // A slow old request must not replace the newest selected color.
    await page.goto(origin+'/products/grid-cargo-pant');
    await page.route('**/assets/*-white-*.webp',async route=>{await new Promise(r=>setTimeout(r,500));await route.continue()});
    const before=await page.locator('.sf-photo-gallery__grid img').evaluateAll(els=>els.map(e=>e.src));
    await page.locator('sf-photo-gallery').evaluate(g=>g.selectColor('White'));
    assert.deepEqual(await page.locator('.sf-photo-gallery__grid img').evaluateAll(els=>els.map(e=>e.src)),before);
    await page.locator('sf-photo-gallery').evaluate(g=>g.selectColor('Grey'));
    await page.waitForFunction(()=>document.querySelector('sf-photo-gallery').dataset.color==='grey'&&!document.querySelector('sf-photo-gallery').hasAttribute('aria-busy'));
    await page.waitForTimeout(650);
    assert((await page.locator('.sf-photo-gallery__grid img').first().getAttribute('src')).includes('-grey-front.webp'));
    await page.unroute('**/assets/*-white-*.webp');
    // A failed replacement keeps the existing photographs intact.
    await page.route('**/assets/*-white-*.webp*',route=>route.abort());
    // Use an uncached URL so WebKit cannot satisfy the failure case from decoded memory.
    await page.locator('.sf-photo-gallery__grid img').evaluateAll(images=>images.forEach(img=>{
     img.src=img.src.replace(/\.webp/g,'.webp?failure-case=1');
     img.srcset=img.srcset.replace(/\.webp/g,'.webp?failure-case=1');
    }));
    const stable=await page.locator('.sf-photo-gallery__grid img').evaluateAll(els=>els.map(e=>e.src));
    await page.locator('sf-photo-gallery').evaluate(g=>g.selectColor('White'));
    await page.waitForFunction(()=>!document.querySelector('sf-photo-gallery').hasAttribute('aria-busy'));
    assert.deepEqual(await page.locator('.sf-photo-gallery__grid img').evaluateAll(els=>els.map(e=>e.src)),stable);
    await page.unroute('**/assets/*-white-*.webp*');
    for (const path of ['/','/collections/all','/search?q=hoodie']) {
     await page.goto(origin+path);
     const sources=await page.locator('#MainContent img').evaluateAll(imgs=>imgs.map(i=>i.src));
     assert(sources.length&&sources.every(src=>src.includes('.webp')));
    }
    const response = await page.request.get(origin+'/assets/sf-gallery-grid-cargo-pant-black-full.webp');
    assert.equal(response.headers()['content-type'],'image/webp; charset=utf-8');
    assert.deepEqual(errors,[]);
    report.push({engine,products:12,colors:3,photosPerColor:4,atomicSwap:true,staleRequestGuard:true,failedImageRetainsPrevious:true});
    console.log('PASS WebP galleries, cards, search, slow/failed swaps:',engine);
   } finally { await browser.close(); }
  }
  fs.writeFileSync('artifacts/webp-validation.json',JSON.stringify(report,null,2));
 } finally { await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1});

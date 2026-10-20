const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/products/offset-heavy-tee?no_size_guide=1');assert.equal(await page.locator('.sf-size-guide').count(),0);console.log('PASS missing sizing hides guide');
 await page.goto('http://127.0.0.1:4173/products/offset-heavy-tee?gallery=media&variant=103');await page.waitForLoadState('networkidle');
 await page.locator('media-gallery li[data-media-id].is-active .product__modal-opener--image').click();assert(await page.locator('product-modal').evaluate(e=>e.hasAttribute('open')));assert.match(await page.locator('product-modal .active').getAttribute('alt'),/White/);await page.keyboard.press('Escape');assert(!(await page.locator('product-modal').evaluate(e=>e.hasAttribute('open'))));console.log('PASS native Dawn lightbox opens selected color and closes with Escape');
 await page.goto('http://127.0.0.1:4173/products/plane-box-tee?variant=200');await page.route('**/cart/add',route=>route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({status:422,description:'Sample variant is no longer available. Choose another size.'})}));await page.locator('product-form [name="add"]').click();await page.waitForTimeout(500);assert.match(await page.locator('.product-form__error-message').innerText(),/no longer available/);console.log('PASS Shopify-style stock error is surfaced to customer');
 await page.unroute('**/cart/add');await page.reload();await page.route('**/cart/add',route=>route.abort('failed'));await page.locator('product-form [name="add"]').click();await page.waitForTimeout(500);assert.match(await page.locator('.product-form__error-message').innerText(),/Check your connection/);console.log('PASS network failure shows retry guidance');
 assert.equal(errors.length,0,errors.join('\n'));await browser.close();
 fs.writeFileSync('artifacts/edge-validation.json',JSON.stringify({environment:'Local fixtures, emulated Shopify endpoints',passed:['Missing sizing hides guide','Native Dawn lightbox: selected color, Escape','422 stock error feedback','Network failure retry guidance'],uncaughtErrors:errors},null,2));
})().catch(e=>{console.error(e);process.exit(1)});

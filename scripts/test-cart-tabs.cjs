const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const first=await context.newPage(),second=await context.newPage(),errors=[];
  for(const page of [first,second])page.on('pageerror',e=>errors.push(e.message));
  async function visit(page,path){await page.goto('http://localhost:4173'+path);await page.waitForLoadState('networkidle')}
  const badge=page=>page.locator('#cart-icon-bubble .cart-count-bubble span[aria-hidden="true"]');
  await visit(first,'/products/offset-heavy-tee?variant=100');await visit(second,'/collections/all');
  assert.equal(await second.locator('[data-sf-collection-filter]').count(),0);
  await first.locator('button[name="add"]').click();await first.waitForFunction(()=>document.querySelector('#cart-icon-bubble .cart-count-bubble')?.textContent.includes('1'));
  await second.waitForFunction(()=>document.querySelector('#cart-icon-bubble .cart-count-bubble')?.textContent.includes('1'));
  assert.equal((await badge(second).innerText()).trim(),'1');
  assert(!await second.locator('cart-drawer').evaluate(e=>e.classList.contains('active')),'Sync does not open drawer');
  const third=await context.newPage();await visit(third,'/products/volume-pullover');assert.equal((await badge(third).innerText()).trim(),'1');
  assert.equal(await third.locator('#CartDrawer .cart-item').count(),1);
  await third.reload();assert.equal((await badge(third).innerText()).trim(),'1');
  await third.locator('#cart-icon-bubble').click();await third.locator('#CartDrawer cart-remove-button button').click();
  await first.waitForFunction(()=>!document.querySelector('#cart-icon-bubble .cart-count-bubble'));
  await second.waitForFunction(()=>!document.querySelector('#cart-icon-bubble .cart-count-bubble'));
  assert.equal(await second.locator('#CartDrawer .cart-item').count(),0);
  await first.locator('cart-drawer .drawer__close').first().click();
  const swatches=await first.locator('.sf-color-options label').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,width:r.width,height:r.height,inner:e.querySelector('.sf-swatch').getBoundingClientRect().width}}));
  assert.equal(swatches.length,3);assert.equal(swatches[0].width,36);assert.equal(swatches[0].inner,28);assert(swatches[1].x-swatches[0].x<50);
  await first.locator('.sf-color-options').screenshot({path:'artifacts/product-swatch-spacing.png'});
  const isolated=await browser.newContext(),other=await isolated.newPage();await visit(other,'/');assert.equal(await other.locator('#cart-icon-bubble .cart-count-bubble').count(),0);await isolated.close();
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/cart-tabs-validation.json',JSON.stringify({newTab:true,existingTabSync:true,removeSync:true,reload:true,isolatedBrowser:true,dropdownRemoved:true,swatches,errors},null,2));
  // Save cookies to verify that restarting the preview does not reset this browser's cart.
  await first.locator('button[name="add"]').click();await first.waitForFunction(()=>document.querySelector('#cart-icon-bubble .cart-count-bubble')?.textContent.includes('1'));
  if(process.argv.includes('--save-cookie'))fs.writeFileSync('artifacts/cart-cookie-test.json',JSON.stringify(await context.cookies()));
  console.log('PASS cart across new/existing tabs, removal, reload, browser isolation, dropdown removed and compact swatches');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});


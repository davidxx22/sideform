const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');
const {chromium,webkit}=require('../tooling/node_modules/playwright');
(async()=>{
const server=http.createServer(require('../api/storefront'));
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port,results=[];
try{
for(const engine of ['chromium','webkit']){
 const browser=await(engine==='webkit'?webkit.launch():chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}));
 try{
 for(const surface of ['drawer','page'])for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],mutations=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('/cart/'))mutations.push(r.url())});
  for(const [id,quantity] of [[100,2],[103,1],[500,1]]){
   const response=await context.request.post(origin+'/cart/add.js',{data:{id,quantity}});
   assert(response.ok());
  }
  await page.goto(origin+(surface==='page'?'/cart':'/'));
  if(surface==='drawer'){
   assert.deepEqual(await page.locator('.sf-category-card__name').allTextContents(),['Hoodies','T-shirts','Jackets','Pants','Shorts']);
   await page.locator('#cart-icon-bubble').click();
  }
  const root=page.locator(surface==='drawer'?'cart-drawer-items':'cart-items'),all=root.locator('[data-sf-cart-select-all]'),items=root.locator('[data-sf-cart-select]'),remove=root.locator('[data-sf-cart-remove-selected]');
  assert.equal(await items.count(),3);
  assert(await remove.isDisabled());
  await all.check();
  assert.equal(await items.evaluateAll(a=>a.filter(i=>i.checked).length),3);
  await items.first().uncheck();assert(await all.evaluate(i=>i.indeterminate));assert(!await all.isChecked());
  await all.check();assert.equal(await items.evaluateAll(a=>a.filter(i=>i.checked).length),3);
  await all.uncheck();assert(await remove.isDisabled());
  await root.locator('[data-sf-cart-select][value="preview-103"]').check();
  await root.locator('[data-sf-cart-select][value="preview-500"]').check();
  await page.waitForTimeout(450);
  assert.equal(mutations.length,0,'Checkboxes must not send quantity requests');
  assert.match(await remove.innerText(),/2/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(engine==='chromium')await(surface==='drawer'?page.locator('#CartDrawer .drawer__inner'):root).screenshot({path:'artifacts/cart-selection-'+surface+'-'+width+'.png',style:'sticky-header,.section-header{visibility:hidden!important}'});
  await page.route('**/cart/update',route=>route.fulfill({status:500,contentType:'application/json',body:'{"errors":"Temporary failure"}'}));
  await remove.click();await root.locator('.sf-cart-selection-error').waitFor();
  assert.equal(await items.count(),3);assert.equal(await items.evaluateAll(a=>a.filter(i=>i.checked).length),2);assert(await remove.isEnabled());
  await page.unroute('**/cart/update');
  const request=page.waitForRequest(r=>r.url().endsWith('/cart/update')&&r.method()==='POST');
  await remove.click();const body=(await request).postDataJSON();
  assert.deepEqual(body.updates,{'preview-103':0,'preview-500':0});
  await page.waitForFunction(tag=>document.querySelector(tag)?.querySelectorAll('[data-sf-cart-select]').length===1,surface==='drawer'?'cart-drawer-items':'cart-items');
  assert.equal(await items.first().inputValue(),'preview-100');
  let state=await(await context.request.get(origin+'/cart.js')).json();
  assert.equal(state.item_count,2);assert.equal(state.total_price,8400);assert.equal(state.items[0].variant_id,100);
  assert.match(await page.locator(surface==='drawer'?'.cart-drawer__footer .totals__total-value':'#main-cart-footer .totals__total-value').innerText(),/84\.00/);
  assert.equal(await items.evaluateAll(a=>a.filter(i=>i.checked).length),0);
  // Quantity updates still work and retain selection by line key after sections re-render.
  await items.first().check();
  const quantity=root.locator('input[name="updates[]"]').first();
  await quantity.fill('3');await quantity.dispatchEvent('change');
  await page.waitForFunction(tag=>document.querySelector(tag)?.querySelector('input[name="updates[]"]')?.getAttribute('value')==='3',surface==='drawer'?'cart-drawer-items':'cart-items');
  assert(await items.first().isChecked());assert(await all.isChecked());
  assert.equal((await page.locator('#cart-icon-bubble .cart-count-bubble span[aria-hidden="true"]').innerText()).trim(),'3');
  await remove.click();
  await page.waitForFunction(tag=>document.querySelector(tag)?.classList.contains('is-empty'),surface==='drawer'?'cart-drawer-items':'cart-items');
  assert.equal(await items.count(),0);assert.equal(await root.locator('sf-cart-selection').count(),0);
  state=await(await context.request.get(origin+'/cart.js')).json();assert.equal(state.item_count,0);
  assert.equal(await page.locator('#cart-icon-bubble .cart-count-bubble').count(),0);
  assert.deepEqual(errors,[]);
  results.push({engine,surface,width,partialSelection:true,selectAll:true,failureRetry:true,onlySelectedRemoved:true,quantityPreserved:true,emptyCart:true});
  console.log('PASS cart selection',engine,surface,width);await context.close();
 }
 }finally{await browser.close()}
}
fs.writeFileSync('artifacts/cart-selection-validation.json',JSON.stringify({categoryOrder:['Hoodies','T-shirts','Jackets','Pants','Shorts'],results},null,2));
}finally{await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});

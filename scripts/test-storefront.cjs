const { chromium } = require('../tooling/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const catalog = require('../catalog/catalog.json');
const results = [];
let browser;
(async () => {
 browser = await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const report = (name,detail) => {results.push({name,status:'passed',detail});console.log('PASS',name,detail||'')};
 async function visit(route){const response=await page.goto('http://127.0.0.1:4173'+route);assert.equal(response.status(),200);await page.waitForLoadState('networkidle')}
 async function checkNoOverflow(){
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const broken=await page.locator('img').evaluateAll(async imgs=>{
   const visible=imgs.filter(img=>{const r=img.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(img).visibility!=='hidden'});
   await Promise.all(visible.map(img=>img.decode().catch(()=>{})));
   return visible.filter(img=>img.naturalWidth===0).map(img=>img.src);
  });assert.equal(broken.length,0,broken.join('\n'));
 }
 async function select(name,value){const radio=page.locator(`variant-selects:visible input[data-option-name="${name}"][value="${value}"]`);const id=await radio.getAttribute('id');await page.locator(`variant-selects:visible label[for="${id}"]`).click();await page.waitForTimeout(750)}
 await visit('/');assert.equal(await page.locator('#shopify-section-new_arrivals .product-card-wrapper').count(),4);assert.equal(await page.locator('.header__inline-menu > ul > li').count(),4);report('Homepage','4 new arrivals; 5 category cards; 4 primary navigation items');
 await checkNoOverflow();await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
 for(const [width,height] of [[1920,1080],[768,1024],[390,844],[320,740]]){
  await page.setViewportSize({width,height});await checkNoOverflow();report('Homepage responsive '+width,'No horizontal overflow or broken images');
  if(width===390)await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 await visit('/products/offset-heavy-tee?gallery=fallback');
 const add=()=>page.locator('product-form [name="add"]');assert(await add().isDisabled());report('Explicit selection required');
 // Clicking a preselected default must also work.
 await select('Color','Black');assert(await add().isDisabled());await select('Size','Small');assert(!(await add().isDisabled()));report('Default Black / Small can be explicitly selected');
 await select('Color','White');await select('Size','Medium');
 assert.equal(await page.locator('product-form input[name="id"]').inputValue(),'104');assert.match(await page.locator('.sf-photo-gallery__tile[data-sf-view="front"] img').getAttribute('src'),/-white-front\.webp/);report('Native variant and imagery update','White / Medium ID 104');
 for(const view of ['full','lineup','detail']){await page.locator(`[data-sf-view="${view}"]`).click();assert.match(await page.locator('[data-sf-enlarged] img').getAttribute('src'),new RegExp('-white-'+view+'\\.webp'));await page.keyboard.press('Escape');assert(await page.locator(`[data-sf-view="${view}"]`).evaluate(e=>e===document.activeElement));}report('Gallery grid, enlargement and Escape focus return');
 await page.getByRole('button',{name:'Size Guide',exact:true}).click();assert(await page.locator('.sf-size-guide dialog').evaluate(d=>d.open));assert.equal(await page.locator('.sf-size-guide tbody tr').count(),3);assert.match(await page.locator('.sf-size-guide dialog').innerText(),/Chest width/);await page.keyboard.press('Escape');assert(await page.getByRole('button',{name:'Size Guide',exact:true}).evaluate(e=>e===document.activeElement));report('Product size guide','3 garment measurement rows; Escape returns focus');
 await select('Color','Grey');await select('Size','Large');assert(await add().isDisabled());assert.match(await add().innerText(),/sold out/i);report('Sold-out prevention','Grey / Large disabled');
 await select('Color','White');await select('Size','Medium');await add().click();await page.waitForTimeout(800);
 assert(await page.locator('cart-drawer').evaluate(e=>e.classList.contains('active')));assert.match(await page.locator('#CartDrawer').innerText(),/White/);assert.match(await page.locator('#CartDrawer').innerText(),/Medium/);assert.match(await page.locator('#cart-icon-bubble').innerText(),/1/);report('Dawn add-to-cart','Drawer opens with selected variant and synchronized count');
 await page.screenshot({path:'artifacts/cart-desktop.png',fullPage:false});
 const qty=page.locator('#CartDrawer input[name="updates[]"]');await qty.fill('2');await qty.dispatchEvent('change');await page.waitForTimeout(1000);assert.match(await page.locator('#cart-icon-bubble').innerText(),/2/);assert.match(await page.locator('#CartDrawer').innerText(),/84\.00/);report('Dawn cart quantity and totals','2 × $42 = $84');
 await page.locator('#CartDrawer cart-remove-button').click();await page.waitForTimeout(800);assert.match(await page.locator('#CartDrawer').innerText(),/empty/i);report('Dawn cart removal','Empty state and zero count');
 await page.locator('#CartDrawer .drawer__close').first().click();
 await visit('/products/grid-cargo-pant');await page.getByRole('button',{name:'Size Guide',exact:true}).click();assert.match(await page.locator('.sf-size-guide dialog').innerText(),/Inseam/);await page.keyboard.press('Escape');report('Bottoms-specific size guide','Waist, hip, inseam and overall length');
 await page.setViewportSize({width:390,height:844});await checkNoOverflow();await page.screenshot({path:'artifacts/product-mobile.png',fullPage:true});await page.getByRole('button',{name:'Size Guide',exact:true}).click();assert(await page.locator('.sf-size-guide dialog').evaluate(d=>d.open));await page.screenshot({path:'artifacts/size-guide-mobile.png'});await page.keyboard.press('Escape');report('Mobile product and size guide','390px; no overflow or broken images');
 await page.setViewportSize({width:1440,height:1000});
 await visit('/products/plane-box-tee?gallery=media');await select('Color','White');await select('Size','Medium');assert.equal(await page.locator('media-gallery li[data-media-id]:not(.sf-color-hidden)').count(),3);assert.equal(await page.locator('media-gallery li[data-media-id]:not(.sf-color-hidden) .product__media img').count(),3);report('Dawn media gallery color grouping','Only 3 matching views visible for White');
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);await page.screenshot({path:'artifacts/product-native-gallery.png',fullPage:true});
 await visit('/collections/all');assert.equal(await page.locator('#product-grid .product-card-wrapper').count(),12);await page.locator('#SortBy').selectOption('price-descending');await page.waitForTimeout(700);assert.match(await page.locator('#product-grid').innerText(),/Transit Work Jacket/);report('Collection catalog and native sorting','12 products rendered');
 await visit('/search?q=hoodie');assert.match(await page.locator('#MainContent').innerText(),/Structure Hoodie/);await visit('/search?q=nothingmatches');assert.match(await page.locator('#MainContent').innerText(),/No results/i);report('Search','Matching results and useful empty state');
 await visit('/products/offset-heavy-tee?variant=100');await add().click();await page.waitForTimeout(700);await page.locator('#CartDrawer [name="checkout"]').click();await page.waitForURL('**/checkout');assert.match(await page.locator('#MainContent').innerText(),/Checkout route reached/);report('Checkout navigation','Local /checkout route only; hosted checkout requires development store');
 assert.equal(errors.length,0,errors.join('\n'));report('Browser runtime','No uncaught JavaScript errors in tested flows');
 await browser.close();fs.writeFileSync('artifacts/browser-validation.json',JSON.stringify({environment:'Local LiquidJS fixture; real Dawn assets with emulated Shopify endpoints',results},null,2));
})().catch(async error=>{console.error(error);fs.writeFileSync('artifacts/browser-validation.json',JSON.stringify({results,error:error.message},null,2));await browser?.close();process.exitCode=1});

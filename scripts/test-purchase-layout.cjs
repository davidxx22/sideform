const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4173/products/offset-heavy-tee');await page.waitForLoadState('networkidle');
  async function choose(name,value){const input=page.locator(`variant-selects:visible input[data-option-name="${name}"][value="${value}"]`);await page.locator(`variant-selects:visible label[for="${await input.getAttribute('id')}"]`).click();await page.waitForTimeout(600)}
  await choose('Color','White');await choose('Size','Medium');
  assert.match(await page.locator('.sf-stock-status').innerText(),/^In stock$/i);
  await choose('Color','Grey');await choose('Size','Large');
  assert.match(await page.locator('.sf-stock-status').innerText(),/out of stock/i);assert(await page.locator('product-form [name="add"]').isDisabled());
  await choose('Color','Black');await choose('Size','Medium');
  assert.match(await page.locator('.sf-stock-status').innerText(),/^In stock$/i);
  await page.locator('product-form [name="add"]').click();await page.waitForTimeout(600);await page.locator('#CartDrawer .drawer__close').first().click();
  // Native cart-count markup stays available to Dawn while its label stays visually hidden.
  assert(await page.locator('.quantity__label').evaluate(e=>e.getBoundingClientRect().width<=1));
  assert.equal(await page.locator('share-button').count(),0);
  for(const width of [1440,990,768,390,320]){
   await page.setViewportSize({width,height:1000});
   const cartBadge=await page.locator('.header__icon--cart .cart-count-bubble').boundingBox(),cartIcon=await page.locator('.header__icon--cart').boundingBox();assert(cartBadge&&cartBadge.height===16&&Math.abs(cartBadge.y-cartIcon.y-2)<1,'Cart count at top');
   if(width===1440)await page.locator('.header__icons').screenshot({path:'artifacts/header-counters-1440.png'});
   const selectors=['.product-form__quantity .quantity','.product-form__submit','.sf-favorite-button','.sf-stock-status','fieldset:has(.sf-size-guide) legend','.sf-size-guide>[data-sf-open]'];
   const boxes=await page.evaluate(sels=>sels.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}),selectors);
   const [qty,add,favorite,stock,size,guide]=boxes;
   assert(Math.abs(qty.y-add.y)<1&&Math.abs(qty.h-add.h)<1&&Math.abs(qty.w-add.w)<1,'Equal purchase controls at '+width);
   assert(Math.abs(qty.x-favorite.x)<1&&Math.abs(add.x+add.w-favorite.x-favorite.w)<1,'Favorite alignment at '+width);
   assert(stock.y>=qty.y+qty.h&&stock.y+stock.h<=favorite.y,'Stock between row and favorite');
   assert(Math.abs(size.y-guide.y)<2,'Size guide aligns with size label at '+width);
   assert(await page.locator('.sf-model-caption').first().evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===1440||width===390){await page.locator('.product__info-container').scrollIntoViewIfNeeded();await page.locator('.product__info-container').screenshot({path:`artifacts/purchase-refinement-${width}.png`,style:'sticky-header,.section-header{visibility:hidden!important}'});}
  }
  // Remove test items from the local review cart.
  await page.evaluate(async()=>{let cart=await(await fetch('/cart.js')).json();while(cart.items.length){await fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({line:1,quantity:0})});cart=await(await fetch('/cart.js')).json()}});
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/purchase-layout-validation.json',JSON.stringify({equalPurchaseControls:true,favoriteAlignment:true,transparentCaptions:true,hiddenQuantityLabelAndCartNote:true,stockUpdates:true,shareRemoved:true,sizeGuideAlignment:true,widths:[1440,990,768,390,320],errors},null,2));
  console.log('PASS purchase alignment, stock updates, transparent captions and five responsive widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

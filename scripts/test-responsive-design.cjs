const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),catalog=require('../catalog/catalog.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[],errors=[];
 try{
  const sizes=[[320,740],[375,812],[390,844],[430,932],[768,1024],[820,1180],[1024,768],[1180,820],[844,390],[1440,1000]];
  for(const [width,height]of sizes){
   const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),p=await ctx.newPage();
   p.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
   async function visit(route){await p.goto('http://localhost:4173'+route);await p.waitForLoadState('networkidle');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`No page overflow: ${width} ${route}`)}
   await visit('/');
   const grid=p.locator('.sf-category-grid');
   if(width<990){assert(await grid.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await p.locator('.sf-category-card--shorts').click();await p.waitForURL('**/collections/shorts');}
   await visit('/collections/all');
   const categories=p.locator('.sf-shop-categories');
   if(width<750)await categories.evaluate(e=>e.scrollLeft=e.scrollWidth);
   await p.locator('[data-sf-shop-category]').filter({hasText:/^Outerwear$/}).click();await p.waitForFunction(()=>location.pathname==='/collections/outerwear'&&!document.querySelector('#MainContent').hasAttribute('aria-busy'));assert.equal(await p.locator('#product-grid .product-card-wrapper').count(),2);
   await visit('/products/offset-heavy-tee?variant=100');
   const layout=await p.evaluate(()=>{const a=document.querySelector('.product__media-wrapper').getBoundingClientRect(),b=document.querySelector('.product__info-wrapper').getBoundingClientRect(),qty=document.querySelector('.product-form__quantity .quantity').getBoundingClientRect(),buy=document.querySelector('button[name="add"]').getBoundingClientRect();return{media:{x:a.x,y:a.y,right:a.right,bottom:a.bottom},info:{x:b.x,y:b.y},qty:{x:qty.x,y:qty.y,w:qty.width,h:qty.height},buy:{x:buy.x,y:buy.y,w:buy.width,h:buy.height}}});
   if(width>=750)assert(layout.info.x>=layout.media.right-1&&Math.abs(layout.info.y-layout.media.y)<2,`Tablet side-by-side ${width}`);
   else assert(layout.info.y>=layout.media.bottom,`Phone stacked ${width}`);
   assert(Math.abs(layout.qty.y-layout.buy.y)<1&&Math.abs(layout.qty.w-layout.buy.w)<1&&layout.buy.h>=52);
   await p.locator('.sf-size-guide>[data-sf-open]').click();const dialog=p.locator('.sf-size-guide dialog');assert(await dialog.evaluate(e=>e.open));
   const bounds=await dialog.boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.height<=height);
   await dialog.locator('[data-sf-close]').click();assert(!await dialog.evaluate(e=>e.open));
   await p.locator('[data-sf-enlarge]').first().click();await p.locator('.sf-image-dialog [data-sf-close]').click();
   await p.locator('.sf-product-page [data-sf-favorite]').click();await p.locator('[data-sf-favorites-open]').click();
   const favorites=p.locator('[data-sf-favorites-dialog]');assert(await favorites.evaluate(e=>e.open));
   assert(await favorites.evaluate(e=>e.scrollWidth<=e.clientWidth+1));await favorites.locator('[data-sf-favorites-close]').click();
   await p.locator('button[name="add"]').click();await p.waitForFunction(()=>document.querySelector('cart-drawer.active')&&document.querySelector('#CartDrawer .cart-item'));
   const cart=await p.locator('#CartDrawer .drawer__inner').boundingBox();assert(cart.x>=-1&&cart.x+cart.width<=width+1&&cart.height<=height+1);
   await p.locator('#CartDrawer .drawer__close').first().click();
   await p.evaluate(()=>scrollTo(0,0));await p.locator('.header__icon--search').click();const search=p.locator('.header__search input[name="q"]');await search.fill('hoodie');await p.waitForSelector('#predictive-search-results');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.search-modal__close-button').click();
   if(width<990){await p.locator('#Details-menu-drawer-container>summary').click();assert(await p.locator('#Details-menu-drawer-container').evaluate(e=>e.open));await p.keyboard.press('Escape');}
   for(const route of ['/pages/about','/pages/contact','/search?q=hoodie','/cart'])await visit(route);
   await visit('/pages/contact');for(const input of await p.locator('.contact .field__input').all())assert(Number.parseFloat(await input.evaluate(e=>getComputedStyle(e).fontSize))>=16);
   results.push({width,height,layout,categoryNavigation:true,dialogs:true,cart:true,search:true,contact:true});
   console.log(`PASS responsive ${width}x${height}`);await ctx.close();
  }
  // Every product must fit the narrow phone and iPad portrait purchase column.
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,768])for(const product of catalog){await p.setViewportSize({width,height:1024});await p.goto('http://localhost:4173/products/'+product.handle+'?variant='+((catalog.indexOf(product)+1)*100));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('.sf-photo-gallery__tile').count(),4);}
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/responsive-design-validation.json',JSON.stringify({results,allProductsCheckedAt:[320,768],errors,method:'Chrome viewport and touch emulation; physical iPad/iPhone Safari not tested'},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

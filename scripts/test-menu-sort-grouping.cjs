const {chromium}=require('../tooling/node_modules/playwright');const assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
 try{for(const width of [320,390,430,768,820,989,1024]){
  const p=await b.newPage({viewport:{width,height:1024},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:4173');
  if(width<990){
   const boxes=await p.evaluate(()=>{const b=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,right:r.right}};return{j:b('.sf-category-card--jackets'),h:b('.sf-category-card--hoodies'),t:b('.sf-category-card--t-shirts'),overflow:document.documentElement.scrollWidth>innerWidth+1}});
   assert(boxes.j.y<boxes.h.y);assert(Math.abs(boxes.h.y-boxes.t.y)<1);assert(Math.abs(boxes.j.w-(boxes.t.right-boxes.h.x))<1);assert(!boxes.overflow);
   if(width===768){await p.locator('.sf-category-grid img').evaluateAll(es=>Promise.all(es.map(i=>{i.loading='eager';return i.decode()})));await p.locator('.sf-category-section').screenshot({path:'artifacts/ipad-mini-category-grid.png'});}
  }
  if(width<750){
   await p.locator('header-drawer>details>summary').click();await p.waitForSelector('header-drawer>details.menu-opening');const menu=p.locator('header-drawer .menu-drawer');assert(Math.abs((await menu.boundingBox()).width-width*.7)<2);
   const links=p.locator('header-drawer .menu-drawer__menu>li');await links.filter({hasText:/Shop/}).locator('summary').first().click();await p.waitForTimeout(150);assert(await menu.locator('.menu-drawer__submenu[tabindex]').first().isVisible());await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('header-drawer .menu-drawer__menu>li>details[open]'));await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('header-drawer>details').open);
   await p.locator('header-drawer>details>summary').click();await p.waitForSelector('header-drawer>details.menu-opening');await p.mouse.click(width-8,400);await p.waitForFunction(()=>!document.querySelector('header-drawer>details').open);
   await p.goto('http://localhost:4173/collections/all');await p.locator('[data-sf-mobile-sort]').click();const options=p.locator('.sf-sort-options');assert.equal(await options.locator('button').first().evaluate(e=>getComputedStyle(e).fontSize),'12px');assert((await options.boundingBox()).width<=200);
   if(width===390)await p.screenshot({path:'artifacts/compact-sort-options.png'});
   await p.keyboard.press('Escape');assert(!await options.isVisible());await p.locator('[data-sf-mobile-sort]').click();await p.locator('[data-sf-sort-value=price-descending]').click();await p.waitForFunction(()=>location.search.includes('price-descending')&&!document.querySelector('#MainContent').hasAttribute('aria-busy'));assert.match(await p.locator('#product-grid .card__heading').first().innerText(),/Transit Work Jacket/);
  }
  await p.goto('http://localhost:4173/search');assert.equal(await p.locator('.sf-search-page-browse .sf-search-category-list a').filter({hasText:'Sweatshirts & long sleeves'}).count(),1);assert.equal(await p.locator('.sf-search-page-browse .sf-search-category-list a').filter({hasText:'T-shirts & long sleeves'}).count(),0);
  results.push({width,compactSort:width<750,menu70Percent:width<750,phoneStyleCategories:width<990});await p.close();console.log('PASS menu/sort/category '+width);
 }
 const p=await b.newPage();for(const [handle,names]of [['t-shirts',['Offset Heavy Tee','Plain Box Tee']],['sweatshirts',['Axis Long Sleeve','Frame Long Sleeve','Contour Crew']]]){await p.goto('http://localhost:4173/collections/'+handle);const titles=(await p.locator('#product-grid .card__heading a:visible').allTextContents()).map(s=>s.trim());assert.deepEqual(titles,names)}
 assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/menu-sort-grouping-validation.json',JSON.stringify({results,grouping:true,errors},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});

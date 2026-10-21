const {chromium}=require('../tooling/node_modules/playwright');const assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
 try{for(const [width,height]of [[320,740],[390,844],[430,932],[768,1024],[820,1180],[1024,768],[1440,1000],[1920,1080]]){
  const p=await b.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:4173');await p.locator('.header__icon--search').click();await p.waitForTimeout(200);
  const modal=p.locator('.header__search .search-modal'),browse=modal.locator('.sf-search-browse');
  const bounds=await modal.boundingBox();assert.equal(Math.round(bounds.width),width);assert.equal(Math.round(bounds.height),height);
  assert.equal(await browse.locator('.sf-search-featured>a').count(),3);assert.equal(await browse.locator('.sf-search-category-list>li').count(),6);
  assert(await modal.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  const input=modal.locator('input[name=q]');await input.fill('hoodie');await p.waitForSelector('.header__search predictive-search[results="true"]');assert(!await browse.isVisible());assert.match(await modal.locator('[data-predictive-search]').innerText(),/Structure Hoodie/);
  await input.fill('');assert(await browse.isVisible());
  await modal.locator('img').evaluateAll(es=>Promise.all(es.map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
  if([390,820,1440].includes(width))await p.screenshot({path:`artifacts/search-discovery-${width}.png`});
  await browse.locator('.sf-search-category-list a').first().click();await p.waitForURL('**/collections/jackets');assert.equal(await p.locator('#product-grid .product-card-wrapper').count(),2);
  if(width<750){
   assert(await p.locator('.sf-collection-back').isVisible());assert.equal((await p.locator('.mobile-facets__open-label:visible').innerText()).trim(),'Filter');
   await p.locator('[data-sf-mobile-sort]').click();await p.locator('[data-sf-sort-value=price-descending]').click();await p.waitForFunction(()=>location.search.includes('price-descending')&&!document.querySelector('#MainContent').hasAttribute('aria-busy'));
   assert.match(await p.locator('#product-grid .card__heading').first().innerText(),/Transit Work Jacket/);
   await p.locator('.mobile-facets__open-wrapper').click();await p.waitForSelector('.mobile-facets__disclosure[open]');await p.locator('.mobile-facets__close').click();
   await p.locator('.sf-collection-back').click();await p.waitForURL('**/collections/all');
   if(width===390)await p.screenshot({path:'artifacts/phone-collection-reference-390.png'});
  }
  await p.goto('http://localhost:4173/search');assert.equal(await p.locator('.sf-search-page-browse .sf-search-category-list>li').count(),6);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('#Search-In-Template').fill('cargo');await p.locator('.template-search__search .search__button').click();await p.waitForURL('**/search?**');assert.match(await p.locator('#MainContent').innerText(),/Grid Cargo Pant/);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({width,height,discovery:true,predictiveSearch:true,categoryLinks:true,searchPage:true,mobileSortFilter:width<750});await p.close();console.log('PASS search discovery '+width);
 }assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/search-discovery-validation.json',JSON.stringify({results,errors},null,2));}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});

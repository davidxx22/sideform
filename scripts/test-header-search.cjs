const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  async function visit(route){await page.goto('http://localhost:4173'+route);await page.waitForLoadState('networkidle')}
  await visit('/products/offset-heavy-tee');await page.locator('.sf-product-page [data-sf-favorite]').click();
  for(const width of [1920,1440,390,320]){
   await page.setViewportSize({width,height:1000});await visit('/products/offset-heavy-tee');
   const badge=await page.locator('[data-sf-favorites-count]').boundingBox();assert(badge&&badge.width===16&&badge.height===16,'Circular favorite count at '+width);
   const favoriteIcon=await page.locator('[data-sf-favorites-open]').boundingBox();assert(Math.abs(badge.y-favoriteIcon.y-2)<1,'Favorite count at top');
   const opener=page.locator('.header__search summary');await opener.click();
   const search=page.locator('.header__search input[name="q"]');assert(await search.isVisible());await search.focus();
   assert.equal(await search.getAttribute('placeholder'),'Search products');
   assert.equal(await page.locator('.header__search .field').evaluate(e=>getComputedStyle(e).borderRadius),'0px');
   const field=await page.locator('.header__search .field').boundingBox();assert.equal(field.height,52);assert(field.width<=1000,'Contained desktop search');if(width<750)assert(field.width>width*.65,'Responsive mobile search');
   if(width===1440)await page.locator('.search-modal__content').screenshot({path:'artifacts/search-bar-1440.png'});
   assert.equal(await page.locator('.header__search .spinner:visible').count(),0);
   await search.fill('hoodie');await page.waitForSelector('.header__search predictive-search[results="true"]');
   const suggestions=page.locator('.header__search [data-predictive-search]');assert(await suggestions.isVisible());assert.match(await suggestions.innerText(),/Structure Hoodie/);
   assert(await page.locator('.header__search svg:visible').evaluateAll(a=>a.every(e=>{const r=e.getBoundingClientRect();return r.width<=44&&r.height<=44})));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`artifacts/header-search-${width}.png`});
   await page.locator('.search-modal__close-button').click();assert(await opener.evaluate(e=>document.activeElement===e));
   await opener.click();await search.fill('zznomatchingitem');await page.waitForFunction(()=>document.querySelector('.header__search predictive-search[results="true"]')?.innerText.includes('zznomatchingitem'));
   await page.locator('.sf-search-back').click();assert(!(await page.locator('.header__search details').evaluate(d=>d.open)));
   await opener.click();await page.keyboard.press('Escape');assert(!(await page.locator('.header__search details').evaluate(d=>d.open)));
   results.push({width,badge:'16px circle',searchOpen:true,suggestions:true,emptyQueryResult:true,closeAndEscape:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const route of ['/','/collections/all']){
   await visit(route);await page.locator('.header__search summary').click();const input=page.locator('.header__search input[name="q"]');await input.fill('offset');
   await page.locator('.header__search .predictive-search__item[href="/products/offset-heavy-tee"]').first().click();await page.waitForURL('**/products/offset-heavy-tee');
  }
  await page.locator('.header__search summary').click();await page.locator('.header__search input[name="q"]').fill('cargo');
  await page.locator('.header__search .search__button').click();await page.waitForURL('**/search?**');assert.match(await page.locator('#MainContent').innerText(),/Grid Cargo Pant/);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/header-search-validation.json',JSON.stringify({results,resultNavigation:true,fullSearchSubmit:true,routes:['/','/collections/all','/products/offset-heavy-tee'],errors},null,2));
  console.log('PASS favorite badge, search opening/suggestions/empty results/closing, result links and full search across four widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

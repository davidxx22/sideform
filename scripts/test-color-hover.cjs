const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let previews=0;
  for(const route of ['/','/collections/all']){
   await page.goto('http://localhost:4173'+route);const url=page.url();
   const grid=page.locator(route==='/'?'.sf-arrivals-section .product-grid':'#product-grid');
   const count=await grid.locator('.product-card-wrapper').count();assert.equal(count,route==='/'?4:12);
   for(let index=0;index<count;index++){
    const card=grid.locator('.product-card-wrapper').nth(index);
    const original=await card.locator('img').first().getAttribute('src');
    const selected=await card.locator('[aria-pressed="true"]').getAttribute('data-sf-card-color');
    for(const color of ['White','Grey','Black']){
     const button=card.locator(`[data-sf-card-color="${color}"]`);await button.hover();
     await button.evaluate(button=>new Promise((resolve,reject)=>{const deadline=Date.now()+5000;const poll=()=>button.hasAttribute('data-sf-preview')&&!button.closest('.product-card-wrapper').hasAttribute('aria-busy')?resolve():Date.now()>deadline?reject(Error('Preview timeout')):setTimeout(poll,20);poll()}));
     const image=card.locator('img').first();assert.match(await image.getAttribute('src'),new RegExp(`-${color.toLowerCase()}-front\\.webp`));
     assert(await image.evaluate(img=>img.complete&&img.naturalWidth>0));
     assert.equal(await card.locator('[aria-pressed="true"]').getAttribute('data-sf-card-color'),selected);
     await card.locator('.card__heading a').last().hover();
     assert.equal(await image.getAttribute('src'),original);
     assert.equal(page.url(),url);previews++;
    }
   }
  }
  // Delegated events also work after the category grid is replaced.
  await page.getByRole('navigation',{name:'Shop categories'}).getByRole('link',{name:'Outerwear',exact:true}).click();
  await page.waitForURL('**/collections/outerwear');
  const card=page.locator('#product-grid .product-card-wrapper').first();
  await card.locator('[data-sf-card-color="Grey"]').hover();
  await page.waitForFunction(()=>document.querySelector('#product-grid [data-sf-card-color="Grey"]')?.hasAttribute('data-sf-preview'));
  await card.locator('[data-sf-card-color="Grey"]').click();
  await card.locator('.card__heading a').last().hover();
  await page.waitForFunction(()=>document.querySelector('#product-grid [data-sf-card-color="Grey"]')?.getAttribute('aria-pressed')==='true');
  await card.locator('[data-sf-card-color="White"]').focus();
  await page.waitForFunction(()=>document.querySelector('#product-grid [data-sf-card-color="White"]')?.hasAttribute('data-sf-preview'));
  await page.locator('.sf-shop-categories a').first().focus();
  assert.match(await card.locator('img').first().getAttribute('src'),/-grey-front\.webp/);
  assert.equal(await card.locator('[data-sf-card-color="Grey"]').getAttribute('aria-pressed'),'true');
  // A late response must not overwrite the committed color after hover ends.
  await page.route('**/sf-packshot-*-white-front*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,200));await route.continue()});
  await card.locator('[data-sf-card-color="White"]').hover();await card.locator('.card__heading a').last().hover();
  await page.waitForTimeout(300);
  assert.match(await card.locator('img').first().getAttribute('src'),/-grey-front\.webp/);
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto('http://localhost:4173/collections/all');
  await mobile.locator('#product-grid [data-sf-card-color="Grey"]').first().tap();
  await mobile.waitForFunction(()=>document.querySelector('#product-grid [data-sf-card-color="Grey"]')?.getAttribute('aria-pressed')==='true');
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/color-hover-validation.json',JSON.stringify({hoverPreviews:previews,restoresOriginal:true,clickPersists:true,lateResponseGuard:true,home:true,shop:true,noNavigation:true,replacedCategory:true,keyboardFocus:true,mobileTap:true,errors},null,2));
  console.log(`PASS ${previews} temporary hover previews; original/clicked color restoration; delayed image guard; keyboard and mobile tap`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

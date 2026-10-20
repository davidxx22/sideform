const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4173/collections/all');
  await page.evaluate(()=>window.shopCategoryMarker='same document');
  const nav=()=>page.getByRole('navigation',{name:'Shop categories'});
  async function select(name,handle,count){
   await nav().getByRole('link',{name,exact:true}).click();
   await page.waitForURL(url=>url.pathname==='/collections/'+handle);
   await page.waitForFunction(()=>!document.querySelector('#MainContent').hasAttribute('aria-busy'));
   assert.equal(await page.locator('#product-grid .product-card-wrapper').count(),count);
   assert.equal(await nav().getByRole('link',{name,exact:true}).getAttribute('aria-current'),'page');
   assert.equal(await page.evaluate(()=>window.shopCategoryMarker),'same document');
  }
  await select('New Arrivals','new-arrivals',8);
  await select('Tops','tops',7);
  await page.locator('#SortBy').selectOption('price-descending');
  await page.waitForFunction(()=>location.search.includes('sort_by=price-descending')&&document.querySelector('#ProductGridContainer .collection')?.classList.contains('loading')===false);
  const priceValues=()=>page.locator('#product-grid .card-information>.price .price__regular .price-item--regular').allTextContents().then(values=>values.map(value=>Number(value.replace(/[^\d.]/g,''))));
  let prices=await priceValues();assert.deepEqual(prices,[...prices].sort((a,b)=>b-a));
  await select('Bottoms','bottoms',3);assert.match(page.url(),/sort_by=price-descending/);
  prices=await priceValues();assert.deepEqual(prices,[...prices].sort((a,b)=>b-a));
  await select('Outerwear','outerwear',2);await select('All','all',12);
  await page.goBack();await page.waitForFunction(()=>location.pathname==='/collections/outerwear'&&document.querySelectorAll('#product-grid .product-card-wrapper').length===2);
  await page.goForward();await page.waitForFunction(()=>location.pathname==='/collections/all'&&document.querySelectorAll('#product-grid .product-card-wrapper').length===12);
  await page.locator('.sf-shop-categories').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/shop-categories-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  const tops=nav().getByRole('link',{name:'Tops',exact:true});await tops.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>location.pathname==='/collections/tops'&&document.querySelectorAll('#product-grid .product-card-wrapper').length===7);
  const swatch=page.locator('#product-grid [data-sf-card-color="White"]').first();await swatch.click();
  await page.waitForFunction(()=>document.querySelector('#product-grid [data-sf-card-color="White"]')?.getAttribute('aria-pressed')==='true');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.sf-shop-categories').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/shop-categories-mobile.png'});
  // Preserve the current grid and expose a useful message on a failed request.
  await page.route('**/collections/bottoms*',route=>route.abort());
  await nav().getByRole('link',{name:'Bottoms',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-sf-shop-status]')?.textContent.includes('Unable'));
  assert.equal(await page.locator('#product-grid .product-card-wrapper').count(),7);assert.match(page.url(),/collections\/tops/);
  await page.unroute('**/collections/bottoms*');await select('Bottoms','bottoms',3);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/shop-categories-validation.json',JSON.stringify({counts:{all:12,newArrivals:8,tops:7,bottoms:3,outerwear:2},inPlace:true,sortPreserved:true,backForward:true,mobileKeyboard:true,swatches:true,failedRequestRetry:true,errors},null,2));
  console.log('PASS Shop categories: in-place loading, counts, native sorting, history, mobile keyboard, color swatches and error/retry');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

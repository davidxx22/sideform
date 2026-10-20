const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const products=require('../catalog/catalog.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const results=[],errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  for(const product of products){
   const response=await page.goto('http://127.0.0.1:4173/products/'+product.handle);assert.equal(response.status(),200);await page.waitForLoadState('networkidle');
   assert.doesNotMatch(await page.locator('#MainContent').innerText(),/AI-generated sample photography/);
   for(const color of ['Black','White','Grey']){
    const id=await page.locator(`variant-selects:visible input[data-option-name="Color"][value="${color}"]`).getAttribute('id');await page.locator(`variant-selects:visible label[for="${id}"]`).click();await page.waitForTimeout(700);
    if(product.tags.includes('sf-four-photo-gallery')){const tiles=page.locator('.sf-photo-gallery__tile');assert.equal(await tiles.count(),4);for(const view of ['front','full','lineup','detail']){const tile=page.locator(`.sf-photo-gallery__tile[data-sf-view="${view}"] img`);assert.match(await tile.getAttribute('src'),new RegExp(`-${color.toLowerCase()}-${view}\\.jpg`));await tile.evaluate(img=>img.decode());}continue;}
    const visible=page.locator('media-gallery li[data-media-id]:not(.sf-color-hidden)');assert.equal(await visible.count(),3);
    const images=visible.locator('.product__media img');assert.equal(await images.count(),3);
    for(const view of ['front','back','detail']){
     const match=visible.locator(`.product__media img[src*="-${color.toLowerCase()}-${view}.jpg"]`);
     assert.equal(await match.count(),1);await match.evaluate(img=>img.decode());assert(await match.evaluate(img=>img.naturalWidth>1000));
    }
    assert.equal(await visible.locator('.sf-model-caption').count(),1);
   }
   results.push({handle:product.handle,colors:3,views:product.tags.includes('sf-four-photo-gallery')?12:9,status:'passed'});console.log('PASS photo matrix',product.handle);
  }
  await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/products/grid-cargo-pant?variant=1003');await page.waitForLoadState('networkidle');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'artifacts/photography-product-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/');await page.waitForLoadState('networkidle');await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
  assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync('artifacts/photo-browser-validation.json',JSON.stringify({environment:'Local preview with generated native-media fixtures; no Shopify import',products:results,total_color_view_checks:144,uncaughtErrors:errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

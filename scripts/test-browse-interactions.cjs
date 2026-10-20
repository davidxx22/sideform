const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),catalog=require('../catalog/catalog.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
  page.on('pageerror',error=>errors.push(error.message));
  const fallback=process.argv.includes('--fallback');
  await page.goto('http://127.0.0.1:4173/'+(fallback?'?gallery=fallback':''));
  const home=page.url(),grid=page.locator('#Slider-featured_collection');
  const initial=await grid.locator('[aria-pressed=true]').allTextContents();
  assert.equal(initial.length,12);
  const shades=await grid.locator('[aria-pressed=true]').evaluateAll(buttons=>buttons.map(button=>button.dataset.sfCardColor));
  assert.deepEqual([...new Set(shades)].sort(),['Black','Grey','White']);
  for(const [category,tag] of [['Tops','tops'],['Bottoms','bottoms'],['Outerwear','outerwear'],['All','all']]){
   await page.locator('.sf-collection-links').getByRole('link',{name:category,exact:true}).click();
   const expected=catalog.filter(product=>tag==='all'||product.tags.includes(tag)).slice(0,12);
   assert.equal(await grid.locator('.product-card-wrapper').count(),expected.length);
   assert.equal(page.url(),home);
   assert.deepEqual(await grid.locator('.card__heading[id^="title-"]').allTextContents().then(texts=>texts.map(text=>text.trim()).filter(Boolean)),expected.map(product=>product.title));
   for(const [index,product] of expected.entries()){
    const card=grid.locator('.product-card-wrapper').nth(index);
    for(const color of ['Black','White','Grey']){
     const swatch=card.locator(`[data-sf-card-color="${color}"]`);await swatch.click();
     await swatch.waitFor({state:'visible'});
     await page.waitForFunction(({handle,color})=>{const card=[...document.querySelectorAll('#Slider-featured_collection .product-card-wrapper')].find(card=>card.querySelector('.card__heading')?.textContent.trim()===handle);return card?.querySelector(`[data-sf-card-color="${color}"]`)?.getAttribute('aria-pressed')==='true';},{handle:product.title,color});
     const image=card.locator('.card__media .media > img,.sf-card-photo img').first();
     assert.match(await image.getAttribute('src'),/sf-packshot-/);
     assert.match(await image.getAttribute('src'),new RegExp(`${product.handle}-${color.toLowerCase()}-front\\.jpg`));
     assert.equal(page.url(),home);assert(await image.evaluate(img=>img.complete&&img.naturalWidth>0));
     const link=card.locator('.card__heading a').last();assert.match(await link.getAttribute('href'),/\?variant=\d+/);
     assert.match(await card.locator('.card-information > .price').innerText(),new RegExp(String(product.price)));
    }
   }
   results.push({category,products:expected.length,inPlace:true,colorPreviews:expected.length*3});
  }
  await page.setViewportSize({width:390,height:844});
  const bottoms=page.locator('.sf-collection-links').getByRole('link',{name:'Bottoms',exact:true});await bottoms.focus();await page.keyboard.press('Enter');
  assert.equal(await grid.locator('.product-card-wrapper').count(),3);assert.equal(page.url(),home);
  const white=grid.locator('.product-card-wrapper').first().locator('[data-sf-card-color="White"]');await white.focus();await page.keyboard.press('Space');
  await page.waitForFunction(()=>document.querySelector('#Slider-featured_collection [data-sf-card-color="White"]')?.getAttribute('aria-pressed')==='true');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'artifacts/in-place-browse-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});await page.goto(home);
  await page.locator('#shopify-section-featured_collection').screenshot({path:'artifacts/mixed-color-grid.png'});
  assert.equal(await grid.locator('img').count(),12);
  await grid.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
  // A failed photo request must preserve the previous preview and allow retry.
  await page.route('**/sf-packshot-offset-heavy-tee-white-front*.jpg',route=>route.abort());
  const card=grid.locator('.product-card-wrapper').first();await card.locator('[data-sf-card-color="White"]').click();
  await page.waitForFunction(()=>document.querySelector('#Slider-featured_collection [data-sf-color-status]')?.textContent.includes('Unable to load'));
  assert.equal(await card.locator('[data-sf-card-color="Black"]').getAttribute('aria-pressed'),'true');assert.equal(page.url(),home);
  await page.unroute('**/sf-packshot-offset-heavy-tee-white-front*.jpg');await card.locator('[data-sf-card-color="White"]').click();
  await page.waitForFunction(()=>document.querySelector('#Slider-featured_collection [data-sf-card-color="White"]')?.getAttribute('aria-pressed')==='true');
  assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync('artifacts/browse-interaction'+(fallback?'-fallback':'')+'-validation.json',JSON.stringify({environment:'Local Shopify-object emulator',fallback,initialColors:shades,categories:results,mobileKeyboard:true,failedPhotoRetry:true,uncaughtErrors:errors},null,2));
  console.log('PASS in-place category grids, 72 matching color previews, variant links/prices, mobile keyboard controls and photo failure/retry');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});

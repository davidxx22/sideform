const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const products=require('../catalog/catalog.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const product of products){
   assert(product.tags.includes('sf-four-photo-gallery'));
   await page.goto('http://localhost:4173/products/'+product.handle);await page.waitForLoadState('networkidle');
   const tiles=page.locator('.sf-photo-gallery__tile');
   assert.deepEqual(await tiles.evaluateAll(a=>a.map(e=>e.dataset.sfView)),['front','full','lineup','detail']);
   assert.equal(await page.locator('.sf-model-caption').count(),2);
   assert.match(await page.locator('.sf-model-caption').first().innerText(),/Model: \d+' \d+"/);
   assert.equal(await page.locator('.product__info-container>.product__description,share-button,.sf-description-accordion[open]').count(),0);
   const labels=await page.locator('input[data-option-name="Size"]+label').evaluateAll(a=>a.map(e=>Array.from(e.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()));
   assert.deepEqual(labels,['S','M','L']);
   for(const color of ['Black','White','Grey']){
    const input=page.locator(`variant-selects:visible input[data-option-name="Color"][value="${color}"]`);await page.locator(`variant-selects:visible label[for="${await input.getAttribute('id')}"]`).click();await page.waitForTimeout(450);
    for(const view of ['front','full','lineup','detail']){
     const tile=page.locator(`.sf-photo-gallery__tile[data-sf-view="${view}"]`),img=tile.locator('img');
     assert.match(await img.getAttribute('src'),new RegExp(`-${color.toLowerCase()}-${view}\\.jpg`));await img.evaluate(i=>i.decode());
     assert(await img.evaluate(i=>i.complete&&i.naturalWidth>0));
     await tile.click();const enlarged=page.locator('[data-sf-enlarged] img');assert.equal(await enlarged.getAttribute('src'),await img.getAttribute('src'));await enlarged.evaluate(i=>i.decode());assert.doesNotMatch(await enlarged.evaluate(i=>i.currentSrc),/-480\.jpg$/);await page.keyboard.press('Escape');
     await page.waitForFunction(()=>!document.body.classList.contains('overflow-hidden'));
     assert(await tile.evaluate(t=>document.activeElement===t));
    }
   }
   for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});
    const boxes=await tiles.evaluateAll(a=>a.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}));
    assert(Math.abs(boxes[0].y-boxes[1].y)<1&&Math.abs(boxes[0].x+boxes[0].w-boxes[1].x)<1&&Math.abs(boxes[0].y+boxes[0].h-boxes[2].y)<1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(width!==320){await page.evaluate(()=>document.activeElement?.blur());await page.locator('.sf-photo-gallery__grid').screenshot({path:`artifacts/gallery-review/${product.handle}-${width}.png`,style:'sticky-header,.section-header{visibility:hidden!important}'});}
   }
   results.push({handle:product.handle,colors:3,views:4,zoomChecks:12,widths:[1440,390,320],status:'passed'});console.log('PASS four-photo gallery',product.handle);
   await page.setViewportSize({width:1440,height:1000});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/catalog-gallery-validation.json',JSON.stringify({products:results,colorViewChecks:144,zoomChecks:144,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

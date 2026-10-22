const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4173/products/offset-heavy-tee');await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.product__info-container>.product__description').count(),0);
  assert.equal(await page.locator('.sf-description-accordion[open]').count(),0);
  await page.locator('.sf-description-accordion').first().locator('summary').click();
  assert(await page.locator('.sf-feature-grid').isVisible());
  await page.reload();await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.sf-description-accordion[open]').count(),0);
  const views=['front','full','lineup','detail'];
  assert.deepEqual(await page.locator('.sf-photo-gallery__tile').evaluateAll(a=>a.map(x=>x.dataset.sfView)),views);
  for(const color of ['Black','White','Grey']){
   const input=page.locator(`variant-selects:visible input[data-option-name="Color"][value="${color}"]`);
   await page.locator(`variant-selects:visible label[for="${await input.getAttribute('id')}"]`).click();await page.waitForTimeout(700);
   for(const view of views){
    const tile=page.locator(`.sf-photo-gallery__tile[data-sf-view="${view}"]`),img=tile.locator('img');
    assert.match(await img.getAttribute('src'),new RegExp(`-${color.toLowerCase()}-${view}\\.webp`));await img.evaluate(i=>i.decode());
    await tile.click();assert.equal(await page.locator('[data-sf-enlarged] img').getAttribute('src'),await img.getAttribute('src'));
    await page.keyboard.press('Escape');assert(await tile.evaluate(t=>document.activeElement===t));
   }
   assert.equal(await page.locator('.sf-photo-gallery__tile .sf-model-caption').count(),2);
  }
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
   const boxes=await page.locator('.sf-photo-gallery__tile').evaluateAll(a=>a.map(x=>{const b=x.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height}}));
   assert.equal(boxes[0].y,boxes[1].y);assert.equal(boxes[2].y,boxes[3].y);assert(boxes[2].y>boxes[0].y);
   assert(boxes.every(b=>Math.abs(b.w-boxes[0].w)<1&&Math.abs(b.h-boxes[0].h)<1));
   assert(Math.abs(boxes[1].x-boxes[0].x-boxes[0].w)<1&&Math.abs(boxes[2].y-boxes[0].y-boxes[0].h)<1,'No gallery gutters');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width!==320){await page.evaluate(()=>document.activeElement?.blur());await page.locator('.sf-photo-gallery__grid').screenshot({path:`artifacts/offset-four-photo-${width}.png`,style:'sticky-header,.section-header{visibility:hidden!important}'});}
  }
  await page.goto('http://localhost:4173/products/plane-box-tee?gallery=media');await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('media-gallery li[data-media-id]:not(.sf-color-hidden)').count(),3);
  assert.equal(await page.locator('.sf-description-accordion[open]').count(),0);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.goto('http://localhost:4173/products/plane-box-tee?gallery=media');await page.waitForLoadState('networkidle');
   await page.locator('media-gallery li[data-media-id]:not(.sf-color-hidden) .product__media-toggle').first().click();
   const nativeWidth=await page.locator('.product-media-modal__content img.active').evaluate(i=>i.getBoundingClientRect().width);
   await page.keyboard.press('Escape');
   await page.goto('http://localhost:4173/products/offset-heavy-tee');await page.waitForLoadState('networkidle');
   const tile=page.locator('.sf-photo-gallery__tile').first();await tile.click();
   const modal=page.locator('.sf-image-dialog'),image=modal.locator('img');await image.evaluate(i=>i.decode());
   assert(Math.abs(await image.evaluate(i=>i.getBoundingClientRect().width)-nativeWidth)<2,'Match native zoom width at '+width);
   assert(await modal.evaluate(d=>d.getBoundingClientRect().width>=innerWidth-1&&d.getBoundingClientRect().height===innerHeight));
   assert(await modal.evaluate(d=>d.scrollHeight>d.clientHeight));
   await modal.evaluate(d=>d.scrollTop=250);assert(await modal.evaluate(d=>d.scrollTop>0));
   await page.screenshot({path:`artifacts/offset-zoom-${width}.png`});
   await page.keyboard.press('Escape');assert(await tile.evaluate(t=>document.activeElement===t));
   await page.waitForFunction(()=>!document.body.classList.contains('overflow-hidden'));
  }
  assert.equal(require('../catalog/catalog.json').filter(p=>p.tags.includes('sf-four-photo-gallery')).length,12);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/offset-four-photo-validation.json',JSON.stringify({product:'offset-heavy-tee',views,colors:3,zoomChecks:12,nativeZoomScaleMatch:[1440,390],gaplessGallery:true,featuresClosedOnEntry:true,purchaseDescriptionRemoved:true,modelCaptions:2,widths:[1440,390,320],unchangedNativeGallery:true,errors},null,2));
  console.log('PASS Offset four-photo grid, all colors, 12 zoom/focus checks, captions and responsive layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

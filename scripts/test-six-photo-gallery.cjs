const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');
const {chromium}=require('../tooling/node_modules/playwright');
const catalog=require('../catalog/catalog.json');
(async()=>{
 const server=http.createServer(require('../api/storefront'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const report=[],errors=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  for(const product of catalog){
   await page.goto(origin+'/products/'+product.handle);
   const upper=product.tags.some(t=>['tops','outerwear'].includes(t));
   const expected=upper?['male','duolow','duofull','female','lineup','detail']:(product.handle==='interval-utility-short'?['female','duoclose','duofull','male','lineup','detail']:['male','duoclose','duofull','female','lineup','detail']);
   const tiles=page.locator('.sf-photo-gallery__tile');
   assert.deepEqual(await tiles.evaluateAll(a=>a.map(e=>e.dataset.sfView)),expected);
   const boxes=await tiles.evaluateAll(a=>a.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}));
   for(let i=0;i<boxes.length;i+=2){
    assert(Math.abs(boxes[i].y-boxes[i+1].y)<1,'Same row');
    assert(Math.abs(boxes[i].x+boxes[i].w-boxes[i+1].x)<1,'No column gap');
    if(i)assert(Math.abs(boxes[i-2].y+boxes[i-2].h-boxes[i].y)<1,'No row gap');
   }
   assert.equal(await tiles.locator('.sf-model-caption').count(),2);
   if(upper){
    assert.match(await tiles.nth(0).innerText(),/Large/);
    assert.match(await tiles.nth(3).innerText(),/Medium/);
   }
   if(product.handle==='interval-utility-short'){assert.match(await tiles.first().innerText(),/Medium/);assert.match(await tiles.nth(3).innerText(),/Large/);}
   if(product.handle==='grid-cargo-pant')assert.match(await tiles.first().innerText(),/Large/);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   report.push({handle:product.handle,views:expected,desktopGrid:true});
  }
  for(const handle of ['offset-heavy-tee','shell-utility-jacket','grid-cargo-pant','drift-baggy-jean','interval-utility-short']){
   await page.goto(origin+'/products/'+handle);
   const tiles=page.locator('.sf-photo-gallery__tile'),count=await tiles.count();
   for(let i=0;i<count;i++){
    const tile=tiles.nth(i);
    await tile.click();
    const image=page.locator('[data-sf-enlarged] img');
    await image.evaluate(i=>i.decode());
    assert.equal(await image.evaluate(i=>i.src),await tile.locator('img').evaluate(i=>i.src));
    assert.doesNotMatch(await image.evaluate(i=>i.currentSrc),/-480.webp/);
    await page.keyboard.press('Escape');
    assert(await tile.evaluate(t=>t===document.activeElement));
   }
   if(handle==='shell-utility-jacket'){await page.evaluate(()=>document.activeElement?.blur());await page.locator('.sf-photo-gallery__grid').screenshot({path:'artifacts/six-photo-gallery-desktop.png',style:'sticky-header,.section-header{visibility:hidden!important}'});}
   for(const width of [320,390,768,989]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>scrollTo(0,0));
    await page.locator('sf-photo-gallery').evaluate(g=>g.selectColor('Black'));
    await page.waitForFunction(()=>{const g=document.querySelector('sf-photo-gallery');return g.dataset.color==='black'&&!g.hasAttribute('aria-busy')});
    const gallery=page.locator('sf-photo-gallery'),strip=gallery.locator('.sf-photo-gallery__grid');
    await strip.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));
    for(let i=1;i<count;i++){
     await gallery.locator('[data-sf-gallery-step="1"]').click();
     await page.waitForFunction(text=>document.querySelector('[data-sf-gallery-counter]').textContent===text,(i+1)+'/'+count);
    }
    assert(await gallery.locator('[data-sf-gallery-step="1"]').isDisabled());
    await strip.focus();await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(text=>document.querySelector('[data-sf-gallery-counter]').textContent===text,(count-1)+'/'+count);
    await gallery.evaluate(g=>g.selectColor('White'));
    await page.waitForFunction(()=>{const g=document.querySelector('sf-photo-gallery');return g.dataset.color==='white'&&!g.hasAttribute('aria-busy')});
    await page.waitForFunction(()=>document.querySelector('[data-sf-gallery-counter]').textContent.startsWith('1/'));
    assert(await strip.evaluate(e=>e.scrollLeft<1));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(handle==='shell-utility-jacket'&&width===390)await gallery.screenshot({path:'artifacts/six-photo-gallery-phone.png'});
   }
   await page.setViewportSize({width:1440,height:1000});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/six-photo-gallery-validation.json',JSON.stringify({products:report,zoomProducts:5,responsiveWidths:[320,390,768,989,1440],colorReset:true,keyboard:true,errors},null,2));
  console.log('PASS gallery order for 12 products, desktop rows, captions, zoom/focus and responsive carousel');
 } finally {await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});

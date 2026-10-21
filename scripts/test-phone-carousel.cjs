const {chromium}=require('../tooling/node_modules/playwright');const assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
 try{for(const width of [320,390,430,749,768,1024,1440]){
  const p=await b.newPage({viewport:{width,height:1000},hasTouch:true,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:4173/products/offset-heavy-tee?variant=100');
  const gallery=p.locator('sf-photo-gallery'),strip=gallery.locator('.sf-photo-gallery__grid');assert.equal(await gallery.locator('.sf-photo-gallery__tile').count(),4);
  if(width<990){
   assert(await strip.evaluate(e=>e.scrollWidth>=e.clientWidth*3.9));
   assert(Math.abs((await strip.boundingBox()).width-(await gallery.locator('.sf-photo-gallery__tile').first().boundingBox()).width)<1);
   await gallery.locator('[data-sf-gallery-step="1"]').click();await p.waitForFunction(()=>document.querySelector('[data-sf-gallery-counter]').textContent==='2/4');
   await gallery.locator('[data-sf-gallery-step="1"]').click();await gallery.locator('[data-sf-gallery-step="1"]').click();await p.waitForFunction(()=>document.querySelector('[data-sf-gallery-counter]').textContent==='4/4');assert(await gallery.locator('[data-sf-gallery-step="1"]').isDisabled());
   await gallery.locator('.sf-photo-gallery__tile').last().click();assert(await p.locator('.sf-image-dialog').evaluate(e=>e.open));await p.locator('.sf-image-dialog [data-sf-close]').click();
   await strip.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('.sf-photo-gallery__grid').scrollLeft<1);
   await strip.focus();await p.keyboard.press('ArrowRight');await p.waitForFunction(()=>document.querySelector('[data-sf-gallery-counter]').textContent==='2/4');
   const input=p.locator('variant-selects:visible input[value="White"]');await p.locator('variant-selects:visible label[for="'+await input.getAttribute('id')+'"]').click();await p.waitForFunction(()=>document.querySelector('sf-photo-gallery').dataset.color==='white'||document.querySelector('sf-photo-gallery img').src.includes('-white-front'));
   await p.waitForFunction(()=>document.querySelector('.sf-photo-gallery__grid').scrollLeft<1);assert.match(await gallery.locator('img').first().getAttribute('src'),/-white-front/);
  }else{assert(!await gallery.locator('.sf-gallery-controls').isVisible());assert(await strip.evaluate(e=>e.scrollWidth<=e.clientWidth+1));}
  await p.goto('http://localhost:4173/collections/all');if(width<750){const gap=await p.evaluate(()=>{const cat=document.querySelector('.sf-shop-categories').getBoundingClientRect(),sort=document.querySelector('.sf-mobile-sort').getBoundingClientRect(),card=document.querySelector('#product-grid>li').getBoundingClientRect();return{categoryToSort:sort.y-cat.bottom,sortToCards:card.y-sort.bottom}});assert(gap.categoryToSort<=12&&gap.sortToCards<=20,JSON.stringify(gap));}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  results.push({width,carousel:width<990,desktopGrid:width>=990});await p.close();console.log('PASS gallery/spacing '+width);
 }
 const p=await b.newPage();await p.goto('http://localhost:4173/collections/sweatshirts');assert.equal(await p.locator('#product-grid .product-card-wrapper').count(),3);assert.match(await p.locator('#product-grid').innerText(),/Contour Crew/);
 assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/phone-carousel-validation.json',JSON.stringify({results,sweatshirts:['axis-long-sleeve','frame-long-sleeve','contour-crew'],errors},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require('../tooling/node_modules/playwright');const assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
try{const p=await b.newPage({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
for(const width of [320,390,768,820,989,1440]){
 await p.setViewportSize({width,height:1000});await p.goto('http://localhost:4173');await p.evaluate(()=>localStorage.removeItem('sideform-favorites-v1'));await p.reload();
 for(const [route,scope,count]of [['/','.sf-arrivals-section',4],['/collections/all','#product-grid',12],['/search?q=tee','#product-grid',2]]){
  await p.goto('http://localhost:4173'+route);await p.waitForLoadState('networkidle');
  const cards=p.locator(scope+' .product-card-wrapper'),hearts=p.locator(scope+' .sf-card-favorite:visible');assert.equal(await hearts.count(),count);
  const aligned=await cards.evaluateAll(es=>es.every(e=>{const row=e.querySelector('.sf-card-colors'),heart=row?.querySelector('.sf-card-favorite'),color=row?.querySelector('.sf-card-color');if(!row||!heart||!color)return false;const a=heart.getBoundingClientRect(),b=color.getBoundingClientRect();return Math.abs((a.y+a.height/2)-(b.y+b.height/2))<1&&a.right<=e.getBoundingClientRect().right+2}));assert(aligned);
 }
 await p.goto('http://localhost:4173');const heart=p.locator('.sf-arrivals-section .sf-card-favorite').first();await heart.click();assert.equal(await heart.getAttribute('aria-pressed'),'true');assert.equal((await p.locator('[data-sf-favorites-count]').innerText()).trim(),'1');
 await p.goto('http://localhost:4173/collections/all');const saved=p.locator('#product-grid .sf-card-favorite[data-sf-favorite="offset-heavy-tee"]:visible');assert.equal(await saved.getAttribute('aria-pressed'),'true');
 await p.locator('[data-sf-shop-category]').filter({hasText:/^Tops$/}).click();await p.waitForFunction(()=>location.pathname==='/collections/tops'&&!document.querySelector('#MainContent').hasAttribute('aria-busy'));assert.equal(await saved.getAttribute('aria-pressed'),'true');
 await p.goto('http://localhost:4173/products/plane-box-tee');await p.waitForLoadState('networkidle');await p.locator('product-recommendations').scrollIntoViewIfNeeded();await p.waitForSelector('product-recommendations .sf-card-favorite');const related=p.locator('product-recommendations .sf-card-favorite:visible');assert.equal(await related.count(),4);await related.first().click();assert.equal(await related.first().getAttribute('aria-pressed'),'true');
 await p.goto('http://localhost:4173/products/shell-utility-jacket?variant=806');const gallery=p.locator('sf-photo-gallery'),strip=gallery.locator('.sf-photo-gallery__grid');
 if(width<990){const a=await strip.boundingBox(),controls=await gallery.locator('.sf-gallery-controls').boundingBox();assert(controls.y>=a.y&&controls.y+controls.height<=a.y+a.height);assert(Math.abs((controls.x+controls.width/2)-(a.x+a.width/2))<1);assert.equal(await gallery.locator('[data-sf-gallery-counter]').innerText(),'1/4');await gallery.locator('[data-sf-gallery-step="1"]').click();await p.waitForFunction(()=>document.querySelector('[data-sf-gallery-counter]').textContent==='2/4');if(width>=750){const layout=await p.evaluate(()=>{const a=document.querySelector('.product__media-wrapper').getBoundingClientRect(),b=document.querySelector('.product__info-wrapper').getBoundingClientRect();return{right:a.right,x:b.x,dy:Math.abs(a.y-b.y)}});assert(layout.x>=layout.right-1&&layout.dy<2);}}
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({width,hearts:true,alignment:true,persistence:true,asyncCards:true,overlay:width<990});console.log('PASS card favorites/gallery '+width);
}
assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/card-favorites-validation.json',JSON.stringify({results,errors},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});


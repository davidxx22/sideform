const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),catalog=require('../catalog/catalog.json');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const newProducts=['offset-heavy-tee','volume-pullover','shell-utility-jacket','grid-cargo-pant'];
  assert.deepEqual(catalog.filter(p=>p.tags.includes('new-arrivals')).map(p=>p.handle),newProducts);
  for(const product of catalog){
   await page.goto('http://localhost:4173/products/'+product.handle);await page.waitForLoadState('networkidle');
   const label=await page.locator('.product__info-container>.product__text').first().innerText();
   assert.equal(label,'SIDEFORM / COLLECTION '+(newProducts.includes(product.handle)?'002':'001'));
   const note=page.locator('.sf-product-collection-note');
   if(newProducts.includes(product.handle))assert.equal(await note.count(),0);
   else{assert.equal(await note.innerText(),'COLLECTION 001 / OFF THE GRID');const favoriteBox=await page.locator('.sf-product-page [data-sf-favorite]').boundingBox(),noteBox=await note.boundingBox();assert(noteBox.y>=favoriteBox.y+favoriteBox.height&&Math.abs(noteBox.x-favoriteBox.x)<1);}
  }
  for(const route of ['/collections/all','/collections/new-arrivals']){
   await page.goto('http://localhost:4173'+route);await page.waitForLoadState('networkidle');
   assert.equal(await page.locator('.collection-hero__description').count(),0);
  }
  for(const [width,height]of [[1920,1080],[1440,1000],[390,844],[320,740]]){
   await page.setViewportSize({width,height});await page.goto('http://localhost:4173/pages/about');await page.waitForLoadState('networkidle');
   const position=await page.locator('.sf-footer').evaluate(e=>({bottom:e.getBoundingClientRect().bottom+scrollY,page:document.documentElement.scrollHeight,viewport:innerHeight}));
   assert(Math.abs(position.bottom-position.page)<2,'No blank area beneath footer at '+width);
   assert(position.bottom>=position.viewport-1,'Footer reaches viewport bottom');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   if(width===1440||width===390)await page.screenshot({path:`artifacts/about-footer-${width}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/collection-story-validation.json',JSON.stringify({newArrivals:newProducts,collection002:4,collection001:8,genericCollectionCaptionRemoved:true,footerAtBottom:true,widths:[1920,1440,390,320],errors},null,2));
  console.log('PASS four Collection 002 products, eight Collection 001 products, neutral shop captions and About footer placement');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

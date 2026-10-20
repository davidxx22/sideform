const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:4173/');
  assert.equal(await page.locator('.review-notice,.announcement-bar').count(),0);
  assert.equal(await page.locator('.header__heading-link img').count(),0);
  assert.equal(await page.locator('.sf-collection-links a').count(),4);
  assert.equal(await page.locator('.sf-editorial__photo img').count(),3);
  const results=[];
  for(const width of [1920,1440,990,768,390,320]){
   await page.setViewportSize({width,height:1000});
   const header=await page.locator('.header').boundingBox(),brand=await page.locator('.header__heading-link').boundingBox();
   assert(Math.abs(brand.x+brand.width/2-(header.x+header.width/2))<3,'Wordmark must be centered at '+width+' '+JSON.stringify({header,brand}));
   if(width>=990){const nav=await page.locator('.header__inline-menu').boundingBox();assert(nav.x+nav.width<brand.x,'Navigation overlaps wordmark at '+width)}
   if(width===1440){await page.goto('http://127.0.0.1:4173/');await page.locator('.section-header').screenshot({path:'artifacts/navbar-layout.png'});}
   const editorial=page.locator('.sf-editorial');await editorial.scrollIntoViewIfNeeded();
   const grid=await page.locator('#Slider-featured_collection').boundingBox(),left=await page.locator('.sf-editorial__tile--1').boundingBox(),right=await page.locator('.sf-editorial__tile--2').boundingBox();
   console.log('Section edges',JSON.stringify({width,products:[grid.x,grid.x+grid.width],editorial:[left.x,right.x+right.width]}));
   await page.locator('.sf-editorial__photo img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const bad=await page.locator('.sf-editorial .button').evaluateAll(buttons=>buttons.filter(button=>{const r=button.getBoundingClientRect(),p=button.closest('article').getBoundingClientRect();return r.left<p.left||r.right>p.right}).length);
   assert.equal(bad,0,'Editorial button overflow at '+width);
   await editorial.screenshot({path:'artifacts/editorial-'+width+'.png'});
   if(width===1920){await page.locator('#shopify-section-featured_collection').screenshot({path:'artifacts/aligned-product-grid.png'});await page.screenshot({path:'artifacts/aligned-home-1920.png',fullPage:true});}
   if(width===1440){await page.locator('#shopify-section-featured_collection').screenshot({path:'artifacts/new-arrivals-layout.png'});await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});}
   if(width===390)await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
   results.push({width,centeredWordmark:true,editorialPhotos:3,noOverflow:true});
  }
  const sticky=[];
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:844});
   for(const route of ['/','/collections/all','/products/offset-heavy-tee']){
    await page.goto('http://127.0.0.1:4173'+route);
    assert.equal(await page.locator('sticky-header').getAttribute('data-sticky-type'),'always');
    assert.equal(await page.locator('.sf-transparent-header').count(),0);
    assert.notEqual(await page.locator('.header-wrapper').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    if(width===1440&&route==='/'){const hero=await page.locator('.sf-campaign').boundingBox();assert(hero.y>40,'Campaign should start below solid header');await page.screenshot({path:'artifacts/solid-header-top.png'});}
    for(const y of [500,1000,350,0]){
     await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(150);
     const rect=await page.locator('.section-header').boundingBox();assert(Math.abs(rect.y)<2,'Sticky header left the viewport '+JSON.stringify({width,route,y,rect}));
     assert.equal(await page.locator('.shopify-section-header-hidden').count(),0);
     if(width===1440&&route==='/'&&y===1000)await page.screenshot({path:'artifacts/solid-header-scroll.png'});
    }
    sticky.push({width,route,transparent:false,scrollUpAndDown:'passed'});
   }
  }
  fs.writeFileSync('artifacts/home-layout-validation.json',JSON.stringify({removedTopStrips:true,textOnlyHeader:true,categoryLinks:4,results,sticky},null,2));console.log('PASS reference layout at six viewport widths; solid always-sticky header on desktop/mobile across homepage, collection and product');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

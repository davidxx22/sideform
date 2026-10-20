const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4173/');
  const menu=page.locator('.header__inline-menu'),shop=menu.locator('#HeaderMenu-shop');
  assert.equal(await menu.locator(':scope > ul > li').count(),4);
  assert.deepEqual(await menu.locator(':scope > ul > li').evaluateAll(items=>items.map(item=>item.querySelector('a,summary').textContent.trim())),['Home','Shop','About','Contact']);
  await shop.click();
  const dropdown=menu.locator('#HeaderMenu-MenuList-2');
  assert(await dropdown.isVisible());
  assert.deepEqual((await dropdown.locator('a').allTextContents()).map(s=>s.trim()),['Shop All','New Arrivals','Tops','Bottoms','Outerwear']);
  await page.locator('.section-header').screenshot({path:'artifacts/navigation-desktop.png'});
  await dropdown.locator('a').first().focus();await page.keyboard.press('Escape');
  assert.equal(await menu.locator('details').getAttribute('open'),null);
  await shop.focus();await page.keyboard.press('Enter');assert(await dropdown.isVisible());
  await dropdown.getByRole('link',{name:'Tops',exact:true}).click();await page.waitForURL('**/collections/tops');
  assert.equal(await menu.locator('#HeaderMenu-shop-tops').getAttribute('aria-current'),'page');
  for(const width of [1920,1440,990]){
   await page.setViewportSize({width,height:950});
   const nav=await menu.boundingBox(),brand=await page.locator('.header__heading-link').boundingBox();
   assert(nav.x+nav.width<brand.x,'Menu overlaps centered wordmark at '+width);
   await page.evaluate(()=>scrollTo(0,600));await page.waitForTimeout(150);
   assert(Math.abs((await page.locator('.section-header').boundingBox()).y)<2);
  }
  await page.setViewportSize({width:1440,height:950});
  await menu.getByRole('link',{name:'Contact',exact:true}).click();await page.waitForURL('**/pages/contact');
  assert(await page.locator('#ContactForm-email').isVisible());
  assert(await page.locator('#ContactForm-body').isVisible());
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await page.goto('http://localhost:4173/');
   await page.locator('summary[aria-label="Menu"]').click();
   await page.locator('#HeaderDrawer-shop').click();
   const mobile=page.locator('#link-shop');await mobile.waitFor({state:'visible'});
   assert.deepEqual((await mobile.locator('ul > li > a').allTextContents()).map(s=>s.trim()),['Shop All','New Arrivals','Tops','Bottoms','Outerwear']);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===390)await page.screenshot({path:'artifacts/navigation-mobile.png'});
   await mobile.getByRole('link',{name:'Bottoms',exact:true}).click();await page.waitForURL('**/collections/bottoms');
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/navigation-validation.json',JSON.stringify({topLevel:['Home','Shop','About','Contact'],shop:['Shop All','New Arrivals','Tops','Bottoms','Outerwear'],desktopWidths:[1920,1440,990],mobileWidths:[390,320],clickAndKeyboard:true,escape:true,activeCategory:true,sticky:true,contactFormRendered:true,localContactDelivery:false,errors},null,2));
  console.log('PASS four-link navigation; native Shop dropdown; keyboard/Escape; current category; centered sticky header; mobile submenus; Contact form');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});

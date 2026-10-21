const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
 try{
  for(const width of [320,375,390,430,749]){
   const ctx=await b.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion:'reduce'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
   await p.goto('http://localhost:4173');await p.waitForLoadState('networkidle');
   const positions=await p.evaluate(()=>{
    const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
    const hero=box('.sf-campaign__image'),copy=box('.sf-campaign__copy'),menu=box('header-drawer'),search=box('.header__search'),logo=box('.header__heading-link'),heart=box('.header__icon--favorites'),cart=box('.header__icon--cart'),jacket=box('.sf-category-card--jackets'),hoodie=box('.sf-category-card--hoodies'),tee=box('.sf-category-card--t-shirts'),footer=box('.sf-footer__grid>div:first-child'),brand=box('.sf-footer .sf-wordmark');
    return{hero,copy,menu,search,logo,heart,cart,jacket,hoodie,tee,footer,brand,overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   const a=positions;assert(!a.overflow);assert(a.copy.y>=a.hero.y&&a.copy.bottom<=a.hero.bottom);assert(a.menu.right<=a.logo.x+1&&a.logo.right<=a.search.x+1&&a.search.right<=a.heart.x+1&&a.heart.right<=a.cart.x+1);assert(Math.abs((a.logo.x+a.logo.right)/2-width/2)<2);
   assert(a.jacket.y<a.hoodie.y&&Math.abs(a.hoodie.y-a.tee.y)<1);assert(Math.abs(a.jacket.width-(a.tee.right-a.hoodie.x))<1);assert(Math.abs((a.brand.x+a.brand.right)/2-(a.footer.x+a.footer.right)/2)<2);
   const styles=await p.evaluate(()=>{const style=s=>getComputedStyle(document.querySelector(s));return{hero:style('.sf-campaign__copy').color,button:style('.sf-campaign__copy .button').backgroundColor,heading:style('.sf-category-section>.sf-home-section-heading').textAlign,panel:style('.sf-category-card__copy').backgroundColor,card:style('.sf-category-card').backgroundColor,searchWidth:document.querySelector('.header__icon--search .icon').getBoundingClientRect().width}});assert.equal(styles.hero,'rgb(255, 255, 255)');assert.equal(styles.button,'rgb(255, 255, 255)');assert.equal(styles.heading,'center');assert.equal(styles.panel,'rgba(0, 0, 0, 0)');assert.equal(styles.card,'rgb(238, 237, 233)');assert.equal(styles.searchWidth,16);
   const footerLinks=await p.locator('.sf-footer__grid nav>a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));assert(footerLinks[1]-footerLinks[0]<=32);
   await p.locator('.header__icon--search').click();await p.locator('.header__search input[name="q"]').fill('hoodie');await p.waitForSelector('#predictive-search-results');const searchBox=await p.locator('.search-modal').boundingBox();assert(searchBox.width>=width-1);await p.locator('.search-modal__close-button').click();
   await p.locator('header-drawer>details>summary').click();await p.waitForSelector('header-drawer>details.menu-opening');assert(await p.locator('header-drawer>details').evaluate(e=>e.open));await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('header-drawer>details').open);
   await p.locator('[data-sf-favorites-open]').click();await p.locator('[data-sf-favorites-close]').click();await p.locator('#cart-icon-bubble').click();await p.locator('#CartDrawer .drawer__close').first().click();
   await p.locator('#MainContent img').evaluateAll(es=>Promise.all(es.map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
   await p.evaluate(()=>scrollTo(0,0));if(width===390||width===320)await p.screenshot({path:`artifacts/phone-home-composition-${width}.png`,fullPage:true});
   results.push({width,...positions});await ctx.close();console.log('PASS phone composition '+width);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/phone-composition-validation.json',JSON.stringify({results,errors},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});

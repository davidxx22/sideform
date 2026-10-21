const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  async function visit(route){await page.goto('http://localhost:4173'+route);await page.waitForLoadState('networkidle')}
  await visit('/');
  assert.deepEqual(await page.locator('#MainContent>.shopify-section').evaluateAll(a=>a.map(e=>e.id)),['shopify-section-campaign','shopify-section-shop_by_category','shopify-section-new_arrivals','shopify-section-editorial','shopify-section-perspective']);
  assert.equal(await page.locator('.sf-category-card').count(),5);
  assert.equal(await page.locator('.sf-arrivals-section .product-card-wrapper').count(),4);
  const names=await page.locator('.sf-arrivals-section .card__information .card__heading a:visible').allTextContents();
  assert.deepEqual(names.map(s=>s.trim()),['Offset Heavy Tee','Volume Pullover','Shell Utility Jacket','Grid Cargo Pant']);
  assert.equal(await page.locator('.sf-home-section-heading').first().innerText(),'Shop by category');
  assert.equal(await page.locator('.sf-home-section-heading').last().innerText(),'New arrivals');
  for(const width of [1920,1440,768,390,320]){
   await page.setViewportSize({width,height:1100});
   await page.locator('.sf-category-section').scrollIntoViewIfNeeded();
   await page.locator('.sf-category-section img,.sf-arrivals-section img').evaluateAll(a=>Promise.all(a.map(i=>i.decode())));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const categoryBoxes=await page.locator('.sf-category-card').evaluateAll(a=>a.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,w:r.width,h:r.height}}));
   const productBoxes=await page.locator('.sf-arrivals-section .grid__item').evaluateAll(a=>a.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,w:r.width}}));
   assert(Math.abs(categoryBoxes[0].x-productBoxes[0].x)<1,'Left edges align at '+width);
   if(width>=750){const last=width>=990?4:3;assert(Math.abs(categoryBoxes[last].x+categoryBoxes[last].w-productBoxes[3].x-productBoxes[3].w)<1,'Right edges align at '+width);}
   else for(let i=0;i<2;i++)assert(Math.abs(categoryBoxes[i].x-productBoxes[i].x)<1&&Math.abs(categoryBoxes[i].w-productBoxes[i].w)<1,'Matching mobile columns at '+width);
   if(width>=990){const boxes=await page.locator('.sf-category-card').evaluateAll(a=>a.map(e=>e.getBoundingClientRect().y));assert(boxes.every(y=>Math.abs(y-boxes[0])<1));}
   if(width===1440||width===390){await page.evaluate(()=>scrollTo(0,document.querySelector('.sf-category-section').getBoundingClientRect().top+scrollY-85));await page.screenshot({path:`artifacts/home-category-arrivals-${width}.png`});}
  }
  await page.setViewportSize({width:1440,height:1100});
  const card=page.locator('.sf-arrivals-section .product-card-wrapper').first(),image=card.locator('.sf-card-photo img'),original=await image.getAttribute('src');
  await card.locator('[data-sf-card-color="White"]').hover();await page.waitForTimeout(200);assert.match(await image.getAttribute('src'),/-white-front/);
  await page.locator('.sf-arrivals-section h2').hover();await page.waitForTimeout(150);assert.equal(await image.getAttribute('src'),original);
  for(const [slug,count] of [['hoodies',2],['t-shirts',2],['pants',2],['jackets',2],['shorts',1]]){
   await visit('/');await page.locator(`.sf-category-card[href="/collections/${slug}"]`).click();await page.waitForURL(`**/collections/${slug}`);assert.equal(await page.locator('#product-grid .product-card-wrapper').count(),count);
  }
  await visit('/');assert.equal(await page.locator('.sf-arrivals-section__more,.sf-campaign__copy .sf-kicker').count(),0);
  assert.match(await page.locator('.sf-category-card--hoodies img').getAttribute('src'),/structure-hoodie-black-front/);
  assert.match(await page.locator('.sf-category-card--jackets img').getAttribute('src'),/shell-utility-jacket-grey-front/);
  await visit('/collections/new-arrivals');assert.equal(await page.locator('#product-grid .product-card-wrapper').count(),4);
  assert.equal(await page.locator('.collection-hero__description').count(),0);
  assert.deepEqual(await page.locator('#product-grid .card__heading a:visible').allTextContents().then(a=>a.map(s=>s.trim())),names.map(s=>s.trim()));
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/homepage-edit-validation.json',JSON.stringify({categories:5,categoryCounts:{hoodies:2,'t-shirts':2,pants:2,jackets:2,shorts:1},featuredProducts:names.map(s=>s.trim()),newArrivals:4,hoverRestore:true,widths:[1920,1440,768,390,320],errors},null,2));
  console.log('PASS homepage category links, four curated arrivals, hover restore and five responsive widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

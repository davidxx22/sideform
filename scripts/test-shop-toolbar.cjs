const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('assert/strict'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://localhost:4173/products/offset-heavy-tee?variant=100');
  const style=await p.locator('.sf-size-guide>[data-sf-open]').evaluate(e=>({color:getComputedStyle(e).color,border:getComputedStyle(e).borderBottomWidth,decoration:getComputedStyle(e).textDecorationLine}));
  assert.equal(style.color,'rgb(0, 102, 204)');assert.equal(style.border,'0px');assert.equal(style.decoration,'none');
  await p.locator('.sf-size-guide>[data-sf-open]').click();assert(await p.locator('.sf-size-guide dialog').evaluate(e=>e.open));await p.keyboard.press('Escape');
  const checks=[];
  for(const width of [1920,1440,990,768,390,320]){
   await p.setViewportSize({width,height:1000});await p.goto('http://localhost:4173/collections/all');await p.waitForLoadState('networkidle');
   const pos=await p.evaluate(()=>{
    const sort=document.querySelector('.facet-filters__field').getBoundingClientRect(),cards=[...document.querySelectorAll('#product-grid>li')],card=cards[(innerWidth>=990?4:2)-1].getBoundingClientRect();
    const counts=[...document.querySelectorAll('#main-collection-filters .product-count')];
    return{sortRight:sort.right,cardRight:card.right,countsHidden:counts.every(e=>e.getBoundingClientRect().width<=1),overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   if(width>=750)assert(Math.abs(pos.sortRight-pos.cardRight)<2,JSON.stringify({width,...pos}));
   assert(pos.countsHidden);assert(!pos.overflow);checks.push({width,...pos});
   if(width===1440||width===390)await p.screenshot({path:`artifacts/shop-toolbar-${width}.png`,fullPage:true});
  }
  await p.setViewportSize({width:1440,height:1000});await p.goto('http://localhost:4173/collections/all');await p.locator('#SortBy').selectOption('price-descending');await p.waitForFunction(()=>document.querySelector('#product-grid .card__heading')?.textContent.includes('Transit Work Jacket'));
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/shop-toolbar-validation.json',JSON.stringify({sizeGuide:style,checks,sorting:true,errors},null,2));
  console.log('PASS blue Size Guide, no visible count, sort aligned with grid, six widths and working sorting');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});


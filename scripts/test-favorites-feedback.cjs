const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4173/products/offset-heavy-tee');await page.waitForLoadState('networkidle');
  const favorite=page.locator('.sf-product-page [data-sf-favorite]'),open=page.locator('[data-sf-favorites-open]'),status=page.locator('[data-sf-favorites-status]');
  await favorite.click();await open.click();
  const remove=page.getByRole('button',{name:'Remove Offset Heavy Tee from favorites'});
  const style=await remove.evaluate(e=>{const s=getComputedStyle(e);return{color:s.color,border:s.borderBottomWidth,decoration:s.textDecorationLine}});
  assert.deepEqual(style,{color:'rgb(180, 35, 24)',border:'0px',decoration:'none'});
  await remove.click();assert.equal(await status.innerText(),'Offset Heavy Tee removed.');
  assert(await status.evaluate(e=>e.classList.contains('visually-hidden')&&e.getBoundingClientRect().width===1));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('[data-sf-favorites-status]').textContent==='');
  await favorite.click();await open.click();assert.equal(await page.locator('.sf-favorite-product').innerText(),'Offset Heavy Tee');assert.equal(await status.innerText(),'');
  await page.locator('[data-sf-favorites-close]').click();await open.click();assert.equal(await status.innerText(),'');
  // Another tab changing the saved list also clears obsolete feedback.
  await remove.click();assert.match(await status.innerText(),/removed/);
  const other=await context.newPage();await other.goto('http://localhost:4173/products/offset-heavy-tee');await other.waitForLoadState('networkidle');await other.locator('.sf-product-page [data-sf-favorite]').click();
  await page.waitForFunction(()=>document.querySelector('.sf-favorite-product')&&document.querySelector('[data-sf-favorites-status]').textContent==='');await other.close();
  await page.screenshot({path:'artifacts/favorites-feedback-1440.png'});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'artifacts/favorites-feedback-390.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/favorites-feedback-validation.json',JSON.stringify({removeReadd:true,reopenClearsStatus:true,crossTabClearsStatus:true,removeRed:true,noUnderline:true,widths:[1440,390],errors},null,2));
  console.log('PASS favorites remove/re-add, reopen/cross-tab status clearing and red un-underlined Remove');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

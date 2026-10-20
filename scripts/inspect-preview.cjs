const {chromium}=require('../tooling/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [name,url] of [['home','/'],['product','/products/offset-heavy-tee'],['collection','/collections/all']]){
  const r=await page.goto('http://127.0.0.1:4173'+url);await page.waitForTimeout(700);
  console.log(name,r.status(),(await page.locator('body').innerText()).slice(0,550));
  await page.screenshot({path:'artifacts/'+name+'-desktop.png',fullPage:true});
 }
 console.log('JS errors',errors);await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});

const {chromium}=require('../tooling/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1400}});
  const response=await page.goto('http://127.0.0.1:4173/photo-review');if(response.status()!==200)throw Error('Photo review unavailable');
  await page.waitForLoadState('networkidle');fs.mkdirSync('artifacts/photo-review',{recursive:true});
  const models=process.argv.includes('--models');
  if(models){await page.addStyleTag({content:'.photo-product figure:nth-child(n+4){display:none}'});fs.mkdirSync('artifacts/model-review',{recursive:true});}
  for(const section of await page.locator('.photo-product').all()){
   const handle=await section.getAttribute('data-handle');await section.screenshot({path:'artifacts/'+(models?'model-review':'photo-review')+'/'+handle+'.png'});
  }
  console.log('Saved 12 product review screenshots.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

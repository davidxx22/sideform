const {chromium}=require('../tooling/node_modules/playwright');const assert=require('assert/strict'),fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true}),results=[],errors=[];
 try{const p=await b.newPage({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,430,768,820,989,1024,1440,1920]){
  await p.setViewportSize({width,height:1000});await p.goto('http://localhost:4173');const section=p.locator('.sf-editorial');assert.equal(await section.locator('article').count(),4);
  assert.deepEqual(await section.locator('.button').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),['/collections/tops','/collections/outerwear','/collections/bottoms']);
  const quote=section.locator('article').last();assert.equal((await quote.locator('h2').innerText()).replace(/\s+/g,' ').trim(),'Your city. Your pace. Your form.');assert.equal((await quote.locator('.sf-kicker').innerText()).trim(),'SIDEFORM');assert.equal(await quote.locator('a').count(),0);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const boxes=await section.locator('article').evaluateAll(es=>es.map(e=>{const box=e.getBoundingClientRect();return [...e.querySelectorAll('.sf-editorial__copy>*')].filter(c=>c.getBoundingClientRect().height>0).every(c=>{const r=c.getBoundingClientRect();return r.x>=box.x-1&&r.right<=box.right+1&&r.y>=box.y-1&&r.bottom<=box.bottom+1})}));assert(boxes.every(Boolean),'Copy/buttons stay in cards at '+width);
  await section.locator('img').evaluateAll(es=>Promise.all(es.map(i=>{i.loading='eager';return i.decode()})));
  if([390,768,1440].includes(width))await section.screenshot({path:`artifacts/restored-editorial-${width}.png`,style:'.section-header{visibility:hidden}'});
  results.push({width,cards:4,quote:true,links:3,noOverflow:true});console.log('PASS editorial '+width);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/restored-editorial-validation.json',JSON.stringify({results,errors},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require('../tooling/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  async function visit(route){await page.goto('http://localhost:4173'+route);await page.waitForLoadState('networkidle')}
  async function select(name,value){const input=page.locator(`variant-selects:visible input[data-option-name="${name}"][value="${value}"]`);await page.locator(`variant-selects:visible label[for="${await input.getAttribute('id')}"]`).click();await page.waitForTimeout(600)}
  await visit('/products/offset-heavy-tee');
  assert.equal(await page.getByText('AI-generated sample photography',{exact:true}).count(),0);
  assert.equal(await page.locator('.sf-photo-gallery__tile').count(),4);
  assert.match(await page.locator('.sf-model-caption:visible').first().innerText(),/6' 1"[\s\S]*Large/);
  assert(await page.locator('product-form [name="add"]').isDisabled());
  await page.locator('.sf-product-page [data-sf-favorite]').click();
  assert.equal(await page.locator('.sf-product-page [data-sf-favorite]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-sf-favorites-count]').innerText(),'1');
  await visit('/');await page.locator('[data-sf-favorites-open]').click();
  assert(await page.locator('[data-sf-favorites-dialog]').evaluate(d=>d.open));
  assert.equal(await page.locator('.sf-favorite-product').innerText(),'Offset Heavy Tee');
  await page.keyboard.press('Escape');
  assert(await page.locator('[data-sf-favorites-open]').evaluate(button=>document.activeElement===button));
  await page.locator('[data-sf-favorites-open]').click();await page.locator('.sf-favorite-product').click();await page.waitForURL('**/products/offset-heavy-tee');
  assert.equal(await page.locator('.sf-product-page [data-sf-favorite]').getAttribute('aria-pressed'),'true');
  await select('Color','White');await select('Size','Medium');
  assert.equal(await page.locator('product-form .product-variant-id').inputValue(),'104');
  assert.equal(await page.locator('.sf-photo-gallery__tile').count(),4);
  assert.match(await page.locator('.sf-photo-gallery__tile').first().locator('img').getAttribute('src'),/-white-front\.webp/);
  assert.match(await page.locator('[data-sf-feature-photo] img').first().getAttribute('src'),/-white-detail\.webp/);
  await page.getByRole('button',{name:'Size Guide',exact:true}).click();assert(await page.locator('.sf-size-guide dialog').evaluate(d=>d.open));assert.equal(await page.locator('.sf-size-guide tbody tr').count(),3);assert.doesNotMatch(await page.locator('.sf-size-guide dialog').innerText(),/Sample measurements|merchant must verify/);await page.keyboard.press('Escape');
  const enlarge=page.locator('.sf-photo-gallery__tile').first();await enlarge.click();assert(await page.locator('.sf-image-dialog').evaluate(modal=>modal.open));await page.keyboard.press('Escape');
  await select('Color','Grey');await select('Size','Large');assert(await page.locator('product-form [name="add"]').isDisabled());
  await select('Color','White');await select('Size','Medium');await page.locator('product-form [name="add"]').click();await page.waitForTimeout(500);
  assert(await page.locator('cart-drawer').evaluate(drawer=>drawer.classList.contains('active')));assert.match(await page.locator('#CartDrawer').innerText(),/White[\s\S]*Medium/);
  const quantity=page.locator('#CartDrawer input[name="updates[]"]');await quantity.fill('2');await quantity.dispatchEvent('change');await page.waitForTimeout(800);assert.match(await page.locator('#CartDrawer').innerText(),/84\.00/);
  await page.locator('#CartDrawer cart-remove-button').click();await page.waitForTimeout(600);assert.match(await page.locator('#CartDrawer').innerText(),/empty/i);await page.locator('#CartDrawer .drawer__close').first().click();
  // Favorites can be removed through the saved list and synchronize across tabs.
  const other=await context.newPage();await other.goto('http://localhost:4173/');
  await page.locator('[data-sf-favorites-open]').click();await page.getByRole('button',{name:'Remove Offset Heavy Tee from favorites'}).click();
  assert.match(await page.locator('[data-sf-favorites-list]').innerText(),/Save the pieces/);
  await other.waitForFunction(()=>document.querySelector('[data-sf-favorites-count]').hidden);await other.close();await page.keyboard.press('Escape');
  await visit('/products/offset-heavy-tee?gallery=fallback');
  assert.equal(await page.locator('.sf-photo-gallery__tile').count(),4);
  await select('Color','Grey');await select('Size','Medium');
  assert.match(await page.locator('.sf-photo-gallery__tile').first().locator('img').getAttribute('src'),/-grey-front\.webp/);
  await page.locator('.sf-photo-gallery__tile').nth(2).click();assert(await page.locator('.sf-image-dialog').evaluate(d=>d.open));await page.keyboard.press('Escape');
  for(const width of [1920,1440,990,768,390,320]){
   await page.setViewportSize({width,height:950});await visit('/products/offset-heavy-tee');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);
   const brand=await page.locator('.header__heading-link').boundingBox();assert(Math.abs(brand.x+brand.width/2-width/2)<3,'Wordmark not centered at '+width);
   if(width===1440||width===390){await page.locator('.sf-description-accordion').first().locator('summary').click();await page.locator('.sf-product-description').scrollIntoViewIfNeeded();await page.locator('[data-sf-feature-photo] img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await page.locator('.sf-product-description').screenshot({path:`artifacts/product-features-${width}.png`});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);await page.screenshot({path:`artifacts/product-detail-${width}.png`});}
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync('artifacts/product-experience-validation.json',JSON.stringify({fourPhotoGallery:true,fallbackGallery:true,modelCaption:true,noPhotographyNotice:true,favorites:{persistence:true,headerDialog:true,removal:true,crossTab:true,escapeFocusReturn:true},variantSelection:true,sizeGuide:true,soldOut:true,cart:{add:true,quantity:true,remove:true},widths:[1920,1440,990,768,390,320],errors},null,2));
  console.log('PASS product redesign, galleries, captions, favorites persistence/removal, variants, size guides, cart and six responsive widths');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});

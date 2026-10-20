/* Local review harness. Renders the actual theme Liquid with fixture Shopify objects.
   AJAX endpoints emulate Shopify only on localhost. No orders or payments are possible. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { Liquid, Drop, Hash } = require('../tooling/node_modules/liquidjs');
const root = path.resolve(__dirname, '..'), theme = path.join(root, 'theme');
const photoStatusPath=path.join(root,'catalog/photo-status.json');
const photoReady=fs.existsSync(photoStatusPath)&&JSON.parse(fs.readFileSync(photoStatusPath,'utf8')).completed===108;
const catalog = JSON.parse(fs.readFileSync(path.join(root,'catalog/catalog.json')));
const settings = JSON.parse(fs.readFileSync(path.join(theme,'config/settings_data.json'))).current;
const translations = JSON.parse(fs.readFileSync(path.join(theme,'locales/en.default.json'),'utf8').replace(/^\/\*[\s\S]*?\*\//,''));
const engine = new Liquid({root:[path.join(theme,'snippets'),path.join(theme,'sections')],extname:'.liquid',strictFilters:false,jsTruthy:false});
const read = name => fs.readFileSync(path.join(theme,name),'utf8');
const escape = s => String(s ?? '').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const money = v => '$'+(Number(v || 0)/100).toFixed(2);
engine.registerFilter('asset_url',x=>'/assets/'+x);
engine.registerFilter('stylesheet_tag',x=>`<link rel="stylesheet" href="${escape(x)}">`);
engine.registerFilter('inline_asset_content',x=>read('assets/'+x));
engine.registerFilter('money',money);engine.registerFilter('money_with_currency',v=>money(v)+' USD');
engine.registerFilter('money_amount',v=>(v/100).toFixed(2));
engine.registerFilter('json',x=>JSON.stringify(x));engine.registerFilter('handleize',x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
engine.registerFilter('t',(key,...opts)=>{
 let value = key.split('.').reduce((o,k)=>o?.[k],translations) || key;
 if (typeof value !== 'string') value = value.other || value.one || key;
 opts.filter(Array.isArray).forEach(([k,v])=>value=value.replaceAll(`{{ ${k} }}`,String(v)));
 return value;
});
engine.registerFilter('image_url',x=>x?.src || x?.preview_image?.src || x);
engine.registerFilter('image_tag',(src,...pairs)=>{
 const attributes=pairs.filter(Array.isArray).filter(([k])=>!['widths','sizes'].includes(k));
 const match=String(src).match(/sf-photo-(.+)-(black|white|grey)-(front|back|detail)\.jpg/);
 if(match&&!attributes.some(([key])=>key==='alt')){
  const title=catalog.find(p=>p.handle===match[1])?.title||match[1];
  attributes.push(['alt',`AI-generated sample photograph — ${title}, ${match[2]}, ${match[3]==='front'?'on-model front':match[3]} view`]);
 }
 return `<img src="${escape(src)}" ${attributes.map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>`;
});
engine.registerFilter('standard_event_data',()=> '{}');engine.registerFilter('payment_terms',()=> '');
engine.registerFilter('item_count_for_variant',(cart,id)=>cart.items.filter(x=>x.variant_id==id).reduce((n,x)=>n+x.quantity,0));
engine.registerFilter('link_to', (label,url)=>`<a href="${escape(url)}">${escape(label)}</a>`);
engine.registerFilter('placeholder_svg_tag',(_,cls)=>`<svg class="${cls||''}" viewBox="0 0 700 850"><rect width="700" height="850" fill="#eceee8"/><text x="40" y="425" font-size="18">Add collection products in Shopify</text></svg>`);
function parseBlock(tag,tokens,end) {
 tag.templates=[];
 const stream=tag.liquid.parser.parseStream(tokens).on('template',t=>tag.templates.push(t)).on('tag:'+end,()=>stream.stop());
 stream.start();
}
engine.registerTag('style',{parse(token,tokens){parseBlock(this,tokens,'endstyle')},*render(ctx,e){e.write('<style>');yield this.liquid.renderer.renderTemplates(this.templates,ctx,e);e.write('</style>')}});
engine.registerTag('javascript',{parse(token,tokens){parseBlock(this,tokens,'endjavascript')},*render(ctx,e){e.write('<script>');yield this.liquid.renderer.renderTemplates(this.templates,ctx,e);e.write('</script>')}});
engine.registerTag('schema',{parse(token,tokens){parseBlock(this,tokens,'endschema')},render(){return ''}});
engine.registerTag('doc',{parse(token,tokens){parseBlock(this,tokens,'enddoc')},render(){return ''}});
engine.registerTag('form',{parse(token,tokens){this.args=token.args;const match=token.args.match(/(?:^|,)\s*[\w-]+\s*:/);this.props=new Hash(match?token.args.slice(match.index).replace(/^,\s*/,''):'');parseBlock(this,tokens,'endform')},*render(ctx,e){
 const hash=yield this.props.render(ctx);
 const action=this.args.startsWith("'product'")?'/cart/add':this.args.startsWith("'cart'")?'/cart':'/contact';
 e.write(`<form method="post" action="${action}" ${Object.entries(hash).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>`);
 yield this.liquid.renderer.renderTemplates(this.templates,ctx,e);e.write('</form>');
}});
engine.registerTag('paginate',{parse(token,tokens){this.expr=token.args.split(' by ')[0];parseBlock(this,tokens,'endpaginate')},*render(ctx,e){
 const values=yield this.liquid.evalValue(this.expr,ctx);ctx.push({paginate:{pages:1,current_page:1,items:values?.length||0,page_size:16,parts:[]}});
 yield this.liquid.renderer.renderTemplates(this.templates,ctx,e);ctx.pop();
}});
// The preview emulates option-value drops, including their string representation.
class OptionValue extends Drop {
 constructor(name,id,selected,available){super();Object.assign(this,{name,id,selected,available,product_url:null,swatch:null});}
 valueOf(){return this.name} toString(){return this.name} toJSON(){return this.name}
}
class CartDrop extends Drop { valueOf(){return this.items} }
let bag=[];
let mediaFixtureHandle=null;
let fallbackFixtureHandle=null;
const menuDefinition=JSON.parse(fs.readFileSync(path.join(root,'catalog/navigation.json'),'utf8'));
function menuLinks(items,currentPath){return items.map(item=>{const links=menuLinks(item.items||[],currentPath);return {...item,handle:item.title.toLowerCase().replaceAll(' ','-'),links,current:item.url===currentPath,active:item.url===currentPath,child_active:links.some(link=>link.current||link.child_active)};});}
const footerNav=[['Shop All','/collections/all'],['New Arrivals','/collections/new-arrivals'],['Tops','/collections/tops'],['Bottoms','/collections/bottoms'],['Outerwear','/collections/outerwear'],['About','/pages/about'],['Contact','/pages/contact']].map(([title,url])=>({title,url,links:[]}));
function productObject(raw,index,url) {
 const variants=raw.variants.map((v,n)=>({...v,id:(index+1)*100+n,price:v.price*100,options:[v.color,v.size],available:v.inventory>0,inventory_management:'shopify',inventory_quantity:v.inventory,inventory_policy:'deny',quantity_rule:{min:1,increment:1,max:null},title:v.color+' / '+v.size,option1:v.color,option2:v.size}));
 const ids=url.searchParams.get('option_values')?.split(',').map(Number);
 let variant=variants.find(v=>String(v.id)===url.searchParams.get('variant'));
 if(ids)variant=variants.find(v=>v.color===['Black','White','Grey'][ids[0]-1]&&v.size===['Small','Medium','Large'][ids[1]-4]);
 variant ||= variants[0];
 const metafields={custom:Object.fromEntries(['material','fit','care','size_guide','model_profile'].map(k=>[k,{value:raw[k]}])),reviews:{}};
 const p={...raw,id:index+1,price:raw.price*100,price_min:raw.price*100,price_max:raw.price*100,price_varies:false,url:'/products/'+raw.handle,vendor:'SIDEFORM',object_type:'product',available:true,variants,variants_count:9,media:[],images:[],collections:[],metafields,selected_or_first_available_variant:variant,selected_variant:variant,description:`<p>${raw.description}</p>`,has_only_default_variant:false,requires_selling_plan:false};
 if(url.searchParams.get('gallery')==='media')p.tags=raw.tags.filter(tag=>tag!=='sf-four-photo-gallery');
 p.options_with_values=[{name:'Color',position:1,selected_value:variant.color,values:['Black','White','Grey'].map((name,i)=>new OptionValue(name,i+1,name===variant.color,true))},{name:'Size',position:2,selected_value:variant.size,values:['Small','Medium','Large'].map((name,i)=>new OptionValue(name,i+4,name===variant.size,variants.find(v=>v.color===variant.color&&v.size===name).available))}];
 if((photoReady&&url.searchParams.get('gallery')!=='fallback')||url.searchParams.get('gallery')==='media'){
  p.media=['Black','White','Grey'].flatMap((color,ci)=>['front','back','detail'].map((view,vi)=>{
   const id=ci*3+vi+1,src='/assets/sf-photo-'+raw.handle+'-'+color.toLowerCase()+'-'+view+'.jpg';
   const image={src,width:1122,height:1402,aspect_ratio:1122/1402,alt:`[color:${color}] AI-generated sample photograph ${raw.title}, ${color}, ${view==='front'?'on-model front':view} view`};
   return {...image,id,media_type:'image',preview_image:image,position:id};
  }));p.images=p.media;variants.forEach(v=>{v.featured_media=p.media.find(m=>m.alt.includes(`[color:${v.color}]`));v.featured_image=v.featured_media});p.featured_media=variant.featured_media||p.media[0];
 }
 return p;
}
function cartObject(products) {
 const items=bag.map((line,index)=>{
  const p=products.find(p=>p.variants.some(v=>v.id===line.id)),v=p.variants.find(v=>v.id===line.id);
  return {index,key:'preview-'+v.id,id:v.id,variant_id:v.id,image:v.featured_image,quantity:line.quantity,product:p,product_id:p.id,product_title:p.title,title:p.title,url:p.url+'?variant='+v.id,variant:v,options_with_values:[{name:'Color',value:v.color},{name:'Size',value:v.size}],original_price:v.price,final_price:v.price,price:v.price,original_line_price:v.price*line.quantity,final_line_price:v.price*line.quantity,line_level_discount_allocations:[],properties:{},has_only_default_variant:false,requires_shipping:true};
 });return Object.assign(new CartDrop(),{items,item_count:items.reduce((n,l)=>n+l.quantity,0),total_price:items.reduce((n,l)=>n+l.final_line_price,0),items_subtotal_price:items.reduce((n,l)=>n+l.final_line_price,0),currency:{iso_code:'USD'},cart_level_discount_applications:[],taxes_included:false});
}
function context(url){
 if(url.pathname.startsWith('/products/')&&!url.searchParams.has('section_id'))fallbackFixtureHandle=url.searchParams.get('gallery')==='fallback'?url.pathname.split('/')[2]:null;
 if(url.searchParams.has('section_id')&&url.pathname.endsWith('/'+fallbackFixtureHandle))url.searchParams.set('gallery','fallback');
 if(url.searchParams.get('gallery')==='media')mediaFixtureHandle=url.pathname.split('/')[2];
 if(url.searchParams.has('section_id')&&url.pathname.endsWith('/'+mediaFixtureHandle)&&!fallbackFixtureHandle)url.searchParams.set('gallery','media');
 const products=catalog.map((p,i)=>productObject(p,i,url));
 const collections=Object.fromEntries(['all','new-arrivals','tops','bottoms','outerwear'].map(handle=>[handle,{handle,title:handle==='all'?'Shop All':handle.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase()),url:'/collections/'+handle,products:products.filter(p=>handle==='all'||p.tags.includes(handle))}]));
 return {settings,products,collections,shop:{name:'SIDEFORM',customer_accounts_enabled:false,enabled_payment_types:[]},request:{locale:{iso_code:'en'},origin:'http://localhost:4173',design_mode:false},routes:{root_url:'/',all_products_collection_url:'/collections/all',collections_url:'/collections',search_url:'/search',predictive_search_url:'/search/suggest',cart_url:'/cart',cart_add_url:'/cart/add',cart_change_url:'/cart/change',cart_update_url:'/cart/update',account_login_url:'/account/login'},cart:cartObject(products),localization:{available_countries:[],available_languages:[]},linklists:{'main-menu':{links:menuLinks(menuDefinition.items,url.pathname)}},template:{name:'index'},form:{},recommendations:{performed:true,products:products.slice(1,5),products_count:4}};
}
function defaults(schema){return Object.fromEntries((schema.settings||[]).filter(s=>s.id&&s.default!==undefined).map(s=>[s.id,s.default]))}
async function renderSection(type,id,provided,ctx){
 const source=read('sections/'+type+'.liquid');const match=source.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);const schema=match?JSON.parse(match[1]):{};
 const secSettings={...defaults(schema),...provided.settings};
 if(type==='header') secSettings.menu=ctx.linklists['main-menu'];
 if(type==='sf-footer') secSettings.menu={links:footerNav};
 if(type==='featured-collection')secSettings.collection=ctx.collections[secSettings.collection];
 const blocks=(provided.block_order||Object.keys(provided.blocks||{})).map(b=>{const block=provided.blocks[b];const spec=schema.blocks?.find(s=>s.type===block.type)||{};const bs={...defaults(spec),...block.settings};if(block.type==='collection'&&bs.collection)bs.collection=ctx.collections[bs.collection];return {...block,id:b,settings:bs,shopify_attributes:''}});
 const globals={...ctx,section:{id,settings:secSettings,blocks,index:1}};
 const html=await engine.parseAndRender(source.replace(/{%\s*schema\s*%}[\s\S]*?{%\s*endschema\s*%}/,''),{}, {globals});
 return `<div id="shopify-section-${id}" class="shopify-section section ${schema.class||''}">${html}</div>`;
}
async function template(name,ctx){const data=JSON.parse(read('templates/'+name+'.json'));let html='';for(const id of data.order){html+=await renderSection(data.sections[id].type,id,data.sections[id],ctx)}return html}
async function drawer(ctx){return engine.renderFile('cart-drawer',{}, {globals:ctx})}
const headCss=`:root{--font-body-family:Arial,sans-serif;--font-heading-family:Arial,sans-serif;--font-body-style:normal;--font-heading-style:normal;--font-body-weight:400;--font-body-weight-bold:700;--font-heading-weight:700;--font-body-scale:1;--font-heading-scale:1;--color-background:250,250,247;--gradient-background:#fafaf7;--color-foreground:32,35,31;--color-button:32,35,31;--color-button-text:255,255,255;--color-secondary-button:250,250,247;--color-secondary-button-text:32,35,31;--color-shadow:0,0,0;--color-link:32,35,31;--alpha-link:1;--alpha-button-background:1;--alpha-button-border:1;--page-width:144rem;--page-width-margin:0rem;--grid-desktop-horizontal-spacing:18px;--grid-desktop-vertical-spacing:36px;--grid-mobile-horizontal-spacing:12px;--grid-mobile-vertical-spacing:24px;--buttons-radius:0px;--buttons-radius-outset:0px;--buttons-border-width:1px;--buttons-border-opacity:1;--buttons-shadow-opacity:0;--buttons-shadow-horizontal-offset:0px;--buttons-shadow-vertical-offset:0px;--buttons-shadow-blur-radius:0px;--inputs-radius:0px;--inputs-border-width:1px;--inputs-border-opacity:.5;--inputs-shadow-opacity:0;--variant-pills-radius:0px;--variant-pills-border-width:1px;--variant-pills-border-opacity:.5;--variant-pills-shadow-opacity:0;--product-card-image-padding:0rem;--product-card-corner-radius:0rem;--product-card-border-width:0rem;--product-card-border-opacity:0;--product-card-shadow-opacity:0;--product-card-text-alignment:left;--media-radius:0px;--media-border-width:0px;--media-border-opacity:0;--media-shadow-opacity:0;--drawer-border-width:1px;--drawer-border-opacity:.2;--drawer-shadow-opacity:0;--popup-border-width:1px;--popup-border-opacity:.2;--popup-shadow-opacity:0;--spacing-sections-desktop:0px;--spacing-sections-mobile:0px}*{box-sizing:border-box}html{font-size:62.5%}body{margin:0;font-size:1.5rem;line-height:1.6;background:#fafaf7;color:#20231f}.review-notice{background:#20231f;color:#fff;padding:8px 16px;text-align:center;font-size:10px;letter-spacing:.06em}.color-scheme-1,.color-scheme-2,.color-scheme-3,.color-scheme-4{color:rgb(var(--color-foreground));background:rgb(var(--color-background))}`;
async function layout(content,ctx){
 const hg=JSON.parse(read('sections/header-group.json'));let header='';for(const id of hg.order)header+=await renderSection(hg.sections[id].type,id,hg.sections[id],ctx);
 const footer=await renderSection('sf-footer','footer',{settings:{}},ctx);
 const js=['constants.js','pubsub.js','global.js','details-disclosure.js','details-modal.js','search-form.js','sideform.js'];
 const css=['base.css','component-cart-drawer.css','component-cart.css','component-cart-items.css','component-totals.css','component-price.css','component-discounts.css','sideform.css'];
 if(settings.predictive_search_enabled){css.push('component-predictive-search.css');js.push('predictive-search.js')}
 return `<!doctype html><html lang="en" class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SIDEFORM · Local Shopify review</title><style>${headCss}</style>${css.map(s=>`<link rel="stylesheet" href="/assets/${s}">`).join('')}<script>window.Shopify={designMode:false};window.StandardEvents={createViewEventElement:(Base=HTMLElement)=>class extends Base{connectedCallback(){}disconnectedCallback(){}dispatchViewEvent(){}}};window.shopUrl=location.origin;window.routes=${JSON.stringify(ctx.routes)};window.variantStrings={addToCart:'Add to cart',soldOut:'Sold out',unavailable:'Unavailable'};window.cartStrings={error:'Unable to update cart',quantityError:'Only [quantity] available'};window.accessibilityStrings={imageAvailable:'Image [index] available',shareSuccess:'Link copied'};</script>${js.map(s=>`<script src="/assets/${s}" defer></script>`).join('')}</head><body><a class="skip-to-content-link button visually-hidden" href="#MainContent">Skip to content</a>${await drawer(ctx)}${header}<main id="MainContent" tabindex="-1">${content}</main>${footer}<script src="/assets/cart-drawer.js" defer></script></body></html>`;
}
async function sections(ctx){return {'cart-drawer':await drawer(ctx),'cart-icon-bubble':`<div class="shopify-section">${await engine.renderFile('cart-icon-bubble',{}, {globals:ctx})}</div>`}}
async function parseBody(req){let text='';for await (const part of req)text+=part; if(req.headers['content-type']?.includes('json'))return JSON.parse(text);if(req.headers['content-type']?.includes('multipart')){const fields={};for(const m of text.matchAll(/name="([^"]+)"\r\n\r\n([\s\S]*?)(?=\r\n--)/g))fields[m[1]]=m[2];return fields}return Object.fromEntries(new URLSearchParams(text))}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost:4173');const ctx=context(url);
  const send=(data,type='text/html',status=200)=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});res.end(data)};
  if(url.pathname.startsWith('/assets/')){const filename=path.join(theme,url.pathname);if(!filename.startsWith(theme+path.sep))return send('Forbidden','text/plain',403);const ext=path.extname(filename);return send(fs.readFileSync(filename),({'.svg':'image/svg+xml','.png':'image/png','.js':'text/javascript','.css':'text/css'})[ext]||'text/plain')}
  if(url.pathname==='/contact'&&req.method==='POST')return send(await layout('<section class="page-width" style="padding-block:70px"><h1>Contact form preview</h1><p>This local preview does not send messages. The Shopify contact form sends enquiries after the theme is configured in your store.</p><a href="/pages/contact">Return to Contact</a></section>',ctx));
  if(url.pathname==='/photo-review')return send(fs.readFileSync(path.join(__dirname,'photography-review.html'),'utf8'));
  if(url.pathname==='/favicon.ico')return send('','text/plain',204);
  if(url.pathname==='/cart.json'||url.pathname==='/cart.js')return send(JSON.stringify(ctx.cart),'application/json');
  if(['/cart/add','/cart/add.js','/cart/change','/cart/change.js','/cart/update','/cart/update.js'].includes(url.pathname)&&req.method==='POST'){
   const body=await parseBody(req);
   if(url.pathname.includes('/add')){const p=ctx.products.find(p=>p.variants.some(v=>v.id==body.id)),v=p?.variants.find(v=>v.id==body.id);const qty=Number(body.quantity||1);const old=bag.find(l=>l.id===v?.id);if(!v||qty<1||!v.available||qty+(old?.quantity||0)>v.inventory_quantity)return send(JSON.stringify({status:422,description:'This sample variant is sold out or exceeds the sample stock.'}),'application/json',422);if(old)old.quantity+=qty;else bag.push({id:v.id,quantity:qty})}
   if(url.pathname.includes('/change')){const line=bag[Number(body.line)-1];if(line){const v=ctx.products.flatMap(p=>p.variants).find(v=>v.id===line.id);if(Number(body.quantity)>v.inventory_quantity)return send(JSON.stringify({errors:'Quantity exceeds sample inventory'}),'application/json',422);line.quantity=Number(body.quantity);bag=bag.filter(l=>l.quantity>0)}}
   const next=context(url);return send(JSON.stringify({...next.cart,id:Number(body.id),sections:await sections(next)}),'application/json');
  }
  if(url.pathname==='/cart'&&url.searchParams.has('section_id'))return send(await drawer(ctx));
  if(url.pathname==='/checkout')return send(await layout('<section class="page-width" style="padding-block:70px"><h1>Checkout route reached</h1><p>This local fixture cannot open Shopify hosted checkout. Upload the theme to a development store to validate checkout navigation and test payments.</p><a href="/collections/all">Continue browsing</a></section>',ctx));
  if(url.pathname==='/cart'&&req.method==='POST'){res.writeHead(303,{Location:'/checkout'});return res.end()}
  let content;
  if(url.pathname.startsWith('/products/')){
   const product=ctx.products.find(p=>p.handle===url.pathname.split('/')[2]);if(!product)return send('Product not found','text/plain',404);ctx.product=product;ctx.template.name='product';
   if(url.searchParams.has('no_size_guide'))ctx.product.metafields.custom.size_guide=null;
   if(url.searchParams.has('section_id')){const data=JSON.parse(read('templates/product.json'));return send(await renderSection('main-product','main',data.sections.main,ctx))}
   content=await template('product',ctx);
  }else if(url.pathname.startsWith('/collections/')){
   ctx.collection={...(ctx.collections[url.pathname.split('/')[2]]||ctx.collections.all)};ctx.collection.description='COLLECTION 001 / OFF THE GRID';ctx.collection.all_products_count=ctx.collection.products.length;
   ctx.collection.products_count=ctx.collection.products.length;ctx.collection.default_sort_by='manual';ctx.collection.sort_by=url.searchParams.get('sort_by')||'manual';ctx.collection.sort_options=[{value:'manual',name:'Featured'},{value:'price-ascending',name:'Price, low to high'},{value:'price-descending',name:'Price, high to low'}];ctx.collection.filters=[];
   if(ctx.collection.sort_by.startsWith('price'))ctx.collection.products=[...ctx.collection.products].sort((a,b)=>ctx.collection.sort_by.endsWith('ascending')?a.price-b.price:b.price-a.price);
   content=await template('collection',ctx);
  }else if(url.pathname==='/search/suggest'){
   const q=(url.searchParams.get('q')||'').trim();
   ctx.predictive_search={performed:true,terms:q,resources:{products:q?ctx.products.filter(p=>(p.title+' '+p.type).toLowerCase().includes(q.toLowerCase())).slice(0,6):[],queries:[],collections:[],pages:[],articles:[]}};
   return send(await renderSection('predictive-search','predictive-search',{settings:{}},ctx));
  }else if(url.pathname==='/search'){
   const q=url.searchParams.get('q')||'';const results=ctx.products.filter(p=>(p.title+' '+p.type).toLowerCase().includes(q.toLowerCase()));ctx.search={performed:!!q,terms:q,results,results_count:results.length,filters:[],sort_options:[{name:'Relevance',value:'relevance'}],sort_by:'relevance'};content=await template('search',ctx);
  }else if(url.pathname==='/cart'){content=await template('cart',ctx)}
  else if(url.pathname==='/pages/contact'){ctx.page={title:'Contact',content:'<p>Questions about SIDEFORM pieces, fit or your order? Get in touch using the form below.</p>'};content=await template('page.contact',ctx)}
  else if(url.pathname.startsWith('/pages/')){content=await renderSection('sf-perspective','about',{settings:{heading:'Streetwear. In your own form.',text:'<p>SIDEFORM is a streetwear brand built around oversized silhouettes, utility details and a neutral palette. From heavyweight tees and hoodies to cargo pants and jackets, each piece is made for layering, movement and everyday city life.</p>',spacing:100}},ctx)}
  else if(url.pathname==='/recommendations/products'){return send(await renderSection('related-products','related-products',{settings:{products_to_show:4,heading:'Complete your everyday',columns_desktop:4,columns_mobile:'2',image_ratio:'portrait'}},ctx))}
  else content=await template('index',ctx);
  send(await layout(content,ctx));
 }catch(error){console.error(error.stack);res.writeHead(500,{'Content-Type':'text/plain'});res.end('Local fixture rendering error: '+error.message)}
});
server.listen(4173,'127.0.0.1',()=>console.log('SIDEFORM local review: http://localhost:4173 (Shopify endpoints emulated)'));

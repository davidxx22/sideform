"""Regenerate the clearly labeled SIDEFORM sample catalog and merchandising files."""
from pathlib import Path
import json, csv
ROOT = Path(__file__).resolve().parents[1]
def write(path, text):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8', newline='\n')
def jwrite(path, data): write(path, json.dumps(data, indent=2, ensure_ascii=False)+'\n')
# Twelve distinct products. All values below are sample merchandising, not claims.
specs=[
('Offset Heavy Tee','Oversized T-shirt',42,'A dropped-shoulder everyday tee with a small offset chest mark.','240 gsm cotton jersey','Wide body, dropped shoulders, oversized sleeves.',[60,72,58,24]),
('Plain Box Tee','Oversized T-shirt',45,'A box-cut tee with a clean neckline and a shorter, structured body.','260 gsm cotton jersey','Boxy and oversized with a slightly cropped body.',[62,68,60,23]),
('Axis Long Sleeve','Long-sleeve T-shirt',54,'An easy long sleeve with a small chest mark and ribbed cuffs.','220 gsm cotton jersey','Relaxed body with long, dropped sleeves.',[59,73,57,59]),
('Frame Long Sleeve','Long-sleeve T-shirt',58,'A wide long sleeve shaped by subtle panel seams.','240 gsm cotton jersey','Wide torso, dropped shoulder, straight hem.',[61,71,59,58]),
('Volume Pullover','Hoodie',88,'A generous pullover with a double-layer hood and front pocket.','400 gsm cotton-rich loopback; 80% cotton, 20% polyester','Oversized with a roomy hood and ribbed hem.',[64,71,62,58]),
('Structure Hoodie','Hoodie',94,'A shorter hoodie with a broad shoulder and discreet offset mark.','420 gsm cotton-rich fleece; 80% cotton, 20% polyester','Boxy through the body with a slightly cropped hem.',[66,68,64,57]),
('Contour Crew','Crewneck Sweatshirt',76,'A crewneck sweatshirt with an open silhouette and restrained rib detailing.','380 gsm cotton-rich loopback; 80% cotton, 20% polyester','Relaxed and wide with a dropped shoulder.',[62,70,60,58]),
('Shell Utility Jacket','Streetwear Jacket',128,'A light utility layer with broad panels and two front pockets.','Cotton-nylon woven shell; 65% cotton, 35% nylon','Oversized outer layer with room for a sweatshirt.',[65,73,61,60]),
('Transit Work Jacket','Streetwear Jacket',138,'A square workwear-inspired jacket with a straight hem and patch pockets.','320 gsm cotton canvas','Boxy, wide shoulder, hip-length body.',[64,69,60,59]),
('Grid Cargo Pant','Cargo Pants',98,'A loose cargo pant with straight legs and low-profile utility pockets.','260 gsm cotton twill','Loose through hip and thigh; straight wide leg.',[38,56,73,102]),
('Drift Baggy Jean','Baggy Jeans',108,'A wide denim silhouette with a long line and clean rear pockets.','12 oz cotton denim','Baggy through seat and leg, full length.',[38,57,76,106]),
('Interval Utility Short','Streetwear Shorts',68,'A wide everyday short with utility pockets and a clean knee-length line.','240 gsm cotton twill','Relaxed hip, wide leg opening, knee length.',[37,55,27,56])]
NEW_ARRIVALS={'volume-pullover','structure-hoodie','shell-utility-jacket','transit-work-jacket'}
catalog=[];rows=[];metafields=[];inventory=[];media=[]
headers=['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published','Option1 Name','Option1 Value','Option2 Name','Option2 Value','Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy','Variant Fulfillment Service','Variant Price','Variant Requires Shipping','Variant Taxable','Status']
for n,(title,kind,price,description,material,fit,base) in enumerate(specs,1):
 handle='plane-box-tee' if title=='Plain Box Tee' else title.lower().replace(' ','-'); bottom=kind in ['Cargo Pants','Baggy Jeans','Streetwear Shorts'];group='bottoms' if bottom else 'outerwear' if kind=='Streetwear Jacket' else 'tops'
 care='Machine wash cold with similar colors. Wash inside out. Line dry. Do not bleach. Follow the verified care label before use.'
 guide=dict(sample=True,unit='cm',basis='garment_flat',columns=['Waist width','Hip width','Inseam','Overall length'] if bottom else ['Chest width','Body length','Shoulder width','Sleeve length'],rows=[dict(size=size,values=[v+i*inc for v,inc in zip(base,[2,2,1,2] if bottom else [3,2,2,1])]) for i,size in enumerate(['Small','Medium','Large'])],instructions='Lay the garment flat without stretching. Waist: across the waistband. Hip: across the fullest seat. Inseam: crotch seam to hem. Overall length: waistband top to hem along the outer seam.' if bottom else 'Lay the garment flat without stretching. Chest: armpit to armpit. Body length: high shoulder beside the neck to hem. Shoulder: seam to seam across the back. Sleeve: shoulder seam to cuff.')
 body=f'<p>{description}</p><p><strong>Material (sample):</strong> {material}</p><p><strong>Fit:</strong> {fit}</p><p><strong>Care:</strong> {care}</p><p>Demonstration product. Specifications, pricing and measurements require merchant verification.</p>'
 tags=['sample-data','ai-sample-media','sf-four-photo-gallery',group]+(['new-arrivals'] if handle in NEW_ARRIVALS else [])
 category='sweatshirts' if kind in ['Crewneck Sweatshirt','Long-sleeve T-shirt'] else 'hoodies' if kind=='Hoodie' else 't-shirts' if 'T-shirt' in kind else 'pants' if kind in ['Cargo Pants','Baggy Jeans'] else 'jackets' if kind=='Streetwear Jacket' else 'shorts' if kind=='Streetwear Shorts' else None
 if category:tags.append(category)
 tags.append('collection-002' if handle in NEW_ARRIVALS else 'collection-001')
 item=dict(handle=handle,title=title,type=kind,price=price,description=description,material=material,fit=fit,care=care,tags=tags,size_guide=guide,variants=[])
 for ci,color in enumerate(['Black','White','Grey']):
  for si,size in enumerate(['Small','Medium','Large']):
   sku=f'SF-{n:03}-{color[:3].upper()}-{size[0]}'; qty=0 if ci==2 and si==2 else 12+si*4
   variant=dict(sku=sku,color=color,size=size,price=price,inventory=qty);item['variants'].append(variant)
   first=ci==0 and si==0
   rows.append(dict(zip(headers,[handle,title if first else '',body if first else '', 'SIDEFORM' if first else '',kind if first else '',', '.join(tags) if first else '', 'FALSE' if first else '', 'Color',color,'Size',size,sku,350 if not bottom else 650,'shopify',qty,'deny','manual',f'{price:.2f}','TRUE','TRUE','draft' if first else ''])))
   inventory.append(dict(Handle=handle,SKU=sku,Color=color,Size=size,SampleQuantity=qty))
  for view in ['front','back','detail']:
   media.append(dict(Handle=handle,Color=color,View=view,Alt=f'[color:{color}] AI-generated sample photograph — {title}, {color}, {view} view.',PhotoAsset=f'sf-photo-{handle}-{color.lower()}-{view}.jpg',Replacement=f'{handle}-{color.lower()}-{view}.jpg'))
 item['model_profile']={'height_cm':173 if handle in ['plane-box-tee','frame-long-sleeve','shell-utility-jacket','grid-cargo-pant','interval-utility-short'] else 185,'wearing_size':'Medium' if handle in ['plane-box-tee','frame-long-sleeve','shell-utility-jacket','grid-cargo-pant','interval-utility-short'] else 'Large','assumed':True}
 catalog.append(item)
 metafields.append(dict(handle=handle,metafields=[dict(namespace='custom',key=key,type=typ,value=json.dumps(val) if typ=='json' else val) for key,typ,val in [('material','multi_line_text_field',material),('fit','multi_line_text_field',fit),('care','multi_line_text_field',care),('size_guide','json',guide),('model_profile','json',item['model_profile'])]]))
def csvwrite(path, data, fields):
 with (ROOT/path).open('w',encoding='utf-8',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(data)
csvwrite('catalog/sideform-products.csv',rows,headers)
csvwrite('catalog/sample-inventory-reference.csv',inventory,list(inventory[0]))
csvwrite('catalog/media-upload-reference.csv',media,list(media[0]))
jwrite('catalog/catalog.json',catalog);jwrite('catalog/product-metafields.json',metafields)
jwrite('catalog/metafield-definitions.json',[dict(name=key.replace('_',' ').title(),namespace='custom',key=key,type=typ,ownerType='PRODUCT',access={'storefront':'PUBLIC_READ'}) for key,typ in [('material','multi_line_text_field'),('fit','multi_line_text_field'),('care','multi_line_text_field'),('size_guide','json'),('model_profile','json')]])
jwrite('catalog/collections.json',[dict(title=title,handle=handle,condition=condition) for title,handle,condition in [('Shop All','all','Native /collections/all includes all published products'),('New Arrivals','new-arrivals','Tag equals new-arrivals'),('Tops','tops','Tag equals tops'),('Bottoms','bottoms','Tag equals bottoms'),('Outerwear','outerwear','Tag equals outerwear'),('Hoodies','hoodies','Tag equals hoodies'),('T-shirts','t-shirts','Tag equals t-shirts'),('Pants','pants','Tag equals pants'),('Jackets','jackets','Tag equals jackets'),('Shorts','shorts','Tag equals shorts'),('Sweatshirts & long sleeves','sweatshirts','Tag equals sweatshirts'),('Collection 001','collection-001','Tag equals collection-001'),('Collection 002','collection-002','Tag equals collection-002')]])
print('Generated 12 products, 108 variants, 108 photo-upload entries, and sample metafields.')

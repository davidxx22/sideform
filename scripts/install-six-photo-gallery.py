"""Install generated gallery originals as optimized storefront WebP assets."""
from pathlib import Path
import json, sys, shutil, csv, hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tooling/python'))
from PIL import Image
ASSETS=ROOT/'theme/assets'
SOURCE=ROOT/'catalog/six-photo-gallery'
GENDERS={'offset-heavy-tee':'male','plane-box-tee':'female','axis-long-sleeve':'male','frame-long-sleeve':'female','volume-pullover':'male','structure-hoodie':'male','contour-crew':'male','shell-utility-jacket':'female','transit-work-jacket':'male'}
ORDER=['male','duolow','duofull','female','lineup','detail']
BOTTOM_GENDERS={'grid-cargo-pant':'male','drift-baggy-jean':'male','interval-utility-short':'female'}
def bottom_order(handle):
    return ['female','duoclose','duofull','male','lineup','detail'] if BOTTOM_GENDERS[handle]=='female' else ['male','duoclose','duofull','female','lineup','detail']
records=[]
for file in sorted(SOURCE.glob('*.json')):
 if file.name=='generation.json' or not file.stat().st_size:continue
 record=json.loads(file.read_text(encoding='utf-8-sig'))
 if not record.get('source'):continue
 original=SOURCE/(file.stem+'.png')
 if not original.exists():raise SystemExit(f'Missing original: {original}')
 handle,color,view=(record[k] for k in ['handle','color','view'])
 prefix='sf-photo' if handle not in GENDERS and view=='front' else 'sf-gallery'
 for suffix,size in [('',(1122,1402)),('-480',(480,600))]:
  target=ASSETS/f'{prefix}-{handle}-{color}-{view}{suffix}.webp'
  if not target.exists() or target.stat().st_mtime<original.stat().st_mtime:
   with Image.open(original) as image:
    image=image.convert('RGB').resize(size,Image.Resampling.LANCZOS)
    image.save(target,'WEBP',quality=85,method=6)
    # Keep the source JPEG in sync so rebuilds and the native media export agree.
    if handle in BOTTOM_GENDERS and view in ['front','full']:image.save(target.with_suffix('.jpg'),'JPEG',quality=93,optimize=True)
 record['original']='catalog/six-photo-gallery/'+original.name
 record['asset']=target.name.replace('-480.webp','.webp')
 records.append(record)
for handle,gender in (GENDERS|BOTTOM_GENDERS).items():
 for color in ['black','white','grey']:
  for suffix in ['','-480']:
   shutil.copyfile(ASSETS/f'sf-photo-{handle}-{color}-front{suffix}.webp',ASSETS/f'sf-gallery-{handle}-{color}-{gender}{suffix}.webp')
expected=[]
for handle,gender in GENDERS.items():
 missing_gender='female' if gender=='male' else 'male'
 for color in ['black','white','grey']:
  expected.extend((handle,color,v) for v in [missing_gender,'duolow','duofull'])
expected.extend(('grid-cargo-pant',c,v) for c in ['black','white','grey'] for v in ['front','full'])
expected.extend((h,c,'front') for h in ['drift-baggy-jean','interval-utility-short'] for c in ['black','white','grey'])
for handle,gender in BOTTOM_GENDERS.items():
 for color in ['black','white','grey']:
  expected.extend((handle,color,v) for v in ['female' if gender=='male' else 'male','duoclose','duofull'])
present={(r['handle'],r['color'],r['view']) for r in records}
missing=[key for key in expected if key not in present]
manifest={'tool':'built-in image_gen','scope':'All 12 products have six views per color. Bottoms retain their primary model first, paired close-up and full-body poses, companion model, hanger lineup and detail. Original studio background preserved.','order':ORDER,'bottom_orders':{h:bottom_order(h) for h in BOTTOM_GENDERS},'main_models':{'grid-cargo-pant':'curly-haired male','drift-baggy-jean':'Black male','interval-utility-short':'female'},'outputs':records,'missing':missing}
(SOURCE/'generation.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# Export the exact active color/view order, distinct from the retained source library.
catalog=json.loads((ROOT/'catalog/catalog.json').read_text(encoding='utf-8'))
media=[]
for product in catalog:
 handle=product['handle']
 views=bottom_order(handle) if handle in BOTTOM_GENDERS else ORDER
 for color_index,color in enumerate(['black','white','grey']):
  for index,view in enumerate(views):
   prefix='sf-gallery' if view in ['male','female','duolow','duofull','duoclose','lineup','full'] else 'sf-photo'
   file=ASSETS/f'{prefix}-{handle}-{color}-{view}.webp'
   if not file.exists():raise SystemExit(f'Missing active asset: {file}')
   media.append({'Handle':handle,'Color':color.title(),'View':view,'ColorPosition':index+1,'ProductPosition':color_index*len(views)+index+1,'Asset':file.name,'Alt':f'[color:{color.title()}] AI-generated sample photograph - {product["title"]}, {color}, {view} view.','SHA256':hashlib.sha256(file.read_bytes()).hexdigest()})
with (SOURCE/'media-manifest.csv').open('w',newline='',encoding='utf-8') as f:
 writer=csv.DictWriter(f,fieldnames=media[0].keys());writer.writeheader();writer.writerows(media)
legacy=ROOT/'catalog/product-photo-manifest.csv'
with legacy.open(encoding='utf-8-sig',newline='') as f:
 reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
for row in rows:
 asset=ASSETS/row['PhotoAsset']
 row['SHA256']=hashlib.sha256(asset.read_bytes()).hexdigest()
 if row['Handle'] not in GENDERS and row['View']=='front':
  row['Original']='six-photo-gallery/'+row['Handle']+'-'+row['Color'].lower()+'-front.png'
with legacy.open('w',encoding='utf-8',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
print(f'Installed {len(records)} generated photographs; {len(missing)} still missing.')
if missing and '--partial' not in sys.argv:raise SystemExit(1)

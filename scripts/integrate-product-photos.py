"""Connect the complete photo library after all delivery assets exist."""
from pathlib import Path
import csv,itertools,json,shutil
root=Path(__file__).resolve().parents[1]
products=json.loads((root/'catalog/catalog.json').read_text(encoding='utf-8'))
for p in products:
    for color,view in itertools.product(['black','white','grey'],['front','back','detail']):
        for suffix in ['','-480']:
            asset=root/'theme/assets'/f'sf-photo-{p["handle"]}-{color}-{view}{suffix}.jpg'
            if not asset.exists():raise SystemExit('Finish photo generation/encoding before integration: '+asset.name)

for filename in ['theme/sections/main-product.liquid','theme/snippets/card-product.liquid','theme/snippets/cart-drawer.liquid','theme/sections/main-cart-items.liquid','theme/assets/sideform.css','theme/assets/sideform.js']:
    path=root/filename;s=path.read_text(encoding='utf-8')
    s=s.replace('sf-demo-image','sf-product-image').replace('sf-demo-gallery','sf-photo-gallery').replace('SfDemoGallery','SfPhotoGallery').replace('sf-card-demo','sf-card-photo').replace('sf-cart-demo','sf-cart-photo')
    if filename.endswith('sideform.js'):
        s=s.replace("this.color = 'black'; this.view = 'front';", "this.color = this.dataset.color || 'black'; this.view = 'front';")
        s=s.replace("selectColor(color) { this.color = color.toLowerCase(); this.view = 'front'; this.render(); }", "selectColor(color) { const next = color.toLowerCase(); if (next === this.color) return; this.color = next; this.view = 'front'; this.render(); }")
        s=s.replace("img.src = img.src.replace(/-(black|white|grey)-(front|back|detail)\\.svg/, `-${this.color}-${view}.svg`);", "const replacePhoto = url => url.replace(/-(black|white|grey)-(front|back|detail)(-480)?\\.jpg/g, (_, oldColor, oldView, small) => `-${this.color}-${view}${small || ''}.jpg`);\n        img.src = replacePhoto(img.src);\n        if (img.srcset) img.srcset = replacePhoto(img.srcset);")
    if filename.endswith('main-product.liquid'):
        target="{% if product.media.size > 0 %}{% render 'product-media-gallery'"
        s=s.replace(target,"{% if product.media.size > 0 %}{% if product.tags contains 'ai-sample-media' %}<p class=\"sf-sample-note\">AI-generated sample photography</p>{% endif %}{% render 'product-media-gallery'")
    path.write_text(s,encoding='utf-8')

# Add an explicit origin tag without changing product names, prices or variants.
for p in products:
    if 'ai-sample-media' not in p['tags']:p['tags'].append('ai-sample-media')
(root/'catalog/catalog.json').write_text(json.dumps(products,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
path=root/'catalog/sideform-products.csv'
with path.open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
for row in rows:
    if row['Title'] and 'ai-sample-media' not in row['Tags']:row['Tags']+=', ai-sample-media'
with path.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)

# Preserve the superseded drawings outside the uploadable theme.
archive=root/'catalog/legacy-illustrations';archive.mkdir(exist_ok=True)
for path in (root/'theme/assets').glob('sf-demo-*.svg'):shutil.move(str(path),str(archive/path.name))
for name in ['sf-demo-image.liquid','sf-demo-gallery.liquid']:
    path=root/'theme/snippets'/name
    if path.exists():shutil.move(str(path),str(archive/name))
for path in [root/'catalog/media-replacement-manifest.csv',root/'scripts/generate-demo-assets.py']:
    if path.exists():shutil.move(str(path),str(archive/path.name))
print('Photo library integrated. Original illustrations archived outside the theme.')

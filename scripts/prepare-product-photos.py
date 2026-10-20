"""Web-encode generated originals without creative edits or cropping.
Preserves every PNG original and makes full-size and small responsive JPEG copies.
"""
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tooling/python'))
from PIL import Image
import csv, hashlib, itertools, json

products=json.loads((root/'catalog/catalog.json').read_text(encoding='utf-8'))
rows=[]
missing=[]
for p in products:
    for color,view in itertools.product(['Black','White','Grey'],['front','back','detail']):
        stem=f'{p["handle"]}-{color.lower()}-{view}'
        original=root/'catalog/product-photos'/f'{stem}.png'
        model=root/'catalog/model-photos'/f'{stem}.png'
        if view=='front' and model.exists():
            original=model
        if not original.exists():
            missing.append(stem)
            continue
        asset=f'sf-photo-{stem}.jpg'
        output=root/'theme/assets'/asset
        with Image.open(original) as image:
            image.verify()
        with Image.open(original) as image:
            rgb=image.convert('RGB')
            rgb.save(output,quality=86,optimize=True,progressive=True)
            thumb=rgb.copy()
            thumb.thumbnail((480,600),Image.Resampling.LANCZOS)
            thumb.save(output.with_name(output.stem+'-480.jpg'),quality=84,optimize=True,progressive=True)
            width,height=rgb.size
        presentation='on-model front' if original==model else view
        rows.append(dict(Handle=p['handle'],Color=color,View=view,Alt=f'[color:{color}] AI-generated sample photograph — {p["title"]}, {color}, {presentation} view.',PhotoAsset=asset,Original=original.relative_to(root/'catalog').as_posix(),Width=width,Height=height,SHA256=hashlib.sha256(output.read_bytes()).hexdigest(),MerchantVerification='AI sample: verify against manufactured garment before launch'))
with (root/'catalog/product-photo-manifest.csv').open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]) if rows else ['Handle','Color','View','PhotoAsset'])
    writer.writeheader();writer.writerows(rows)
(root/'catalog/photo-status.json').write_text(json.dumps(dict(expected=108,completed=len(rows),missing=missing),indent=2),encoding='utf-8')
print(f'Encoded {len(rows)}/108 original photographs; {len(missing)} pending. Originals retained without edits.')

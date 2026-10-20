from pathlib import Path
import sys,csv,hashlib,itertools,json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tooling/python'))
from PIL import Image,ImageStat
products=json.loads((root/'catalog/catalog.json').read_text(encoding='utf-8'))
records=json.loads((root/'catalog/photo-generation.json').read_text(encoding='utf-8-sig'))['images']
model_records=json.loads((root/'catalog/model-generation.json').read_text(encoding='utf-8'))['images']
assert len(model_records)==36
assert {(r['handle'],r['color']) for r in model_records}=={(p['handle'],c) for p in products for c in ['black','white','grey']}
expected={(p['handle'],c,v) for p in products for c,v in itertools.product(['black','white','grey'],['front','back','detail'])}
actual={(r['handle'],r['color'],r['view']) for r in records}
assert actual==expected and len(records)==108,(len(records),expected-actual)
hashes=set();total=0;front_values={}
for handle,color,view in sorted(expected):
    path=root/'theme/assets'/f'sf-photo-{handle}-{color}-{view}.jpg'
    small=path.with_name(path.stem+'-480.jpg')
    assert path.exists() and small.exists()
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as image:
        w,h=image.size;assert w>=1000 and h>=1000 and abs(w/h-.8)<.04,(path.name,w,h)
        if view=='front':
            # Sample the visible garment, clear of face, hands and styling pieces.
            bottom=handle in ['grid-cargo-pant','drift-baggy-jean','interval-utility-short']
            box=(.42,.56,.48,.60) if bottom else (.45,.53,.55,.58)
            region=image.convert('L').crop((int(w*box[0]),int(h*box[1]),int(w*box[2]),int(h*box[3])))
            front_values[(handle,color)]=ImageStat.Stat(region).mean[0]
            original=root/'catalog/model-photos'/f'{handle}-{color}-front.png'
            assert original.exists(),original
    with Image.open(small) as image:assert image.width<=480 and image.height<=600
    hashes.add(hashlib.sha256(path.read_bytes()).hexdigest());total+=path.stat().st_size+small.stat().st_size
assert len(hashes)==108,'Duplicate delivery images found'
for p in products:
    handle=p['handle'];b,w,g=[front_values[(handle,c)] for c in ['black','white','grey']]
    assert b+30<g and g+30<w,(handle,b,g,w)
assert not list((root/'theme/assets').glob('sf-demo-*.svg')),'Legacy drawings still in uploadable theme'
manifest=list(csv.DictReader((root/'catalog/product-photo-manifest.csv').open(encoding='utf-8')))
assert len(manifest)==108 and len({row['PhotoAsset'] for row in manifest})==108
assert all(row['Original'].startswith('model-photos/') and 'on-model front' in row['Alt'] for row in manifest if row['View']=='front')
result=dict(products=12,individual_photos=108,on_model_fronts=36,responsive_jpegs=216,unique_photos=len(hashes),delivery_bytes=total,checks=['complete product/color/view matrix','all JPEGs decode','portrait aspect ratio','unique files','36 on-model originals and prompts','Black < Grey < White garment luminance','legacy drawings removed','108-row media manifest'])
(root/'artifacts/photo-validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))

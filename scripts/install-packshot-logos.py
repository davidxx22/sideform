"""Install imagegen chest-mark edits for upper garments; preserve all bottoms."""
from pathlib import Path
import hashlib,json,shutil,sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tooling/python'))
from PIL import Image,ImageOps,ImageDraw
allowed={'plane-box-tee','frame-long-sleeve','volume-pullover','contour-crew','shell-utility-jacket','transit-work-jacket'}
records=json.loads((root/'catalog/packshot-logo-generation.json').read_text(encoding='utf-8'))['images']
assert {(r['handle'],r['color']) for r in records}=={(h,c) for h in allowed for c in ['black','white','grey']}
bottoms=list((root/'theme/assets').glob('sf-packshot-grid-cargo-pant-*.jpg'))+list((root/'theme/assets').glob('sf-packshot-drift-baggy-jean-*.jpg'))+list((root/'theme/assets').glob('sf-packshot-interval-utility-short-*.jpg'))
before={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in bottoms}
target=root/'catalog/branded-packshots';target.mkdir(exist_ok=True)
sheet=Image.new('RGB',(900,6*400),'#fafaf7');draw=ImageDraw.Draw(sheet)
for row,handle in enumerate(sorted(allowed)):
    for col,color in enumerate(['black','white','grey']):
        record=next(r for r in records if r['handle']==handle and r['color']==color)
        name=f'{handle}-{color}-front'
        shutil.copy2(record['source'],target/(name+'.png'))
        with Image.open(target/(name+'.png')) as source:
            image=source.convert('RGB').resize((1122,1402),Image.Resampling.LANCZOS)
            image.save(root/'theme/assets'/('sf-packshot-'+name+'.jpg'),quality=89,optimize=True,progressive=True)
            thumb=image.copy();thumb.thumbnail((480,600),Image.Resampling.LANCZOS)
            thumb.save(root/'theme/assets'/('sf-packshot-'+name+'-480.jpg'),quality=87,optimize=True,progressive=True)
            review=ImageOps.contain(image,(300,370));sheet.paste(review,(col*300+(300-review.width)//2,row*400))
            draw.text((col*300+8,row*400+373),handle+' / '+color,fill='black')
assert before=={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in bottoms}
(root/'artifacts/packshot-bottoms-unchanged.json').write_text(json.dumps(before,indent=2),encoding='utf-8')
sheet.save(root/'artifacts/packshot-logo-review.jpg',quality=90)
print('Installed 18 upper-garment logo edits. All 18 bottom delivery files are unchanged.')

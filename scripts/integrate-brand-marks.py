"""Install the approved chest-logo image edits; never modify bottoms."""
from pathlib import Path
import csv,hashlib,json,shutil
root=Path(__file__).resolve().parents[1]
metadata=json.loads((root/'catalog/logo-generation.json').read_text(encoding='utf-8'))
allowed={'plane-box-tee','frame-long-sleeve','volume-pullover','contour-crew','shell-utility-jacket','transit-work-jacket'}
records=metadata['images']
assert len(records)==18 and {(r['handle'],r['color']) for r in records}=={(h,c) for h in allowed for c in ['black','white','grey']}
original_bottoms=json.loads((root/'catalog/bottoms-before-branding.sha256.json').read_text(encoding='utf-8'))
for name,digest in original_bottoms.items():assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
for r in records:assert (root/'catalog/branded-model-photos'/f'{r["handle"]}-{r["color"]}-front.png').exists()
archive=root/'catalog/model-photos-before-branding';archive.mkdir(exist_ok=True)
model_path=root/'catalog/model-generation.json'
backup=root/'catalog/model-generation-before-branding.json'
if not backup.exists():shutil.copy2(model_path,backup)
models=json.loads(model_path.read_text(encoding='utf-8'))
for r in records:
    name=f'{r["handle"]}-{r["color"]}-front.png'
    current=root/'catalog/model-photos'/name
    if not (archive/name).exists():shutil.copy2(current,archive/name)
    shutil.copy2(root/'catalog/branded-model-photos'/name,current)
    old=next(image for image in models['images'] if image['handle']==r['handle'] and image['color']==r['color'])
    old.update(r,view='front',presentation='on-model',path=f'catalog/model-photos/{name}',branding='Two offset horizontal rectangles on upper left chest')
model_path.write_text(json.dumps(models,indent=2)+'\n',encoding='utf-8')
catalog_path=root/'catalog/catalog.json'
products=json.loads(catalog_path.read_text(encoding='utf-8'))
updated={}
for p in products:
    if p['handle'] in allowed:
        before=p['description']
        addition=' Finished with the small SIDEFORM offset chest mark.'
        if addition not in before:p['description']+=addition
        updated[p['handle']]=(before,p['description'])
catalog_path.write_text(json.dumps(products,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
csv_path=root/'catalog/sideform-products.csv'
with csv_path.open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
for row in rows:
    if row['Title'] and row['Handle'] in updated:
        before,after=updated[row['Handle']]
        row['Body (HTML)']=row['Body (HTML)'].replace('<p>'+before+'</p>','<p>'+after+'</p>',1)
with csv_path.open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
print('Installed 18 chest-logo edits; previous originals archived; bottoms remain unchanged.')

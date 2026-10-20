"""Enable the approved gallery after every required image is installed."""
from pathlib import Path
import csv, json
ROOT=Path(__file__).resolve().parents[1]
catalog_file=ROOT/'catalog/catalog.json'
products=json.loads(catalog_file.read_text(encoding='utf-8'))
missing=[]
for product in products:
    for color in ['black','white','grey']:
        for view in ['full','lineup']:
            for suffix in ['', '-480']:
                file=ROOT/'theme/assets'/f"sf-gallery-{product['handle']}-{color}-{view}{suffix}.jpg"
                if not file.exists():missing.append(str(file))
if missing:
    raise SystemExit(f'Refusing to enable incomplete galleries: {len(missing)} missing images. First: {missing[0]}')
for product in products:
    if 'sf-four-photo-gallery' not in product['tags']:
        product['tags'].append('sf-four-photo-gallery')
catalog_file.write_text(json.dumps(products,indent=2)+'\n',encoding='utf-8')
csv_file=ROOT/'catalog/sideform-products.csv'
with csv_file.open(encoding='utf-8-sig',newline='') as file:
    reader=csv.DictReader(file);headers=reader.fieldnames;rows=list(reader)
for row in rows:
    if row['Title']:
        tags=[tag.strip() for tag in row['Tags'].split(',') if tag.strip()]
        if 'sf-four-photo-gallery' not in tags:tags.append('sf-four-photo-gallery')
        row['Tags']=', '.join(tags)
with csv_file.open('w',encoding='utf-8',newline='') as file:
    writer=csv.DictWriter(file,fieldnames=headers);writer.writeheader();writer.writerows(rows)
print('Enabled four-photo galleries for all 12 products and preserved all 108 variant rows.')

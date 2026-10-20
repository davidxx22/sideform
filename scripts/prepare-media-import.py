"""Build a Shopify product CSV with actual public photo URLs; makes no store writes."""
from pathlib import Path
import argparse,csv,itertools,json
from urllib.parse import urlparse,urljoin,quote
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--base-url',required=True,help='Public HTTPS directory containing the 108 sf-photo-*.jpg assets')
parser.add_argument('--output',default=str(root/'catalog/sideform-products-with-photos.csv'))
args=parser.parse_args()
parsed=urlparse(args.base_url)
if parsed.scheme!='https' or not parsed.hostname or parsed.username or parsed.password:
    parser.error('Provide a public HTTPS photo directory without embedded credentials.')
base=args.base_url.rstrip('/')+'/'
with (root/'catalog/sideform-products.csv').open(encoding='utf-8-sig',newline='') as f:
    reader=csv.DictReader(f);fields=reader.fieldnames;rows=list(reader)
fields=fields+['Image Src','Image Position','Image Alt Text','Variant Image']
photos=list(itertools.product(['Black','White','Grey'],['front','back','detail']))
positions={}
for row in rows:
    handle=row['Handle'];i=positions.get(handle,0);positions[handle]=i+1
    color,view=photos[i]
    photo=f'sf-photo-{handle}-{color.lower()}-{view}.jpg'
    if not (root/'theme/assets'/photo).exists():raise SystemExit('Missing photo: '+photo)
    row['Image Src']=urljoin(base,quote(photo));row['Image Position']=str(i+1)
    presentation='on-model front' if view=='front' else view
    row['Image Alt Text']=f'[color:{color}] AI-generated sample photograph — {handle.replace("-"," ")}, {color}, {presentation} view.'
    row['Variant Image']=urljoin(base,f'sf-photo-{handle}-{row["Option1 Value"].lower()}-front.jpg')
with Path(args.output).open('w',encoding='utf-8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
print(f'Wrote {len(rows)} variant/media rows to {args.output}. No upload or Shopify import performed.')

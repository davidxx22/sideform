"""Install built-in imagegen outputs as responsive four-photo gallery assets."""
from pathlib import Path
import json, shutil, sys
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tooling/python'))
from PIL import Image, ImageDraw

destination = ROOT / 'catalog/product-gallery-photos'
destination.mkdir(exist_ok=True)
rows = []
for batch in sorted((ROOT / 'catalog').glob('gallery-batch-*.json')):
    rows.extend(json.loads(batch.read_text(encoding='utf-8'))['done'])
for row in rows:
    target = destination / (row['name'] + '.png')
    if not target.exists():
        shutil.copyfile(row['source'], target)
    image = Image.open(target).convert('RGB').resize((1122, 1402), Image.Resampling.LANCZOS)
    stem = 'sf-gallery-' + row['name']
    for size, suffix, quality in [((1122, 1402), '', 89), ((480, 600), '-480', 87)]:
        output = ROOT / 'theme/assets' / (stem + suffix + '.jpg')
        if not output.exists():
            image.resize(size, Image.Resampling.LANCZOS).save(output, quality=quality, optimize=True, progressive=True)

review = ROOT / 'artifacts/gallery-review'
review.mkdir(exist_ok=True)
for handle in sorted({row['handle'] for row in rows}):
    sheet = Image.new('RGB', (900, 800), '#fafaf7')
    draw = ImageDraw.Draw(sheet)
    for y, view in enumerate(['full', 'lineup']):
        for x, color in enumerate(['black', 'white', 'grey']):
            file = destination / f'{handle}-{color}-{view}.png'
            draw.text((x*300+8, y*400+8), f'{handle} {color} {view}', fill='black')
            if file.exists():
                photo = Image.open(file).convert('RGB')
                photo.thumbnail((292, 365))
                sheet.paste(photo, (x*300+(300-photo.width)//2, y*400+30))
    sheet.save(review / (handle + '.jpg'), quality=90)

(ROOT/'catalog/product-gallery-output-manifest.json').write_text(json.dumps({
    'tool': 'Built-in imagegen', 'additional_images': len(rows),
    'originals': 'catalog/product-gallery-photos/',
    'approved_offset_originals': 'catalog/offset-four-photo/',
    'images': [{**row, 'workspace_source': 'catalog/product-gallery-photos/'+row['name']+'.png'} for row in rows]
}, indent=2), encoding='utf-8')
print(f'Installed {len(rows)} additional originals and {len(rows)*2} responsive JPEGs; review sheets: {review}')

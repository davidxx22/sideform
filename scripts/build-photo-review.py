"""Create a visual QA page without modifying any photograph."""
from pathlib import Path
import json,html
root=Path(__file__).resolve().parents[1]
products=json.loads((root/'catalog/catalog.json').read_text(encoding='utf-8'))
body=[]
for p in products:
    photos=[]
    for view in ['front','back','detail']:
        for color in ['black','white','grey']:
            name=f'sf-photo-{p["handle"]}-{color}-{view}.jpg'
            content=f'<img src="/assets/{name}" alt="{html.escape(p["title"])} {color} {view}">' if (root/'theme/assets'/name).exists() else '<div class="pending">Pending</div>'
            photos.append(f'<figure>{content}<figcaption>{color.title()} / {view.title()}</figcaption></figure>')
    body.append(f'<section class="photo-product" data-handle="{p["handle"]}"><h2>{html.escape(p["title"])}</h2><div class="grid">{"".join(photos)}</div></section>')
text='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SIDEFORM photo review</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f5f1;color:#20231f;font-family:Arial,sans-serif}header{padding:24px;border-bottom:1px solid #ccc}header h1{font-size:30px;margin:0 0 10px}header p{font-size:13px}.photo-product{max-width:850px;margin:auto;padding:24px;background:#fafaf7;border-bottom:1px solid #ccc}.photo-product h2{font-size:23px;margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}figure{margin:0}img,.pending{display:block;width:100%;aspect-ratio:4/5;object-fit:contain;background:#eeefeb}.pending{display:grid;place-items:center;color:#777;font-size:12px}figcaption{font-size:11px;padding:8px 0;text-transform:uppercase;letter-spacing:1px}</style><header><h1>SIDEFORM / product photo review</h1><p>AI-generated sample photography · 12 products × Black, White, Grey × front, back, detail</p><a href="/">Open storefront</a></header>'''+''.join(body)+'</html>'
(root/'preview/photography-review.html').write_text(text,encoding='utf-8')
print('Built visual review page.')

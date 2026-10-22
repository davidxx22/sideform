from pathlib import Path
import csv, json, itertools
root=Path(__file__).resolve().parents[1]
products=json.loads((root/'catalog/catalog.json').read_text(encoding='utf-8'))
rows=list(csv.DictReader((root/'catalog/sideform-products.csv').open(encoding='utf-8-sig')))
assert len(products)==12 and len(rows)==108
assert len({r['Variant SKU'] for r in rows})==108
expected=set(itertools.product(['Black','White','Grey'],['Small','Medium','Large']))
for p in products:
    data=[r for r in rows if r['Handle']==p['handle']]
    assert len(data)==9
    assert {(r['Option1 Value'],r['Option2 Value']) for r in data}==expected
    assert data[0]['Status']=='draft' and data[0]['Published']=='FALSE'
    assert all(r['Variant Inventory Policy']=='deny' for r in data)
    assert any(int(r['Variant Inventory Qty'])==0 for r in data)
    guide=p['size_guide'];assert guide['sample'] and guide['unit']=='cm' and guide['basis']=='garment_flat'
    assert len(guide['columns'])==4 and len(guide['rows'])==3
    assert all(len(row['values'])==4 and all(v>0 for v in row['values']) for row in guide['rows'])
    for color,view in itertools.product(['black','white','grey'],['front','back','detail']):
        asset=root/'theme/assets'/f'sf-photo-{p["handle"]}-{color}-{view}.jpg'
        assert asset.exists()
for p in (root/'theme/templates').glob('*.json'):json.loads(p.read_text(encoding='utf-8'))
for p in (root/'theme/sections').glob('*-group.json'):json.loads(p.read_text(encoding='utf-8'))
print('PASS: 12 products, 108 unique SKUs and option combinations; sample inventory and sizing; 108 usable media references; JSON templates.')

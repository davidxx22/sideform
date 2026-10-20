"""Apply the supplied product metafields after CSV import. Dry-run unless --apply.
Token is read from SHOPIFY_ADMIN_TOKEN in the environment; it is never printed.
Required Admin API access: read_products, write_products.
"""
from pathlib import Path
import argparse, json, os, re, urllib.request

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--store',help='Development store hostname, e.g. sideform-dev.myshopify.com')
parser.add_argument('--apply',action='store_true',help='Write metafields to the explicitly named store')
args=parser.parse_args()
payloads=json.loads((root/'catalog/product-metafields.json').read_text())
definitions=json.loads((root/'catalog/metafield-definitions.json').read_text())
if not args.apply:
    print(f'DRY RUN: {len(definitions)} definitions and {sum(len(p["metafields"]) for p in payloads)} product metafields. No requests made.')
    raise SystemExit(0)
if not args.store or not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com',args.store):
    parser.error('--apply requires an explicit *.myshopify.com development store hostname')
token=os.environ.get('SHOPIFY_ADMIN_TOKEN')
if not token: parser.error('Set SHOPIFY_ADMIN_TOKEN in the environment for this process.')
def graphql(query,variables):
    req=urllib.request.Request(f'https://{args.store}/admin/api/2026-10/graphql.json',data=json.dumps(dict(query=query,variables=variables)).encode(),headers={'Content-Type':'application/json','X-Shopify-Access-Token':token},method='POST')
    with urllib.request.urlopen(req,timeout=30) as response: result=json.load(response)
    if result.get('errors'): raise RuntimeError(json.dumps(result['errors']))
    return result['data']
existing=graphql('query { metafieldDefinitions(first: 250, ownerType: PRODUCT, namespace: "custom") { nodes { key type { name } } } }',{})['metafieldDefinitions']['nodes']
for definition in definitions:
    found=next((d for d in existing if d['key']==definition['key']),None)
    if found:
        if found['type']['name']!=definition['type']: raise RuntimeError('Existing metafield has incompatible type: '+definition['key'])
        continue
    data=graphql('mutation($definition: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $definition) { userErrors { field message } } }',{'definition':definition})['metafieldDefinitionCreate']
    if data['userErrors']: raise RuntimeError(json.dumps(data['userErrors']))
for product in payloads:
    data=graphql('query($query: String!) { products(first: 2, query: $query) { nodes { id handle } } }',{'query':'handle:'+product['handle']})['products']['nodes']
    found=next((p for p in data if p['handle']==product['handle']),None)
    if not found: raise RuntimeError('Import the product CSV first. Missing handle: '+product['handle'])
    metafields=[dict(ownerId=found['id'],**m) for m in product['metafields']]
    result=graphql('mutation($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { userErrors { field message } } }',{'metafields':metafields})['metafieldsSet']
    if result['userErrors']: raise RuntimeError(json.dumps(result['userErrors']))
    print('Updated sizing and details:',product['handle'])
print('Complete. Product publication, inventory and theme publication were not changed.')

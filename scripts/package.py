from pathlib import Path
import json, zipfile, hashlib
root=Path(__file__).resolve().parents[1]
theme=root/'theme'
allowed={'assets','config','layout','locales','sections','snippets','templates'}
paths=sorted(p for folder in allowed for p in (theme/folder).rglob('*') if p.is_file())
paths.append(theme/'LICENSE.md')
with zipfile.ZipFile(root/'artifacts/SIDEFORM-product-photos.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(list((theme/'assets').glob('sf-photo-*.jpg'))+list((theme/'assets').glob('sf-gallery-*.jpg'))):
        if not p.stem.endswith('-480'):archive.write(p,p.name)
    if (root/'catalog/product-photo-manifest.csv').exists():archive.write(root/'catalog/product-photo-manifest.csv','product-photo-manifest.csv')
with zipfile.ZipFile(root/'artifacts/SIDEFORM-theme.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in paths: archive.write(p,p.relative_to(theme).as_posix())
manifest=[dict(path=p.relative_to(root).as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in paths]
(root/'artifacts/theme-manifest.json').write_text(json.dumps(manifest,indent=2))
with zipfile.ZipFile(root/'artifacts/SIDEFORM-handoff.zip','w',zipfile.ZIP_DEFLATED) as archive:
    archive.write(root/'artifacts/SIDEFORM-theme.zip','SIDEFORM-theme.zip')
    archive.write(root/'artifacts/SIDEFORM-product-photos.zip','SIDEFORM-product-photos.zip')
    archive.write(root/'README.md','README.md')
    for folder in ['catalog','docs','scripts','preview']:
        for p in sorted((root/folder).glob('*')):
            if p.is_file():archive.write(p,p.relative_to(root).as_posix())
    for name in ['package.json','package-lock.json','requirements.txt']:
        archive.write(root/'tooling'/name,'tooling/'+name)
    for name in ['browser-validation.json','edge-validation.json','photo-validation.json','photo-browser-validation.json','theme-check.json','theme-manifest.json','home-desktop.png','home-mobile.png','product-mobile.png','photography-product-mobile.png','size-guide-mobile.png','cart-desktop.png','product-native-gallery.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['home-layout-validation.json','editorial-1440.png','editorial-390.png','new-arrivals-layout.png','navbar-layout.png','transparent-header-top.png','transparent-header-scroll.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['browse-interaction-validation.json','browse-interaction-fallback-validation.json','mixed-color-grid.png','in-place-browse-mobile.png','logo-validation.json']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['product-experience-validation.json','product-detail-1440.png','product-detail-390.png','product-features-1440.png','product-features-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for p in sorted((root/'catalog/product-gallery-photos').glob('*.png')):
        archive.write(p,p.relative_to(root).as_posix())
    for p in sorted((root/'artifacts/gallery-review').glob('*')):
        if p.is_file():archive.write(p,p.relative_to(root).as_posix())
    if (root/'artifacts/catalog-gallery-validation.json').exists():archive.write(root/'artifacts/catalog-gallery-validation.json','artifacts/catalog-gallery-validation.json')
    if (root/'artifacts/catalog-gallery-assets-validation.json').exists():archive.write(root/'artifacts/catalog-gallery-assets-validation.json','artifacts/catalog-gallery-assets-validation.json')
    for p in sorted((root/'catalog/offset-four-photo').glob('*.png')):
        archive.write(p,p.relative_to(root).as_posix())
    for name in ['offset-four-photo-validation.json','offset-four-photo-1440.png','offset-four-photo-390.png','offset-zoom-1440.png','offset-zoom-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['purchase-layout-validation.json','purchase-refinement-1440.png','purchase-refinement-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['header-search-validation.json','header-search-1920.png','header-search-1440.png','header-search-390.png','header-search-320.png','search-bar-1440.png','header-counters-1440.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['favorites-feedback-validation.json','favorites-feedback-1440.png','favorites-feedback-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    if (root/'artifacts/price-badge-validation.json').exists():archive.write(root/'artifacts/price-badge-validation.json','artifacts/price-badge-validation.json')
    for name in ['collection-story-validation.json','about-footer-1440.png','about-footer-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for name in ['homepage-edit-validation.json','home-category-arrivals-1440.png','home-category-arrivals-390.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
    for p in sorted((root/'catalog/editorial-photos').glob('*.png')):
        archive.write(p,p.relative_to(root).as_posix())
    for name in ['restored-editorial-validation.json','restored-editorial-390.png','restored-editorial-768.png','restored-editorial-1440.png']:
        if (root/'artifacts'/name).exists():archive.write(root/'artifacts'/name,'artifacts/'+name)
print(f'Packaged {len(paths)} theme files. Theme SHA256: {hashlib.sha256((root/"artifacts/SIDEFORM-theme.zip").read_bytes()).hexdigest()}')

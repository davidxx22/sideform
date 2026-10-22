"""Create optimized storefront WebP derivatives; keep original sources intact."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, sys
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'tooling/python'))
from PIL import Image, ImageOps

def convert(source):
    target = source.with_suffix('.webp')
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        alpha = 'A' in image.getbands()
        image = image.convert('RGBA' if alpha else 'RGB')
        image.save(target, 'WEBP', quality=85, method=6, lossless=alpha, exact=alpha)
        width, height = image.size
    return dict(source=source.relative_to(root).as_posix(), output=target.relative_to(root).as_posix(), width=width, height=height, alpha=alpha, original_bytes=source.stat().st_size, webp_bytes=target.stat().st_size)

sources = sorted(p for p in (root / 'theme/assets').iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png'})
assert len({p.stem for p in sources}) == len(sources), 'Duplicate output stems'
with ThreadPoolExecutor(max_workers=4) as pool:
    images = list(pool.map(convert, sources))
original_bytes = sum(i['original_bytes'] for i in images)
webp_bytes = sum(i['webp_bytes'] for i in images)
report = dict(count=len(images), original_bytes=original_bytes, webp_bytes=webp_bytes, reduction_percent=round((1-webp_bytes/original_bytes)*100,1), quality=85, transparent_images_lossless=True, images=images)
(root / 'artifacts/webp-conversion.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(f"Converted {len(images)} images: {original_bytes:,} -> {webp_bytes:,} bytes ({report['reduction_percent']}% smaller).")

"""Create responsive delivery files from the imagegen-edited campaign original."""
from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tooling/python'))
from PIL import Image
with Image.open(root/'catalog/campaign-branded.png') as source:
    image=source.convert('RGB');width,height=image.size
    image.save(root/'theme/assets/sideform-campaign-branded.jpg',quality=89,optimize=True,progressive=True)
    small=image.copy();small.thumbnail((750,750),Image.Resampling.LANCZOS)
    small.save(root/'theme/assets/sideform-campaign-branded-750.jpg',quality=87,optimize=True,progressive=True)
    small_width=small.width
path=root/'theme/sections/sf-campaign.liquid'
source=path.read_text(encoding='utf-8')
tag='''<img class="sf-campaign__desktop" src="{{ 'sideform-campaign-branded.jpg' | asset_url }}" srcset="{{ 'sideform-campaign-branded-750.jpg' | asset_url }} SMALLw, {{ 'sideform-campaign-branded.jpg' | asset_url }} FULLw" sizes="100vw" width="WIDTH" height="HEIGHT" loading="eager" fetchpriority="high" alt="AI-edited campaign photograph: two models in white and black SIDEFORM logo T-shirts, unbranded black cargo pants and grey cargo shorts beside concrete architecture">'''
tag=tag.replace('SMALLw',str(small_width)+'w').replace('FULLw',str(width)+'w').replace('WIDTH',str(width)).replace('HEIGHT',str(height))
source=re.sub(r'<img class="sf-campaign__desktop(?: sf-screenshot-crop)?"[^>]+>',lambda match:tag,source,count=1)
path.write_text(source,encoding='utf-8')
print(f'Campaign delivery encoded: {width}x{height}, responsive width {small_width}px. Original preserved.')

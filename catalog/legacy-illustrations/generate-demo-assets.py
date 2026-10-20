"""Regenerate the clearly labeled SIDEFORM sample catalog and merchandising files."""
from pathlib import Path
import json, csv
ROOT = Path(__file__).resolve().parents[1]
def write(path, text):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8', newline='\n')
def jwrite(path, data): write(path, json.dumps(data, indent=2, ensure_ascii=False)+'\n')
# Code-drawn demo illustrations are deliberately not presented as photography.
paths={
'oversized-t-shirt':'M218 176 143 205 78 315 157 360 198 305 198 618 502 618 502 305 543 360 622 315 557 205 482 176 Q350 229 218 176Z',
'long-sleeve-t-shirt':'M218 176 143 205 55 527 142 552 198 338 198 618 502 618 502 338 558 552 645 527 557 205 482 176 Q350 229 218 176Z',
'hoodie':'M254 194 Q241 100 350 91 Q459 100 446 194 L548 231 624 544 544 568 497 352 497 634 203 634 203 352 156 568 76 544 152 231Z',
'crewneck-sweatshirt':'M230 179 150 214 70 523 153 552 204 335 204 625 496 625 496 335 547 552 630 523 550 214 470 179 Q350 238 230 179Z',
'streetwear-jacket':'M261 163 217 202 157 218 83 548 163 568 207 338 207 629 493 629 493 338 537 568 617 548 543 218 483 202 439 163 350 196Z',
'cargo-pants':'M229 158 471 158 502 643 392 643 350 349 308 643 198 643Z',
'baggy-jeans':'M228 158 472 158 517 643 390 643 350 350 310 643 183 643Z',
'streetwear-shorts':'M226 236 474 236 510 566 383 566 350 388 317 566 190 566Z'}
for kind,path in paths.items():
 for color,fill in [('black','#282a28'),('white','#f8f7f3'),('grey','#969895')]:
  for view in ['front','back','detail']:
   stroke = '#777a76' if color=='black' else '#61655f'
   seams = '<path d="M350 197V625M230 337H318V427H230ZM382 337H470V427H382Z"/>' if kind=='streetwear-jacket' else '<path d="M220 208Q350 267 480 208M208 592H492"/>' if kind in ['oversized-t-shirt','long-sleeve-t-shirt','crewneck-sweatshirt'] else '<path d="M232 184H468M350 184V337M211 429H295V512H211ZM406 429H490V512H406Z"/>' if kind in ['cargo-pants','baggy-jeans','streetwear-shorts'] else '<path d="M281 193Q350 238 419 193M280 466H420L447 554H253Z"/>'
   if view=='back': seams='<path d="M232 205Q350 238 468 205M218 590H482"/>' if 'pants' not in kind and 'jeans' not in kind and 'shorts' not in kind else '<path d="M238 211H313V298H238ZM387 211H462V298H387ZM232 180H468"/>'
   content=f'<path d="{path}" fill="{fill}" stroke="{stroke}" stroke-width="2"/><g fill="none" stroke="{stroke}" stroke-width="2" opacity=".65">{seams}</g>'
   if view=='front' and kind in ['oversized-t-shirt','long-sleeve-t-shirt','hoodie','crewneck-sweatshirt']: content+='<path d="M408 280h18v8h-18ZM424 292h18v8h-18Z" fill="'+('#ddd' if color=='black' else '#333')+'"/>'
   if view=='detail': content=f'<rect x="100" y="210" width="500" height="390" rx="4" fill="{fill}" stroke="{stroke}"/><path d="M100 330Q350 430 600 330M100 342Q350 442 600 342" fill="none" stroke="{stroke}" stroke-width="3" stroke-dasharray="8 5"/><path d="M130 240H570M130 260H570M130 280H570" stroke="{stroke}" opacity=".2"/>'
   svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 850"><rect width="700" height="850" fill="#eeefeb"/>{content}<text x="28" y="48" fill="#50554b" font-family="Arial" font-size="13" letter-spacing="2">SIDEFORM / {view.upper()}</text><text x="28" y="814" fill="#50554b" font-family="Arial" font-size="12" letter-spacing="1">DEMO ILLUSTRATION · {color.upper()} · REPLACE BEFORE LAUNCH</text></svg>'
   write(f'theme/assets/sf-demo-{kind}-{color}-{view}.svg',svg)


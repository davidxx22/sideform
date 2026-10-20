# SIDEFORM generated product photography

This collection replaces the earlier flat SVG demo illustrations with 108 individual, photorealistic AI-generated sample photographs: 12 distinct garments × Black / White / Grey × front / back / close-up.

The 36 primary front photographs now show adult models wearing the garments. Product cards, the first gallery image and variant/cart thumbnails use these model shots. The 72 supporting back and detail photographs remain garment-only views. Each product retains the same model, pose and styling across its three colors.

These are merchandising concepts for the sample brand, not photographs or proof of manufactured inventory. The storefront labels them **AI-generated sample photography**. Keep that disclosure until photography of the verified manufactured garments replaces them.

## Art direction and consistency

The homepage campaign is also edited with built-in imagegen. Both shirts have the two-rectangle chest mark; the woman's shirt is White and the man's remains Black. The man wears the Black Grid Cargo Pant, and the woman wears the Grey Interval Utility Short, using the catalog garment photographs as references. Neither bottom carries a logo. Models, poses, concrete setting and left-side headline space are preserved. `catalog/campaign-branded.png` is the final original, `catalog/campaign-generation.json` records both edit stages and prompts, and `catalog/campaign-shirt-edit.png` preserves the intermediate shirt-only edit. The original supplied screenshot stays at `theme/assets/sideform-campaign.png`; the active theme uses optimized full-size and 750px JPEGs named `sideform-campaign-branded*.jpg`.

- A warm, pale-grey seamless studio background; soft upper-left daylight and gentle contact shadows.
- Straight-on model portraits for the primary images, consistent portrait framing and natural fabric drape. Tops and jackets show the model from head to mid-thigh; pants and shorts use full-body framing to show the entire garment.
- Twelve garment-specific designs derived from the catalog's material and fit descriptions. The two tees, two long sleeves, two hoodies and two jackets each have distinct silhouettes or construction.
- Each product's Black front image establishes its identity. White and Grey fronts preserve that cut, seams, pockets and hardware. Back and detail views reference the matching product rather than an unrelated garment.
- All nine upper garments now carry SIDEFORM's two short, offset horizontal rectangles at the wearer's upper left chest. Black garments use off-white ink; White and Grey garments use black ink. Eighteen previously plain model photos were edited with built-in imagegen to add the mark. Existing branded tees/hoodies retain their original marks. Pants, jeans and shorts were excluded from the edit and retain their original imagery.
- Back views omit front-only features. Detail views focus on the same garment's neckline, cuff, panel seam, pocket, hardware or fabric.

## Files

- `catalog/product-photos/*.png`: all original generated images, retained in the workspace.
- `catalog/model-photos/*.png`: 36 replacement on-model front originals. The previous garment-only fronts are preserved in `catalog/product-photos/`.
- `catalog/model-generation.json`: prompts, reference inputs and source paths for the on-model series, generated with the built-in imagegen tool.
- `catalog/logo-generation.json`: the eighteen approved chest-logo edit prompts and references. `catalog/branded-model-photos/` holds those generated PNGs; they are also installed in `catalog/model-photos/` for delivery. Previous unbranded originals and provenance remain in `catalog/model-photos-before-branding/` and `catalog/model-generation-before-branding.json`.
- `catalog/bottoms-before-branding.sha256.json`: checksums used to confirm that active pants, jeans and shorts images remain unchanged. Discarded concept studies are excluded from theme assets and packaged photography.
- `catalog/photo-generation.json`: per-image prompt, product/color/view, source and workspace path. The full first master prompt is also in `catalog/photo-master-prompt.txt`. Generated with the built-in imagegen tool, not the API/CLI fallback.
- `theme/assets/sf-photo-{product-handle}-{color}-{view}.jpg`: full-size web delivery copies.
- `theme/assets/sf-photo-{product-handle}-{color}-{view}-480.jpg`: smaller responsive copies.
- `catalog/product-photo-manifest.csv`: all 108 deliverable images, dimensions, checksums and accessible alt-text/color markers.
- `artifacts/SIDEFORM-product-photos.zip`: the 108 full-size JPEGs and manifest for upload to Shopify.

JPEG encoding and smaller responsive copies are technical delivery optimizations. Original PNGs remain unchanged; garments are not reshaped, recolored or cropped by code. Image generation and color/view changes use imagegen.

## Storefront behavior

Shopify product media remains the first choice. For the 12 sample handles, theme assets provide the photo gallery, product-card images and selected-color cart thumbnail until the images are uploaded as native Shopify product media.

Selecting a color updates all three views to that product and color. Size changes keep the selected view. Thumbnails and accessible enlarged-image dialogs continue to work. Unknown products with no uploaded media display an imagery-pending message.

## Upload to Shopify

1. Extract `SIDEFORM-product-photos.zip`. Upload each product's nine JPEGs to its Shopify product media gallery, following `product-photo-manifest.csv`.
2. Preserve the provided descriptive alt text and `[color:Black]`, `[color:White]` or `[color:Grey]` marker. The theme uses those markers to group the native gallery by color.
3. Assign each color's front photo to all three size variants for that color.
4. To build a CSV using public image URLs, first upload the JPEG files to a public HTTPS media directory (Shopify Files can provide such URLs), then run:

```powershell
python scripts/prepare-media-import.py --base-url "https://YOUR-PUBLIC-IMAGE-DIRECTORY/"
```

This creates `catalog/sideform-products-with-photos.csv` with the 108 variant rows, nine ordered product images per product, matching variant front images and alt text. No fake URLs are supplied and no store writes are made. Preview the CSV import in the development store; it also contains the sample product and inventory fields from the original catalog.

## Verification before launch

Compare the generated concept against the manufactured garment: body/sleeve proportions, pocket count, placement and shape, closures, seams, fabric, branding and actual color. AI images can contain small construction differences and cannot establish production accuracy. Replace them with verified photos before selling a materially different item. Sample measurements and product specifications still require merchant verification.

For local asset preparation on another machine:

```powershell
python -m pip install --target tooling/python -r tooling/requirements.txt
python scripts/prepare-product-photos.py
```

Garment-only grid chest marks: six formerly plain upper-garment styles are edited with built-in imagegen in Black, White and Grey. The other three upper styles already have chest marks. Original garment packshots remain in `catalog/product-photos`; edited PNGs are saved in `catalog/branded-packshots`, with prompts in `catalog/packshot-logo-generation.json`. Active delivery is `theme/assets/sf-packshot-*.jpg`. Bottom packshots remain unbranded and unchanged. The cargo editorial uses a responsive CSS crop focused on waistband, pockets and legs.

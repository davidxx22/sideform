# Implementation files

The complete theme is in `theme/`; `artifacts/theme-manifest.json` enumerates every packaged file and SHA-256. Shopify upload ZIPs contain the standard theme folders at their root.

## New theme code

- `sections/sf-campaign.liquid` — supplied hero asset, desktop/mobile image settings, headline, text and CTA.
- `sections/sf-editorial.liquid` — reorderable four-panel photographic collection collage with merchant image pickers and included SIDEFORM sample-photo selections.
- `snippets/sf-collection-links.liquid`, `snippets/sf-category-grid.liquid` — editable collection controls with native product-card templates for instant in-place category changes.
- `snippets/sf-card-colors.liquid` — labeled color-preview buttons with native variant media, matching variant links and money-filtered prices.
- `sections/sf-perspective.liquid` — editable brand copy and navigation.
- `sections/sf-footer.liquid` — menus, brand copy, configured social links, policies and clearly marked missing policies.
- `snippets/sf-wordmark.liquid` — supplied offset-bar asset with a text SIDEFORM wordmark, plus editor override.
- `snippets/sf-card-colors.liquid` — accessible collection-card color indicators.
- `snippets/sf-size-guide.liquid` — product JSON metafield table in an accessible native dialog.
- `snippets/sf-product-details.liquid` — material, fit and care metafields with sample-content disclosure.
- `snippets/sf-product-image.liquid`, `snippets/sf-photo-gallery.liquid` — product-specific AI sample photo gallery, responsive image sources, thumbnail controls and zoom. Unknown product handles show an imagery-pending message.
- `assets/sideform.css`, `assets/sideform.js` — SIDEFORM styling, dialogs, selection guard, sample photo views, real-media color grouping and theme-editor initialization.
- `assets/sideform-campaign.png`, `assets/sideform-symbol.png` — actual supplied Image 2 and Image 3 screenshots; original asset proportions retained. Screenshot borders are clipped through layout, without regenerating the campaign.
- `assets/sf-photo-*.jpg` — 108 individual AI-generated product photographs and 108 smaller responsive copies. All 36 primary front images show models wearing the garments in Black, White and Grey; the back and close-up views remain garment-only. Model PNGs and prompts are in `catalog/model-photos/` and `catalog/model-generation.json`. Earlier garment-only PNGs remain in `catalog/product-photos/`; superseded drawings are archived outside the theme.
- `templates/page.about.json` — editable About page arrangement.

## Modified Dawn files

| Files | Change |
| --- | --- |
| `layout/theme.liquid` | Load SIDEFORM CSS and JS |
| `config/settings_schema.json`, `config/settings_data.json` | Identity setting, restrained palette, spacing, square controls, drawer defaults |
| `sections/header.liquid` | Supplied symbol/wordmark fallback; native Dawn menus, search and cart retained |
| `sections/header-group.json`, `sections/footer-group.json` | Development announcement, header configuration, SIDEFORM footer |
| `templates/index.json` | Campaign, eight-product collection, editorial blocks and perspective |
| `templates/product.json` | Thumbnail gallery, mobile thumbnails, native variant picker and cart form, related products |
| `templates/collection.json`, `templates/search.json` | Portrait imagery; native sorting/filtering retained |
| `sections/main-product.liquid` | Demo fallback gallery when media absent; material/fit/care additions |
| `snippets/product-variant-picker.liquid`, `snippets/product-variant-options.liquid` | Labeled color swatches and size-guide control |
| `snippets/product-media-gallery.liquid` | Color metadata for native gallery/thumbnail filtering; fix inherited escaping of generated thumbnail HTML |
| `snippets/card-product.liquid` | Correct garment-type sample photo fallback, color indicators, safe media layout |
| `snippets/cart-drawer.liquid`, `sections/main-cart-items.liquid` | Correct-color sample photo thumbnail when real product media is missing |
| `sections/main-search.liquid` | Continue-browsing link in empty search results |
| `assets/product-form.js`, `assets/product-info.js` | Useful network-failure messages in Dawn's existing error UI |

All remaining Dawn assets, templates, sections, snippets and translations are included unchanged. Navigation, predictive search, native product forms, hosted checkout, real-media thumbnails/lightbox, related-product recommendations, storefront facets and cart updates use existing Dawn components.

## Catalog and handoff

- `catalog/sideform-products.csv`: Shopify product import, 12 products / 108 variants.
- `catalog/catalog.json`: editable source of sample merchandising and the local review fixtures.
- `catalog/product-metafields.json`, `catalog/metafield-definitions.json`: exact sizing/detail values and Shopify definition structures.
- `catalog/collections.json`: collection handles and automated-rule instructions.
- `catalog/sample-inventory-reference.csv`: SKU-to-quantity lookup for location-specific inventory setup.
- `catalog/product-photo-manifest.csv`: all 108 product/color/view photo files, dimensions, hashes and alt-text/color markers.
- `catalog/photo-generation.json`: generated-image prompt set and source paths.
- `artifacts/SIDEFORM-product-photos.zip`: full-size JPEGs for native Shopify product-media upload.
- `scripts/generate-catalog.py`: reproducible sample merchandising. `scripts/prepare-product-photos.py`: delivery JPEG encoding. `scripts/integrate-product-photos.py`: guarded photo-library integration. `scripts/prepare-media-import.py`: public-URL media import CSV preparation. None modifies a store.
- `scripts/apply-metafields.py`: optional Admin API helper; dry-run default, explicit store and `--apply` required for writes.
- `scripts/validate-catalog.py`, `scripts/validate-photography.py`, `scripts/test-storefront.cjs`, `scripts/test-edge-cases.cjs`, `scripts/test-photography.cjs`: merchandising, photo-library and local browser validation.
- `preview/server.cjs`: localhost-only Liquid rendering and Shopify endpoint emulation; no production dependency.
- `scripts/package.py`: Shopify theme ZIP and handoff bundle creation.
- `artifacts/*.png`, `artifacts/*validation.json`, `artifacts/theme-check.json`: visual and machine-readable validation evidence.
- `docs/SETUP.md`, `docs/LAUNCH-CHECKLIST.md`, `docs/VALIDATION.md`: configuration, missing content and acceptance checks.

The earlier `site/` prototype is retained for history and is not in the theme upload.


## Product experience update

- `sections/main-product.liquid`, `templates/product.json`, `assets/sideform.css` — paired media layout, compact title/purchase panel, circular colors and favorite control.
- `sections/sf-product-description.liquid` — editable feature/detail section from product content and metafields.
- `snippets/sf-model-caption.liquid`, `snippets/product-media-gallery.liquid`, `snippets/sf-photo-gallery.liquid` — model captions, native gallery retention and fallback grid/zoom.
- `snippets/sf-heart.liquid`, `snippets/sf-favorite-button.liquid`, `snippets/sf-favorites-dialog.liquid`, `assets/sf-favorites.js`, `sections/header.liquid` — accessible local favorites and header heart.
- `catalog/catalog.json`, `catalog/product-metafields.json`, `catalog/metafield-definitions.json` — editable assumed model height/worn-size profiles.
- `scripts/test-product-experience.cjs` — layout, favorites, galleries, variant, sizing and cart verification.


- Legacy gallery-enabling tag (tops/outerwear now select six views, bottoms four): tag `sf-four-photo-gallery` in catalog JSON/CSV, consumed by `sections/main-product.liquid`, `snippets/sf-photo-gallery.liquid` and `sf-product-image.liquid`; color changes handled by `SfPhotoGallery` in `assets/sideform.js`.
- `catalog/offset-four-photo/`: six final full-body/hanger PNGs; `offset-four-photo-generation.json` and `offset-hanger-generation.json`: built-in imagegen prompts and references. `sf-gallery-offset-heavy-tee-*` assets provide full/480px JPEGs.
- `scripts/test-offset-gallery.cjs`: four-view order, three colors, twelve zoom/focus checks, two model captions, 2×2 equal-size tiles at desktop/mobile, no overflow, and unchanged native gallery for Plain Box Tee.


- `catalog/product-gallery-photos/`: 66 new full-body and hanger originals for the remaining eleven products. `all-product-gallery-generation.json` and `product-gallery-output-manifest.json` preserve exact prompts and selected outputs.
- `scripts/test-catalog-galleries.cjs`: every product/color/view, 144 zoom checks, captions, gapless mobile/desktop layout and approved controls.


- `sections/sf-shop-by-category.liquid`, `sections/sf-new-arrivals.liquid`, `templates/index.json`: five category image links and four curated product cards, replacing the previous large homepage product grid/editorial collage. Collection definitions and imported tags are in `catalog/collections.json`, catalog JSON/CSV and the generator. No new image generation required; existing approved imagery is reused.

- catalog/six-photo-gallery/: final generated originals and exact built-in imagegen prompts/reference records for six-view upper galleries and updated cargo model. scripts/install-six-photo-gallery.py exports optimized full/480px WebP copies.

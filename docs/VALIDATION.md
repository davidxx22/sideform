Product experience redesign: verified native and fallback paired galleries, removed photography notice, editable model captions, circular variant controls, native sold-out prevention, size dialog and image lightboxes. Favorites persist across navigation/reloads, synchronize across tabs, remove correctly, and return keyboard focus after Escape. Cart add, quantity, totals and removal passed. Six viewport widths passed without overflow and with centered wordmark (1920/1440/990/768/390/320). All 108 product/color/view images decoded through the native galleries; all 12 model captions were present. Full storefront regression passed through local checkout navigation; no real Shopify upload, import or hosted checkout testing occurred. Theme Check: 0 errors. See `artifacts/product-experience-validation.json`, `artifacts/photo-browser-validation.json`, `artifacts/browser-validation.json`, `artifacts/product-detail-1440.png` and `artifacts/product-detail-390.png`.

Temporary hover refinement: 72 homepage/Shop hover previews restore each original color on pointer exit. Clicking commits the displayed color; subsequent hover/focus previews restore that clicked color. Verified delayed-image race protection, unchanged selection during preview, replaced category grids, keyboard focus/blur, mobile tap, and existing click/failure-retry behavior. Evidence: `artifacts/color-hover-validation.json`.

Color hover update: verified 72 hover previews across all 12 homepage and 12 Shop cards (Black/White/Grey), loaded matching images without navigation, category-replaced grid handling, keyboard focus and mobile touch tap. Evidence: `artifacts/color-hover-validation.json`.

Shop category controls: verified All (12), Tops (7), Bottoms (3), Outerwear (2), in-place requests without document navigation, preserved descending-price sorting, native facet sorting, browser Back/Forward, keyboard category activation at 390px, color swatches, and failed-request feedback/retry. Current category is underlined and marked aria-current; fetched content announces status and restores focus. Evidence: `artifacts/shop-categories-validation.json`, `artifacts/shop-categories-desktop.png`, `artifacts/shop-categories-mobile.png`.

Shop All added as the first Shop submenu item, followed by New Arrivals, Tops, Bottoms and Outerwear. Desktop/mobile navigation checks passed with all five items.

Approved navigation update: Home, Shop, About, Contact. Native Dawn Shop dropdown contains only New Arrivals, Tops, Bottoms, Outerwear. Verified click, Enter/Escape, active category, desktop centering and sticky behavior at 1920/1440/990px, mobile submenu and category navigation at 390/320px, and Contact form fields. Preview now includes Dawn’s `js` root class, matching the real theme so the mobile drawer displays. Local contact submissions do not send email. Navigation is in `catalog/navigation.json`; merchant must configure the real Shopify menu per SETUP. Evidence: `artifacts/navigation-validation.json`, `artifacts/navigation-desktop.png`, `artifacts/navigation-mobile.png`.

Black cargo editorial update: visually inspected the imagegen edit against the Black Grid Cargo Pant reference. The banner uses real concrete wall/floor across the whole tile, without the pale panel or mask fade. Responsive files are 1536x1024 and 480x320; six viewport layout checks passed. Source/prompt: `catalog/cargo-editorial-black-generation.json`.

Brand/editorial refinements verified: Plain Box Tee display name in the 12-product grid and CSV, garment-type labels, background-free two-rectangle default footer SVG, explicit streetwear copy on homepage and About preview. New angled Grey Grid Cargo Pant editorial was visually inspected; six viewport layout checks and 72 color previews passed. Evidence: `artifacts/editorial-1440.png`, `artifacts/background-free-footer.png` and `catalog/cargo-editorial-generation.json`.

Packshot logo update: visually reviewed 18 built-in imagegen chest-mark edits across six previously plain upper garments and three colors. Existing nine branded upper packshots remain. All 18 bottom JPEG files (full and responsive) match their pre-edit SHA256 checksums. All 72 grid color previews passed. Cargo editorial is cropped around waistband, cargo pockets and legs. Evidence: `artifacts/packshot-logo-review.jpg`, `artifacts/packshot-bottoms-unchanged.json` and `artifacts/browse-interaction-validation.json`.

Product-only grid update: all 12 products appear in Collections → All, using garment-only front photos. In-place browsing checks passed for Tops (7), Bottoms (3), Outerwear (2), All (12), including 72 color switches, matching variant links/prices, mobile keyboard operation and image failure/retry. Verified exactly 12 loaded images in the All grid. Six-width responsive layout and desktop/mobile sticky checks passed. Evidence: `artifacts/mixed-color-grid.png` and `artifacts/browse-interaction-validation.json`.

Solid navbar update: transparency is disabled; the campaign starts below the opaque header. The six-width layout review passed, including always-sticky navigation while scrolling up and down on homepage, collection and product pages at 1440px and 390px. Evidence: `artifacts/solid-header-top.png`, `artifacts/solid-header-scroll.png` and `artifacts/home-layout-validation.json`. Earlier transparent-header checks below are historical.

# Validation — 19 October 2026

## Completed locally

Campaign update: the original photograph was edited to show both chest marks, a true White woman's tee, Black Grid Cargo Pants on the man and Grey Interval Utility Shorts on the woman. Final image was visually inspected against the catalog references; bottoms remain unbranded. Responsive delivery files decode at 1529×1029 and 750px width. The six-width layout review and desktop/mobile sticky-header checks passed with the replacement hero. Evidence: `artifacts/transparent-header-top.png` and `catalog/campaign-generation.json`.

Chest-branding update: eighteen previously plain model photos across six tops/jackets now carry the two-rectangle SIDEFORM mark in Black, White and Grey. Six three-color review sheets were visually inspected. All 108 photos and 216 delivery JPEGs passed decoding, aspect, uniqueness and color checks; the 60 in-place color/category previews passed again. Checksums confirm that all nine active pants/jeans/shorts front images remain byte-for-byte unchanged. No discarded bottoms branding study is included in theme assets or the packaged photo library. Prompts and originals: `catalog/logo-generation.json` and `catalog/branded-model-photos/`.

In-place browsing verification: All / Tops / Bottoms / Outerwear switch the homepage grid without changing its URL. The fixtures displayed 8 / 7 / 3 / 2 products from their respective collections. All 60 color previews across these grids loaded the matching product/color image without navigation, updated the variant link and price, and exposed a selected-state ring. The same 60 checks also passed with the theme-asset fallback used before native Shopify media upload. Initial merchandising contains Black, White and Grey. Enter/Space controls worked on mobile; a blocked image request kept the previous photo and allowed a successful retry. The existing 21 storefront regression checks also passed. Evidence: `artifacts/browse-interaction-validation.json`, `artifacts/browse-interaction-fallback-validation.json`, `artifacts/mixed-color-grid.png`, `artifacts/in-place-browse-mobile.png`.

Transparent always-sticky header verification: the native Dawn header stayed at viewport top after scroll positions 500 → 1000 → 350 → 0 on the homepage, collection and product pages at 1440px and 390px. Its computed background remained transparent, no hidden-header class appeared, and the desktop campaign starts beneath the header. The five-width layout checks also passed. Evidence: `artifacts/home-layout-validation.json`, `artifacts/transparent-header-top.png`, `artifacts/transparent-header-scroll.png`.

The latest reference-layout update removes the two top strips, centers a text-only SIDEFORM header, centers New Arrivals with collection links, and replaces architectural placeholder banners with a four-panel photographic collage. The dedicated layout review passed at 1440, 990, 768, 390 and 320 pixels: centered wordmark, no navigation overlap, three loaded editorial photos, four category links, no horizontal overflow and contained buttons. The full 21 storefront regression checks passed after the structural changes. See `artifacts/home-layout-validation.json`, `artifacts/editorial-1440.png`, `artifacts/editorial-390.png`, `artifacts/new-arrivals-layout.png` and `artifacts/navbar-layout.png`.

Shopify Theme Check: **0 errors, 9 warnings**. The warnings concern retained Dawn code (snippet usage, naming, Liquid complexity and static-analysis limitations); no new SIDEFORM file has an offense. Full output: `artifacts/theme-check.json`.

Catalog validation: **12 distinct products, 108 unique SKUs and all 9 color/size combinations per product**. Checked draft/unpublished import state, tracked sample quantities, deny-overselling policy, sold-out examples, garment-specific three-row/four-measurement tables, positive centimeter values, all 108 shot-list asset references, all 108 product-photo references and JSON templates. Optional metafield helper dry-run: 4 definitions and 48 metafields, with no network requests.

Browser verification used installed Google Chrome on Windows. The review harness rendered the actual theme sections/snippets with LiquidJS and ran the actual Dawn frontend components. Shopify section-rendering, cart and product objects were **emulated on localhost**. This verifies the local frontend integration, not a Shopify deployment. The preview's checkout route only displays an explanatory completion screen.

The main browser suite passed these checks:

- Homepage displays eight editable-collection products and six main navigation destinations.
- No horizontal overflow or broken images at desktop widths 1440 and 1920, tablet 768, and mobile 390 and 320 pixels.
- A valid explicit color and size selection is required; clicking the preselected Black/Small values works.
- Dawn's selected variant ID updates correctly for White/Medium; matching AI sample photography follows the selection.
- Front, back and detail thumbnails change the main image; enlarged sample-photo view supports Escape and returns focus.
- Size guide displays three garment-measurement rows; Escape closes it and returns focus to its trigger.
- Grey/Large sold-out variants disable Add to Cart and show the sold-out label.
- Dawn's cart drawer opens after adding the selected variant; line options and cart count update.
- Quantity 2 at a sample $42 price updates the line and estimated subtotal to $84; item removal returns the empty state and zero count.
- Cargo pants display waist, hip, inseam and overall-length measurements; mobile product and guide layouts remain usable at 390 pixels.
- Native Dawn media-gallery fixtures show only the three selected-color views and their image thumbnails; thumbnails select the corresponding view.
- Collection renders all twelve products and responds to native sorting. Search returns matching products and provides an empty state with a continue-browsing link.
- Cart checkout submits to the checkout route in the local emulator.
- No uncaught JavaScript errors occurred in the main tested flows.

Additional edge checks passed: absent sizing hides the guide, native Dawn lightbox opens the selected-color image and closes with Escape, Shopify-style stock errors are displayed, and failed network requests give retry guidance. Results: `artifacts/browser-validation.json` and `artifacts/edge-validation.json`.

Screenshots were inspected for desktop homepage/product/collection, mobile homepage/product/size guide, cart drawer and native gallery. Visual review corrected the mobile wordmark wrapping and inherited thumbnail HTML escaping. The olive editorial background was slightly darkened for normal-text contrast with white.

## Requires an unpublished Shopify preview

No Shopify store credentials or connection were provided. Consequently, the following were **not performed**:

- Uploading, saving, publishing or serving this theme from Shopify.
- CSV import acceptance, sales-channel publication, collection/menu creation, inventory-location allocation or Admin API metafield writes.
- Shopify section-rendering integration against real storefront objects and Shopify's cart backend, including session persistence and server-side stock limits.
- Configured Search & Discovery filters, product category taxonomy, real predictive-search results, markets, multi-currency output or localization.
- Merchant photography of manufactured garments, actual Shopify variant image assignments, or videos. The local preview includes AI-generated on-model front imagery.
- Shopify hosted-checkout navigation, test payment, shipping/tax calculations, order confirmation or customer-account flows.
- Physical-device, screen-reader or complete WCAG audit with final merchant content.

Run the store-only acceptance steps in `LAUNCH-CHECKLIST.md` after importing and configuring the development store. Do not treat the local endpoint emulator as a real Shopify cart or checkout.


## Product-photography update

The earlier illustrations have been replaced by **108 individual photorealistic AI-generated images** (12 products × 3 colors × front/back/detail). The 72 legacy SVG assets and old snippets are archived outside the uploadable theme. Original PNGs are retained unchanged in `catalog/product-photos/`; the storefront uses full-size and smaller responsive JPEG delivery copies.

Completed verification:

- All 108 product/color/view images and 108 responsive copies decode, have the expected portrait aspect ratio, and exist under unique product-specific filenames. All 108 full-size photographs have distinct checksums.
- Black, Grey and White front-image samples have the expected relative luminance for all twelve garments.
- All twelve product review grids were visually inspected for matching cuts, pockets, closures, branding, color and view.
- The browser exercised **all 108 color/view selections** across all twelve products using Dawn's native gallery. Every active image matched its product, color and view and loaded successfully; no uncaught JavaScript errors occurred.
- The 21 storefront regression checks and 4 edge checks passed again with the photo assets, including the asset-backed fallback gallery, color changes, responsive layouts, size guides, image zoom, cart quantity/removal and useful stock/network errors.
- Media-import CSV preparation was tested with temporary test URLs: 108 unique image rows and correct color-front variant assignments. The temporary test CSV was removed; no fabricated public URLs are included as a ready-to-import catalog.
- Shopify Theme Check still reports 0 errors and 9 retained Dawn warnings.

Evidence: `artifacts/photo-validation.json`, `artifacts/photo-browser-validation.json`, refreshed storefront screenshots and `artifacts/photo-review/`. The preview is still local; no Shopify product-media upload or store import was performed. Images remain explicitly labeled as AI-generated samples and require verification against manufactured garments before launch.

## On-model primary-image update

All 36 primary images (12 products × Black / White / Grey) now show adult models wearing the same sample garments. All twelve three-color model review sheets were visually checked for model identity, framing, silhouette, seams, pockets, closures and marks. The previous garment-only front originals are preserved; the back and detail images remain unchanged. New originals and the exact prompt set are in `catalog/model-photos/` and `catalog/model-generation.json`.

Photo validation passed for all 108 current images, including the 36 on-model originals, 216 JPEGs, unique checksums and garment color luminance. The complete 108 color/view browser checks and all 21 responsive, product, guide and cart regression checks passed again with no uncaught JavaScript errors. Evidence: `artifacts/model-review/`, `artifacts/photo-validation.json`, `artifacts/photo-browser-validation.json`, and `artifacts/browser-validation.json`.

Latest cargo banner: black pants on off-white photographic concrete, matching the light neutral editorial palette. Active asset: `sf-editorial-cargo-black-pale.jpg` with responsive 480px copy. Original and built-in imagegen prompt: `catalog/cargo-editorial-black-pale.png`, `catalog/cargo-editorial-pale-generation.json`.


## Offset Heavy Tee four-photo review — 2026-10-21

Offset Heavy Tee alone now uses model front / full body / hanger rail / neckline detail in a two-column, four-tile gallery. All three generated full-body images and final hanger lineups were visually inspected. Hanger images feature the chosen color facing forward with the other two turned sideways behind it. Built-in imagegen originals and prompts are preserved in the catalog.

The dedicated gallery check passed for all three colors, twelve image-enlargement and Escape/focus-return interactions, two model captions, equal-size 2×2 tiles at 1440/390/320px and no horizontal overflow. The catalog flag is present only on Offset; Plain Box Tee retains its native three-view gallery. Product experience checks passed including favorites, native variants, sold-out guards, size guides, cart add/quantity/remove and six widths. The complete product color/view image matrix passed (111 checks across twelve products). Evidence: `artifacts/offset-four-photo-validation.json`, `offset-four-photo-1440.png`, `offset-four-photo-390.png`, `photo-browser-validation.json` and `product-experience-validation.json`.


Purchase refinement checks passed at 1440/990/768/390/320px: equal quantity/Add to Cart dimensions, shared Favorites edges, stock placement, Size Guide label alignment, transparent captions, no Share and no horizontal overflow. Variant transitions verified In stock → Out of stock → In stock, with sold-out purchase prevention retained. Cart-add quantity text stays visually hidden; local test cart items were removed. Evidence: `artifacts/purchase-layout-validation.json`, `purchase-refinement-1440.png`, `purchase-refinement-390.png`. Theme Check: zero errors.


Gallery refinement checks: four tiles touch without gaps; the purchase-panel description is absent; Features starts closed, opens on request and resets closed after reload. Compared Offset’s enlarged image width against Plain Box Tee’s native modal at 1440px and 390px: matching scale. Full-screen bounds, enlarged-image scrolling, Escape/focus return and body-scroll restoration passed. Three colors and twelve tile zoom checks also passed. Evidence: updated `offset-four-photo-validation.json` and `offset-zoom-1440.png` / `offset-zoom-390.png`. Theme Check: zero errors.


Model captions now convert the stored `custom.model_profile.height_cm` to rounded feet and inches (185 cm = 6 ft 1 in; 173 cm = 5 ft 8 in), retaining worn clothing size. Size guide customer-facing sample-measurement notice removed; source measurement provenance and verification requirements remain in handoff documentation. The garment measurement table remains in centimeters.


Product size picker labels now display S / M / L and the selected-size heading uses the same abbreviation. Native Small / Medium / Large option values, IDs and accessible full-size labels are retained. Browser checks confirmed display labels and native variant/cart behavior.


Header/search regression: confirmed the single saved-product count stays circular at 1920/1440/390/320px. Search opens with a visible input and no oversized spinner, returns catalog suggestions, handles no matches, closes via button/Escape and returns focus. Suggestion links work from home and shop; submitting the full search returns matching products. No uncaught browser errors. Evidence: `header-search-validation.json`, `header-search-{1920|1440|390|320}.png`.


Header reference styling: badge top alignment verified after saving a favorite and adding a cart variant. Header search rounded field, placeholder and width verified at 1920/1440/390/320px; back/close/Escape, suggestions, empty results, product navigation and full search submission passed. Purchase controls and cart badge checks passed at five responsive widths. Theme Check: zero errors. Evidence: `search-bar-1440.png`, `header-counters-1440.png`, updated header/purchase validation files.


Header search sizing refined: centered control group capped at 840px, 36px-high field and 56px search strip. Mobile remains fluid. Search interaction checks passed at 1920/1440/390/320px.


## Approved gallery rollout across all products — 2026-10-21

All 12 products now carry the four-photo gallery tag. Added 66 built-in imagegen originals for the remaining eleven products and reused the six approved Offset originals. Every new six-image product review sheet was visually inspected for the existing model, garment silhouette, colors, branding and selected-color hanger arrangement; bottoms remain unbranded. Final originals: `catalog/product-gallery-photos/`. Exact prompt/reference/output records: `catalog/all-product-gallery-generation.json`, `gallery-batch-*.json`, `product-gallery-output-manifest.json`.

The full browser matrix passed: all 12 products, all three colors, 144 view selections and 144 image-enlargement/Escape/focus-return interactions. Each gallery retains two model captions, feet/inches formatting, S/M/L size labels, collapsed Features, no description beneath Favorites and a gapless 2x2 layout at 1440/390/320px. Zoom selects the full-size image; no missing assets or uncaught browser errors. All 144 responsive gallery JPEGs have expected dimensions and unique checksums; all 108 CSV variant rows are preserved and all twelve title rows carry the gallery tag. Theme Check: zero errors.

Evidence: `artifacts/catalog-gallery-validation.json`, `catalog-gallery-assets-validation.json`, and `artifacts/gallery-review/` (generated-image review sheets and product screenshots). Product-experience regression retains native variant IDs, size guides, sold-out prevention, favorites and cart checks. The earlier Offset-only validation sections record the initial review stage; this rollout supersedes that scope.


Favorites feedback regression passed: remove then re-add on the same page, dialog reopen, and same-browser cross-tab changes all clear obsolete removal messages. Immediate removal feedback remains. Remove computes to red (#b42318), no border underline and no text underline. Desktop/mobile screenshots show the updated state; no uncaught errors. Evidence: `favorites-feedback-validation.json`, `favorites-feedback-1440.png`, `favorites-feedback-390.png`.


Sold-out price badge checks passed for all twelve Grey/Large variants: price badge absent, Out of stock status retained, Add to Cart disabled. Evidence: `artifacts/price-badge-validation.json`.


Size letters no longer use strikethrough when unavailable. Verified all twelve Grey/Large selections display L without a line while Out of stock remains visible and the Sold out purchase button stays disabled.

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


Favorites removal confirmations are now screen-reader-only, so no product-removed sentence or extra message area appears in the dialog. Storage errors remain visible. Remove/re-add, stale-message clearing and hidden confirmation checks passed.


## Homepage category and New arrivals edit

Five category destinations passed with matching catalogs: Hoodies (2), T-shirts including long sleeves (4), Pants (2), Jackets (2), Shorts (1). Four featured products are Offset Heavy Tee, Volume Pullover, Shell Utility Jacket and Grid Cargo Pant. View all new arrivals opens the nine-product tagged collection. Checked headings, section order, five category images, all four product images, temporary color hover/restore and layouts at 1920/1440/768/390/320px with no horizontal overflow. All 21 storefront checks passed again, covering navigation, variants, size guides, sold-out prevention, cart, collection sorting and search. Theme Check: zero errors. Evidence: `homepage-edit-validation.json`, `home-category-arrivals-1440.png`, `home-category-arrivals-390.png`, refreshed storefront validation/screenshots. This replaces the earlier homepage twelve-card/category-tab experiment.


Category cards now fill their grid columns with a larger 3:4 portrait shape and an 18px desktop gap. The category row shares its left/right edges with New arrivals. Mobile uses matching two-column card widths and 12px gaps inside the horizontal scroller. Alignment checks passed at 1920/1440/768/390/320px.


## Collection 002 curation, category models and About footer

New Arrivals now contains exactly Offset Heavy Tee, Volume Pullover, Shell Utility Jacket and Grid Cargo Pant. Their product sidebars show Collection 002; the other eight show Collection 001. All twelve product labels were checked. The new-arrivals collection matches the homepage's four cards, including matching order; the View all new arrivals link and homepage campaign eyebrow are absent. Generic collection headers no longer show Collection 001 / Off the Grid. Category images use the other male hoodie model (Structure Hoodie) and the female jacket model (Shell Utility Jacket).

Homepage/category tests passed at five viewport sizes. About footer placement passed at 1920x1080, 1440x1000, 390x844 and 320x740: footer reaches the viewport bottom or natural page end, with no empty area below it and no horizontal overflow. Theme Check: zero errors. Evidence: `collection-story-validation.json`, updated `homepage-edit-validation.json`, `about-footer-1440.png`, `about-footer-390.png`, and refreshed homepage section screenshots. This supersedes the earlier nine-item New Arrivals curation.


Collection 001 products now show COLLECTION 001 / OFF THE GRID directly below Add to favorites, aligned with that button. All eight Collection 001 products were verified; the four Collection 002 products omit this Collection 001 note. The trial Collection dropdown was removed at user request. Product collection indicators remain in their approved positions.


Cart tab consistency: Shopify cart data remains authoritative; native cart changes notify other tabs to refresh the drawer and count without opening it. Refocusing a tab also refreshes its cart. The local preview now uses an HttpOnly browser cookie for cart lines instead of server-only shared memory, so new tabs, reloads and preview restarts retain the browser cart. Product color selections use a 36px outer circle around the 28px swatch with tighter spacing. Evidence: artifacts/cart-tabs-validation.json.

Shop toolbar refinement: Size Guide is blue (#0066cc) without an underline; it still opens and closes the measurement dialog. Collection product counts are visually hidden while their native live status remains available. Sort by aligns with the product grid right edge at desktop/tablet widths. Checked sorting and layout at 1920, 1440, 990, 768, 390 and 320px. Evidence: artifacts/shop-toolbar-validation.json.

Responsive design pass (21 October 2026): iPad portrait (750-989px) now places the gapless four-photo gallery beside product choices and purchase controls. Tablet category cards show three at a time in a horizontally scrollable row; phones retain two. Phone shop categories stay in one scrollable row, section spacing is tighter, favorites fit narrow screens, footer links remain separate rows with larger tap areas, and dialogs fit short viewports. Search and quantity inputs use 16px text on touch devices to avoid focus enlargement, and the cart supports dynamic viewport height and bottom safe-area padding. The approved desktop presentation and collection indicators remain intact.

Validation: scripts/test-responsive-design.cjs passed full browsing, category navigation, Size Guide, image zoom, favorites, cart, search, menu, contact, About and cart page checks at 320x740, 375x812, 390x844, 430x932, 768x1024, 820x1180, 1024x768, 1180x820, 844x390 and 1440x1000. All 12 product galleries were checked at 320px and 768px. No page overflow or uncaught browser errors. scripts/test-homepage-edit.cjs also passed. Evidence: artifacts/responsive-design-validation.json and responsive-after screenshots. This uses Chrome viewport/touch emulation; physical iPad/iPhone Safari verification remains outstanding.

Phone composition revision: replaces the phone category carousel with a wide Jackets feature above a two-column grid for Hoodies, T-shirts, Pants and Shorts. Approved model photography remains in use, cropped to show upper/lower clothing. Hero text is now inside the phone banner with smaller dark typography over the concrete background. Navbar has menu/search on the left and favorites/cart on the right around a centered brand. Footer branding/description is centered and Explore links use compact 30px rows. Verified banner bounds, non-overlapping centered header, category geometry, footer alignment, menu close, search suggestions, favorites and cart at 320/375/390/430/749px. Evidence: artifacts/phone-composition-validation.json and phone-home-composition screenshots. scripts/test-homepage-edit.cjs passed, including unchanged iPad/desktop layouts. These checks supersede the previous phone carousel description.

Search discovery and compact category reference: scripts/test-search-discovery.cjs passed at 320, 390, 430, 768, 820, 1024, 1440 and 1920px. Checks include full-viewport bounds, no horizontal overflow, two featured cards, five actual category links, query suggestions, clearing queries, category navigation, direct /search discovery and results, and phone sorting/filter/back controls. scripts/test-header-search.cjs passed closing/focus return, badges, suggestions, empty queries, result navigation and submission on desktop and phone. scripts/test-phone-composition.cjs passed restored white hero text/CTA, smaller right-side search icon, centered category heading, transparent caption panels and phone layout geometry at five widths. Evidence: artifacts/search-discovery-validation.json, artifacts/phone-composition-validation.json and corresponding screenshots. Earlier compact-search dimensions and left-side search placement are superseded by this revision.

Phone gallery and image-card revision: all custom product photo sets now use a one-photo-at-a-time, native horizontal scroll-snap carousel below 750px, with swipe, dots, previous/next, keyboard arrows, zoom and a live photo status. Color changes reset to the first photo. Responsive image sizing now requests approximately the full phone content width. Tablet and desktop retain the approved four-photo grid. Category model photos cover the entire phone card and captions overlay the image, without a separate label strip. The collection category/sort/product spacing is reduced. Search now separates T-shirts and Sweatshirts in Featured and All categories, with a real Sweatshirts collection tagged to Contour Crew (catalog, CSV, generator and preview aligned).

Validation: scripts/test-phone-carousel.cjs passed gallery controls, zoom, color reset, grid preservation and phone toolbar spacing at 320/390/430/749/768/1024/1440px; Sweatshirts contains only Contour Crew. scripts/test-search-discovery.cjs passed three featured cards and six category links at eight widths. Theme Check reports zero errors. Evidence: artifacts/phone-carousel-validation.json and artifacts/search-discovery-validation.json. Earlier two-card Featured and five-category search counts are superseded.

Compact sorting/menu/grouping/iPad mini revision: scripts/test-menu-sort-grouping.cjs passed at 320/390/430/768/820/989/1024px, including 12px sort options and selected ordering, Escape closing, 70vw phone drawer, nested Shop navigation, outside-backdrop dismissal, phone-style category geometry on iPad mini, and search labels. Actual collections were verified: T-shirts has Offset/Plain tees; Sweatshirts & long sleeves has Axis/Frame long sleeves and Contour Crew. Evidence: artifacts/menu-sort-grouping-validation.json.

Restored editorial section: below New arrivals, three model photo tiles link to Tops/Outerwear/Bottoms. The olive tile contains the original SIDEFORM copy "Your city. Your pace. Your form." with no collection label or CTA. scripts/test-restored-editorial.cjs passed at 320/390/430/768/820/989/1024/1440/1920px, checking all text and buttons stay within their tiles, correct links, quote content, and no horizontal page overflow. Desktop retains the collage, tablet uses a balanced two-by-two layout, and phone tiles adapt to available width. scripts/test-homepage-edit.cjs passed after restoring section order. Theme Check has zero errors. Evidence: artifacts/restored-editorial-validation.json and restored-editorial screenshots. These revisions supersede the earlier one-product Sweatshirts grouping, tablet category carousel, and removed editorial section state.

Room to move editorial image update: full-body shot with the existing white-hoodie model in black SIDEFORM Grid Cargo Pant, shoes visible. The new generated asset was visually inspected, installed as dedicated editorial JPEGs and tested through scripts/test-restored-editorial.cjs at nine widths (320 through 1920px). Both full-resolution and responsive sources are kept inside the workspace; prompt/reference provenance is saved. Desktop and phone screenshots confirm head and shoes are not cropped. The original product photograph is preserved.

Card favorites and gallery controls revision: every shared product-card color row now includes a heart aligned to the swatches. It uses the same product-level local favorites storage as the product-page button, synchronizes saved state on asynchronously inserted cards, and updates header counts. Home, collection, search and native product recommendation cards were tested at 320/390/768/820/989/1440px, including cross-page persistence and category navigation. Evidence: artifacts/card-favorites-validation.json. Existing test selectors now scope the primary favorite button to .sf-product-page to distinguish it from card hearts.

The product gallery is now a carousel through 989px, preserving the iPad mini side-by-side gallery/purchase columns. Dots were replaced by a visible fraction (1/4) between arrows, positioned inside the image at bottom center. Arrows, keyboard, zoom and color reset passed; wide desktop retains the photo grid. The neutral editorial photo removes the violet cast, while Shop bottoms is single-line and sits lower in its card. scripts/test-phone-carousel.cjs and scripts/test-restored-editorial.cjs passed. Prompt and original neutral PNG are retained in the workspace and handoff archive.

Single-background editorial correction: installed a transparent model cutout over the existing outer gray tile. Verified transparent alpha at empty canvas points and visually confirmed the complete tile has one background color. scripts/test-restored-editorial.cjs passed nine viewport widths with head/shoes visible, correct text/links and no overflow. Updated restored-editorial screenshots show the final single-color result. Theme Check has zero errors.

Category CTA consistency: phone and iPad mini cards (through 989px) now use the supplied outlined SHOP NOW style: 1px white border, uppercase white text, slim arrow and translucent dark background. Verified all five cards at 320/390/768/820/989px: buttons fit within each card, no horizontal page overflow, and collection navigation works.

Category CTA preview revision: all screen sizes now use the hero-style solid off-white background, dark uppercase text and slim arrow, scaled smaller than the hero CTA. This supersedes the outlined phone/iPad-only style. Verified all five category buttons at 320/390/768/820/1024/1440/1920px for consistent styles, fitting within cards, no page overflow and working collection navigation. Preview screenshots: artifacts/category-hero-buttons-390.png and -1440.png.

Button scale/spacing refinement: solid category CTAs scale from 9px text/32px height on narrow phones to 10px/34px on phones, 11px/38px on tablets and 11px/40px on desktop. Shop bottoms no longer uses auto top margin and follows its heading at the same normal spacing as the editorial cards. Checked all category buttons fit, no page overflow and a 0-28px title-to-button gap at 320/390/430/768/820/1024/1440/1920px. This supersedes the earlier bottom-anchored Shop bottoms placement.

Editorial text clearance and iPad Pro layout: cargo photo now occupies the right 48% of its tile with a soft fade at the left boundary, leaving a clear solid area behind the heading and CTA. At 750-1399px, including iPad Pro 13 portrait (1032px) and landscape (1366px), the four editorial tiles form a two-by-two grid matching the reference. Verified text ends before the opaque photo area at 440/1032/1366px, no page overflow, and correct two-row tablet geometry. scripts/test-restored-editorial.cjs also passed nine widths. Wider desktop retains its collage.

Phone editorial stacking: all four tiles now use a single full-width column below 750px, giving the cargo photograph more visible space. Confirmed stacking and equal widths at 320/390/440/749px, and preserved the two-by-two tablet layout at 768/1032px. No page overflow. Evidence: artifacts/editorial-phone-single-column.png.

Cargo fade removal: phone and tablet editorial cargo photographs now use no CSS mask or gradient through 1399px. Verified standard and WebKit mask properties resolve to none at 320/440/768/1032/1366px, with no page overflow.

Cargo original-background restoration: the original cargo photograph now fills the entire tile with no side panel or gradient mask. Phone and tablet cargo cards retain the photograph's 3:2 ratio to show the full original framing and keep the heading over its empty wall area. The adjacent tablet quote adjusts to the same row. Visually checked phone and tablet screenshots; scripts/test-restored-editorial.cjs passed nine widths. This supersedes the cropped right-half photo arrangement.

Transparent carousel and product Back control: carousel control group has no background on phone/iPad mini; previous/next arrows align with the vertical midpoint at the image edges and the fraction stays bottom-center. Checked geometry/transparency at 320/440/768/820/989px, and no product Back control at desktop 1024px. Burger-navbar product layouts now show Back above the gallery; verified it returns to the previous same-origin browse URL with sort parameters intact, with /collections/all fallback for direct-entry visits. Existing carousel navigation/zoom/color checks passed. Evidence: artifacts/carousel-side-arrows-440.png and -820.png.

Collection Back navigation: verified at 320, 440, 768, 820, 989 and 1024px. Arrow appears throughout burger-navbar widths and its SVG center aligns with the collection title. Desktop visibility remains unchanged.

Category button hover: matched editorial button dark outline and paper background; verified all five cards at 390, 768 and 1440px with unchanged button dimensions and keyboard focus. Animation respects reduced motion.

Card photo hover zoom: 4% over 300ms on fine-pointer hover devices. Verified homepage, collections, search results, related products and category cards; existing category crops remain intact, zoom is clipped within photos, and reduced-motion preference disables it.

Carousel positioning: explicit block gallery and regular positioned viewport now anchor the overlay. scripts/test-carousel-position.cjs passed Chromium and WebKit at 320, 390, 414 (iPhone 11), 768, 896 landscape, 989 and 1024px; checked side arrow centers, bottom-centered fraction, next-photo navigation and desktop control visibility. This is browser-engine simulation, not a physical iPhone test.

Bottoms second-photo pose updates: visually reviewed nine generated outputs, exported 1122x1402 and 480x600 JPEGs, verified Black/White/Grey switching and second-slide access for all three bottoms at 414, 768 and 1440px, with no horizontal page overflow.

Product subtotal trial: a 13px live line appears below quantity/Add to Cart and above stock only for quantities greater than one. Unit price stays unchanged. Verified 2 and 3 items, typed quantities, hiding at one/empty input, synchronization after native variant/quantity-rule updates, and placement at 390, 768 and 1440px (scripts/test-product-subtotal.cjs).

Mobile cart heading: TOTAL now occupies the right header column and shares the product amount's right edge. Verified at 320, 390, 440 and 749px; table column-header semantics retained.

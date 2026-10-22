# SIDEFORM — development-store setup

This is a Shopify Online Store 2.0 theme built on Shopify Dawn 16.0.0, upstream commit `258f00f64365e2018ca4c62778a6bf55a5d3cd18`. Dawn's MIT license remains in `theme/LICENSE.md`. All catalog information is sample data. No Shopify account was connected, no products were imported, and no live theme was changed.

If starting from `SIDEFORM-handoff.zip`, extract it into a folder, then extract the included `SIDEFORM-theme.zip` into a `theme/` subfolder to restore the source layout used by the scripts and local review. Shopify itself takes `SIDEFORM-theme.zip` directly.

## Upload and preview

1. In a development store, go to **Online Store → Themes → Add theme → Upload ZIP** and upload `artifacts/SIDEFORM-theme.zip`. Leave it in the theme library, unpublished.
2. Alternatively, with Shopify CLI installed and an authorized store, run `shopify theme push --unpublished --path theme --store YOUR-DEV-STORE.myshopify.com`. Review the store name before running it. Use the preview URL Shopify returns.
3. Set the store name to SIDEFORM. Select the theme's **Customize** action. Theme settings provide colors, typography, spacing, cart type, search, logo, and social URLs.
4. Choose **Cart → Drawer** (already the default). Keep the product template's dynamic checkout off until the configuration is verified. Native checkout remains available from the cart.
5. The supplied original campaign and symbol remain included assets. The default hero is an AI-edited version of that campaign: branded White/Black T-shirts, the Black Grid Cargo Pant and the Grey Interval Utility Short, with no bottom logos or screenshot border. Responsive delivery uses `sideform-campaign-branded.jpg` and its 750px copy. The header uses a centered **SIDEFORM text-only wordmark**, navigation on the left and search/cart on the right. **Transparent header** is disabled for a solid background. **Sticky header → Always** keeps it visible in both directions. The campaign starts below the navigation on every screen size. The symbol appears in the footer. The Header setting **Use SIDEFORM text without symbol** controls the wordmark treatment. The announcement bar is removed from the header group.

## Import catalog and inventory

1. Import `catalog/sideform-products.csv` through **Products → Import**, checking the import preview first. It contains **12 products, each with 9 variants**: Color = Black / White / Grey; Size = Small / Medium / Large. Each variant has a unique SKU, numeric price, inventory tracking, and a deny-overselling policy.
2. Products import as **draft** and unpublished. In the designated development store only, make them active and available on the Online Store channel to populate the preview. The theme cannot display draft products on the storefront. Do not activate this sample inventory on a production store.
3. Every Grey / Large variant has sample inventory 0; the other variants have 12, 16 or 20 units. These quantities are illustrative. For multiple locations, export Shopify's **inventory CSV after product import**, preserve the location columns, fill the intended location from `sample-inventory-reference.csv`, and reimport that inventory export. The reference file is a lookup, not an inventory import file.
4. CSV prices are sample numeric amounts in the store's configured currency. The local review uses USD for illustration. Confirm the store currency and replace all prices, weights, taxes and stock values before launch. The theme uses Shopify money filters everywhere customer prices are rendered.

## Collections and navigation

Create automated collections with the exact handles below. Only Volume Pullover, Structure Hoodie, Shell Utility Jacket and Transit Work Jacket carry the `new-arrivals` and `collection-002` tags; the other eight products carry `collection-001`.

| Menu label | Handle / link | Rule |
| --- | --- | --- |
| Shop All | `/collections/all` | Shopify's native all-products collection |
| New Arrivals | `new-arrivals` | Product tag equals `new-arrivals` |
| Tops | `tops` | Product tag equals `tops` |
| Bottoms | `bottoms` | Product tag equals `bottoms` |
| Outerwear | `outerwear` | Product tag equals `outerwear` |
| Hoodies | `hoodies` | Product tag equals `hoodies` |
| T-shirts | `t-shirts` | Product tag equals `t-shirts` |
| Pants | `pants` | Product tag equals `pants` |
| Jackets | `jackets` | Product tag equals `jackets` |
| Shorts | `shorts` | Product tag equals `shorts` |
| Collection 001 | `collection-001` | Product tag equals `collection-001` |
| Collection 002 | `collection-002` | Product tag equals `collection-002` |
| About | `/pages/about` | Create an About page with merchant-approved brand copy |

Set **Content → Menus → Main menu** (handle `main-menu`) to **Home** (`/`), **Shop** (`/collections/all`), **About** (`/pages/about`) and **Contact** (`/pages/contact`). Nest **Shop All** (`/collections/all`), **New Arrivals**, **Tops**, **Bottoms**, and **Outerwear** beneath Shop, in that order. The Shop parent opens the native dropdown. Use the structure in `catalog/navigation.json` as the setup reference (it is not a Shopify product CSV). Assign the menu in Header, with desktop menu type **Dropdown**. Create Contact using the supplied `page.contact` template to enable Shopify’s native contact form. Create a `footer` menu with the relevant collection, About and contact links, then assign it in SIDEFORM footer. Use Shopify page links so handles remain consistent. A supplied `page.about` template can be selected for the About page.

## Homepage

The default homepage is campaign → Shop by category (five image cards) → New arrivals (four products) → brand perspective. These are separate, reorderable sections in the theme editor.

- **SIDEFORM campaign:** replaceable desktop/mobile photographs, independent image positioning, headline, short copy, button label/link, text color and copy spacing. Desktop copy occupies the left open space. With no mobile override, mobile shows the full photograph above the text to retain both models and their clothing.
- **SIDEFORM shop by category:** five image cards for Hoodies, T-shirts, Pants, Jackets and Shorts, each with a category name and Shop now overlay. Assign the matching automated collections in the theme editor using the exact handles above. Each block supports replacement photography and a fallback link. Desktop shows one row; mobile scrolls horizontally with a partial next card visible.
- **SIDEFORM new arrivals:** selects four curated products through the native product-list setting: Volume Pullover, Structure Hoodie, Shell Utility Jacket and Transit Work Jacket. Keep New Arrivals selected as the fallback collection if no products are picked. The extra View all new arrivals link has been removed. Four columns on desktop, two on mobile. The New Arrivals collection contains exactly these four products, matching the homepage picks, and is treated as Collection 002. No artificial release dates were added.
- The prior twelve-card Collections grid and repeated editorial collage are replaced by these two sections. The original Featured collection and SIDEFORM editorial sections remain available for reuse in the theme editor. `test-browse-interactions.cjs` describes that earlier in-place homepage experiment; current homepage checks are `test-homepage-edit.cjs`, `test-color-hover.cjs` and `test-storefront.cjs`.
- **SIDEFORM perspective:** editable brand copy and About link.
- **SIDEFORM footer:** brand description, menu and development note. Social links are populated from Dawn's social settings. Unconfigured policies display “merchant content required” instead of dead links. Set approved policies in **Settings → Policies**; actual policy links then appear automatically.

## Photography and color grouping

The 12 sample products now have **108 individual photorealistic AI-generated photographs**: Black, White and Grey × front, back and detail views for each product. The drawings are archived outside the theme. No unrelated branded photography or reference collage is used.

- Use `artifacts/SIDEFORM-product-photos.zip` and `catalog/product-photo-manifest.csv` for native Shopify product-media upload. Every image is product-specific, with a matching color and view.
- Until native media is uploaded, the theme displays these photos from its assets for the matching sample-product handles. Shopify product media takes precedence automatically. Cards and cart thumbnails also use the corresponding photos.
- Product cards initially alternate Black, White and Grey. Each color swatch is a button that previews matching native variant/color-tagged imagery (or the sample asset fallback), updates its selected ring and price, and prepares the product link with the matching variant. Swatches never navigate or add an item. Image or product-title clicks still open the product page. Missing photos disable that preview; load failures retain the previous image and offer retry guidance.
- Preserve `[color:Black]`, `[color:White]` and `[color:Grey]` in each descriptive alt text to group the native gallery by color. Assign every color's front photograph to all three sizes of that color in Shopify's variant editor.
- Keep gallery layout **Thumbnail**, mobile thumbnails **Show**, **Hide other variant media** off, and zoom **Lightbox**.
- The `ai-sample-media` product tag identifies the generated sample media. Remove it only after replacing the AI sample photos with verified physical-garment photography; the custom sample-photo fallback remains explicitly labeled.
- See `docs/PRODUCT-PHOTOGRAPHY.md` for the complete art direction, preserved originals, prompt set, media files and optional public-URL CSV preparation script.

These are AI-generated merchandising concepts, not evidence of manufactured inventory. Verify the depicted construction and colors against actual products before launch.

## Product details and sizing

Create product metafield definitions in **Settings → Custom data → Products**:

| Namespace and key | Type | Purpose |
| --- | --- | --- |
| `custom.material` | Multi-line text | Material details |
| `custom.fit` | Multi-line text | Silhouette and fit |
| `custom.care` | Multi-line text | Care instructions |
| `custom.size_guide` | JSON | Product-specific measurement table |

Exact definitions are supplied in `catalog/metafield-definitions.json`; all 12 products' values are in `catalog/product-metafields.json`. These JSON files are **not native Shopify bulk-import files**. Copy the values into the matching product metafields, or use the optional Admin API helper after the product CSV is imported:

```powershell
python scripts/apply-metafields.py                         # dry run; no network requests
# Set SHOPIFY_ADMIN_TOKEN securely in the process environment, then:
python scripts/apply-metafields.py --apply --store YOUR-DEV-STORE.myshopify.com
```

The helper uses read/write product permissions, creates missing definitions, resolves products by handle, and sets 48 metafields. It does not publish products or a theme. It has been validated in dry-run only; no Admin API writes were performed. It overwrites these four keys for the named sample handles, so run it against the intended development store only.

Example `custom.size_guide` value:

```json
{
  "sample": true,
  "unit": "cm",
  "basis": "garment_flat",
  "columns": ["Chest width", "Body length", "Shoulder width", "Sleeve length"],
  "rows": [
    {"size": "Small", "values": [60, 72, 58, 24]},
    {"size": "Medium", "values": [63, 74, 60, 25]},
    {"size": "Large", "values": [66, 76, 62, 26]}
  ],
  "instructions": "Lay flat without stretching. Chest: armpit to armpit. Body: high shoulder beside neck to hem. Shoulder: seam to seam across back. Sleeve: shoulder seam to cuff."
}
```

Bottoms use waist width, hip width, inseam and overall length. All measurements describe the garment laid flat, not the wearer; width is half-circumference. The dialog is hidden when data is missing. Keep `sample: true` until each product is measured and verified, then replace values and set it to false. The dialog supports Escape, native keyboard focus containment, close buttons and focus return.

## Filtering and search

Dawn's native collection and search sections retain sorting and storefront-filter rendering. In Shopify's first-party **Search & Discovery** configuration, enable Availability, Price, Product type (label it Category), Color and Size filters. Category/taxonomy filters can also be enabled after the merchant supplies verified Shopify product categories. These filters appear only when the store makes them available through `collection.filters` / `search.filters`; the theme does not fake unavailable filter data. No third-party app is required. Search uses Shopify's native search routes and results.

## Local review and validation

```powershell
npm ci --prefix tooling
node preview/server.cjs
# Open http://localhost:4173
python scripts/validate-catalog.py
node tooling/node_modules/@shopify/cli/bin/run.js theme check --path theme
node scripts/test-storefront.cjs
```

The preview renders the **actual Liquid sections/snippets and Dawn JavaScript** with sample Shopify objects. It emulates Shopify AJAX endpoints in memory on localhost; its bag resets when the process restarts. It cannot accept orders or payments. The browser tests use the installed Chrome path on Windows; edit the executable path if using another machine. The local preview uses all nine generated photo media objects on each product to exercise Dawn's native gallery. `?gallery=fallback` tests the asset-backed gallery used before native media upload. That query is a review-harness feature, not a production storefront feature.

See `artifacts/browser-validation.json` and `docs/VALIDATION.md` for completed checks and store-only checks. For final acceptance, repeat all critical flows on the **unpublished Shopify preview** with real product media and store data. Leave publication as a separate merchant action after approval.

Shopify references: [product CSV import](https://help.shopify.com/en/manual/products/import-export/using-csv), [inventory CSV](https://help.shopify.com/en/manual/inventory-and-locations/setup/inventory-csv), [native storefront filtering](https://shopify.dev/docs/storefronts/themes/navigation-search/filtering/storefront-filtering), [variant support](https://shopify.dev/docs/storefronts/themes/product-merchandising/variants), [JSON metafield values in Liquid](https://shopify.dev/docs/api/liquid/objects/metafield).

Product grid update: homepage New arrivals shows four curated products in four desktop columns and two mobile columns, with square garment-only photos. Sample cards and their Black/White/Grey swatches use `sf-packshot-{handle}-{color}-front.jpg` and responsive `-480.jpg` copies, encoded from the original garment photographs in `catalog/product-photos`. Product detail galleries and editorial/campaign photos retain their existing imagery. For merchant media, use untagged real Shopify products and their uploaded color media.

Brand refinements: the product display name is **Plain Box Tee** (the existing `plane-box-tee` handle remains stable). Homepage/About/footer copy explicitly describes streetwear. The default footer symbol is a background-free vector with two offset rectangles; a merchant-uploaded replacement still takes precedence. The bottoms editorial uses `sf-editorial-cargo-grey.jpg`, an AI-generated angled close-up of Grey Grid Cargo Pants; original and prompt are in `catalog/cargo-editorial-grey.png` and `catalog/cargo-editorial-generation.json`. Product cards show garment type to distinguish long-sleeve T-shirts from sweatshirts.

The latest cargo banner uses `sf-editorial-cargo-black.jpg`: black unbranded cargo pants with the actual concrete wall/floor across the entire tile, including behind the text. The pale panel and mask fade are removed for this banner. Original and built-in imagegen prompt: `catalog/cargo-editorial-black.png` and `catalog/cargo-editorial-black-generation.json`.

Latest cargo banner: black pants on off-white photographic concrete, matching the light neutral editorial palette. Active asset: `sf-editorial-cargo-black-pale.jpg` with responsive 480px copy. Original and built-in imagegen prompt: `catalog/cargo-editorial-black-pale.png`, `catalog/cargo-editorial-pale-generation.json`.

Shop collection pages now expose **All / New Arrivals / Tops / Bottoms / Outerwear** above the sorting controls. Collection template → Product grid → **Show SIDEFORM category links** controls visibility. The links use Shopify collections `tops`, `bottoms`, `outerwear` and the native all-products URL. JavaScript loads the chosen collection in place, preserving `sort_by` but clearing category-specific filters and pagination; URLs remain shareable with native link fallback. Dawn retains sorting/filtering and pagination within the chosen collection.

Product-card color controls now preview matching photography on mouse hover and keyboard focus, as well as click/tap. Hover and keyboard focus temporarily preview only the photograph; leaving the swatch or moving focus restores the original or last clicked color. Click/tap commits the color and updates its variant link and price. Delegated handlers also cover grids replaced by category switching; touch uses tap.


## Product detail presentation and favorites

Product template → Main product uses Dawn’s **Columns** gallery and **Columns** mobile presentation. Color grouping, native variant IDs/forms, size guide, media lightbox and cart remain in Dawn. The purchase panel uses circular color controls, clear size buttons and a quantity/Add to Cart row. The **SIDEFORM product features** section below the gallery presents Features, Details, Material / Care, and shipping/return policy links when those policies are configured. Headings and spacing are editable; features read existing product material/fit/care metafields.

The header heart sits between search and cart on every page. Product **Add to favorites** saves the product to browser local storage (`sideform-favorites-v1`), survives reload/navigation, synchronizes across same-browser tabs, and supports removal from an accessible dialog. It does not require an app or account; it does not synchronize between devices. Storage failures show feedback. Favorites are product-level, with saved links returning to the product’s default variant.

Define product JSON metafield **custom.model_profile** (see `catalog/metafield-definitions.json`) and populate from `catalog/product-metafields.json`. Shape: `{"height_cm":185,"wearing_size":"Large","assumed":true}`. The requested styling assumptions are 185 cm / Large for male model images, and 173 cm / Medium for female model images. These are invented styling references, not measured model data; replace with verified shoot measurements and actual worn size before launch. The caption appears on native media tagged `on-model` in its alt text; fallback model fronts show it too. It hides if the metafield is absent. Captions describe the photographed outfit and do not change when the shopper selects a size. Product photo disclosure banners have been removed from the page; generation provenance remains in the catalog and these docs.


## Product gallery layouts

Keep the existing sf-four-photo-gallery catalog tag: it enables the custom product gallery. The snippet uses the existing tops or outerwear tag to select six images in this order: male half-body, two-model low-angle, two-model full-body, female half-body, hanger lineup, garment detail. Bottoms use primary solo full-body, paired close-up, paired full-body, companion solo full-body, hanger lineup and detail. Cargo and jeans start with the male model; shorts start with the female model. Paired pants poses follow the supplied leaning full-body and lower-chest-to-shoes references; shorts follow the supplied paired standing poses, with the close view framed through the knees. Desktop uses two columns; phone and tablet use the existing swipe carousel with a six-photo counter.

Grid Cargo Pant's model is the curly-haired male in an oversized grey tee. Drift Baggy Jean uses the Black male, and Interval Utility Short uses the female. Preserve the updated cargo model-profile metafield when importing. The curly-haired male appears on four upper garments as well.

Final generated originals, prompts and references: catalog/six-photo-gallery/generation.json and adjacent PNGs. Run python scripts/install-six-photo-gallery.py to export full and 480px WebP copies. The installer refuses completion if any new color/view is absent. Reused half-body photographs come from the existing front WebP files. New asset names are sf-gallery-{handle}-{color}-{male|female|duolow|duofull|duoclose}[-480].webp; existing lineup/detail names remain compatible. Native variant forms, size guides, favorites and cart remain active.

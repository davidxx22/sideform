# SIDEFORM

A complete development-ready Shopify Online Store 2.0 implementation based on official Dawn 16.0.0. Minimal streetwear, architectural spacing, the supplied campaign photograph and the supplied offset-bar symbol. Native Shopify product forms, variant selection, filters, search, cart drawer/cart page, and hosted-checkout links remain in Dawn.

**Status:** local implementation and review fixtures complete. No Shopify store was connected, imported into, or published. Product specifications, measurements, prices, inventory and generated-photography provenance are documented in the catalog and handoff guides. Verification against manufactured garments remains required.

All 12 products have a gapless four-photo gallery in Black, White and Grey: model front, matching full-body photo, selected-color hanger lineup and garment detail. Tops and jackets carry the two-rectangle logo; bottoms remain unbranded. Original back photographs are retained as source assets. Saved originals, prompts and output records are in `catalog/model-photos/`, `catalog/offset-four-photo/`, `catalog/product-gallery-photos/` and the accompanying generation manifests.

The homepage has five Shop by category image cards and four curated New arrivals products. New Arrivals contains only those four Collection 002 pieces; the other eight products belong to Collection 001. The storefront includes category navigation, temporary color-hover previews, browser-saved favorites, a compact rounded search field, cart drawer, size guides, S/M/L selectors and model-height captions in feet and inches. Unavailable variants retain their stock message and disabled purchase button, without a price badge or crossed-out size text.

- `theme/` — uploadable Liquid theme: all Dawn sections, snippets, templates, CSS, JavaScript and locales, plus SIDEFORM extensions.
- `artifacts/SIDEFORM-theme.zip` — Shopify upload package.
- `catalog/sideform-products.csv` — 12 draft products, 108 unique variants; Black / White / Grey × Small / Medium / Large.
- `catalog/product-metafields.json` — 60 material, fit, care, sizing and model-profile metafield values, with definitions alongside.
- `catalog/product-photo-manifest.csv` — 108 product/color/view photographs and upload metadata.
- `artifacts/SIDEFORM-product-photos.zip` — full-size JPEG photo library for Shopify upload.
- `docs/PRODUCT-PHOTOGRAPHY.md` — art direction, prompts, files and media setup.
- `docs/SETUP.md` — upload, catalog, collections, menus, photography, filters, size-guide and preview instructions.
- `docs/LAUNCH-CHECKLIST.md` — required merchant content and launch acceptance checks.
- `docs/VALIDATION.md` — completed checks and limits; browser screenshots and machine-readable results are in `artifacts/`.
- `preview/` — renders the actual theme sections with sample Shopify objects; localhost AJAX endpoints are emulated. No payments.
- `scripts/` — sample catalog generator, photo delivery preparation scripts, validation and optional metafield application helper (dry-run default).
- `site/` and `brand/` — retained earlier concept, not the current Shopify implementation. Its slanted symbol is superseded by the user's supplied offset-bar reference in `theme/assets/sideform-symbol.png`.

To review locally, run `npm ci`, then `npm start`, and open [localhost:4173](http://localhost:4173). Install optional browser and Shopify validation tools with `npm ci --prefix tooling`. The preview uses LiquidJS; the Shopify theme has no added production dependencies.

For a Vercel preview, import this repository at its root with the **Other** framework preset. Build and routing settings are supplied in `vercel.json`; see [Vercel setup](docs/VERCEL.md). Checkout and contact submissions remain demonstrations until connected to a real store.

Generate the delivery ZIPs with `python scripts/package.py`. These rebuildable archives and installed local dependencies are excluded from Git; the theme, original image assets, catalog, scripts and validation records are included.

Read [the setup guide](docs/SETUP.md) before importing or publishing. Upload the theme to an **unpublished development theme** and verify the store-specific acceptance checklist before publication.

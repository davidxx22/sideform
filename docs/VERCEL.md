# Vercel preview deployment

Import `davidxx22/sideform` from GitHub and select branch `main`.

- Root Directory: repository root (leave empty).
- Framework Preset: Other.
- Build Command: `npm run build`.
- Output Directory: `public`.
- Install Command: `npm ci --ignore-scripts`.
- Environment variables: none required for this preview.

The checked-in `vercel.json` supplies the commands and routing. Static theme assets are copied into `public/assets`; the Node function renders the same Liquid theme and sample catalog as the local preview. Product, collection, search and cart URLs can be opened directly.

This is a demonstration storefront with sample inventory and a browser-cookie cart. Checkout does not take payments or create orders; the contact form does not send email. A real Shopify store is still required to sell these products using the theme.

Implementation references: [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [bundling runtime files](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions), and [rewrites](https://vercel.com/docs/routing/rewrites).

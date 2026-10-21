const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const handler = require('../api/storefront');

(async () => {
  // Model Vercel's parsed JSON body as well as ordinary streamed requests.
  const server = http.createServer(async (req, res) => {
    if (req.headers['x-test-parsed-body']) {
      let body = '';
      for await (const part of req) body += part;
      req.body = JSON.parse(body);
    }
    return handler(req, res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/', '/collections/all', '/collections/sweatshirts', '/products/offset-heavy-tee', '/search?q=tee', '/cart', '/pages/contact']) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200, route);
      const html = await response.text();
      assert(html.includes('SIDEFORM'), route);
      console.log('PASS render', route);
    }
    const css = fs.readFileSync('theme/assets/sideform.css');
    assert(css.equals(fs.readFileSync('public/assets/sideform.css')));
    assert.equal((await fetch(origin + '/assets/sideform.css')).status, 200);
    const id = 100; // First available sample variant in the review catalog.
    for (const parsed of [false, true]) {
      const response = await fetch(origin + '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(parsed ? { 'x-test-parsed-body': '1' } : {}) },
        body: JSON.stringify({ id, quantity: 1 })
      });
      assert.equal(response.status, 200);
      const cookie = response.headers.get('set-cookie').split(';')[0];
      const cart = await (await fetch(origin + '/cart.js', { headers: { cookie } })).json();
      assert.equal(cart.item_count, 1);
    }
    console.log('PASS built static assets and streamed/parsed cart bodies');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

/* Shopify remains the cart source of truth. Notify other tabs after native cart updates. */
(() => {
  const key = 'sideform-cart-updated-v1';
  let refreshing = false;
  let pending = false;
  async function refreshCart() {
    if (refreshing) { pending = true; return; }
    refreshing = true;
    try {
      const url = new URL(window.routes.cart_url, location.origin);
      url.searchParams.set('sections', 'cart-drawer,cart-icon-bubble');
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const sections = await response.json();
      const parser = new DOMParser();
      const icon = document.getElementById('cart-icon-bubble');
      const nextIcon = sections['cart-icon-bubble'] && parser.parseFromString(sections['cart-icon-bubble'], 'text/html').querySelector('.shopify-section');
      if (icon && nextIcon) icon.innerHTML = nextIcon.innerHTML;
      const drawer = document.querySelector('cart-drawer');
      const nextDrawer = sections['cart-drawer'] && parser.parseFromString(sections['cart-drawer'], 'text/html').querySelector('cart-drawer');
      if (drawer && nextDrawer) {
        const next = nextDrawer.querySelector('#CartDrawer');
        if (next) {
          drawer.classList.toggle('is-empty', nextDrawer.classList.contains('is-empty'));
          drawer.querySelector('#CartDrawer').innerHTML = next.innerHTML;
          drawer.querySelector('#CartDrawer-Overlay')?.addEventListener('click', () => drawer.close());
        }
      }
      // Refresh a cart page and variant quantity rules without opening the drawer.
      await publish(PUB_SUB_EVENTS.cartUpdate, { source: 'sf-cart-sync' });
    } catch { /* Keep the current cart visible if the network is unavailable. */ }
    finally { refreshing = false; if (pending) { pending = false; refreshCart(); } }
  }
  subscribe(PUB_SUB_EVENTS.cartUpdate, event => {
    if (event.source === 'sf-cart-sync') return;
    try { localStorage.setItem(key, Date.now() + '-' + Math.random()); } catch {}
  });
  window.addEventListener('storage', event => { if (event.key === key) refreshCart(); });
  window.addEventListener('pageshow', event => { if (event.persisted) refreshCart(); });
  window.addEventListener('focus', refreshCart);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCart(); });
})();

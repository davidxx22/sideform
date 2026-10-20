/* Favorites are stored locally, without requiring an account or an app. */
(() => {
  if (window.sfFavoritesInitialized) return;
  window.sfFavoritesInitialized = true;
  const key = 'sideform-favorites-v1';
  const dialog = document.querySelector('[data-sf-favorites-dialog]');
  if (!dialog) return;
  let opener;
  function clearStatus() {
    dialog.querySelector('[data-sf-favorites-status]').textContent = '';
  }
  function read() {
    try {
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(items) ? items.filter(item => item && typeof item.handle === 'string' && typeof item.title === 'string' && typeof item.url === 'string' && new URL(item.url, location.origin).origin === location.origin && new URL(item.url, location.origin).pathname.startsWith('/products/')).slice(0,100) : [];
    } catch { return []; }
  }
  function sync() {
    clearStatus();
    const items = read();
    document.querySelectorAll('[data-sf-favorites-count]').forEach(count => { count.textContent = items.length; count.hidden = !items.length; });
    document.querySelectorAll('[data-sf-favorites-open]').forEach(button => button.setAttribute('aria-label', `Favorites, ${items.length} saved ${items.length === 1 ? 'product' : 'products'}`));
    document.querySelectorAll('[data-sf-favorite]').forEach(button => {
      const saved = items.some(item => item.handle === button.dataset.sfFavorite);
      button.setAttribute('aria-pressed', String(saved));
      const label = button.querySelector('[data-sf-favorite-label]');
      if (label) label.textContent = saved ? 'Saved to favorites' : 'Add to favorites';
    });
    if (dialog.open) render();
  }
  function write(items, status) {
    try { localStorage.setItem(key, JSON.stringify(items)); sync(); return true; }
    catch { if (status) status.textContent = 'Unable to save favorites in this browser. Check your browser storage settings.'; return false; }
  }
  function render() {
    const list = dialog.querySelector('[data-sf-favorites-list]');
    list.replaceChildren();
    const items = read();
    if (!items.length) {
      const p = document.createElement('p'); p.textContent = 'Save the pieces you like using the heart on a product page.';
      const link = document.createElement('a'); link.href = '/collections/all'; link.className = 'button'; link.textContent = 'Explore the collection';
      list.append(p, link); return;
    }
    items.forEach(item => {
      const row = document.createElement('article'); row.className = 'sf-favorite-row';
      const link = document.createElement('a'); link.href = item.url; link.className = 'sf-favorite-product';
      if (item.image) {
        const image = document.createElement('img'); image.src = item.image; image.alt = item.title; image.loading = 'lazy'; image.width = 80; image.height = 100;
        image.addEventListener('error', () => image.remove(), { once: true }); link.append(image);
      }
      const text = document.createElement('span'); text.textContent = item.title; link.append(text);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'sf-text-link sf-favorite-remove'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${item.title} from favorites`);
      remove.addEventListener('click', () => {
        if (write(read().filter(saved => saved.handle !== item.handle), dialog.querySelector('[data-sf-favorites-status]'))) {
          dialog.querySelector('[data-sf-favorites-status]').textContent = `${item.title} removed.`;
          dialog.querySelector('[data-sf-favorites-close]').focus();
        }
      });
      row.append(link, remove); list.append(row);
    });
  }
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-sf-favorites-open]');
    if (open) { opener = open; clearStatus(); render(); dialog.showModal(); dialog.querySelector('[data-sf-favorites-close]').focus(); return; }
    if (event.target.closest('[data-sf-favorites-close]')) { dialog.close(); return; }
    const button = event.target.closest('[data-sf-favorite]');
    if (!button) return;
    const items = read(), saved = items.some(item => item.handle === button.dataset.sfFavorite);
    const next = saved ? items.filter(item => item.handle !== button.dataset.sfFavorite) : [...items, {handle:button.dataset.sfFavorite,title:button.dataset.title,url:button.dataset.url,image:button.dataset.image}];
    const status = button.nextElementSibling;
    if (write(next, status) && status) status.textContent = saved ? 'Removed from favorites.' : 'Saved to favorites on this browser.';
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { clearStatus(); opener?.focus(); });
  window.addEventListener('storage', event => { if (event.key === key) sync(); });
  document.addEventListener('shopify:section:load', sync);
  document.addEventListener('product-info:loaded', sync);
  sync();
})();

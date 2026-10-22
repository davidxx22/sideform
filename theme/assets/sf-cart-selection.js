/* Select and remove cart lines together using Shopify's line keys. */
(() => {
  const selectedKeys = new Set();
  let busy = false;
  const refreshSelection = () => document.querySelectorAll('sf-cart-selection').forEach(control => control.sync());

  class SfCartSelection extends HTMLElement {
    connectedCallback() {
      this.cartItems = this.closest('cart-items, cart-drawer-items');
      if (!this.cartItems) return;
      this.controller = new AbortController();
      this.cartItems.addEventListener('change', event => {
        const input = event.target;
        if (input.matches('[data-sf-cart-select-all]')) {
          this.items.forEach(item => input.checked ? selectedKeys.add(item.value) : selectedKeys.delete(item.value));
        } else if (input.matches('[data-sf-cart-select]')) {
          input.checked ? selectedKeys.add(input.value) : selectedKeys.delete(input.value);
        } else return;
        refreshSelection();
      }, { signal: this.controller.signal });
      this.querySelector('[data-sf-cart-remove-selected]').addEventListener('click', () => this.removeSelected(), { signal: this.controller.signal });
      queueMicrotask(() => {
        if (!this.isConnected) return;
        const current = new Set(this.items.map(input => input.value));
        for (const key of selectedKeys) if (!current.has(key)) selectedKeys.delete(key);
        refreshSelection();
      });
    }

    disconnectedCallback() { this.controller?.abort(); }
    get items() { return [...this.cartItems.querySelectorAll('[data-sf-cart-select]')]; }

    sync() {
      const items = this.items;
      let count = 0;
      items.forEach(input => {
        input.checked = selectedKeys.has(input.value);
        input.disabled = busy;
        if (input.checked) count++;
      });
      const all = this.querySelector('[data-sf-cart-select-all]');
      all.checked = items.length > 0 && count === items.length;
      all.indeterminate = count > 0 && count < items.length;
      all.disabled = busy;
      const remove = this.querySelector('[data-sf-cart-remove-selected]');
      remove.disabled = busy || !count;
      remove.textContent = busy ? 'Removing…' : 'Remove selected' + (count ? ' (' + count + ')' : '');
      this.querySelector('[data-sf-cart-selection-status]').textContent = count + ' of ' + items.length + ' items selected.';
    }

    async removeSelected() {
      const keys = this.items.filter(input => selectedKeys.has(input.value)).map(input => input.value);
      if (busy || !keys.length) return;
      const rootTag = this.cartItems.tagName.toLowerCase();
      const targets = [
        { id: 'CartDrawer', section: 'cart-drawer', selector: '.drawer__inner' },
        { id: 'cart-icon-bubble', section: 'cart-icon-bubble', selector: '.shopify-section' }
      ];
      for (const id of ['main-cart-items', 'main-cart-footer']) {
        const element = document.getElementById(id);
        if (element) targets.push({ id, section: element.dataset.id, selector: '.js-contents' });
      }
      const live = document.getElementById('cart-live-region-text');
      if (live) targets.push({ id: live.id, section: live.id, selector: '.shopify-section' });
      const sections = [...new Set(targets.map(target => target.section))];
      const controls = [...document.querySelectorAll('cart-items input, cart-items button, cart-drawer-items input, cart-drawer-items button, button[name="checkout"]')]
        .map(element => ({ element, disabled: element.disabled }));
      this.querySelector('.sf-cart-selection-error')?.remove();
      busy = true;
      this.cartItems.setAttribute('aria-busy', 'true');
      controls.forEach(({ element }) => { element.disabled = true; });
      refreshSelection();
      let success = false;
      try {
        const response = await fetch(window.routes.cart_update_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ updates: Object.fromEntries(keys.map(key => [key, 0])), sections, sections_url: location.pathname })
        });
        const state = await response.json();
        if (!response.ok || state.errors) throw new Error('Cart update failed');
        const parser = new DOMParser();
        const replacements = targets.map(target => {
          const container = document.getElementById(target.id);
          if (!container) return null;
          const source = state.sections?.[target.section] && parser.parseFromString(state.sections[target.section], 'text/html').querySelector(target.selector);
          if (!source) throw new Error('Cart section unavailable');
          return { element: container.querySelector(target.selector) || container, html: source.innerHTML };
        }).filter(Boolean);
        selectedKeys.clear();
        replacements.forEach(({ element, html }) => { element.innerHTML = html; });
        document.querySelectorAll('cart-items, cart-drawer-items, cart-drawer, #main-cart-footer').forEach(element => element.classList.toggle('is-empty', state.item_count === 0));
        await publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: state });
        success = true;
      } catch {
        if (this.isConnected) {
          const error = document.createElement('span');
          error.className = 'sf-cart-selection-error';
          error.role = 'alert';
          error.textContent = 'Could not remove the selected items. Please try again.';
          this.append(error);
        }
      } finally {
        busy = false;
        this.cartItems.removeAttribute('aria-busy');
        controls.forEach(({ element, disabled }) => { if (element.isConnected) element.disabled = disabled; });
        refreshSelection();
      }
      if (success) {
        const root = document.querySelector(rootTag);
        const selection = root?.querySelector('sf-cart-selection');
        if (selection) {
          selection.querySelector('[data-sf-cart-selection-status]').textContent = 'Removed ' + keys.length + ' selected items.';
          selection.querySelector('[data-sf-cart-select-all]').focus();
        } else {
          const drawer = document.querySelector('cart-drawer.active');
          if (drawer) {
            const empty = drawer.querySelector('.drawer__inner-empty');
            if (empty) trapFocus(empty, empty.querySelector('a, button'));
          } else {
            const title = document.querySelector('cart-items h1');
            if (title) { title.tabIndex = -1; title.focus(); }
          }
        }
      }
    }
  }
  customElements.define('sf-cart-selection', SfCartSelection);
})();

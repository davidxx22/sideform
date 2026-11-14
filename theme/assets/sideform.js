/* SIDEFORM extends Dawn. Native Shopify forms, variant requests and cart stay in Dawn. */
(() => {
  let shopRequest;
  let shopPath = location.pathname;
  async function changeShopCategory(url, pushHistory = true, focusCategory = true) {
    const main = document.querySelector('#MainContent');
    if (!main?.querySelector('.sf-shop-categories')) return;
    shopRequest?.abort();
    const request = new AbortController(); shopRequest = request;
    main.setAttribute('aria-busy', 'true');
    const status = main.querySelector('[data-sf-shop-status]');
    if (status) status.textContent = 'Loading products…';
    try {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error('Collection unavailable');
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const next = html.querySelector('#MainContent');
      if (!next?.querySelector('.sf-shop-categories') || !next.querySelector('#ProductGridContainer')) throw new Error('Collection unavailable');
      if (request.signal.aborted) return;
      next.querySelectorAll('script').forEach(script => script.remove());
      main.replaceChildren(...Array.from(next.childNodes).map(node => document.importNode(node, true)));
      if (pushHistory) history.pushState({ searchParams: url.search.slice(1) }, '', url.pathname + url.search);
      shopPath = url.pathname;
      const selected = main.querySelector('[data-sf-shop-category][aria-current="page"]');
      if (focusCategory === 'sort') main.querySelector('[data-sf-mobile-sort]')?.focus({ preventScroll: true });
      else if (focusCategory) selected?.focus({ preventScroll: true });
      if (typeof FacetFiltersForm !== 'undefined') FacetFiltersForm.searchParamsPrev = url.search.slice(1);
      const nextStatus = main.querySelector('[data-sf-shop-status]');
      if (nextStatus) nextStatus.textContent = `Showing ${selected?.textContent.trim() || 'collection'}. ${main.querySelector('#ProductCountDesktop, #ProductCount')?.textContent.trim() || ''}`;
      document.querySelectorAll('.header__submenu a,.menu-drawer__submenu a').forEach(link => {
        if (!new URL(link.href).pathname.startsWith('/collections/')) return;
        const current = new URL(link.href).pathname === url.pathname;
        if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        link.classList.toggle('list-menu__item--active', current);
        link.classList.toggle('menu-drawer__menu-item--active', current);
      });
      if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger();
    } catch (error) {
      if (error.name !== 'AbortError' && status) status.textContent = 'Unable to load this category. Please try again.';
    } finally {
      if (shopRequest === request) main.removeAttribute('aria-busy');
    }
  }
  // Category URLs remain shareable; Dawn still handles sorting/filtering within a category.
  window.addEventListener('popstate', event => {
    if (location.pathname === shopPath || !document.querySelector('.sf-shop-categories')) return;
    event.stopImmediatePropagation();
    changeShopCategory(new URL(location.href), false, false);
  });
  const categorySnapshots = new WeakMap();
  document.addEventListener('click', event => {
    const option = event.target.closest('[data-sf-sort-value]');
    if (!option) {
      document.querySelectorAll('.sf-mobile-sort[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set('sort_by', option.dataset.sfSortValue);
    url.searchParams.delete('page');
    changeShopCategory(url, true, 'sort');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.sf-mobile-sort[open]').forEach(menu => { menu.open = false; menu.querySelector('summary').focus(); });
  });
  function changeCategory(link, event) {
    const browser = link.closest('[data-sf-collection-browser]');
    if (!browser) return;
    const grid = browser.querySelector('ul.product-grid');
    if (!grid) return;
    if (!categorySnapshots.has(browser)) {
      const initial = document.createElement('template');
      initial.innerHTML = grid.innerHTML;
      categorySnapshots.set(browser, new Map([[browser.dataset.sfInitialCategory, initial]]));
      browser.querySelectorAll('template[data-sf-category-grid]').forEach(template => {
        categorySnapshots.get(browser).set(template.dataset.sfCategoryGrid, template);
      });
    }
    const template = categorySnapshots.get(browser).get(link.dataset.sfCategory);
    if (!template) return;
    event.preventDefault();
    grid.replaceChildren(template.content.cloneNode(true));
    grid.querySelectorAll('[aria-busy]').forEach(card => card.removeAttribute('aria-busy'));
    browser.querySelectorAll('[data-sf-category]').forEach(item => {
      item.classList.toggle('is-current', item === link);
      if (item === link) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    const count = grid.querySelectorAll('.product-card-wrapper').length;
    browser.querySelector('[data-sf-browse-status]').textContent = `Showing ${link.textContent.trim()}: ${count} ${count === 1 ? 'product' : 'products'}.`;
    const viewAll = browser.querySelector('.collection__view-all a');
    if (viewAll) viewAll.href = link.href;
    grid.closest('slider-component')?.resetPages?.();
  }
  const colorSelections = new WeakMap();
  function colorSelection(card, image) {
    if (!colorSelections.has(card)) colorSelections.set(card, {
      snapshot: { src: image.getAttribute('src'), srcset: image.getAttribute('srcset'), alt: image.alt, previewClass: card.classList.contains('sf-color-preview') },
      pending: null
    });
    return colorSelections.get(card);
  }
  function restoreCardColor(button) {
    const card = button.closest('.product-card-wrapper');
    const image = card?.querySelector('.card__media .media > img, .sf-card-photo img');
    const state = card && colorSelections.get(card);
    if (!image || !state) return;
    if (state.pending) { previewCardColor(state.pending, true); return; }
    card.sfColorRequest = Symbol();
    image.src = state.snapshot.src;
    if (state.snapshot.srcset) image.srcset = state.snapshot.srcset; else image.removeAttribute('srcset');
    image.alt = state.snapshot.alt;
    card.classList.toggle('sf-color-preview', state.snapshot.previewClass);
    card.removeAttribute('aria-busy');
    card.querySelectorAll('[data-sf-preview]').forEach(item => item.removeAttribute('data-sf-preview'));
    const status = card.querySelector('[data-sf-color-status]');
    if (status) status.textContent = '';
  }
  async function previewCardColor(button, commit = false) {
    const card = button.closest('.product-card-wrapper');
    const image = card?.querySelector('.card__media .media > img, .sf-card-photo img');
    if (!image || button.disabled || !button.dataset.sfPhoto) return;
    const state = colorSelection(card, image);
    if (commit) state.pending = button;
    const request = Symbol(); card.sfColorRequest = request;
    const status = card.querySelector('[data-sf-color-status]');
    card.setAttribute('aria-busy', 'true');
    try {
      const photo = new Image();
      photo.sizes = image.sizes;
      photo.srcset = button.dataset.sfSrcset || '';
      photo.src = button.dataset.sfPhoto;
      await photo.decode();
      if (card.sfColorRequest !== request) return;
      image.srcset = photo.srcset;
      image.src = photo.src;
      image.alt = button.dataset.sfAlt;
      card.classList.add('sf-color-preview');
      card.querySelectorAll('[data-sf-preview]').forEach(item => item.removeAttribute('data-sf-preview'));
      if (!commit) {
        button.setAttribute('data-sf-preview', 'true');
        if (status) status.textContent = `${button.dataset.sfCardColor} preview. Click to select.`;
        return;
      }
      card.querySelectorAll('[data-sf-card-color]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const target = new URL(button.dataset.sfVariantUrl, location.origin);
      card.querySelectorAll('a[href]').forEach(link => { if (new URL(link.href).pathname === target.pathname) link.href = target.href; });
      const priceTemplate = [...card.querySelectorAll('template[data-sf-card-price]')].find(template => template.dataset.sfCardPrice === button.dataset.sfCardColor);
      const price = card.querySelector('.card-information > .price');
      if (price && priceTemplate) price.replaceWith(priceTemplate.content.cloneNode(true));
      state.snapshot = { src: image.getAttribute('src'), srcset: image.getAttribute('srcset'), alt: image.alt, previewClass: true };
      state.pending = null;
      if (status) status.textContent = `${button.dataset.sfCardColor} selected.`;
    } catch {
      if (card.sfColorRequest === request) {
        if (commit) state.pending = null;
        restoreCardColor(button);
        if (status) status.textContent = 'Unable to load this color. Please try again.';
      }
    } finally {
      if (card.sfColorRequest === request) card.removeAttribute('aria-busy');
    }
  }
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch' || !window.matchMedia('(any-hover: hover)').matches) return;
    const button = event.target.closest('[data-sf-card-color]');
    if (!button || (event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) return;
    previewCardColor(button);
  });
  document.addEventListener('focusin', event => {
    const button = event.target.closest('[data-sf-card-color]');
    if (button) previewCardColor(button);
  });
  document.addEventListener('pointerout', event => {
    if (event.pointerType === 'touch') return;
    const button = event.target.closest('[data-sf-card-color]');
    if (button && !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) restoreCardColor(button);
  });
  document.addEventListener('focusout', event => {
    const button = event.target.closest('[data-sf-card-color]');
    if (button) restoreCardColor(button);
  });
  document.addEventListener('click', event => {
    const back = event.target.closest('[data-sf-product-back]');
    if (back && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && history.length > 1 && document.referrer) {
      const referrer = new URL(document.referrer);
      if (referrer.origin === location.origin) {
        event.preventDefault(); history.back(); return;
      }
    }
    const shopCategory = event.target.closest('[data-sf-shop-category]');
    if (shopCategory && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      const url = new URL(shopCategory.href);
      const sort = new URLSearchParams(location.search).get('sort_by');
      if (sort) url.searchParams.set('sort_by', sort);
      changeShopCategory(url);
      return;
    }
    const color = event.target.closest('[data-sf-card-color]');
    if (color) { event.preventDefault(); event.stopPropagation(); previewCardColor(color, true); return; }
    const category = event.target.closest('[data-sf-category]');
    if (category && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) changeCategory(category, event);
  });

  class SfDialog extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.dialog = this.querySelector('dialog');
      this.querySelector('[data-sf-open]')?.addEventListener('click', event => this.open(event.currentTarget));
      this.querySelector('[data-sf-close]')?.addEventListener('click', () => this.dialog.close());
      this.dialog?.addEventListener('click', event => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close();
      });
      this.dialog?.addEventListener('close', () => {
        if (this.dialog.classList.contains('sf-image-dialog')) document.body.classList.remove('overflow-hidden');
        this.opener?.focus();
      });
    }
    open(opener) {
      this.opener = opener;
      this.dialog.showModal();
      if (this.dialog.classList.contains('sf-image-dialog')) {
        document.body.classList.add('overflow-hidden');
        this.dialog.scrollTo(0, 0);
      }
      this.dialog.querySelector('[data-sf-close]')?.focus();
    }
  }
  customElements.define('sf-dialog', SfDialog);

  class SfPhotoGallery extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.color = this.dataset.color || 'black'; this.view = this.querySelector('[data-sf-view]')?.dataset.sfView || 'front';
      const strip = this.querySelector('.sf-photo-gallery__grid');
      const slides = [...this.querySelectorAll('.sf-photo-gallery__tile')];
      const showSlide = index => strip.scrollTo({ left: Math.max(0, Math.min(index, slides.length - 1)) * strip.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      const updateCarousel = () => {
        const index = Math.max(0, Math.min(slides.length - 1, Math.round(strip.scrollLeft / strip.clientWidth)));
        this.querySelector('[data-sf-gallery-step="-1"]').disabled = index === 0;
        this.querySelector('[data-sf-gallery-step="1"]').disabled = index === slides.length - 1;
        this.querySelector('[data-sf-gallery-status]').textContent = `Photo ${index + 1} of ${slides.length}`;
        this.querySelector('[data-sf-gallery-counter]').textContent = `${index + 1}/${slides.length}`;
      };
      strip.addEventListener('scroll', updateCarousel, { passive: true });
      this.querySelectorAll('[data-sf-gallery-step]').forEach(button => button.addEventListener('click', () => showSlide(Math.round(strip.scrollLeft / strip.clientWidth) + Number(button.dataset.sfGalleryStep))));
      strip.addEventListener('keydown', event => {
        if (!matchMedia('(max-width: 989px)').matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); showSlide(Math.round(strip.scrollLeft / strip.clientWidth) + (event.key === 'ArrowRight' ? 1 : -1));
      });
      this.querySelectorAll('[data-sf-view]').forEach(button => button.addEventListener('click', () => {
        this.view = button.dataset.sfView; this.render();
      }));
      this.querySelectorAll('[data-sf-enlarge]').forEach(button => button.addEventListener('click', event => {
        const enlarged = this.querySelector('[data-sf-enlarged]');
        const selectedImage = event.currentTarget.querySelector('img');
        if (!selectedImage || !enlarged) return;
        const image = selectedImage.cloneNode();
        image.sizes = '(min-width: 750px) calc(100vw - 22rem), 1100px';
        image.loading = 'eager';
        enlarged.replaceChildren(image);
        this.querySelector('sf-dialog').open(event.currentTarget);
      }));
    }
    selectColor(color) { const next = color.toLowerCase(); if (next === this.color) return; this.color = next; this.view = this.querySelector('[data-sf-view]')?.dataset.sfView || 'front'; this.querySelector('.sf-photo-gallery__grid').scrollTo({left:0,behavior:'instant'}); this.render(); }
    async render() {
      const color = this.color;
      const request = Symbol();
      this.sfPhotoRequest = request;
      const updates = [...this.querySelectorAll('.sf-photo-gallery__grid img')].map(img => {
        const view = img.closest('[data-sf-view]')?.dataset.sfView || this.view;
        const replacePhoto = url => url.replace(/-(black|white|grey)-(front|back|detail|full|lineup|male|female|duolow|duofull|duoclose)(-480)?\.(?:webp|jpg)/g, (_, previous, angle, small) => `-${color}-${view}${small || ''}.webp`);
        return { img, view, src: replacePhoto(img.src), srcset: replacePhoto(img.srcset) };
      });
      this.setAttribute('aria-busy', 'true');
      try {
        // Decode the complete color set first so old photos stay visible while loading.
        await Promise.all(updates.map(async update => {
          const photo = new Image();
          photo.decoding = 'async';
          photo.sizes = update.img.sizes;
          photo.srcset = update.srcset;
          photo.src = update.src;
          await photo.decode();
        }));
        if (this.sfPhotoRequest !== request || !this.isConnected) return;
        updates.forEach(({ img, view, src, srcset }) => {
          if (srcset) img.srcset = srcset;
          else img.removeAttribute('srcset');
          img.src = src;
          img.alt = img.alt.replace(/, (black|white|grey),/i, ', ' + color + ',');
        });
        this.dataset.color = color;
        this.querySelectorAll('[data-sf-view]').forEach(button => {
          if (button.dataset.sfView === this.view) button.setAttribute('aria-current', 'true');
          else button.removeAttribute('aria-current');
        });
      } catch {
        if (this.sfPhotoRequest === request) {
          this.color = this.dataset.color;
          this.querySelector('[data-sf-gallery-status]').textContent = 'Unable to load this color. Please try again.';
        }
      } finally {
        if (this.sfPhotoRequest === request) this.removeAttribute('aria-busy');
      }
    }
  }
  customElements.define('sf-photo-gallery', SfPhotoGallery);

  class SfProductSubtotal extends HTMLElement {
    connectedCallback() {
      this.info = this.closest('product-info');
      this.price = Number(this.dataset.unitPrice);
      this.onQuantity = event => {
        if (event.target.matches('input[name="quantity"]')) this.update();
      };
      this.info?.addEventListener('input', this.onQuantity);
      this.info?.addEventListener('change', this.onQuantity);
      this.update();
    }
    disconnectedCallback() {
      this.info?.removeEventListener('input', this.onQuantity);
      this.info?.removeEventListener('change', this.onQuantity);
    }
    update(variant) {
      if (variant !== undefined) this.price = variant ? Number(variant.price) : NaN;
      const input = this.info?.querySelector('input[name="quantity"]');
      const quantity = Number(input?.value);
      this.hidden = !input || !input.validity.valid || !Number.isInteger(quantity) || quantity <= 1 || !Number.isFinite(this.price);
      if (this.hidden) return;
      const currency = this.dataset.currency || 'USD';
      const amount = new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency', currency, currencyDisplay: 'narrowSymbol'
      }).format(this.price * quantity / 100);
      this.textContent = `Subtotal (${quantity} items): ${amount} ${currency}`;
    }
  }
  customElements.define('sf-product-subtotal', SfProductSubtotal);

  function selectedColor(info) {
    return info.querySelector('variant-selects input[data-option-name="Color"]:checked')?.value ||
      info.querySelector('variant-selects select[name="options[Color]"]')?.value;
  }
  function filterMedia(info) {
    const color = selectedColor(info);
    if (!color) return;
    info.querySelector('sf-photo-gallery')?.selectColor(color);
    document.querySelectorAll('[data-sf-feature-photo] img').forEach(image => {
      const replace = url => url.replace(/-(black|white|grey)-(front|detail)(-480)?\.webp/g, (_, previous, view, small) => `-${color.toLowerCase()}-${view}${small || ''}.webp`);
      image.src = replace(image.src); if (image.srcset) image.srcset = replace(image.srcset);
      image.alt = image.alt.replace(/, (black|white|grey),/i, `, ${color.toLowerCase()},`);
    });
    const gallery = info.querySelector('media-gallery');
    if (!gallery) return;
    gallery.querySelectorAll('[data-sf-media-alt]').forEach(item => {
      const match = item.dataset.sfMediaAlt.match(/\[color:([^\]]+)\]/i);
      item.classList.toggle('sf-color-hidden', !!match && match[1].toLowerCase() !== color.toLowerCase());
    });
    const active = gallery.querySelector('[data-media-id].is-active');
    if (active?.classList.contains('sf-color-hidden')) {
      const first = gallery.querySelector('[data-media-id]:not(.sf-color-hidden)');
      if (first) gallery.setActiveMedia(first.dataset.mediaId, false);
    }
    gallery.querySelectorAll('slider-component').forEach(slider => slider.resetPages?.());
  }

  function setupProduct(info) {
    if (info.dataset.sfReady) return;
    info.dataset.sfReady = 'true';
    // Keep explicit selections outside Dawn's replaced variant-selector DOM.
    info.sfChoices = new Set();
    if (new URLSearchParams(location.search).has('variant')) {
      info.sfChoices.add('Color'); info.sfChoices.add('Size');
    }
    const hint = document.createElement('p');
    hint.className = 'sf-selection-hint'; hint.role = 'status';
    hint.textContent = 'Choose a color and size to add this piece.';
    info.querySelector('.product-form__buttons')?.before(hint);
    function guard() {
      const button = info.querySelector('product-form [name="add"]');
      if (!button) return;
      const required = ['Color', 'Size'].filter(name => info.querySelector(`variant-selects [data-option-name="${name}"], variant-selects select[name="options[${name}]"]`));
      const incomplete = required.some(name => !info.sfChoices.has(name));
      hint.hidden = !incomplete;
      if (incomplete) {
        if (!button.disabled) button.disabled = true;
        button.dataset.sfGuarded = 'true';
      } else if (button.dataset.sfGuarded) {
        delete button.dataset.sfGuarded;
        let variant;
        try { variant = JSON.parse(info.querySelector('[data-selected-variant]')?.textContent || 'null'); } catch { variant = null; }
        if (variant?.available && button.disabled) button.disabled = false;
      }
    }
    function recordChoice(event) {
      const input = event.target;
      if (!input.closest('variant-selects')) return;
      const name = input.dataset.optionName || input.name.match(/^options\[(.+)\]$/)?.[1];
      if (name) info.sfChoices.add(name);
      guard();
    }
    info.addEventListener('change', recordChoice, true);
    // A default checked radio still counts when deliberately clicked.
    info.addEventListener('click', event => {
      if (event.target.matches('variant-selects input[type="radio"]')) recordChoice(event);
    }, true);
    info.addEventListener('submit', event => {
      if (!event.target.closest('product-form')) return;
      if (['Color', 'Size'].some(name => info.querySelector(`variant-selects [data-option-name="${name}"], variant-selects select[name="options[${name}]"]`) && !info.sfChoices.has(name))) {
        event.preventDefault(); event.stopImmediatePropagation(); hint.hidden = false;
        info.querySelector('variant-selects input')?.focus();
      }
    }, true);
    const observer = new MutationObserver(guard);
    observer.observe(info, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
    guard(); filterMedia(info);
  }
  function initialize(root = document) { root.querySelectorAll('product-info').forEach(setupProduct); }
  document.addEventListener('DOMContentLoaded', () => {
    initialize();
    if (typeof subscribe === 'function') {
      subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
        const info = document.getElementById(`MainProduct-${data.sectionId}`);
        if (info) { filterMedia(info); info.querySelector('sf-product-subtotal')?.update(data.variant); }
      });
    }
  });
  document.addEventListener('shopify:section:load', () => initialize());
  document.addEventListener('product-info:loaded', event => setupProduct(event.target));
})();

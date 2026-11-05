/* Repeatable, gentle entrances; content stays visible without JavaScript or animation support. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!window.IntersectionObserver || !Element.prototype.animate) return;
  const selector = [
    '.sf-campaign__copy > *', '.sf-home-section-heading',
    '.sf-category-grid > li', '.sf-arrivals-section .product-grid > li',
    '#product-grid > .grid__item', '.sf-editorial__tile',
    '.sf-perspective > *', '.collection-hero__title',
    '.sf-product-page .product__title', '.sf-product-description > *',
    '.sf-footer__grid > div', '.main-page-title',
    '.product-recommendations .grid__item'
  ].join(',');
  let entered = new WeakSet();
  const active = new WeakMap();
  let observed = new WeakSet();
  const animations = new Set();
  let frame;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting || !target.isConnected) return;
      if (preference.matches || entered.has(target)) return;
      entered.add(target);
      // Restored scroll positions should not animate content already passed.
      if (target.getBoundingClientRect().bottom <= 0 || target.contains(document.activeElement)) return;
      const siblings = [...target.parentElement.children].filter(e => e.matches(selector));
      const delay = Math.max(0, Math.min(siblings.indexOf(target), 3)) * 35;
      const animation = target.animate([
        { opacity: 0.15, translate: '0 10px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 720, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      animations.add(animation);
      active.set(target, animation);
      const finish = () => {
        animations.delete(animation);
        if (active.get(target) === animation) active.delete(target);
      };
      animation.addEventListener('finish', finish, { once: true });
      animation.addEventListener('cancel', finish, { once: true });
    });
  }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
  // Re-arm only after leaving the real viewport plus a small buffer. Keeping
  // exit detection separate prevents entrance translation from retriggering it.
  const exitObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) return;
      entered.delete(target);
      active.get(target)?.cancel();
      if (!target.isConnected) {
        observer.unobserve(target);
        exitObserver.unobserve(target);
      }
    });
  }, { rootMargin: '48px 0px' });
  const imageCards = '.sf-category-grid > li, .sf-arrivals-section .product-grid > li, #product-grid > .grid__item, .sf-editorial__tile, .product-recommendations .grid__item';
  const imageTargets = new Set();
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      target.toggleAttribute('data-sf-photo-visible', isIntersecting || target.contains(document.activeElement));
    });
  });
  function clearImage(target) {
    imageObserver.unobserve(target);
    imageTargets.delete(target);
    target.removeAttribute('data-sf-photo-reveal');
    target.removeAttribute('data-sf-photo-visible');
    target.style.removeProperty('--sf-photo-delay');
  }
  function scan() {
    frame = undefined;
    if (preference.matches || window.Shopify?.designMode) return;
    imageTargets.forEach(target => { if (!target.isConnected) clearImage(target); });
    document.querySelectorAll('#MainContent ' + selector.split(',').join(', #MainContent ') + ', .sf-footer__grid > div').forEach(element => {
      if (observed.has(element) || element.closest('.scroll-trigger')) return;
      observed.add(element);
      if (element.matches(imageCards) && element.querySelector('img')) {
        const siblings = [...element.parentElement.children].filter(child => child.matches(imageCards));
        element.style.setProperty('--sf-photo-delay', Math.min(siblings.indexOf(element), 3) * 40 + 'ms');
        element.setAttribute('data-sf-photo-reveal', '');
        imageTargets.add(element);
        imageObserver.observe(element);
        return;
      }
      observer.observe(element);
      exitObserver.observe(element);
    });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(scan);
  }
  function start() {
    scan();
    const main = document.getElementById('MainContent');
    if (main) new MutationObserver(schedule).observe(main, { childList: true, subtree: true });
    document.addEventListener('shopify:section:load', schedule);
    window.addEventListener('pageshow', schedule);
    // Reveal focused items immediately so keyboard navigation is never obscured.
    document.addEventListener('focusin', event => {
      event.target.closest('[data-sf-photo-reveal]')?.setAttribute('data-sf-photo-visible', '');
      active.get(event.target.closest(selector))?.cancel();
      animations.forEach(animation => {
        if (animation.effect?.target.contains(event.target)) animation.cancel();
      });
    });
    preference.addEventListener('change', () => {
      observer.disconnect();
      exitObserver.disconnect();
      imageTargets.forEach(clearImage);
      entered = new WeakSet();
      observed = new WeakSet();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      schedule();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

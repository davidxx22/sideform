/* One-time entrances; content stays visible without JavaScript or animation support. */
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
  const revealed = new WeakSet();
  let observed = new WeakSet();
  const animations = new Set();
  let frame;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting || !target.isConnected) return;
      observer.unobserve(target);
      if (preference.matches || revealed.has(target)) return;
      revealed.add(target);
      // Restored scroll positions should not animate content already passed.
      if (target.getBoundingClientRect().bottom <= 0 || target.contains(document.activeElement)) return;
      const siblings = [...target.parentElement.children].filter(e => e.matches(selector));
      const delay = Math.max(0, Math.min(siblings.indexOf(target), 3)) * 55;
      const animation = target.animate([
        { opacity: 0, translate: '0 14px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 520, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      animations.add(animation);
      const finish = () => animations.delete(animation);
      animation.addEventListener('finish', finish, { once: true });
      animation.addEventListener('cancel', finish, { once: true });
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  function scan() {
    frame = undefined;
    if (preference.matches || window.Shopify?.designMode) return;
    document.querySelectorAll('#MainContent ' + selector.split(',').join(', #MainContent ') + ', .sf-footer__grid > div').forEach(element => {
      if (observed.has(element) || revealed.has(element) || element.closest('.scroll-trigger')) return;
      observed.add(element);
      observer.observe(element);
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
      animations.forEach(animation => {
        if (animation.effect?.target.contains(event.target)) animation.cancel();
      });
    });
    preference.addEventListener('change', () => {
      observer.disconnect();
      observed = new WeakSet();
      animations.forEach(animation => animation.cancel());
      animations.clear();
      schedule();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

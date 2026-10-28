/**
 * Read more / Read less for the NH ONE long-form text blocks (.nh-seo):
 * - the home page SEO text (sections/seo-text.liquid)
 * - the collection description under the product grid
 *   (sections/main-collection-product-grid.liquid)
 *
 * Markup: a [data-nh-seo] root carrying --nh-seo-lines, holding .nh-seo__body
 * and a .nh-seo__btn with data-label-more / data-label-less and a
 * .nh-seo__btn-text. Styles live in assets/style.css under "SEO text".
 *
 * The copy is only ever clipped by CSS, never removed, so all of it stays in
 * the HTML for crawlers.
 */
(function () {
  if (window.nhSeoText) return; // both sections may load this file
  window.nhSeoText = true;

  function init(root) {
    if (root.dataset.nhSeoReady) return;
    root.dataset.nhSeoReady = 'true';

    var body = root.querySelector('.nh-seo__body');
    var btn = root.querySelector('.nh-seo__btn');
    if (!body || !btn) return;

    var text = btn.querySelector('.nh-seo__btn-text');

    // Lines x the copy's own line height, so the same number of lines shows
    // whatever the type size is.
    function collapsedHeight() {
      var cs = getComputedStyle(body);
      var lines = parseFloat(getComputedStyle(root).getPropertyValue('--nh-seo-lines')) || 4;
      var lh = parseFloat(cs.lineHeight);
      if (!lh) lh = parseFloat(cs.fontSize) * 1.75;
      return Math.round(lines * lh);
    }

    function fullHeight() {
      var pinned = body.style.maxHeight;
      body.style.maxHeight = 'none';
      var h = body.getBoundingClientRect().height;
      body.style.maxHeight = pinned;
      void body.offsetHeight;
      return h;
    }

    // Nothing clipped: drop the button and the fade rather than leave a dead
    // control under copy that is already fully visible.
    if (fullHeight() <= body.getBoundingClientRect().height + 8) {
      btn.hidden = true;
      root.classList.add('is-open');
      return;
    }

    btn.addEventListener('click', function () {
      var open = !root.classList.contains('is-open');

      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      text.textContent = open ? btn.dataset.labelLess : btn.dataset.labelMore;

      // Animate between two pixel heights: a transition from or to a keyword
      // does not animate, so the current height is pinned and a reflow forced
      // before the target is set.
      body.style.maxHeight = body.getBoundingClientRect().height + 'px';
      void body.offsetHeight;
      root.classList.toggle('is-open', open);
      body.style.maxHeight = (open ? fullHeight() : collapsedHeight()) + 'px';

      if (!open) {
        var top = root.getBoundingClientRect().top;
        if (top < 0) {
          window.scrollTo({
            top: window.pageYOffset + top - 24,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
          });
        }
      }
    });

    // Once open, let the copy reflow freely when the window changes width.
    window.addEventListener('resize', function () {
      if (root.classList.contains('is-open')) body.style.maxHeight = fullHeight() + 'px';
    });
  }

  function initAll(scope) {
    scope.querySelectorAll('[data-nh-seo]').forEach(init);
  }

  initAll(document);

  // The theme editor re-renders a section in place without re-running
  // deferred scripts (the old inline script re-ran by itself).
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();

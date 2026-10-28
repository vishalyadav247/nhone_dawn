/*
 * Article table-of-contents scroll-spy.
 *
 * The TOC itself (markup, anchor ids, the layout decision) is built in Liquid by
 * snippets/nh-article-body.liquid, so the page renders and the anchors work with
 * this file blocked. All this adds is highlighting the heading you're currently
 * reading.
 *
 * Loaded only by sections/main-article.liquid, and only when a TOC was actually
 * rendered — deliberately not in assets/main.js, which ships on every page.
 *
 * Uses IntersectionObserver rather than a scroll listener: no long tasks, no INP
 * cost. Vanilla, so it does not depend on the CDN-deferred jQuery.
 */
(function () {
  var links = document.querySelectorAll('[data-nh-toc-link]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  // The mobile <details> and the desktop rail each render a copy of the list,
  // so one heading id maps to two links.
  var byId = {};
  Array.prototype.forEach.call(links, function (link) {
    var id = link.getAttribute('data-nh-toc-link');
    if (!id) return;
    if (!byId[id]) byId[id] = [];
    byId[id].push(link);
  });

  var headings = Object.keys(byId)
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (!headings.length) return;

  var current = null;

  function setCurrent(id) {
    if (id === current) return;
    if (current && byId[current]) {
      byId[current].forEach(function (link) {
        link.removeAttribute('aria-current');
      });
    }
    current = id;
    if (current && byId[current]) {
      byId[current].forEach(function (link) {
        link.setAttribute('aria-current', 'true');
      });
    }
  }

  // --header-height is set on <html> by the StickyHeader component, but only
  // when a sticky header type is configured — hence the fallback.
  var headerHeight =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 90;

  var visible = {};

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          visible[entry.target.id] = true;
        } else {
          delete visible[entry.target.id];
        }
      });

      // Headings are observed in document order, so the first visible one is
      // the section the reader is in.
      for (var i = 0; i < headings.length; i++) {
        if (visible[headings[i].id]) {
          setCurrent(headings[i].id);
          return;
        }
      }

      // Nothing in the band — above the first heading, or scrolled past the
      // last. Clear it rather than leaving a stale entry highlighted.
      setCurrent(null);
    },
    {
      // Top margin clears the sticky header; the -70% bottom margin means a
      // heading only counts as "current" once it reaches the upper third.
      rootMargin: '-' + (headerHeight + 24) + 'px 0px -70% 0px',
      threshold: 0,
    }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
})();

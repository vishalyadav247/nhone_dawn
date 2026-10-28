class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 800);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newFacetDetailsElement = document.getElementById(closestJSFilterID);
        const newElementSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
          ? `.mobile-facets__close-button`
          : `.facets__summary`;
        const newElementToActivate = newFacetDetailsElement.querySelector(newElementSelector);

        const isTextInput = event.target.getAttribute('type') === 'text';

        if (newElementToActivate && !isTextInput) newElementToActivate.focus();
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }

    // The mobile groups are an accordion, so the group being edited stays open
    // with its row in view; refresh the row's selected-count badge as well.
    // innerHTML, not outerHTML, so the <summary> keeps MenuDrawer's listener.
    const targetSummary = target.querySelector('.mobile-facets__summary');
    const sourceSummary = source.querySelector('.mobile-facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.innerHTML = sourceSummary.innerHTML;
      const label = sourceSummary.getAttribute('aria-label');
      if (label) targetSummary.setAttribute('aria-label', label);
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    // Only the From / To text fields: the NH slider's range inputs (see
    // snippets/price-facet.liquid) carry no data-min / data-max, so
    // adjustToValidValues would clamp them to 0.
    this.querySelectorAll('.field__input').forEach((element) => {
      element.addEventListener('change', this.onRangeChange.bind(this));
      element.addEventListener('keydown', this.onKeyDown.bind(this));
    });
    this.setMinAndMaxValues();
    this.initSlider();
  }

  // Two-thumb slider. Each move writes whole units into the hidden From / To
  // fields; the range's own `input` event then bubbles to the filter form,
  // which submits on its usual debounce. A thumb at either end leaves its
  // field empty, so the full range means no price filter at all.
  initSlider() {
    const root = this.querySelector('.nh-price');
    if (!root) return;

    const lo = root.querySelector('.nh-price__range--lo');
    const hi = root.querySelector('.nh-price__range--hi');
    const [minField, maxField] = this.querySelectorAll('.field__input');
    const loLabel = root.querySelector('[data-nh-price-lo]');
    const hiLabel = root.querySelector('[data-nh-price-hi]');
    const top = Number(hi.max);
    const symbol = root.dataset.currency || '';
    const format = (value) => symbol + Number(value).toLocaleString();

    const paint = () => {
      root.style.setProperty('--nh-lo', `${(Number(lo.value) / top) * 100}%`);
      root.style.setProperty('--nh-hi', `${(Number(hi.value) / top) * 100}%`);
      // With both thumbs parked at the top, the low one must be the one you
      // grab, or neither could move.
      lo.style.zIndex = Number(lo.value) >= top ? '3' : '';
    };

    const update = (moved) => {
      // Dragging one thumb past the other pushes it along rather than
      // blocking, so the pair can never lock together.
      if (Number(lo.value) > Number(hi.value)) {
        if (moved === lo) hi.value = lo.value;
        else lo.value = hi.value;
      }

      minField.value = Number(lo.value) > 0 ? lo.value : '';
      maxField.value = Number(hi.value) < top ? hi.value : '';
      loLabel.textContent = format(lo.value);
      hiLabel.textContent = format(hi.value);
      this.setMinAndMaxValues();
      paint();
    };

    lo.addEventListener('input', () => update(lo));
    hi.addEventListener('input', () => update(hi));

    // Same number format before and after the first drag.
    loLabel.textContent = format(lo.value);
    hiLabel.textContent = format(hi.value);
    paint();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  onKeyDown(event) {
    if (event.metaKey) return;

    const pattern = /[0-9]|\.|,|'| |Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
    if (!event.key.match(pattern)) event.preventDefault();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('.field__input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('data-max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('data-min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('data-min', 0);
    if (maxInput.value === '') minInput.setAttribute('data-max', maxInput.getAttribute('data-max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('data-min'));
    const max = Number(input.getAttribute('data-max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);

/* Mobile floating Filter button: out of the way while browsing.
   Scrolling DOWN through the products tucks the button away; scrolling up,
   pausing for a moment, or being near the top of the page brings it back.
   Toggles .nh-fab-away on the drawer's <summary> (styled in
   component-nh-facets.css). The class sits on the summary, not on the button
   itself, because the button's contents are replaced after every filter
   change while the summary stays put. Never hides while the drawer is open. */
(() => {
  const mobile = window.matchMedia('(max-width: 749px)');
  const TOP_ZONE = 300; // px from the top where the button always shows
  const NUDGE = 8; // ignore scroll jitter smaller than this
  const IDLE_MS = 900;

  let lastY = window.scrollY;
  let ticking = false;
  let idleTimer;

  const wrapper = () => document.querySelector('.facets-vertical .mobile-facets__open-wrapper');

  const setAway = (away) => {
    const summary = wrapper();
    if (!summary) return;
    const drawerOpen = summary.parentElement && summary.parentElement.hasAttribute('open');
    summary.classList.toggle('nh-fab-away', away && !drawerOpen);
  };

  const onScroll = () => {
    ticking = false;
    if (!mobile.matches) return;

    const y = window.scrollY;
    if (y < TOP_ZONE) setAway(false);
    else if (y > lastY + NUDGE) setAway(true);
    else if (y < lastY - NUDGE) setAway(false);
    if (Math.abs(y - lastY) > NUDGE) lastY = y;

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => setAway(false), IDLE_MS);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
})();

/* Mobile filter drawer: one group open at a time.
   The same behaviour as the mobile navigation drawer (assets/main.js): opening
   a group closes the others and scrolls it up to the top of the list, where
   its row is sticky, so its values start at the top of the screen.

   `toggle` does not bubble, but it can be caught on the way down, so one
   capturing listener covers groups that the AJAX filter refresh adds later.
   Closing a sibling fires its own toggle, hence the early return when closed.

   The siblings are closed WITHOUT their height animation (.nh-instant): a
   group above the one you opened would otherwise still be collapsing when
   the scroll target is measured, and the list would stop in the wrong place. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      if (!details.classList.contains('mobile-facets__details') || !details.open) return;

      const list = details.closest('.mobile-facets__main');
      if (!list) return;

      const siblings = Array.from(list.querySelectorAll('details.mobile-facets__details[open]')).filter(
        (sibling) => sibling !== details
      );
      siblings.forEach((sibling) => {
        sibling.classList.add('nh-instant');
        sibling.removeAttribute('open');
        sibling.classList.remove('menu-opening');
        const summary = sibling.querySelector(':scope > summary');
        if (summary) summary.setAttribute('aria-expanded', 'false');
      });

      // Measure the <details>, not its <summary>: the summary is sticky, so
      // its rect reports where it is parked rather than where the group starts.
      // The sticky offset is 0 — the list itself is the scroll container.
      const top = list.scrollTop + details.getBoundingClientRect().top - list.getBoundingClientRect().top;
      list.scrollTo({ top: Math.max(0, Math.round(top)), behavior: reduceMotion.matches ? 'auto' : 'smooth' });

      requestAnimationFrame(() => siblings.forEach((sibling) => sibling.classList.remove('nh-instant')));
    },
    true
  );
})();

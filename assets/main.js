const previewMode = window.Shopify.previewMode;
if(!previewMode){
	document.addEventListener('contextmenu', function(e) {
	e.preventDefault();
	});

	document.addEventListener('dragstart', function(e) {
	if (e.target.tagName === 'IMG') {
		e.preventDefault();
	}
	});

	document.addEventListener('keydown', function(e) {
	const key = e.key.toLowerCase();

	if (
		e.key === 'F12' ||
		(e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
		(e.ctrlKey && key === 'u')
	) {
		e.preventDefault();
	}
	});
}

/**
 * Run a carousel's init only when it is worth it: after the page has loaded
 * (or 3s after the HTML is ready, whichever is first) and once the element is
 * within 300px of the viewport. Every carousel has a static pre-init layout
 * (style.css, "Carousel pre-init layout"), so waiting is invisible, and Owl's
 * layout work no longer competes with the first render. Carousels far down
 * the page are only built if the visitor scrolls to them.
 */
window.nhWhenVisible = function (el, init) {
	if (!el) return;
	var done = false;
	var watching = false;
	function run() {
		if (done) return;
		done = true;
		init();
	}
	function watch() {
		if (watching) return;
		watching = true;
		if (!('IntersectionObserver' in window)) return run();
		var io = new IntersectionObserver(function (entries) {
			if (entries.some(function (e) { return e.isIntersecting; })) {
				io.disconnect();
				run();
			}
		}, { rootMargin: '300px 0px' });
		io.observe(el);
	}
	if (document.readyState === 'complete') {
		watch();
	} else {
		window.addEventListener('load', watch, { once: true });
		setTimeout(watch, 3000);
	}
};

$(function() {
	// .product-carousel (home-page-tabbber) is initialised by its section.
	$(".carousel").not(".product-carousel").each(function() {
		var el = this;
		nhWhenVisible(el, function () {
		$(el).owlCarousel({
			items: 3,
			margin: 10,
			loop: true,
			nav: true,
			dots: false,
			navText: [
				`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
					fill="none" stroke="currentColor" stroke-width="2" 
					stroke-linecap="round" stroke-linejoin="round" 
					class="feather feather-arrow-left">
					<path d="M20 12H4"></path><path d="M10 6l-6 6 6 6"></path>
				</svg>`,
				`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
					fill="none" stroke="currentColor" stroke-width="2" 
					stroke-linecap="round" stroke-linejoin="round" 
					class="feather feather-arrow-right">
					<path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path>
				</svg>`
			],
			responsive: {
				0: {
					items: 2,
					margin: 5
				},
				600: {
					items: 2
				},
				1000: {
					items: 4
				}
			}
		});
		});
	});

	$('#sub-collections').owlCarousel({
		items: 6,
		margin: 10,
		loop: true,
		autoplay: true, // Activates automatic slide transition
		nav: true,
		dots: true,
		navText: [
			`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-arrow-left">
			<path d="M20 12H4"></path><path d="M10 6l-6 6 6 6"></path>
		</svg>`,
			`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-arrow-right">
			<path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path>
		</svg>`,
		],
		responsive: {
			0: {
			items: 3,
			margin: 5,
			nav: false,
			},
			600: {
			items: 3,
			},
			900: {
			items: 4,
			},
			1100: {
			items: 6,
			nav: true,
			dots: true,
			},
		},
	});
});

$(".bannerCarousel").each(function () {
	var el = this;
	nhWhenVisible(el, function () {
$(el).owlCarousel({
	items: 1,
	margin: 10,
	loop: true,
	autoplay: true,
	nav: false,
	dots: true,
	responsive: {
		0: {
			items: 1
		},
		600: {
			items: 1
		},
		1000: {
			items: 1
		}
	}
});
	});
});

$('.CarCarousel').each(function () {
  var $this = $(this);
  nhWhenVisible(this, function () {

  var isRTL = $this.data('rtl') === true || $this.data('rtl') === "true";

  // Arrows render beside the section heading (see sections/car-carousel.liquid).
  var $navContainer = $this.closest('.car-carousel-section').find('.nh-slider-nav');

  $this.owlCarousel({
   	items: 10,
	margin: 10,
	loop: true,
	autoplay: true,
  	autoplayTimeout: 2000,
    autoplaySpeed: 1000,
    autoplayHoverPause: true,
	nav: true,
	dots: false,
	rtl: isRTL,
	navContainer: $navContainer.length ? $navContainer : false,
	// Long thin arrows for the pill control styled in style.css ("Car carousel").
	navText: [
		`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
			fill="none" stroke="currentColor" stroke-width="1.8"
			stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M20 12H4"></path><path d="M10 6l-6 6 6 6"></path>
		</svg>`,
		`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
			fill="none" stroke="currentColor" stroke-width="1.8"
			stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path>
		</svg>`
	],
	responsive: {
		0: {
			items: 4,
			margin: 5,
			nav:false
		},
		1000: {
			items: 6
		},
		1200: {
			items: 10
		}
	}
  });

  $navContainer.find('.owl-prev').attr('aria-label', 'Previous');
  $navContainer.find('.owl-next').attr('aria-label', 'Next');
  });
});

$(".pdp-featured-collection").owlCarousel({
	items: 6,
	margin: 10,
	loop: false,
	autoplay: false,
	nav: true,
	dots: true,
	navText: [
		`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-arrow-left">
			<path d="M20 12H4"></path><path d="M10 6l-6 6 6 6"></path>
		</svg>`,
		`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-arrow-right">
			<path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path>
		</svg>`
	],
	responsive: {
		0: {
			items: 2,
			margin: 5,
			dots:false
		},
		800: {
			items: 3,
			dots:false
		},
		1000: {
			items: 4
		},
		1300: {
			items: 6
		},
	}
});

window.addEventListener('load', function() {
	var modal = document.querySelector(".modal");
	var trigger = document.querySelector(".trigger");
	var closeButton = document.querySelector(".close-button");

	function toggleModal() {
		if(modal) modal.classList.toggle("show-modal");
	}

	function windowOnClick(event) {
		if (event.target === modal) {
			toggleModal();
		}
	}

	setTimeout(() => {
		toggleModal()
	}, 5000)

	if(closeButton) closeButton.addEventListener("click", toggleModal);
	window.addEventListener("click", windowOnClick);
})

//js for open submenu on hover
const inlineMenu = document.querySelector(".header__inline-menu");
const detailsItems = inlineMenu.querySelectorAll("details");

detailsItems.forEach(item => {
	const ulElement = item.querySelector("ul");
	item.addEventListener("mouseover", () => {

		item.setAttribute("open", true);
		positionNavFlyout(item);
		ulElement.addEventListener("mouseleave", () => {
			item.removeAttribute("open");
		});

		item.addEventListener("mouseleave", () => {
			item.removeAttribute("open");
		});

	});
});

/* Line the second-level flyout up with the category it belongs to.

   CSS cannot do this. The flyout has to be positioned against the panel
   (.parent-navitem-panel) rather than against its own row: the category list
   inside the panel scrolls, and an absolutely positioned box only escapes an
   ancestor's overflow when its containing block sits outside that ancestor.
   Positioned against the panel, "level with my row" is not something CSS can
   express — so the offset is measured here.

   The offset is clamped to the panel, which is what keeps a long flyout from
   running above the menu's top or below its bottom; anything past that height
   scrolls inside the flyout (max-height: 100% in the stylesheet). Clamping
   also keeps the row inside the flyout's vertical span, so reaching it stays a
   straight sideways move — the hover code above closes a category as soon as
   the pointer leaves it, and a diagonal trip across the other categories would
   open those instead. */
function positionNavFlyout(details) {
	const flyout = details.querySelector(":scope > .child-navitem");
	if (!flyout) return;

	const panel = details.closest(".parent-navitem-panel");
	const row = details.querySelector(":scope > summary");
	if (!panel || !row) return;

	// Measure against the panel's padding box, which is what `top` resolves to.
	const panelTop = panel.getBoundingClientRect().top + panel.clientTop;
	const rowTop = row.getBoundingClientRect().top;
	const height = flyout.offsetHeight;
	const top = Math.max(0, Math.min(rowTop - panelTop, panel.clientHeight - height));

	flyout.style.top = top + "px";

	// The hover bridge over the list's scrollbar is a pseudo element, so it is
	// handed the same span through custom properties. See `.nav-item >
	// details[open]::after` in assets/style.css.
	details.style.setProperty("--nh-fly-top", top + "px");
	details.style.setProperty("--nh-fly-height", height + "px");
}

/* Scrolling the category list moves the rows but not the flyout, which is
   anchored to the panel. Re-measure so the open one keeps its row. */
inlineMenu.querySelectorAll(".parent-navitem").forEach(list => {
	let queued = false;
	list.addEventListener("scroll", () => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			const open = list.querySelector(".nav-item > details[open]");
			if (open) positionNavFlyout(open);
		});
	});
});



// collection popup js
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('collection-popup');
  if (!popup) return;

  const delay = parseInt(popup.dataset.delay, 10);
  const expiry = parseInt(popup.dataset.expiry, 10);
  const storageKey = 'collection_popup_closed';

  const storedData = JSON.parse(localStorage.getItem(storageKey));
  const now = Date.now();

  if (storedData && now - storedData < expiry) return;

  setTimeout(() => {
    popup.classList.remove('hidden');
  }, delay);

  popup.querySelector('.collection-popup__close').addEventListener('click', () => {
    popup.classList.add('hidden');
    localStorage.setItem(storageKey, JSON.stringify(Date.now()));
  });
    /* Overlay click = temporary dismissal */
  popup.querySelector('.collection-popup__overlay').addEventListener('click', () => {
    popup.classList.add('hidden');
    // intentionally NO localStorage write
  });
});

// mobile bottom menu cart bubble count js 
(function () {
const MOBILE_SELECTOR = '.mobile-bottom-menu';

function updateMobileCartBubble() {
	const mobileMenu = document.querySelector(MOBILE_SELECTOR);
	if (!mobileMenu || window.innerWidth > 767) return;

	const cartLink = mobileMenu.querySelector('#cart-icon-bubble');
	if (!cartLink) return;

	fetch('/cart.js')
	.then((res) => res.json())
	.then((cart) => {
		let bubble = cartLink.querySelector('.cart-count-bubble');

		if (cart.item_count > 0) {
		if (!bubble) {
			bubble = document.createElement('div');
			bubble.className = 'cart-count-bubble';
			bubble.innerHTML = `<span aria-hidden="true"></span>`;
			cartLink.appendChild(bubble);
		}
		bubble.querySelector('span').textContent = cart.item_count;
		} else if (bubble) {
		bubble.remove();
		}
	});
}

/* 🔥 Patch fetch to listen cart updates */
const originalFetch = window.fetch;
window.fetch = function () {
	return originalFetch.apply(this, arguments).then((response) => {
	try {
		const url = arguments[0];
		if (
		typeof url === 'string' &&
		(url.includes('/cart/add') || url.includes('/cart/change') || url.includes('/cart/update'))
		) {
		setTimeout(updateMobileCartBubble, 300);
		}
	} catch (e) {}
	return response;
	});
};

/* Initial sync on load */
document.addEventListener('DOMContentLoaded', updateMobileCartBubble);
})();

(function () {
  function initRelatedProductsCarousel() {
    var $carousel = jQuery('.pdp-related-products');

    if ($carousel.length && !$carousel.hasClass('owl-loaded')) {
      $carousel.owlCarousel({
        items: 6,
        margin: 10,
        loop: false,
        autoplay: false,
        nav: true,
        dots: true,
        navText: [
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 12H4"></path><path d="M10 6l-6 6 6 6"></path>
          </svg>`,
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12h16"></path><path d="M14 6l6 6-6 6"></path>
          </svg>`
        ],
        responsive: {
          0: { items: 2, margin: 5, dots: false },
          800: { items: 3, dots: false },
          1000: { items: 4 },
          1300: { items: 6 }
        }
      });
    }
  }

  // Shopify product-recommendations lifecycle hook
  document.addEventListener('DOMContentLoaded', function () {
    var recommendations = document.querySelector('product-recommendations');

    if (!recommendations) return;

    recommendations.addEventListener('load', function () {
      initRelatedProductsCarousel();
    });
  });

  // Defensive fallback for async DOM injection
  var observer = new MutationObserver(function () {
    if (document.querySelector('.pdp-related-products')) {
      initRelatedProductsCarousel();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

/* Mobile drawer: one branch open at a time.

   Dawn's drawer lets every entry stay expanded, so opening three categories
   left a scroll containing all of their children at once — on this store that
   is 240 rows. Opening one entry now closes its siblings and scrolls it up to
   the sticky slot under the masthead, which is where it is about to park
   anyway, so the list you asked for starts at the top of the screen.

   Applied at both levels: a single-open first level with a multi-open second
   level would just move the same pile-up one step down.

   `toggle` does not bubble, so the listener is bound per <details>. Closing a
   sibling fires its own toggle, hence the early return on a closed element.
   The classes cleared alongside the attribute are Dawn's own open-state
   bookkeeping (see MenuDrawer.closeMenuDrawer in global.js). */
(() => {
  const drawer = document.querySelector('#menu-drawer');
  if (!drawer) return;

  const masthead = drawer.querySelector('.menu-drawer__header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeBranch(details) {
    details.removeAttribute('open');
    details.classList.remove('menu-opening');
    details.querySelectorAll('details').forEach((nested) => {
      nested.removeAttribute('open');
      nested.classList.remove('menu-opening');
    });
    details.querySelectorAll('.submenu-open').forEach((el) => el.classList.remove('submenu-open'));
    details.querySelectorAll('summary').forEach((s) => s.setAttribute('aria-expanded', 'false'));
  }

  function revealBranch(details) {
    const summary = details.querySelector(':scope > summary');
    if (!summary) return;

    // Scroll the branch to exactly where its own row is about to park, and no
    // further. That target is the row's sticky `top` — 56px under the masthead
    // for a category, 105px for a brand, because a brand parks below the
    // category that is itself still stuck above it. Using the masthead height
    // for both (as this did) left a brand 49px too high, so the first entry of
    // its list started life hidden behind the row above it.
    const stickyTop = parseFloat(getComputedStyle(summary).top);
    const offset = Number.isNaN(stickyTop) ? masthead ? masthead.offsetHeight : 0 : stickyTop;

    // Measure the <details>, not its <summary>: the summary is sticky, so its
    // rect reports where it is parked rather than where the branch begins.
    const top = drawer.scrollTop + details.getBoundingClientRect().top - drawer.getBoundingClientRect().top - offset;
    drawer.scrollTo({ top: Math.max(0, Math.round(top)), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  drawer.querySelectorAll('.level-one, .level-two').forEach((list) => {
    list.querySelectorAll(':scope > li > details').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        list.querySelectorAll(':scope > li > details').forEach((sibling) => {
          if (sibling !== details && sibling.hasAttribute('open')) closeBranch(sibling);
        });
        // Let the closes reflow before measuring where this branch landed.
        requestAnimationFrame(() => revealBranch(details));
      });
    });
  });
})();

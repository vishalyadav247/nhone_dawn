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
$(function() {
	$(".carousel").each(function() {
		$(this).owlCarousel({
			items: 3,
			margin: 20,
			loop: true,
			nav: true,
			dots: false,
			navText: [
				`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
					fill="none" stroke="currentColor" stroke-width="2" 
					stroke-linecap="round" stroke-linejoin="round" 
					class="feather feather-chevron-left">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>`,
				`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
					fill="none" stroke="currentColor" stroke-width="2" 
					stroke-linecap="round" stroke-linejoin="round" 
					class="feather feather-chevron-right">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>`
			],
			responsive: {
				0: {
					items: 2,
					margin: 7
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
			class="feather feather-chevron-left">
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>`,
			`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-chevron-right">
			<polyline points="9 18 15 12 9 6"></polyline>
		</svg>`,
		],
		responsive: {
			0: {
			items: 3,
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

$(".bannerCarousel").owlCarousel({
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

$('.CarCarousel').each(function () {
  var $this = $(this);

  var isRTL = $this.data('rtl') === true || $this.data('rtl') === "true";

  $this.owlCarousel({
   	items: 6,
	margin: 50,
	loop: true,
	autoplay: true,
  	autoplayTimeout: 2000,
    autoplaySpeed: 1000,
    autoplayHoverPause: true,
	nav: true,
	dots: true,
	rtl: isRTL,
	navText: [
		`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-chevron-left">
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>`,
		`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-chevron-right">
			<polyline points="9 18 15 12 9 6"></polyline>
		</svg>`
	],
	responsive: {
		0: {
			items: 3,
			nav:false
		},
		600: {
			items: 4
		},
		1000: {
			items: 6
		}
	}
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
			class="feather feather-chevron-left">
			<polyline points="15 18 9 12 15 6"></polyline>
		</svg>`,
		`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
			fill="none" stroke="currentColor" stroke-width="2" 
			stroke-linecap="round" stroke-linejoin="round" 
			class="feather feather-chevron-right">
			<polyline points="9 18 15 12 9 6"></polyline>
		</svg>`
	],
	responsive: {
		0: {
			items: 2,
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
		ulElement.addEventListener("mouseleave", () => {
			item.removeAttribute("open");
		});

		item.addEventListener("mouseleave", () => {
			item.removeAttribute("open");
		});

	});
});

document.addEventListener('DOMContentLoaded', function () {
	const contentWrapper = document.querySelector('.read-more-text');
	const readMoreBtn = document.querySelector('.read-more-btn');

	const maxWords = 100;
	let wordCount = 0;

	// Walk through nodes and split when over 200 words
	function splitContent(node) {
		if (wordCount >= maxWords) {
		return { keep: null, extra: node.cloneNode(true) };
		}

		if (node.nodeType === Node.TEXT_NODE) {
		const words = node.textContent.trim().split(/\s+/);
		if (wordCount + words.length <= maxWords) {
			wordCount += words.length;
			return { keep: node.cloneNode(true), extra: null };
		} else {
			const splitIndex = maxWords - wordCount;
			const keepText = words.slice(0, splitIndex).join(' ');
			const extraText = words.slice(splitIndex).join(' ');
			wordCount = maxWords;

			return {
			keep: document.createTextNode(keepText + ' '),
			extra: document.createTextNode(extraText + ' '),
			};
		}
		}

		if (node.nodeType === Node.ELEMENT_NODE) {
		const keepClone = node.cloneNode(false);
		const extraClone = node.cloneNode(false);

		node.childNodes.forEach((child) => {
			const { keep, extra } = splitContent(child);
			if (keep) keepClone.appendChild(keep);
			if (extra) extraClone.appendChild(extra);
		});

		return {
			keep: keepClone.hasChildNodes() ? keepClone : null,
			extra: extraClone.hasChildNodes() ? extraClone : null,
		};
		}

		return { keep: null, extra: null };
	}

	if (contentWrapper) {
		const { keep, extra } = splitContent(contentWrapper);

		if (extra) {
		contentWrapper.innerHTML = '';
		const visiblePart = document.createElement('span');
		visiblePart.className = 'visible-text';
		visiblePart.appendChild(keep);

		const hiddenPart = document.createElement('span');
		hiddenPart.className = 'more-text';
		hiddenPart.style.display = 'none';
		hiddenPart.appendChild(extra);

		contentWrapper.appendChild(visiblePart);
		contentWrapper.appendChild(hiddenPart);

		// Toggle logic
		readMoreBtn.addEventListener('click', function () {
			if (hiddenPart.style.display === 'none') {
			hiddenPart.style.display = 'inline';
			readMoreBtn.textContent = 'Read Less';
			} else {
			hiddenPart.style.display = 'none';
			readMoreBtn.textContent = 'Read More';
			}
		});
		} else {
		readMoreBtn.style.display = 'none'; // Hide button if <200 words
		}
	}
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
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>`,
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>`
        ],
        responsive: {
          0: { items: 2, dots: false },
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

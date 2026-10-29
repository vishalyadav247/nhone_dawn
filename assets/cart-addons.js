/**
 * Cart add-ons (snippets/cart-addons.liquid): one-tap Add inside the cart
 * drawer.
 *
 * Adds the variant with /cart/add.js and asks Shopify to render the drawer's
 * sections in the same request, then hands them to the drawer's own
 * renderContents() — exactly what a product page's Add to cart does
 * (assets/product-form.js) — so the new line, the totals and the header
 * cart count all update at once and the add-on drops out of the row.
 *
 * Loaded once from layout/theme.liquid. The drawer re-renders its contents
 * with innerHTML, so the <cart-addons> element is recreated each time and
 * upgraded by this definition; listeners live on that element.
 */
if (!customElements.get('cart-addons')) {
  customElements.define(
    'cart-addons',
    class CartAddons extends HTMLElement {
      connectedCallback() {
        this.addEventListener('click', this.onClick);
        this.addEventListener('change', this.onVariantChange);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('change', this.onVariantChange);
      }

      // Products with options: point the card's button and price at the
      // variant picked in its dropdown.
      onVariantChange = (event) => {
        const select = event.target.closest('.cart-addon__variant');
        if (!select) return;
        const card = select.closest('.cart-addon');
        const option = select.selectedOptions[0];
        const button = card.querySelector('[data-addon-variant]');
        const price = card.querySelector('[data-addon-price]');
        const compare = card.querySelector('[data-addon-compare]');

        if (button) button.dataset.addonVariant = select.value;
        if (price && option.dataset.price) price.textContent = option.dataset.price;
        if (compare) {
          compare.textContent = option.dataset.compare || '';
          compare.hidden = !option.dataset.compare;
        }
      };

      onClick = (event) => {
        const button = event.target.closest('[data-addon-variant]');
        if (!button || button.disabled) return;
        this.add(button);
      };

      async add(button) {
        const drawer = document.querySelector('cart-drawer');
        const error = this.querySelector('.cart-addons__error');
        if (error) error.hidden = true;

        button.disabled = true;
        button.classList.add('is-loading');
        button.setAttribute('aria-busy', 'true');

        const body = {
          items: [{ id: Number(button.dataset.addonVariant), quantity: 1 }],
        };
        if (drawer && typeof drawer.getSectionsToRender === 'function') {
          body.sections = drawer.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
        }

        try {
          const response = await fetch(routes.cart_add_url, { ...fetchConfig(), body: JSON.stringify(body) });
          const data = await response.json();

          if (data.status) {
            // Shopify's own message, e.g. "All 2 … are in your cart."
            this.showError(data.description || data.message);
            this.reset(button);
            return;
          }

          if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
            publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-addons', productVariantId: body.items[0].id, cartData: data });
          }

          if (drawer && data.sections) {
            drawer.renderContents({ id: body.items[0].id, sections: data.sections });
          } else {
            window.location.href = routes.cart_url;
          }
        } catch (e) {
          this.showError(window.cartStrings ? window.cartStrings.error : 'Something went wrong. Please try again.');
          this.reset(button);
        }
      }

      reset(button) {
        button.disabled = false;
        button.classList.remove('is-loading');
        button.removeAttribute('aria-busy');
      }

      showError(message) {
        const error = this.querySelector('.cart-addons__error');
        if (!error || !message) return;
        error.textContent = message;
        error.hidden = false;
      }
    }
  );
}

if (!customElements.get('card-buy-now')) {
  // GoKwik readiness: direct buy-now clicks must not fire before the vendor
  // script is ready. Probe the vendor's public entry point (window.onBuyNowClick)
  // and also listen for the vendor's `gokwikLoaded` event — the probe covers the
  // case where our script loads after `gokwikLoaded` already fired.
  let gkReady = typeof window.onBuyNowClick === 'function';
  window.addEventListener('gokwikLoaded', () => {
    gkReady = true;
  });
  const gokwikReady = () => {
    if (!gkReady && typeof window.onBuyNowClick === 'function') gkReady = true;
    return gkReady;
  };

  customElements.define(
    'card-buy-now',
    class CardBuyNow extends HTMLElement {
      connectedCallback() {
        if (this.buyNowBound) return;
        const button = this.querySelector('button');
        if (!button) return;
        this.buyNowBound = true;
        button.addEventListener('click', this.onButtonClick.bind(this));
      }

      onButtonClick(event) {
        // Multi-variant / quantity-rule products: open the card's quick-add
        // modal so the shopper picks options; fall back to the product page.
        // Opening the variant picker does not need GoKwik, so no readiness gate.
        if (this.dataset.modal) {
          const opener = this.closest('.card-wrapper')?.querySelector(
            `modal-opener[data-modal="${this.dataset.modal}"] button`
          );
          if (opener) {
            opener.click();
          } else if (this.dataset.productUrl) {
            window.location.href = this.dataset.productUrl;
          }
          return;
        }

        if (!gokwikReady()) return;
        try {
          window.onBuyNowClick(event.currentTarget, false, [
            { id: Number(this.dataset.variantId), quantity: 1 },
          ]);
        } catch (e) {
          console.error('GoKwik buy now failed', e);
        }
      }
    }
  );

  // The quick-add modal fetches the PDP's product-info, which includes the PDP
  // GoKwik button (#gokwik-buy-now with an inline onclick="onBuyNowClick(this)").
  // That inline flow targets the PDP form, so rewire the fetched button to pass
  // the modal's variant + quantity explicitly. `product-info:loaded` bubbles
  // from the fetched <product-info> (see assets/product-info.js). The rewire is
  // NOT gated on GoKwik readiness (only the final onBuyNowClick call is), so a
  // modal opened before the vendor script loads still gets wired up.
  document.addEventListener('product-info:loaded', (event) => {
    const modal = event.target.closest('quick-add-modal');
    if (!modal) return;
    const gkBtn = modal.querySelector('#gokwik-buy-now');
    if (!gkBtn) return;
    if (gkBtn.dataset.cardBuyNowBound === 'true') return;
    // Hidden by the vendor Intl flow (non-India) or the hideFlow setting —
    // leave it alone so removing the id doesn't un-hide it.
    if (window.getComputedStyle(gkBtn).display === 'none') return;
    gkBtn.dataset.cardBuyNowBound = 'true';
    gkBtn.removeAttribute('onclick');
    gkBtn.removeAttribute('id');
    gkBtn.classList.add('card-buy-now__btn');
    gkBtn.classList.remove('disabled');
    gkBtn.disabled = false;
    gkBtn.addEventListener('click', () => {
      if (!gokwikReady()) return;
      const form = modal.querySelector('form[data-type="add-to-cart-form"]');
      const variantInput = form?.querySelector('input.product-variant-id, [name="id"]');
      const variantId = variantInput ? Number(variantInput.value) : NaN;
      const addButton = modal.querySelector('button[name="add"]');
      // product-info.js only updates the variant input's value (never its
      // `disabled` attribute): an unavailable option combo leaves value ''
      // (Number('') === 0) and disables the add-to-cart button instead.
      const unavailable =
        !variantInput || variantInput.disabled || !variantId || Number.isNaN(variantId) || addButton?.disabled;
      gkBtn.classList.toggle('gokwik-disabled', Boolean(unavailable));
      if (unavailable) return;
      const qtyInput = modal.querySelector('input[name="quantity"]');
      const quantity = qtyInput ? Number(qtyInput.value) || 1 : 1;
      try {
        window.onBuyNowClick(gkBtn, false, [{ id: variantId, quantity }]);
      } catch (e) {
        console.error('GoKwik buy now failed', e);
      }
    });
  });
}

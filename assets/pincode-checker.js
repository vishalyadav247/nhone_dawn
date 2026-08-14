if (!customElements.get('pincode-checker')) {
  customElements.define(
    'pincode-checker',
    class PincodeChecker extends HTMLElement {
      static STORAGE_KEY = 'nhone-fitment-pincode';
      // Minimum time the "checking..." shimmer stays visible for user-initiated
      // checks, so the instant inline lookup still reads as a real check.
      // Tune to taste; skipped entirely when restoring a saved pincode.
      static MIN_LOADING_MS = 3000;
      static dataPromise = null;
      static rangeCache = new WeakMap();
      static memPin = null;

      connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;

        this.input = this.querySelector('.pincode-checker__input');
        this.checkButton = this.querySelector('.pincode-checker__button');
        this.inputRow = this.querySelector('.pincode-checker__row--input');
        this.chipRow = this.querySelector('.pincode-checker__row--chip');
        this.chipPin = this.querySelector('[data-chip-pin]');
        this.changeButton = this.querySelector('.pincode-checker__change');
        this.result = this.querySelector('[data-result]');
        const idleElement = this.querySelector('.pincode-checker__idle');
        this.idleText = idleElement ? idleElement.textContent.trim() : '';

        this.matches = [];
        this.lastCheckedPin = null;
        this.busy = false;
        this.prefetched = false;
        this.resultBar = null;

        this.addEventListener('focusin', this.onFocusIn.bind(this));
        if (this.input) {
          this.input.addEventListener('input', this.onInput.bind(this));
          this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              this.onCheckClick();
            }
          });
        }
        if (this.checkButton) this.checkButton.addEventListener('click', this.onCheckClick.bind(this));
        if (this.changeButton) this.changeButton.addEventListener('click', this.onChangeClick.bind(this));

        this.applySavedPin();
      }

      getModal() {
        // ModalDialog moves itself to document.body on connect, so look it up globally.
        if (!this.modal || !this.modal.isConnected) {
          this.modal = document.querySelector(this.dataset.modal);
        }
        return this.modal;
      }

      loadData() {
        if (!PincodeChecker.dataPromise) {
          // Centres are rendered inline from the "fitment_centre" metaobject —
          // no network request. Missing data means no entries exist yet
          // (or the metaobject type/field keys don't match the snippet).
          PincodeChecker.dataPromise = new Promise((resolve, reject) => {
            const inline = this.querySelector('[data-fitment-centres]');
            if (!inline) {
              reject(new Error('No centres data — add "fitment_centre" metaobject entries in Shopify admin'));
              return;
            }
            const data = JSON.parse(inline.textContent);
            if (!Array.isArray(data.centres)) {
              reject(new Error('Malformed fitment centres data'));
              return;
            }
            resolve(data.centres);
          }).catch((error) => {
            PincodeChecker.dataPromise = null;
            throw error;
          });
        }
        return PincodeChecker.dataPromise;
      }

      matchCentres(pinString, centres) {
        const pin = parseInt(pinString, 10);
        return centres.filter(
          (centre) => typeof centre.pincodes === 'string' && centre.pincodes !== '' && this.pinInRanges(pin, centre)
        );
      }

      pinInRanges(pin, centre) {
        let ranges = PincodeChecker.rangeCache.get(centre);
        if (!ranges) {
          ranges = centre.pincodes
            .split(',')
            .map((token) => {
              const part = token.trim();
              const dash = part.indexOf('-');
              if (dash > 0) {
                return [parseInt(part.slice(0, dash), 10), parseInt(part.slice(dash + 1), 10)];
              }
              const value = parseInt(part, 10);
              return [value, value];
            })
            .filter((range) => !Number.isNaN(range[0]) && !Number.isNaN(range[1]));
          PincodeChecker.rangeCache.set(centre, ranges);
        }
        return ranges.some((range) => pin >= range[0] && pin <= range[1]);
      }

      onFocusIn() {
        if (this.prefetched) return;
        this.prefetched = true;
        this.loadData().catch(() => {});
      }

      onInput() {
        const digits = this.input.value.replace(/\D/g, '').slice(0, 6);
        if (this.input.value !== digits) this.input.value = digits;
        this.input.classList.remove('pincode-checker__input--invalid');
        if (digits.length === 6) this.check(digits);
      }

      onCheckClick() {
        // Explicit "Check" (or Enter) means the shopper wants to SEE the centres:
        // run the check and open the popup directly when the pincode is served.
        const value = this.input ? this.input.value : '';
        if (/^\d{6}$/.test(value)) {
          this.check(value, { openOnFound: true });
        } else {
          this.flagInvalid();
        }
      }

      flagInvalid() {
        if (!this.input) return;
        this.input.classList.remove('pincode-checker__input--invalid');
        void this.input.offsetWidth; // restart the shake animation
        this.input.classList.add('pincode-checker__input--invalid');
      }

      onChangeClick() {
        const pin = this.lastCheckedPin || (this.chipPin ? this.chipPin.textContent.trim() : '');
        this.lastCheckedPin = null;
        this.setState('idle');
        if (this.input) {
          this.input.value = /^\d{6}$/.test(pin) ? pin : '';
          this.input.focus();
          this.input.select();
        }
      }

      openModal(opener) {
        const modal = this.getModal();
        if (!modal || typeof modal.show !== 'function') return;
        this.buildCards(modal);
        const title = modal.querySelector('[data-modal-title]');
        if (title) {
          title.textContent = (this.dataset.dialogTitle || '').replace('[pincode]', this.lastCheckedPin || '');
        }
        modal.show(opener || this);
      }

      async check(pin, { fromStorage = false, openOnFound = false } = {}) {
        if (this.busy) return;
        if (pin === this.lastCheckedPin && (this.dataset.state === 'found' || this.dataset.state === 'notfound')) {
          if (openOnFound && this.dataset.state === 'found') this.openModal(this.resultBar || this.checkButton);
          return;
        }
        this.busy = true;
        this.setState('loading');
        const startedAt = Date.now();

        let centres;
        try {
          centres = await this.loadData();
        } catch (error) {
          console.warn('pincode-checker: could not load fitment centres', error);
          this.setState('idle');
          if (fromStorage && this.input) this.input.value = pin;
          this.busy = false;
          return;
        }

        // Hold the shimmer so the check doesn't resolve instantly (skipped on
        // silent restore-from-storage, which runs on every page load).
        const minMs = fromStorage ? 0 : PincodeChecker.MIN_LOADING_MS;
        const remaining = minMs - (Date.now() - startedAt);
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));

        this.matches = this.matchCentres(pin, centres);
        this.lastCheckedPin = pin;
        this.savePin(pin);
        this.setState(this.matches.length ? 'found' : 'notfound', pin);
        this.busy = false;
        if (openOnFound && this.matches.length) this.openModal(this.resultBar || this.checkButton);
      }

      applySavedPin() {
        const pin = this.readPin();
        if (!pin) return;
        if (this.inputRow) this.inputRow.hidden = true;
        if (this.chipRow) {
          this.chipRow.hidden = false;
          if (this.chipPin) this.chipPin.textContent = pin;
        }
        this.check(pin, { fromStorage: true });
      }

      setState(state, pin) {
        this.dataset.state = state;

        // Row toggling: "found" collapses the input into the pincode chip;
        // "idle"/"notfound" bring the input back so the shopper can edit.
        // "loading" leaves whichever row is visible untouched.
        if (state === 'found') {
          if (this.inputRow) this.inputRow.hidden = true;
          if (this.chipRow) {
            this.chipRow.hidden = false;
            if (this.chipPin) this.chipPin.textContent = pin || this.lastCheckedPin || '';
          }
        } else if (state === 'idle' || state === 'notfound') {
          if (this.chipRow) this.chipRow.hidden = true;
          if (this.inputRow) this.inputRow.hidden = false;
          if (state === 'notfound' && this.input && this.input.value === '' && pin) this.input.value = pin;
        }

        if (!this.result) return;
        this.result.textContent = '';
        this.resultBar = null;

        if (state === 'idle') {
          const idle = document.createElement('span');
          idle.className = 'pincode-checker__idle';
          idle.textContent = this.idleText;
          this.result.appendChild(idle);
          return;
        }

        if (state === 'loading') {
          const shimmer = document.createElement('span');
          shimmer.className = 'pincode-checker__shimmer';
          this.result.appendChild(shimmer);
          return;
        }

        const template = state === 'found' ? this.dataset.successText : this.dataset.notFoundText;
        const icon = document.createElement('span');
        icon.className = 'pincode-checker__bar-icon';
        icon.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.className = 'pincode-checker__bar-text';
        text.innerHTML = (template || '').replace('[pincode]', pin || '');

        if (state === 'found') {
          // The whole success bar is the button that opens the centres popup.
          const bar = document.createElement('button');
          bar.type = 'button';
          bar.className = 'pincode-checker__bar pincode-checker__bar--found';
          bar.setAttribute('aria-haspopup', 'dialog');
          const cta = document.createElement('span');
          cta.className = 'pincode-checker__bar-cta';
          cta.textContent = this.matches.length === 1 ? 'View centre' : `View ${this.matches.length} centres`;
          bar.append(icon, text, cta);
          bar.addEventListener('click', () => this.openModal(bar));
          this.result.appendChild(bar);
          this.resultBar = bar;
        } else {
          const bar = document.createElement('div');
          bar.className = 'pincode-checker__bar pincode-checker__bar--notfound';
          bar.append(icon, text);
          this.result.appendChild(bar);
        }
      }

      buildCards(modal) {
        const list = modal.querySelector('[data-centres-list]');
        if (!list) return;
        list.textContent = '';

        this.matches.forEach((centre) => {
          const card = document.createElement('div');
          card.className = 'pincode-centre-card';

          const marker = document.createElement('span');
          marker.className = 'pincode-centre-card__marker';
          marker.setAttribute('aria-hidden', 'true');
          card.appendChild(marker);

          const body = document.createElement('div');
          body.className = 'pincode-centre-card__body';

          const name = document.createElement('h3');
          name.className = 'pincode-centre-card__name';
          name.textContent = centre.name || '';

          const badge = document.createElement('span');
          badge.className = 'pincode-centre-card__badge';
          badge.textContent = 'FREE FITMENT';
          name.appendChild(badge);
          body.appendChild(name);

          if (centre.address) {
            const address = document.createElement('p');
            address.className = 'pincode-centre-card__address';
            address.textContent = centre.address;
            body.appendChild(address);
          }

          const actions = document.createElement('div');
          actions.className = 'pincode-centre-card__actions';

          if (centre.phone) {
            const call = document.createElement('a');
            call.className = 'pincode-centre-card__call';
            call.href = `tel:${String(centre.phone).replace(/[^+\d]/g, '')}`;
            call.textContent = 'Call';
            actions.appendChild(call);
          }

          if (centre.maps && /^https?:\/\//i.test(centre.maps)) {
            const directions = document.createElement('a');
            directions.className = 'pincode-centre-card__directions';
            directions.href = centre.maps;
            directions.target = '_blank';
            directions.rel = 'noopener';
            directions.textContent = 'Get directions';
            actions.appendChild(directions);
          }

          if (actions.childElementCount > 0) body.appendChild(actions);
          card.appendChild(body);
          list.appendChild(card);
        });
      }

      savePin(pin) {
        try {
          window.localStorage.setItem(PincodeChecker.STORAGE_KEY, pin);
        } catch (error) {
          PincodeChecker.memPin = pin;
        }
      }

      readPin() {
        let pin = null;
        try {
          pin = window.localStorage.getItem(PincodeChecker.STORAGE_KEY);
        } catch (error) {
          pin = PincodeChecker.memPin;
        }
        if (pin && /^\d{6}$/.test(pin)) return pin;
        if (pin) {
          try {
            window.localStorage.removeItem(PincodeChecker.STORAGE_KEY);
          } catch (error) {
            // storage unavailable — nothing to clean up
          }
          PincodeChecker.memPin = null;
        }
        return null;
      }
    }
  );
}

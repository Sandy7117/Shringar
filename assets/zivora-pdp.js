class ZivoraPdp extends HTMLElement {
  connectedCallback() {
    this.thumbs = Array.from(this.querySelectorAll('[data-thumb]'));
    this.main = this.querySelector('[data-main-image]');
    this.lightbox = this.querySelector('[data-lightbox]');
    this.lightboxImage = this.querySelector('[data-lightbox-image]');
    this.variantInput = this.querySelector('[data-variant-id]');
    this.priceNow = this.querySelector('[data-price-now]');
    this.priceWas = this.querySelector('[data-price-was]');
    this.priceOff = this.querySelector('[data-price-off]');
    this.colorLabel = this.querySelector('[data-color-label]');

    try {
      this.variants = JSON.parse(this.querySelector('[data-variants-json]')?.textContent || '[]');
    } catch (e) {
      this.variants = [];
    }

    this.selected = {};
    this.querySelectorAll('[data-option-name]').forEach((group) => {
      const name = group.dataset.optionName;
      const active = group.querySelector('.is-active');
      if (name && active) this.selected[name] = active.dataset.value;
    });

    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.showMedia(index, thumb));
    });

    this.querySelector('[data-zoom]')?.addEventListener('click', () => this.openZoom());
    this.querySelector('[data-lightbox-close]')?.addEventListener('click', () => this.closeZoom());
    this.lightbox?.addEventListener('click', (event) => {
      if (event.target === this.lightbox) this.closeZoom();
    });

    this.querySelectorAll('[data-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.closest('[data-option-name]');
        group.querySelectorAll('[data-option]').forEach((el) => el.classList.remove('is-active'));
        button.classList.add('is-active');
        this.selected[group.dataset.optionName] = button.dataset.value;
        if (this.colorLabel && group.dataset.optionName.toLowerCase().includes('col')) {
          this.colorLabel.textContent = button.dataset.value;
        }
        this.applyVariant();
      });
    });

    this.querySelector('[data-buy-now]')?.addEventListener('click', () => this.buyNow());
  }

  showMedia(index, thumb) {
    this.thumbs.forEach((el) => el.classList.remove('is-active'));
    thumb.classList.add('is-active');
    const src = thumb.dataset.full;
    if (this.main && src) {
      this.main.src = src;
      this.main.srcset = '';
    }
  }

  openZoom() {
    if (!this.lightbox || !this.main) return;
    this.lightboxImage.src = this.main.currentSrc || this.main.src;
    this.lightbox.classList.add('is-open');
  }

  closeZoom() {
    this.lightbox?.classList.remove('is-open');
  }

  applyVariant() {
    const match = this.variants.find((variant) =>
      Object.entries(this.selected).every(([, value], index) => variant.options[index] === value)
    );
    if (!match || !this.variantInput) return;
    this.variantInput.value = match.id;
    if (this.priceNow) this.priceNow.textContent = match.price;
    if (this.priceWas) {
      this.priceWas.textContent = match.compare || '';
      this.priceWas.hidden = !match.compare;
    }
    if (this.priceOff) {
      this.priceOff.textContent = match.save || '';
      this.priceOff.hidden = !match.save;
    }
    if (match.image && this.main) this.main.src = match.image;
  }

  async buyNow() {
    const id = this.variantInput?.value;
    const qty = this.querySelector('input[name="quantity"]')?.value || '1';
    if (!id) return;
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), quantity: Number(qty) }),
    });
    window.location.href = '/checkout';
  }
}

customElements.define('zivora-pdp', ZivoraPdp);

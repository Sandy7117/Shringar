class ZivoraSlider extends HTMLElement {
  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-slide]'));
    this.dots = Array.from(this.querySelectorAll('[data-dot]'));
    this.index = 0;
    this.interval = Number(this.dataset.interval || 6000);

    this.querySelector('[data-prev]')?.addEventListener('click', () => this.go(this.index - 1));
    this.querySelector('[data-next]')?.addEventListener('click', () => this.go(this.index + 1));
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.go(i)));

    this.go(0);
    this.start();
    this.addEventListener('mouseenter', () => this.stop());
    this.addEventListener('mouseleave', () => this.start());
  }

  go(next) {
    if (!this.slides.length) return;
    this.index = (next + this.slides.length) % this.slides.length;
    this.slides.forEach((slide, i) => slide.classList.toggle('is-active', i === this.index));
    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === this.index));
  }

  start() {
    this.stop();
    if (this.slides.length < 2) return;
    this.timer = setInterval(() => this.go(this.index + 1), this.interval);
  }

  stop() {
    clearInterval(this.timer);
  }
}

customElements.define('zivora-slider', ZivoraSlider);

class ZivoraScroller extends HTMLElement {
  connectedCallback() {
    const scroller = this.querySelector('[data-scroller]');
    this.querySelector('[data-next]')?.addEventListener('click', () => {
      scroller?.scrollBy({ left: 160, behavior: 'smooth' });
    });
    this.querySelector('[data-prev]')?.addEventListener('click', () => {
      scroller?.scrollBy({ left: -160, behavior: 'smooth' });
    });
  }
}

customElements.define('zivora-scroller', ZivoraScroller);

class ZivoraQuotes extends HTMLElement {
  connectedCallback() {
    this.index = 1;
    this.querySelector('[data-prev]')?.addEventListener('click', () => this.show(this.index - 1));
    this.querySelector('[data-next]')?.addEventListener('click', () => this.show(this.index + 1));
    this.dots = Array.from(this.querySelectorAll('[data-dot]'));
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.show(i + 1)));
  }

  show(next) {
    this.index = ((next - 1 + 3) % 3) + 1;
    this.classList.remove('is-show-2', 'is-show-3');
    if (this.index !== 1) this.classList.add(`is-show-${this.index}`);
    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === this.index - 1));
  }
}

customElements.define('zivora-quotes', ZivoraQuotes);

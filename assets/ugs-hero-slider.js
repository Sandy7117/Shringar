class UgsHeroSlider extends HTMLElement {
  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-ugs-hero-slide]'));
    this.bars = Array.from(this.querySelectorAll('[data-ugs-hero-bar]'));
    this.index = Math.max(
      0,
      this.slides.findIndex((slide) => slide.classList.contains('is-active'))
    );
    this.autoplay = this.dataset.autoplay === 'true';
    this.intervalMs = Number(this.dataset.interval || 5000);
    this.timer = null;
    this.raf = null;
    this.startedAt = 0;

    if (this.slides.length < 2) return;

    this.bars.forEach((bar) => {
      bar.addEventListener('click', () => {
        const next = Number(bar.dataset.index || 0);
        this.goTo(next, true);
      });
    });

    this.addEventListener('mouseenter', () => this.pause());
    this.addEventListener('mouseleave', () => this.play());
    this.addEventListener('focusin', () => this.pause());
    this.addEventListener('focusout', () => this.play());

    this.goTo(this.index, false);
    if (this.autoplay) this.play();
  }

  disconnectedCallback() {
    this.pause();
  }

  goTo(index, userTriggered) {
    if (!this.slides.length) return;
    this.index = ((index % this.slides.length) + this.slides.length) % this.slides.length;

    this.slides.forEach((slide, i) => {
      const active = i === this.index;
      slide.classList.toggle('is-active', active);
      if (active) slide.removeAttribute('hidden');
      else slide.setAttribute('hidden', '');
    });

    // Sync all progress bar groups (one per slide in markup)
    const groups = this.querySelectorAll('.ugs-hero__progress');
    groups.forEach((group) => {
      group.querySelectorAll('[data-ugs-hero-bar]').forEach((bar, i) => {
        bar.classList.toggle('is-active', i === this.index);
        const fill = bar.querySelector('.ugs-hero__bar-fill');
        if (fill) fill.style.transform = i === this.index ? 'scaleX(0)' : 'scaleX(0)';
      });
    });

    if (userTriggered) {
      this.pause();
      if (this.autoplay) this.play();
    } else {
      this.resetProgressAnimation();
    }
  }

  resetProgressAnimation() {
    const activeBars = this.querySelectorAll('.ugs-hero__bar.is-active .ugs-hero__bar-fill');
    activeBars.forEach((fill) => {
      fill.style.transition = 'none';
      fill.style.transform = 'scaleX(0)';
      // force reflow
      void fill.offsetWidth;
      fill.style.transition = `transform ${this.intervalMs}ms linear`;
      fill.style.transform = 'scaleX(1)';
    });
  }

  play() {
    if (!this.autoplay || this.slides.length < 2) return;
    this.pause();
    this.resetProgressAnimation();
    this.timer = window.setInterval(() => {
      this.goTo(this.index + 1, false);
    }, this.intervalMs);
  }

  pause() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    const activeFills = this.querySelectorAll('.ugs-hero__bar.is-active .ugs-hero__bar-fill');
    activeFills.forEach((fill) => {
      fill.style.transition = 'none';
    });
  }
}

if (!customElements.get('ugs-hero-slider')) {
  customElements.define('ugs-hero-slider', UgsHeroSlider);
}

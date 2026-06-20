/* ============================================================
   OXÍGENO MARKETING — interactions
   ============================================================ */
(function () {
  'use strict';

  /* Sticky nav shadow on scroll */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu toggle */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const closeMenu = () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* Scroll-reveal */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for grouped cards
          setTimeout(() => entry.target.classList.add('in'), (i % 6) * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* Animated stat counters */
  const counters = document.querySelectorAll('.stat__num[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '')));
  }

  /* Services carousel (mobile): swipe + snap + dots + gentle auto-slide */
  const cards = document.querySelector('.cards');
  const dotsWrap = document.getElementById('cardsDots');
  if (cards && dotsWrap) {
    const items = Array.from(cards.querySelectorAll('.card'));
    const mq = window.matchMedia('(max-width: 560px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dots = [];
    let auto = null;
    let resumeT = null;
    let raf = 0;

    const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2;
    const currentIndex = () => {
      const center = cards.scrollLeft + cards.clientWidth / 2;
      let best = 0, bd = Infinity;
      items.forEach((el, i) => {
        const d = Math.abs(centerOf(el) - center);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    };
    const scrollToIndex = (i) => {
      const el = items[i];
      if (el) cards.scrollTo({ left: el.offsetLeft - (cards.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    };
    const setActive = () => {
      const idx = currentIndex();
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      items.forEach((el, i) => el.classList.toggle('is-active', i === idx));
    };
    const stopAuto = () => { if (auto) { clearInterval(auto); auto = null; } };
    const startAuto = () => {
      if (reduce) return;
      stopAuto();
      auto = setInterval(() => scrollToIndex((currentIndex() + 1) % items.length), 4200);
    };
    const pauseAuto = () => { stopAuto(); clearTimeout(resumeT); resumeT = setTimeout(startAuto, 6500); };

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      dots = items.map((_, i) => {
        const b = document.createElement('button');
        b.className = 'cards__dot';
        b.type = 'button';
        b.setAttribute('aria-label', 'Ver servicio ' + (i + 1));
        b.addEventListener('click', () => { scrollToIndex(i); pauseAuto(); });
        dotsWrap.appendChild(b);
        return b;
      });
    };

    const onScrollCards = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(setActive); };

    const enable = () => { buildDots(); setActive(); startAuto(); };
    const disable = () => {
      stopAuto(); clearTimeout(resumeT);
      dotsWrap.innerHTML = ''; dots = [];
      items.forEach((el) => el.classList.remove('is-active'));
    };

    cards.addEventListener('scroll', onScrollCards, { passive: true });
    cards.addEventListener('pointerdown', pauseAuto);
    cards.addEventListener('touchstart', pauseAuto, { passive: true });

    if (mq.matches) enable();
    mq.addEventListener('change', (e) => (e.matches ? enable() : disable()));
  }

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

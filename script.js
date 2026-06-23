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
      el.textContent = prefix + Math.round(eased * target).toLocaleString('es-AR') + suffix;
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
    counters.forEach((el) => (el.textContent = (el.dataset.prefix || '') + Number(el.dataset.count).toLocaleString('es-AR') + (el.dataset.suffix || '')));
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

  /* ============================================================
     AI chat assistant (Oxi)
     - Talks to a small backend that runs Claude + emails the
       transcript to the right inbox (prospects/clients →
       oxigeno@oxigenoweb.com, candidates → seleccion@oxigenoweb.com).
     - If OXI_ENDPOINT is empty/unreachable, falls back to a local
       guided "demo" flow so the widget still works on the static site.
     ============================================================ */
  (function initOxiChat() {
    const OXI_ENDPOINT = ''; // ← set to the deployed backend URL to go live with real Claude

    const launcher = document.getElementById('oxiLauncher');
    const panel    = document.getElementById('oxiPanel');
    const closeBtn = document.getElementById('oxiClose');
    const log      = document.getElementById('oxiLog');
    const form     = document.getElementById('oxiForm');
    const input    = document.getElementById('oxiInput');
    if (!launcher || !panel || !log || !form || !input) return;

    const history = [];   // [{ role: 'user' | 'assistant', text }]
    let greeted = false;
    let busy = false;

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };

    function addMsg(text, who) {
      const el = document.createElement('div');
      el.className = 'oxi-msg oxi-msg--' + who;
      el.textContent = text;
      log.appendChild(el);
      scrollDown();
      return el;
    }

    function showTyping() {
      const t = document.createElement('div');
      t.className = 'oxi-typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      log.appendChild(t);
      scrollDown();
      return t;
    }

    function openPanel() {
      panel.hidden = false;
      launcher.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      if (!greeted) {
        greeted = true;
        const t = showTyping();
        setTimeout(() => {
          t.remove();
          addMsg('¡Hola! 👋 Soy el asistente de Oxígeno Marketing. Puedo contarte sobre nuestros servicios de Trade Marketing, BTL y ejecución comercial — o, si buscás sumarte al equipo, también te ayudo. ¿En qué estás interesado?', 'bot');
        }, 700);
      }
      setTimeout(() => input.focus(), 250);
    }

    function closePanel() {
      panel.hidden = true;
      launcher.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
    }

    launcher.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || busy) return;

      addMsg(text, 'user');
      history.push({ role: 'user', text });
      input.value = '';
      busy = true;

      const typing = showTyping();
      try {
        const reply = await getReply(text);
        typing.remove();
        addMsg(reply, 'bot');
        history.push({ role: 'assistant', text: reply });
      } catch (err) {
        typing.remove();
        addMsg('Disculpá, tuve un problema para responder. Escribinos directamente a oxigeno@oxigenoweb.com y te contactamos a la brevedad.', 'bot');
      } finally {
        busy = false;
        input.focus();
      }
    });

    async function getReply(text) {
      if (OXI_ENDPOINT) {
        const res = await fetch(OXI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        return data.reply;
      }
      // Demo fallback (no backend yet) — short guided replies.
      return new Promise((resolve) => setTimeout(() => resolve(demoReply(text)), 650));
    }

    function demoReply(text) {
      const q = text.toLowerCase();
      const isJob = /(trabaj|empleo|cv|curr|sumar|puesto|vacante|seleccion|rrhh|postul)/.test(q);
      if (isJob) {
        return 'Genial que quieras sumarte a Oxígeno. Contame tu nombre, en qué te gustaría trabajar y dejame un mail o teléfono — un responsable de Selección te va a contactar. (También podés escribir a seleccion@oxigenoweb.com).';
      }
      if (/(precio|costo|cotiz|presupuesto)/.test(q)) {
        return 'Los proyectos se cotizan a medida según el canal, la categoría y el alcance de la campaña. Si me dejás tu marca, tu nombre y un mail, un ejecutivo te prepara una propuesta. (O escribinos a oxigeno@oxigenoweb.com).';
      }
      if (/(servicio|trade|btl|merch|qué hacen|que hacen|campañ)/.test(q)) {
        return 'Brindamos soluciones a Empresas y Marcas con servicios de Marketing, Trade Marketing y ejecución comercial en campo: merchandisers, activaciones, relevamiento de información y dashboards a medida. ¿Sobre cuál querés saber más, o preferís que te contacte un ejecutivo?';
      }
      return 'Perfecto. Para conectarte con la persona indicada, ¿me dejás tu nombre, tu marca/empresa y un mail o teléfono? Un ejecutivo de Oxígeno te va a contactar a la brevedad.';
    }
  })();
})();

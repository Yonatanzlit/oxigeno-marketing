/* Memotest Bagóvit — Oxígeno Marketing, portal de cliente para Bagó.
   Plain JS, no dependencies. To use real product photos, set `img` on a
   product (e.g. img: "img/solar-50.png" inside /bago/memotest/) and it replaces the drawing. */
(function () {
  "use strict";

  /* ---------- Products (8 pairs). PLACEHOLDERS until Oxígeno sends photos + names. ---------- */
  var PRODUCTS = [
    { id: "solar", name: "Protector Solar FPS 50", svg:
      '<svg viewBox="0 0 80 100"><defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e9edf2"/></linearGradient></defs><rect x="31" y="6" width="18" height="14" rx="3" fill="#F07D1A"/><rect x="22" y="18" width="36" height="74" rx="10" fill="url(#g1)" stroke="#d5dce4"/><rect x="22" y="42" width="36" height="26" fill="#F07D1A"/><text x="40" y="61" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="15" fill="#fff">50</text><rect x="28" y="24" width="5" height="60" rx="2.5" fill="#fff" opacity=".7"/></svg>' },
    { id: "spray", name: "Spray Solar", svg:
      '<svg viewBox="0 0 80 100"><defs><linearGradient id="g2" x1="0" x2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset="1" stop-color="#d9650a"/></linearGradient></defs><path d="M34 8h14v8l10 4-2 5-8-3v6H34z" fill="#2b3a48"/><rect x="24" y="28" width="32" height="64" rx="9" fill="url(#g2)"/><rect x="28" y="50" width="24" height="22" rx="4" fill="#fff"/><circle cx="40" cy="61" r="6" fill="#ffb21e"/><rect x="27" y="33" width="4" height="54" rx="2" fill="#fff" opacity=".35"/></svg>' },
    { id: "body", name: "Crema Corporal", svg:
      '<svg viewBox="0 0 80 100"><path d="M22 10h36l-4 64H26z" fill="#fff" stroke="#d5dce4"/><rect x="25" y="74" width="30" height="18" rx="4" fill="#1aa6a6"/><rect x="26" y="28" width="28" height="26" rx="3" fill="#e6f6f6"/><text x="40" y="45" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="9" fill="#128585">BODY</text><path d="M22 10h36" stroke="#cfd7df" stroke-width="3"/></svg>' },
    { id: "lotion", name: "Loción Hidratante", svg:
      '<svg viewBox="0 0 80 100"><path d="M38 6h4v8h12v5H40v10" fill="none" stroke="#2f6fb3" stroke-width="4" stroke-linejoin="round"/><rect x="33" y="26" width="14" height="8" rx="2" fill="#2f6fb3"/><rect x="22" y="34" width="36" height="58" rx="10" fill="#fff" stroke="#d5dce4"/><path d="M22 60h36v14H22z" fill="#2f6fb3"/><path d="M40 44c4 5 5 8 5 10a5 5 0 0 1-10 0c0-2 1-5 5-10z" fill="#9cc4ec"/></svg>' },
    { id: "aloe", name: "Gel After Sun", svg:
      '<svg viewBox="0 0 80 100"><defs><linearGradient id="g5" x1="0" x2="1"><stop offset="0" stop-color="#b9ecc4"/><stop offset="1" stop-color="#6fcf86"/></linearGradient></defs><rect x="32" y="6" width="16" height="12" rx="3" fill="#1f8a4c"/><path d="M26 18h28l4 70a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" fill="url(#g5)"/><path d="M40 36c-8 10-8 22 0 34 8-12 8-24 0-34z" fill="#1f8a4c"/><path d="M40 40v28" stroke="#b9ecc4" stroke-width="1.6"/></svg>' },
    { id: "kids", name: "Protector Kids", svg:
      '<svg viewBox="0 0 80 100"><rect x="30" y="6" width="20" height="13" rx="6" fill="#e5398b"/><rect x="18" y="18" width="44" height="74" rx="20" fill="#ffd23f"/><circle cx="40" cy="55" r="11" fill="#ff8a00"/><g stroke="#ff8a00" stroke-width="3" stroke-linecap="round"><path d="M40 36v-5"/><path d="M40 79v-5"/><path d="M21 55h5"/><path d="M54 55h5"/><path d="M27 42l3 3"/><path d="M50 65l3 3"/><path d="M53 42l-3 3"/><path d="M30 65l-3 3"/></g></svg>' },
    { id: "hands", name: "Crema de Manos", svg:
      '<svg viewBox="0 0 80 100"><path d="M26 8h28l-3 62H29z" fill="#fde3ea" stroke="#f3b8c8"/><rect x="29" y="70" width="22" height="22" rx="5" fill="#d94676"/><path d="M33 30c0-4 5-6 7-1 2-5 7-3 7 1 0 5-7 10-7 10s-7-5-7-10z" fill="#d94676"/><rect x="31" y="46" width="18" height="3" rx="1.5" fill="#f3b8c8"/><rect x="34" y="52" width="12" height="3" rx="1.5" fill="#f3b8c8"/></svg>' },
    { id: "lips", name: "Bálsamo Labial", svg:
      '<svg viewBox="0 0 80 100"><rect x="30" y="8" width="20" height="34" rx="6" fill="#7a4cc2"/><rect x="28" y="40" width="24" height="6" fill="#5b3596"/><rect x="28" y="46" width="24" height="46" rx="4" fill="#fff" stroke="#d5dce4"/><rect x="28" y="58" width="24" height="18" fill="#efe7fb"/><path d="M33 67c3-3 5-3 7-1 2-2 4-2 7 1-3 3-11 3-14 0z" fill="#7a4cc2"/><rect x="33" y="12" width="4" height="26" rx="2" fill="#fff" opacity=".35"/></svg>' }
  ];
  var PAIRS = PRODUCTS.length;

  /* ---------- Small helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function fmt(s) { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function bump(id) { var el = $(id); el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

  /* ---------- Statistics: counts only, no personal data (see ../stats.php) ---------- */
  function track(e, extra) {
    try {
      var body = "e=" + e + (extra ? "&t=" + Math.round(extra.t) + "&a=" + extra.a : "");
      var url = "../stats.php";
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/x-www-form-urlencoded" }));
      else fetch(url, { method: "POST", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, keepalive: true });
    } catch (err) {}
  }
  try { if (!sessionStorage.getItem("bago-memo-v")) { sessionStorage.setItem("bago-memo-v", "1"); track("visit"); } } catch (err) { track("visit"); }

  /* ---------- Sound: synthesized in the browser, no files ---------- */
  var muted = store("bago-memo-muted") === "1", ac = null;
  function audio() {
    if (muted) return null;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
    } catch (e) { return null; }
    return ac;
  }
  function tone(f, dur, type, vol, delay, slideTo) {
    var c = audio(); if (!c) return;
    var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  var sfx = {
    deal: function () { tone(900 + Math.random() * 500, 0.05, "sine", 0.035); },
    flip: function () { tone(520, 0.07, "triangle", 0.07, 0, 820); },
    tick: function () { tone(440, 0.12, "sine", 0.08); },
    go: function () { tone(660, 0.1, "triangle", 0.09); tone(990, 0.22, "triangle", 0.09, 0.08); },
    match: function (combo) {
      var k = Math.pow(2, Math.min(combo - 1, 6) * 2 / 12), n = [523.25, 659.25, 783.99, 1046.5];
      n.forEach(function (f, i) { tone(f * k, 0.22, "triangle", 0.075, i * 0.055); });
      tone(2093 * k, 0.35, "sine", 0.03, 0.22);
    },
    miss: function () { tone(300, 0.16, "sine", 0.06, 0, 190); },
    win: function () {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach(function (f, i) { tone(f, 0.32, "triangle", 0.08, i * 0.09); });
      [2093, 2637, 3136].forEach(function (f, i) { tone(f, 0.4, "sine", 0.025, 0.6 + i * 0.07); });
    },
    star: function (i) { tone(880 * Math.pow(1.26, i), 0.25, "triangle", 0.08); }
  };
  function paintMute() {
    $("ic-sound").hidden = muted; $("ic-mute").hidden = !muted;
    $("mute").setAttribute("aria-pressed", muted ? "true" : "false");
    $("mute").setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar sonido");
  }
  $("mute").addEventListener("click", function () { muted = !muted; store("bago-memo-muted", muted ? "1" : "0"); paintMute(); if (!muted) sfx.flip(); });
  paintMute();

  /* ---------- Game state ---------- */
  var board = $("board"), cards = [], open = [], matched = 0, tries = 0, combo = 0;
  var lock = true, t0 = 0, timer = 0, elapsed = 0, timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; clearInterval(timer); }

  function faceHTML(p) {
    return p.img ? '<img src="' + p.img + '" alt="" loading="eager">' : p.svg;
  }
  function build() {
    board.innerHTML = "";
    var deck = shuffle(PRODUCTS.concat(PRODUCTS).map(function (p, i) { return { p: p, k: i }; }));
    cards = deck.map(function (d, i) {
      var b = document.createElement("button");
      b.className = "mc"; b.type = "button";
      b.setAttribute("aria-label", "Carta " + (i + 1) + ", boca abajo");
      b.innerHTML = '<span class="mc__in"><span class="mc__f mc__back"><span class="mc__mark">Bagóvit<small>BAGÓ</small></span></span>' +
        '<span class="mc__f mc__front">' + faceHTML(d.p) + '<span class="mc__name">' + d.p.name + "</span></span></span>";
      b.addEventListener("click", function () { pick(b); });
      b._p = d.p; b._i = i;
      board.appendChild(b);
      return b;
    });
  }
  function hud() {
    $("v-time").textContent = fmt(elapsed);
    $("v-tries").textContent = tries;
    $("v-pairs").textContent = matched + "/" + PAIRS;
    $("bar").style.width = (100 * matched / PAIRS) + "%";
  }
  function reset() {
    clearAll(); open = []; matched = 0; tries = 0; combo = 0; elapsed = 0; lock = true;
    build(); hud();
  }

  function start() {
    reset();
    track("start");
    $("intro").hidden = true; $("win").hidden = true; $("count").hidden = true;
    board.classList.remove("idle");
    board.classList.add("locked");
    // deal the cards in, one by one
    cards.forEach(function (c, i) {
      if (reduced) return;
      c.style.animationDelay = (i * 45) + "ms";
      c.classList.add("deal");
      later(sfx.deal, i * 45 + 80);
    });
    later(countdown, reduced ? 0 : cards.length * 45 + 420);
  }
  function countdown() {
    var el = $("count"), seq = ["3", "2", "1", "¡Ya!"], i = 0;
    el.hidden = false;
    (function step() {
      var go = i === seq.length - 1;
      el.innerHTML = '<b class="' + (go ? "go" : "") + '">' + seq[i] + "</b>";
      go ? sfx.go() : sfx.tick();
      i++;
      if (i < seq.length) later(step, reduced ? 350 : 650);
      else later(function () {
        el.hidden = true; el.innerHTML = "";
        cards.forEach(function (c) { c.classList.remove("deal"); c.style.animationDelay = ""; });
        board.classList.remove("locked"); lock = false;
        t0 = performance.now();
        timer = setInterval(function () { elapsed = (performance.now() - t0) / 1000; $("v-time").textContent = fmt(elapsed); }, 250);
      }, reduced ? 250 : 600);
    })();
  }

  function pick(c) {
    if (lock || c.classList.contains("up") || c.classList.contains("done")) return;
    c.classList.add("up"); sfx.flip(); buzz(8);
    c.setAttribute("aria-label", c._p.name);
    open.push(c);
    if (open.length < 2) return;
    lock = true; tries++; hud(); bump("st-tries");
    var a = open[0], b = open[1];
    if (a._p.id === b._p.id) later(function () { hit(a, b); }, 380);
    else later(function () { miss(a, b); }, 650);
  }
  function hit(a, b) {
    open = []; matched++; combo++;
    [a, b].forEach(function (c) {
      c.classList.remove("up"); c.classList.add("done", "pop");
      c.setAttribute("aria-label", c._p.name + ", encontrada");
      later(function () { c.classList.remove("pop"); }, 650);
      burst(c);
    });
    sfx.match(combo); buzz([12, 40, 18]);
    floatLabel(b, a._p.name);
    hud(); bump("st-pairs");
    if (combo >= 2) toast("¡Combo x" + combo + "!");
    if (matched === PAIRS) { clearInterval(timer); elapsed = (performance.now() - t0) / 1000; hud(); later(win, 700); return; }
    lock = false;
  }
  function miss(a, b) {
    combo = 0;
    [a, b].forEach(function (c) { c.classList.add("shake"); });
    sfx.miss(); buzz(30);
    later(function () {
      [a, b].forEach(function (c) { c.classList.remove("shake", "up"); c.setAttribute("aria-label", "Carta " + (c._i + 1) + ", boca abajo"); });
      open = []; lock = false;
    }, 520);
  }

  /* ---------- Juice: sparks, floating name, combo toast, confetti ---------- */
  var COLORS = ["#F07D1A", "#ffb21e", "#ff9a3c", "#1E73BE", "#ffffff"];
  function burst(c) {
    if (reduced) return;
    var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span"); s.className = "spark";
      s.style.left = cx + "px"; s.style.top = cy + "px";
      s.style.background = COLORS[i % COLORS.length];
      if (COLORS[i % COLORS.length] === "#ffffff") s.style.boxShadow = "0 0 0 1px rgba(240,125,26,.5)";
      document.body.appendChild(s);
      var ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.4, dist = r.width * (0.55 + Math.random() * 0.5);
      var anim = s.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: "translate(" + Math.cos(ang) * dist + "px," + Math.sin(ang) * dist + "px) scale(.2)", opacity: 0 }
      ], { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2,.8,.3,1)" });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }
  function floatLabel(c, text) {
    var r = c.getBoundingClientRect(), f = document.createElement("span");
    f.className = "float"; f.textContent = text;
    f.style.left = Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90) + "px";
    f.style.top = r.top + "px";
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1500);
  }
  function toast(text) {
    var t = $("toast"); t.textContent = text;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  }
  function confetti() {
    if (reduced) return;
    var cv = $("confetti"), cx = cv.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.scale(dpr, dpr);
    var P = [], n = innerWidth < 600 ? 110 : 170;
    for (var i = 0; i < n; i++) P.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 15 - 5,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
      c: COLORS[i % 4]
    });
    var tStart = performance.now();
    (function frame(now) {
      var age = now - tStart;
      cx.clearRect(0, 0, innerWidth, innerHeight);
      P.forEach(function (p) {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
        cx.globalAlpha = Math.max(0, 1 - age / 3200);
        cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        cx.restore();
      });
      if (age < 3200) requestAnimationFrame(frame); else { cx.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
    })(tStart);
  }

  /* ---------- End of game: stars, results, personal best ---------- */
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
  function starsFor(t) { return t <= 12 ? 3 : t <= 18 ? 2 : 1; }
  function readBest() { try { return JSON.parse(store("bago-memo-best") || "null"); } catch (e) { return null; } }
  function bestText(b) { return b ? "Tu mejor marca: " + b.tries + " intentos · " + fmt(b.time) : ""; }
  function paintBest() {
    var b = readBest(), el = $("best-intro");
    el.hidden = !b; el.textContent = bestText(b);
  }
  function countUp(el, to, isTime, ms) {
    var s = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - s) / ms), v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = isTime ? fmt(v) : Math.round(v);
      if (k < 1) requestAnimationFrame(f);
    })(s);
  }
  function win() {
    track("finish", { t: elapsed, a: tries });
    var n = starsFor(tries), best = readBest();
    var isRecord = !best || tries < best.tries || (tries === best.tries && elapsed < best.time);
    if (isRecord) store("bago-memo-best", JSON.stringify({ tries: tries, time: Math.round(elapsed) }));
    $("win-title").textContent = n === 3 ? "¡Memoria perfecta!" : n === 2 ? "¡Muy bien!" : "¡Lo lograste!";
    var st = $("stars"); st.innerHTML = STAR + STAR + STAR;
    st.setAttribute("aria-label", n + " de 3 estrellas");
    $("record").hidden = !(isRecord && best);
    var bw = $("best-win"); bw.hidden = isRecord || !best; bw.textContent = bestText(best);
    $("win").hidden = false;
    countUp($("r-time"), elapsed, true, 900);
    countUp($("r-tries"), tries, false, 900);
    sfx.win(); buzz([20, 60, 20, 60, 40]); confetti();
    for (var i = 0; i < n; i++) later((function (k) { return function () { st.children[k].classList.add("on"); sfx.star(k); }; })(i), 450 + i * 280);
    later(function () { $("again").focus(); }, 300);
  }

  /* ---------- Wiring ---------- */
  $("play").addEventListener("click", function () { audio(); start(); });
  $("again").addEventListener("click", start);
  $("restart").addEventListener("click", function () { audio(); start(); });

  reset(); paintBest();
})();

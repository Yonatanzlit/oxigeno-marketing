/* Memotest Bagóvit — Oxígeno Marketing, portal de cliente para Bagó.
   Plain JS, no dependencies. Product photos live in /bago/memotest/img/. */
(function () {
  "use strict";

  /* ---------- Products (8 pairs) ---------- */
  var PRODUCTS = [
    { id: "emulsion50", name: "Emulsión FPS 50", img: "img/emulsion-50.jpg" },
    { id: "spray50", name: "Spray FPS 50", img: "img/spray-50.jpg" },
    { id: "spray30", name: "Spray Bronceador FPS 30", img: "img/spray-30.jpg" },
    { id: "bebes75", name: "Bebés FPS 75", img: "img/bebes-75.jpg" },
    { id: "labial", name: "Protector Labial", img: "img/labial.jpg" },
    { id: "facial45", name: "Facial con Color FPS 45", img: "img/facial-45.jpg" },
    { id: "familiar50", name: "Familiar FPS 50", img: "img/familiar-50.jpg" },
    { id: "aloe", name: "Aloe Vera Post Solar", img: "img/aloe-vera.jpg" }
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
      var beacon = function () { try { if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/x-www-form-urlencoded" })); } catch (e) {} };
      if (window.fetch) fetch(url, { method: "POST", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, keepalive: true, cache: "no-store" }).catch(beacon);
      else beacon();
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
  $("mute").addEventListener("click", function () {
    muted = !muted; store("bago-memo-muted", muted ? "1" : "0"); paintMute();
    if (muted) { if (music) music.stop(0.1); } else { sfx.flip(); if (matched < PAIRS) musicOn(); }
  });
  /* ---------- Music: in-browser loop, synced to the HUD ---------- */
  var music = window.BagoMusic ? window.BagoMusic(audio) : null;
  function pulse(id) { var el = $(id); if (!el) return; el.classList.remove("beat"); void el.offsetWidth; el.classList.add("beat"); }
  function band() { return Math.min(3, 1 + Math.floor(matched / 3) + (combo >= 2 ? 1 : 0)); }
  function musicOn() { if (music && !muted && t0) music.start({ style: "calm", bpm: 96, layer: band() }); }
  function musicSync() { if (music) music.setLayer(band()); }
  if (music) music.onBeat(function (n) { if (!reduced && n % 2 === 0) pulse("st-time"); });
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
      b.innerHTML = '<span class="mc__in"><span class="mc__f mc__back"></span>' +
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
    clearAll(); open = []; matched = 0; tries = 0; combo = 0; elapsed = 0; lock = true; t0 = 0;
    if (music) music.stop(0.15);
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
        t0 = performance.now(); musicOn();
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
    sfx.match(combo); buzz([12, 40, 18]); musicSync();
    floatLabel(b, a._p.name);
    hud(); bump("st-pairs");
    if (combo >= 2) toast("¡Combo x" + combo + "!");
    if (matched === PAIRS) { if (music) music.stop(0.6); clearInterval(timer); elapsed = (performance.now() - t0) / 1000; hud(); later(win, 700); return; }
    lock = false;
  }
  function miss(a, b) {
    combo = 0;
    [a, b].forEach(function (c) { c.classList.add("shake"); });
    sfx.miss(); buzz(30); if (music) { music.duck(); musicSync(); }
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

  PRODUCTS.forEach(function (p) { new Image().src = p.img; });
  reset(); paintBest();
})();

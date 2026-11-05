/* Góndola Rush Bagóvit — Oxígeno Marketing, portal de cliente para Bagó.
   Tap every Bagóvit product on the shelf before the time runs out.
   Plain JS, no dependencies. Bagóvit products are the same PLACEHOLDERS as the Memotest
   (../memotest/memotest.js); when real photos arrive, set `img` on each product in both files. */
(function () {
  "use strict";

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
  /* ---------- Other products on the shelf: plain packs, no real brands ---------- */
  var SHAPES = {
    bottle: function (c) { return '<rect x="32" y="6" width="16" height="12" rx="3" fill="#2b3a48"/><rect x="22" y="18" width="36" height="74" rx="10" fill="' + c + '"/><rect x="26" y="38" width="28" height="22" rx="4" fill="#fff" opacity=".8"/><rect x="27" y="24" width="4" height="62" rx="2" fill="#fff" opacity=".35"/>'; },
    tube: function (c) { return '<rect x="32" y="80" width="16" height="12" rx="2" fill="#2b3a48"/><path d="M20 8h40l-6 72H26z" fill="' + c + '"/><path d="M21 9h38" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><rect x="28" y="24" width="24" height="22" rx="3" fill="#fff" opacity=".8"/>'; },
    jar: function (c) { return '<rect x="18" y="38" width="44" height="10" rx="3" fill="#2b3a48"/><rect x="16" y="48" width="48" height="44" rx="10" fill="' + c + '"/><rect x="22" y="52" width="5" height="34" rx="2.5" fill="#fff" opacity=".35"/>'; },
    box: function (c) { return '<rect x="18" y="14" width="40" height="78" rx="4" fill="' + c + '"/><path d="M18 14l6-6h40l-6 6z" fill="#fff" opacity=".5"/><path d="M58 14l6-6v78l-6 6z" fill="#000" opacity=".14"/><rect x="23" y="26" width="30" height="24" rx="3" fill="#fff" opacity=".8"/>'; },
    pump: function (c) { return '<path d="M38 6h4v8h12v5H40v10" fill="none" stroke="#2b3a48" stroke-width="4" stroke-linejoin="round"/><rect x="33" y="26" width="14" height="8" rx="2" fill="#2b3a48"/><rect x="22" y="34" width="36" height="58" rx="10" fill="' + c + '"/><rect x="26" y="42" width="28" height="18" rx="4" fill="#fff" opacity=".8"/>'; }
  };
  var SHAPE_KEYS = Object.keys(SHAPES);
  var PLAIN = ["#6f93b8", "#79b297", "#a58ccc", "#c4a07c", "#8b9caa", "#5fa8b8", "#d98fa8"];
  var LOOKALIKE = ["#f08a2a", "#e9963b", "#ff9a3c", "#e07a24"];
  var WORDS = ["Solar", "Hidra", "Derma", "Sun", "Care", "Piel", "Vita"];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function otherSVG(c) { return '<svg viewBox="0 0 80 100" aria-hidden="true">' + SHAPES[pick(SHAPE_KEYS)](c) + "</svg>"; }

  /* ---------- Small helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function bump(id) { var el = $(id); el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  var nf = new Intl.NumberFormat("es-AR");

  /* ---------- Statistics: counts only, no personal data (see ../stats.php) ---------- */
  function track(e, extra) {
    try {
      var body = "g=gondola&e=" + e + (extra ? "&t=" + Math.round(extra.t) + "&a=" + extra.a : "");
      var url = "../stats.php";
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/x-www-form-urlencoded" }));
      else fetch(url, { method: "POST", body: body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, keepalive: true });
    } catch (err) {}
  }
  try { if (!sessionStorage.getItem("bago-gondola-v")) { sessionStorage.setItem("bago-gondola-v", "1"); track("visit"); } } catch (err) { track("visit"); }

  /* ---------- Sound: synthesized in the browser, no files ---------- */
  var muted = store("bago-gondola-muted") === "1", ac = null;
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
    tick: function () { tone(440, 0.12, "sine", 0.08); },
    warn: function () { tone(880, 0.08, "square", 0.03); },
    go: function () { tone(660, 0.1, "triangle", 0.09); tone(990, 0.22, "triangle", 0.09, 0.08); },
    hit: function (combo) {
      var k = Math.pow(2, Math.min(combo - 1, 8) / 12);
      tone(660 * k, 0.09, "triangle", 0.08); tone(990 * k, 0.16, "triangle", 0.07, 0.05); tone(1980 * k, 0.2, "sine", 0.025, 0.09);
    },
    miss: function () { tone(220, 0.22, "sawtooth", 0.035, 0, 140); tone(300, 0.16, "sine", 0.06, 0, 190); },
    level: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 0.2, "triangle", 0.08, i * 0.07); }); tone(2093, 0.4, "sine", 0.03, 0.3); },
    end: function () { [784, 659, 523].forEach(function (f, i) { tone(f, 0.22, "triangle", 0.08, i * 0.12); }); },
    win: function () {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach(function (f, i) { tone(f, 0.32, "triangle", 0.08, i * 0.09); });
    },
    star: function (i) { tone(880 * Math.pow(1.26, i), 0.25, "triangle", 0.08); }
  };
  function paintMute() {
    $("ic-sound").hidden = muted; $("ic-mute").hidden = !muted;
    $("mute").setAttribute("aria-pressed", muted ? "true" : "false");
    $("mute").setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar sonido");
  }
  $("mute").addEventListener("click", function () { muted = !muted; store("bago-gondola-muted", muted ? "1" : "0"); paintMute(); if (!muted) sfx.tick(); });
  paintMute();

  /* ---------- Levels: more products, moving shelves, look-alike packs ---------- */
  var START_TIME = 30, LEVEL_BONUS = 6, MISS_COST = 2;
  function cfg(L) {
    if (reduced) return { per: 5, b: Math.min(4 + L, 8), dur: 0, look: Math.min(Math.max(0, L - 2) * 2, 6) };
    if (L === 1) return { per: 5, b: 5, dur: 0, look: 0 };
    return { per: Math.min(4 + L, 8), b: Math.min(4 + L, 9), dur: Math.max(6, 17 - (L - 2) * 3), look: Math.min((L - 2) * 2, 7) };
  }

  /* ---------- Game state ---------- */
  var unit = $("unit"), stage = $("stage"), tracks = unit.querySelectorAll(".track");
  var level = 1, need = 0, found = 0, total = 0, score = 0, combo = 0, time = START_TIME;
  var playing = false, paused = false, raf = 0, last = 0, lastSec = 0, timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearAll() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); }

  function layout() { var r = unit.querySelector(".row"); if (r.clientWidth) unit.style.setProperty("--iw", (r.clientWidth / 5) + "px"); }
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(layout, 120); });

  function stock(L, animate) {
    var c = cfg(L), n = 3 * c.per, order = shuffle(Array.apply(null, { length: n }).map(function (_, i) { return i; }));
    var kind = {}, i;
    for (i = 0; i < n; i++) kind[order[i]] = i < c.b ? "b" : i < c.b + c.look ? "l" : "o";
    var bag = shuffle(PRODUCTS.slice()), bi = 0, slots = [];
    for (i = 0; i < n; i++) {
      var k = kind[i], s = { k: i, kind: k };
      if (k === "b") { s.p = bag[bi++ % bag.length]; s.html = s.p.img ? '<img src="' + s.p.img + '" alt="">' : s.p.svg; s.tag = "Bagóvit"; s.label = "Bagóvit " + s.p.name; }
      else { s.html = otherSVG(k === "l" ? pick(LOOKALIKE) : pick(PLAIN)); s.tag = pick(WORDS); s.color = k === "l" ? pick(LOOKALIKE) : "#8b9caa"; s.label = "Otro producto"; }
      slots.push(s);
    }
    need = c.b; found = 0;
    tracks.forEach(function (tr, r) {
      tr.innerHTML = ""; tr.classList.remove("move");
      var copies = c.dur ? 2 : 1;
      for (var cp = 0; cp < copies; cp++) for (var j = 0; j < c.per; j++) {
        var s = slots[r * c.per + j], b = document.createElement("button");
        b.type = "button"; b.className = "it" + (animate ? " drop" : "");
        b.setAttribute("data-k", s.k); b.setAttribute("data-b", s.kind === "b" ? "1" : "0");
        b.setAttribute("aria-label", s.label);
        if (cp) { b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); }
        b.innerHTML = '<span class="it__p">' + s.html + '</span><span class="it__tag' + (s.kind === "b" ? " bvt" : "") + '"' +
          (s.kind === "b" ? "" : ' style="background:' + s.color + '"') + ">" + s.tag + "</span>";
        if (animate) b.querySelector(".it__p").style.animationDelay = Math.round(Math.random() * 280) + "ms";
        tr.appendChild(b);
      }
      if (c.dur) { tr.style.setProperty("--dur", (c.dur + r * 1.5) + "s"); void tr.offsetWidth; tr.classList.add("move"); }
    });
    if (animate) later(function () { unit.querySelectorAll(".it.drop").forEach(function (b) { b.classList.remove("drop"); }); }, 900);
    $("sign").textContent = "Nivel " + L;
    hud();
  }
  function hud() {
    $("v-score").textContent = nf.format(score);
    $("v-left").textContent = need - found;
    paintTime();
  }
  function paintTime() {
    var s = Math.ceil(time);
    $("v-time").textContent = s;
    $("bar").style.width = (100 * Math.min(1, time / START_TIME)) + "%";
    var warn = playing && time <= 5;
    $("st-time").classList.toggle("warn", warn); $("prog").classList.toggle("warn", warn);
    if (warn && s !== lastSec && s > 0) sfx.warn();
    lastSec = s;
  }
  function setLocked(on) { unit.classList.toggle("locked", on); }

  function reset() {
    clearAll(); playing = false; paused = false;
    level = 1; total = 0; score = 0; combo = 0; time = START_TIME;
    layout(); stock(1, false);
  }

  function start() {
    reset();
    track("start");
    $("intro").hidden = true; $("win").hidden = true;
    stage.classList.remove("idle"); setLocked(true);
    stock(1, !reduced);
    var el = $("count"), seq = ["3", "2", "1", "¡Ya!"], i = 0;
    el.hidden = false;
    (function step() {
      var go = i === seq.length - 1;
      el.innerHTML = '<b class="' + (go ? "go" : "") + '">' + seq[i] + "</b>";
      if (go) sfx.go(); else sfx.tick();
      i++;
      if (i < seq.length) later(step, reduced ? 350 : 650);
      else later(function () {
        el.hidden = true; el.innerHTML = "";
        playing = true; setLocked(false);
        last = performance.now(); raf = requestAnimationFrame(loop);
      }, reduced ? 250 : 550);
    })();
  }
  function loop(now) {
    if (!playing) return;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!paused) time -= dt;
    if (time <= 0) { time = 0; paintTime(); end(); return; }
    paintTime();
    raf = requestAnimationFrame(loop);
  }

  unit.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".it");
    if (!b || !playing || paused || b.classList.contains("got") || b.classList.contains("bad")) return;
    if (b.getAttribute("data-b") === "1") hit(b); else miss(b);
  });
  function hit(b) {
    found++; total++; combo++;
    var pts = 100 + 25 * Math.min(combo - 1, 8);
    score += pts;
    unit.querySelectorAll('.it[data-k="' + b.getAttribute("data-k") + '"]').forEach(function (x) { x.classList.add("got"); });
    burst(b); floatAt(b, "+" + pts, ""); sfx.hit(combo); buzz(10);
    hud(); bump("st-score"); bump("st-left");
    if (combo === 3 || combo === 6 || combo === 10 || combo === 15) toast("¡Combo x" + combo + "!", "");
    if (found === need) levelUp();
  }
  function miss(b) {
    combo = 0; time = Math.max(0, time - MISS_COST);
    b.classList.add("bad"); later(function () { b.classList.remove("bad"); }, 450);
    var f = $("flash"); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
    floatAt(b, "−" + MISS_COST + " s", "bad"); sfx.miss(); buzz(40);
    paintTime(); bump("st-time");
  }
  function levelUp() {
    paused = true; setLocked(true);
    level++; time += LEVEL_BONUS;
    sfx.level(); buzz([15, 40, 15]);
    floatAt($("st-time"), "+" + LEVEL_BONUS + " s", "plus");
    later(function () { toast("¡Nivel " + level + "!", "blue"); }, 250);
    later(function () { stock(level, !reduced); paintTime(); }, 900);
    later(function () { if (!playing) return; paused = false; setLocked(false); last = performance.now(); }, 1400);
  }
  function end() {
    playing = false; setLocked(true); clearAll();
    tracks.forEach(function (tr) { tr.style.animationPlayState = "paused"; });
    sfx.end(); buzz([30, 50, 30]);
    toast("¡Tiempo!", "blue");
    later(results, 1100);
  }

  /* ---------- Juice: sparks, floating points, toast, confetti ---------- */
  var COLORS = ["#F07D1A", "#ffb21e", "#ff9a3c", "#1E73BE", "#ffffff"];
  function burst(c) {
    if (reduced || !c.animate) return;
    var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 12; i++) {
      var s = document.createElement("span"); s.className = "spark";
      s.style.left = cx + "px"; s.style.top = cy + "px";
      s.style.background = COLORS[i % COLORS.length];
      if (COLORS[i % COLORS.length] === "#ffffff") s.style.boxShadow = "0 0 0 1px rgba(240,125,26,.5)";
      document.body.appendChild(s);
      var ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.4, dist = r.width * (0.6 + Math.random() * 0.6);
      var anim = s.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: "translate(" + Math.cos(ang) * dist + "px," + Math.sin(ang) * dist + "px) scale(.2)", opacity: 0 }
      ], { duration: 550 + Math.random() * 250, easing: "cubic-bezier(.2,.8,.3,1)" });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }
  function floatAt(el, text, cls) {
    var r = el.getBoundingClientRect(), f = document.createElement("span");
    f.className = "float" + (cls ? " " + cls : ""); f.textContent = text;
    f.style.left = Math.min(Math.max(r.left + r.width / 2, 40), innerWidth - 40) + "px";
    f.style.top = (r.top + r.height * 0.3) + "px";
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 1200);
  }
  function toast(text, cls) {
    var t = $("toast"); t.textContent = text; t.className = "toast" + (cls ? " " + cls : "");
    void t.offsetWidth; t.classList.add("show");
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

  /* ---------- Results: stars, score, personal best ---------- */
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
  function starsFor(s) { return s >= 3000 ? 3 : s >= 1500 ? 2 : 1; }
  function readBest() { try { return JSON.parse(store("bago-gondola-best") || "null"); } catch (e) { return null; } }
  function bestText(b) { return b ? "Tu mejor marca: " + nf.format(b.score) + " puntos · nivel " + b.level : ""; }
  function paintBest() { var b = readBest(), el = $("best-intro"); el.hidden = !b; el.textContent = bestText(b); }
  function countUp(el, to, ms) {
    var s = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - s) / ms);
      el.textContent = nf.format(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(f);
    })(s);
  }
  function results() {
    track("finish", { t: score, a: level });
    var n = starsFor(score), best = readBest(), isRecord = !best || score > best.score;
    if (isRecord) store("bago-gondola-best", JSON.stringify({ score: score, level: level }));
    $("win-title").textContent = n === 3 ? "¡Ojo de experto!" : n === 2 ? "¡Muy bien!" : "¡Buen intento!";
    var st = $("stars"); st.innerHTML = STAR + STAR + STAR; st.setAttribute("aria-label", n + " de 3 estrellas");
    $("record").hidden = !(isRecord && best);
    var bw = $("best-win"); bw.hidden = isRecord || !best; bw.textContent = bestText(best);
    $("r-level").textContent = level; $("r-found").textContent = total;
    $("win").hidden = false;
    countUp($("r-score"), score, 900);
    sfx.win(); confetti();
    for (var i = 0; i < n; i++) later((function (k) { return function () { st.children[k].classList.add("on"); sfx.star(k); }; })(i), 450 + i * 280);
    later(function () { $("again").focus(); }, 300);
    paintBest();
  }

  /* ---------- Wiring ---------- */
  $("play").addEventListener("click", function () { audio(); start(); });
  $("again").addEventListener("click", start);
  $("restart").addEventListener("click", function () { audio(); start(); });

  reset(); paintBest();
})();

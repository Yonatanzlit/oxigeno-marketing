/* Bagó client portal: tabs, game link tools (copy, QR) and game statistics. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var GAMES = {
    memotest: { url: "https://oxigenoweb.com/bago/memotest/", name: "el Memotest", file: "memotest-bagovit-qr" },
    gondola: { url: "https://oxigenoweb.com/bago/gondola/", name: "Góndola Rush", file: "gondola-rush-bagovit-qr" }
  };

  /* ---------- Tabs (#juegos opens the games panel) ---------- */
  var tabs = [$("tab-informe"), $("tab-juegos")];
  var statsLoaded = false;
  function showTab(which, focus) {
    tabs.forEach(function (t) {
      var on = t.id === "tab-" + which;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    });
    if (history.replaceState) history.replaceState(null, "", which === "juegos" ? "#juegos" : location.pathname + location.search);
    if (which === "juegos" && !statsLoaded) { statsLoaded = true; loadStats(); }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { showTab(t.id.slice(4)); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); showTab(tabs[(i + 1) % 2].id.slice(4), true); }
    });
  });

  /* ---------- Per-game tools: copy link, QR ---------- */
  function cardOf(el) { return el.closest("[data-game]"); }
  function gameOf(el) { return GAMES[cardOf(el).getAttribute("data-game")]; }
  document.querySelectorAll(".js-copy").forEach(function (btn) {
    var timer;
    btn.addEventListener("click", function () {
      var g = gameOf(btn), input = cardOf(btn).querySelector(".js-link"), label = btn.querySelector("span");
      function done() {
        btn.classList.add("ok"); label.textContent = "¡Copiado!";
        clearTimeout(timer);
        timer = setTimeout(function () { btn.classList.remove("ok"); label.textContent = "Copiar link"; }, 1800);
      }
      function fallback() { input.focus(); input.select(); try { document.execCommand("copy"); done(); } catch (e) {} }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(g.url).then(done, fallback);
      else fallback();
    });
  });

  function makeQR(url) {
    if (typeof qrcode !== "function") return null;
    var q = qrcode(0, "M"); q.addData(url); q.make(); return q;
  }
  function qrSVG(q, size, margin) {
    var n = q.getModuleCount(), m = margin == null ? 4 : margin, total = n + m * 2, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '"' + (size ? ' width="' + size + '" height="' + size + '"' : "") +
      ' shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#0e3a63"/></svg>';
  }
  function save(blob, name) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function downloadPNG(g) {
    var q = makeQR(g.url); if (!q) return;
    var n = q.getModuleCount(), m = 4, px = Math.floor(1200 / (n + m * 2)), size = px * (n + m * 2);
    var cv = document.createElement("canvas"); cv.width = cv.height = size;
    var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, size, size); cx.fillStyle = "#0e3a63";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) cx.fillRect((c + m) * px, (r + m) * px, px, px);
    cv.toBlob(function (b) { save(b, g.file + ".png"); }, "image/png");
  }
  function downloadSVG(g) {
    var q = makeQR(g.url); if (!q) return;
    save(new Blob([qrSVG(q, 1000)], { type: "image/svg+xml" }), g.file + ".svg");
  }
  var dlg = $("qr-dlg"), qrGame = GAMES.memotest;
  document.querySelectorAll(".js-qr").forEach(function (btn) {
    btn.addEventListener("click", function () {
      qrGame = gameOf(btn);
      var q = makeQR(qrGame.url);
      $("qr-text").textContent = "Escaneá con la cámara del celular para abrir " + qrGame.name + ".";
      $("qr-box").innerHTML = q ? qrSVG(q, 0, 1) : "<p>No se pudo generar el código. Recargá la página.</p>";
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
  });
  document.querySelectorAll(".js-dl").forEach(function (btn) { btn.addEventListener("click", function () { downloadPNG(gameOf(btn)); }); });
  $("qr-close").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  $("qr-png").addEventListener("click", function () { downloadPNG(qrGame); });
  $("qr-svg").addEventListener("click", function () { downloadSVG(qrGame); });

  /* ---------- Statistics ---------- */
  var nf = new Intl.NumberFormat("es-AR");
  function fmt(s) { s = Math.round(s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function dayLabel(iso) { var p = iso.split("-"); return +p[2] + "/" + +p[1]; }
  var statGame = "memotest", req = 0;
  document.querySelectorAll(".gswitch button").forEach(function (b) {
    b.addEventListener("click", function () {
      statGame = b.getAttribute("data-g");
      document.querySelectorAll(".gswitch button").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      loadStats();
    });
  });
  function loadStats() {
    var my = ++req, g = statGame;
    ["s-visits", "s-starts", "s-finishes", "s-time"].forEach(function (id) { $(id).textContent = "–"; });
    $("s-updated").textContent = "Cargando…";
    fetch("stats.php?g=" + g, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (s) { if (my === req) paint(s, g); })
      .catch(function () { $("s-updated").textContent = "No se pudieron cargar las estadísticas. Probá de nuevo más tarde."; });
  }
  function paint(s, g) {
    var memo = g === "memotest";
    $("s-tlabel").textContent = memo ? "Tiempo promedio" : "Puntaje promedio";
    $("s-rate").textContent = "Partidas completas";
    $("s-tries").textContent = "Por partida terminada";
    $("s-visits").textContent = nf.format(s.visits);
    $("s-starts").textContent = nf.format(s.starts);
    $("s-finishes").textContent = nf.format(s.finishes);
    $("s-time").textContent = s.avg_time == null ? "–" : memo ? fmt(s.avg_time) : nf.format(s.avg_time);
    if (s.starts) $("s-rate").textContent = Math.round(100 * s.finishes / s.starts) + "% de las partidas";
    if (s.avg_tries != null) $("s-tries").textContent = (memo ? "Promedio " : "Nivel promedio ") + String(s.avg_tries).replace(".", ",") + (memo ? " intentos" : "");
    $("s-updated").textContent = "Total desde el lanzamiento · actualizado " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    $("s-empty").hidden = s.starts > 0;
    chart(s.days);
  }
  var lastDays = null, rz;
  window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (lastDays && !$("panel-juegos").hidden) chart(lastDays); }, 150); });
  function chart(days) {
    var box = $("chart"), W = Math.max(280, box.clientWidth || 600), H = 180, L = 28, B = 22, T = 8, n = days.length;
    lastDays = days;
    var max = Math.max.apply(null, days.map(function (d) { return d.starts; }));
    var top = Math.max(4, Math.ceil(max / 4) * 4), slot = (W - L) / n, bw = Math.max(4, slot - 4);
    var y = function (v) { return T + (H - T - B) * (1 - v / top); };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Partidas por día en los últimos 30 días">';
    svg += '<g class="grid ax">';
    [0, top / 2, top].forEach(function (v) {
      svg += '<line x1="' + L + '" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
        '<text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text>";
    });
    svg += "</g><g class=\"ax\">";
    [0, 14, n - 1].forEach(function (i) {
      svg += '<text x="' + (L + slot * i + slot / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + dayLabel(days[i].d) + "</text>";
    });
    svg += "</g>";
    days.forEach(function (d, i) {
      var x = L + slot * i + (slot - bw) / 2, h = (H - T - B) - (y(d.starts) - T);
      svg += '<g data-i="' + i + '"><rect class="hit" x="' + (L + slot * i) + '" y="' + T + '" width="' + slot + '" height="' + (H - T - B) + '"/>';
      if (d.starts > 0) {
        var r = Math.min(4, bw / 2, h), yy = y(d.starts), bot = H - B;
        svg += '<path class="bar" d="M' + x + " " + bot + "V" + (yy + r) + "Q" + x + " " + yy + " " + (x + r) + " " + yy + "H" + (x + bw - r) +
          "Q" + (x + bw) + " " + yy + " " + (x + bw) + " " + (yy + r) + "V" + bot + 'Z"/>';
      }
      svg += "</g>";
    });
    svg += "</svg>";
    box.innerHTML = svg + '<div class="tip" hidden></div>';
    var tip = box.querySelector(".tip"), el = box.querySelector("svg");
    box.querySelectorAll("g[data-i]").forEach(function (g) {
      function show() {
        var d = days[+g.getAttribute("data-i")], r = g.getBoundingClientRect(), br = box.getBoundingClientRect();
        box.querySelectorAll("g.on").forEach(function (o) { o.classList.remove("on"); });
        g.classList.add("on");
        tip.innerHTML = "<b>" + dayLabel(d.d) + "</b> · " + d.starts + " partida" + (d.starts === 1 ? "" : "s") + " · " + d.visits + " visita" + (d.visits === 1 ? "" : "s");
        tip.style.left = Math.min(Math.max(r.left - br.left + r.width / 2, 90), br.width - 90) + "px";
        tip.style.top = (el.getBoundingClientRect().top - br.top + 8) + "px";
        tip.hidden = false;
      }
      g.addEventListener("mouseenter", show);
      g.addEventListener("click", show);
    });
    box.addEventListener("mouseleave", function () { tip.hidden = true; box.querySelectorAll("g.on").forEach(function (o) { o.classList.remove("on"); }); });
  }

  /* open the games panel from a link like /bago/#juegos (after everything above is ready) */
  if (/^#(juegos|memotest|gondola)$/.test(location.hash)) showTab("juegos");
})();

/* Bagó client portal: tabs, game link tools (copy, QR) and game statistics. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var GAME_URL = "https://oxigenoweb.com/bago/memotest/";

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
  if (location.hash === "#juegos" || location.hash === "#memotest") showTab("juegos");

  /* ---------- Copy link ---------- */
  var copyBtn = $("g-copy"), copyTimer;
  copyBtn.addEventListener("click", function () {
    var input = $("g-link");
    function done() {
      copyBtn.classList.add("ok"); copyBtn.querySelector("span").textContent = "¡Copiado!";
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { copyBtn.classList.remove("ok"); copyBtn.querySelector("span").textContent = "Copiar link"; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(GAME_URL).then(done, fallback);
    else fallback();
    function fallback() { input.focus(); input.select(); try { document.execCommand("copy"); done(); } catch (e) {} }
  });

  /* ---------- QR code ---------- */
  function makeQR() {
    if (typeof qrcode !== "function") return null;
    var q = qrcode(0, "M"); q.addData(GAME_URL); q.make(); return q;
  }
  function qrSVG(q, size) {
    var n = q.getModuleCount(), m = 4, total = n + m * 2, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '"' + (size ? ' width="' + size + '" height="' + size + '"' : "") +
      ' shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#0e3a63"/></svg>';
  }
  function save(blob, name) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function downloadPNG() {
    var q = makeQR(); if (!q) return;
    var n = q.getModuleCount(), m = 4, px = Math.floor(1200 / (n + m * 2)), size = px * (n + m * 2);
    var cv = document.createElement("canvas"); cv.width = cv.height = size;
    var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, size, size); cx.fillStyle = "#0e3a63";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) cx.fillRect((c + m) * px, (r + m) * px, px, px);
    cv.toBlob(function (b) { save(b, "memotest-bagovit-qr.png"); }, "image/png");
  }
  function downloadSVG() {
    var q = makeQR(); if (!q) return;
    save(new Blob([qrSVG(q, 1000)], { type: "image/svg+xml" }), "memotest-bagovit-qr.svg");
  }
  var dlg = $("qr-dlg");
  $("g-qr").addEventListener("click", function () {
    var q = makeQR();
    $("qr-box").innerHTML = q ? qrSVG(q) : '<p>No se pudo generar el código. Recargá la página.</p>';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  });
  $("qr-close").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  $("g-dl").addEventListener("click", downloadPNG);
  $("qr-png").addEventListener("click", downloadPNG);
  $("qr-svg").addEventListener("click", downloadSVG);

  /* ---------- Statistics ---------- */
  var nf = new Intl.NumberFormat("es-AR");
  function fmt(s) { s = Math.round(s); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function dayLabel(iso) { var p = iso.split("-"); return +p[2] + "/" + +p[1]; }
  function loadStats() {
    fetch("stats.php", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(paint)
      .catch(function () { $("s-updated").textContent = "No se pudieron cargar las estadísticas. Probá de nuevo más tarde."; });
  }
  function paint(s) {
    $("s-visits").textContent = nf.format(s.visits);
    $("s-starts").textContent = nf.format(s.starts);
    $("s-finishes").textContent = nf.format(s.finishes);
    $("s-time").textContent = s.avg_time == null ? "–" : fmt(s.avg_time);
    if (s.starts) $("s-rate").textContent = Math.round(100 * s.finishes / s.starts) + "% de las partidas";
    if (s.avg_tries != null) $("s-tries").textContent = "Promedio " + String(s.avg_tries).replace(".", ",") + " intentos";
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
})();

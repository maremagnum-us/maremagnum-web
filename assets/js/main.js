/* MAREMAGNUM: interacción de la página. Sin librerías ni servicios externos. */
(function () {
  "use strict";
  window.mmReady = true;
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var vw = window.innerWidth, vh = window.innerHeight;
  window.addEventListener("resize", function () { vw = window.innerWidth; vh = window.innerHeight; });
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Cabecera y menú superpuesto ---------- */
  var top = doc.querySelector(".top");
  var toTop = doc.querySelector(".to-top");
  var hero = doc.querySelector(".hero");
  function onScrollHeader() {
    top.classList.toggle("is-scrolled", window.scrollY > 24);
    if (toTop && hero) toTop.classList.toggle("is-visible", hero.getBoundingClientRect().bottom < vh * 0.55);
  }
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0 });
    var logo = doc.querySelector(".top .logo");
    if (logo) logo.focus({ preventScroll: true });
  });
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  var menuBtn = doc.querySelector(".menu-btn");
  function setMenu(open) {
    doc.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Menu");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!doc.body.classList.contains("menu-open")); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.body.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
    });
    doc.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    doc.addEventListener("click", function (e) {
      if (doc.body.classList.contains("menu-open") && !e.target.closest(".nav, .menu-btn")) setMenu(false);
    });
  }

  /* ---------- Inclinación hacia el ratón con brillo ---------- */
  function tilt(el, max) {
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || reduced) return;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", ((px - 0.5) * max).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - py) * max).toFixed(2) + "deg");
      el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", function () {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  }
  doc.querySelectorAll(".btn").forEach(function (b) { tilt(b, 14); });
  doc.querySelectorAll("[data-tilt]").forEach(function (b) { tilt(b, Number(b.dataset.tilt) || 8); });

  /* ---------- Aparición al hacer scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }) : null;
  var revealables = doc.querySelectorAll("[data-reveal], .cards, .step");
  revealables.forEach(function (el) { if (io) io.observe(el); else el.classList.add("is-in"); });

  /* ---------- La marea: líneas de ola que se calman donde está el cursor ---------- */
  var cv = doc.getElementById("water");
  var ctx = cv && cv.getContext("2d");
  var ptr = { x: -9999, y: -9999, on: false, t: 0 };
  var calm = { x: vw * 0.6, y: vh * 0.5 };
  var dpr = 1, gap = 36, W = 0, H = 0, step = 8;
  function sizeWater() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 700 ? 30 : 38;
    step = W < 700 ? 12 : 8;
  }
  sizeWater();
  window.addEventListener("resize", sizeWater);
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true; ptr.t = performance.now();
  }, { passive: true });
  doc.addEventListener("pointerleave", function () { ptr.on = false; });
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now();
  }, { passive: true });

  function calmAt(x, y) {
    var dx = x - calm.x, dy = (y - calm.y) * 1.4, rad = W < 700 ? 150 : 250;
    return Math.exp(-(dx * dx + dy * dy) / (rad * rad));
  }
  function drawWater(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var drift = (window.scrollY * 0.18) % gap;
    var n = Math.ceil(H / gap) + 2;
    var amp = W < 700 ? 9 : 13;
    for (var i = -1; i < n; i++) {
      var y0 = i * gap - drift;
      var ph = i + Math.floor(window.scrollY * 0.18 / gap);
      ctx.beginPath();
      for (var x = -10; x <= W + step; x += step) {
        var c = reduced ? 0.85 : calmAt(x, y0);
        var a = amp * (1 - c);
        var y = y0 + a * Math.sin(x * 0.011 + t * (0.6 + (ph % 4 + 4) % 4 * 0.12) + ph * 0.9) + a * 0.5 * Math.sin(x * 0.023 - t * 0.4 + ph);
        if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      var k = ((ph % 3) + 3) % 3, lc = calmAt(calm.x, y0);
      ctx.strokeStyle = k === 0 ? "rgba(20,152,213," + (0.26 + lc * 0.3).toFixed(3) + ")" : k === 1 ? "rgba(95,224,208," + (0.1 + lc * 0.22).toFixed(3) + ")" : "rgba(228,236,243," + (0.06 + lc * 0.12).toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  /* ---------- Portada: la lupa ---------- */
  var sheet = doc.getElementById("sheet");
  var lensToggle = doc.getElementById("lens-toggle");
  var lens = { x: 0.5, y: 0.42, ax: 0.5, ay: 0.42, r: 0.18, follow: false, full: reduced, touchT: 0 };
  if (sheet) {
    sheet.addEventListener("pointermove", function (e) {
      var b = sheet.getBoundingClientRect();
      lens.ax = (e.clientX - b.left) / b.width; lens.ay = (e.clientY - b.top) / b.height;
      if (e.pointerType === "mouse") lens.follow = true;
    });
    sheet.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") sheet.style.setProperty("--rot", "-1deg"); });
    sheet.addEventListener("pointerleave", function () { lens.follow = false; sheet.style.setProperty("--rot", "-3deg"); });
    sheet.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      var b = sheet.getBoundingClientRect();
      lens.ax = (e.clientX - b.left) / b.width; lens.ay = (e.clientY - b.top) / b.height;
      lens.touchT = performance.now();
    });
    lensToggle.setAttribute("aria-pressed", String(lens.full));
    lensToggle.addEventListener("click", function () {
      lens.full = !lens.full;
      lensToggle.setAttribute("aria-pressed", String(lens.full));
    });
  }
  function updateLens(now, t) {
    if (!sheet) return;
    var rect = sheet.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    if (!lens.follow && now - lens.touchT > 2600) {
      lens.ax = 0.5 + Math.sin(t * 0.42) * 0.3;
      lens.ay = 0.46 + Math.sin(t * 0.29 + 1) * 0.3;
    }
    lens.x += (lens.ax - lens.x) * 0.09; lens.y += (lens.ay - lens.y) * 0.09;
    var grow = clamp(window.scrollY / (vh * 0.55), 0, 1);
    var target = lens.full ? 1.6 : 0.18 + grow * 1.4;
    lens.r += (target - lens.r) * 0.08;
    var w = sheet.offsetWidth;
    sheet.style.setProperty("--x", (lens.x * 100).toFixed(2) + "%");
    sheet.style.setProperty("--y", (lens.y * 100).toFixed(2) + "%");
    sheet.style.setProperty("--r", (lens.r * w).toFixed(1) + "px");
    sheet.style.setProperty("--lens-o", lens.r > 1 ? "0" : "1");
    sheet.style.setProperty("--lens-d", lens.r > 1 ? "none" : "block");
  }

  /* ---------- Para firmas: los papeles se ordenan en un documento ---------- */
  var stage = doc.getElementById("stage");
  var stackDoc = doc.getElementById("stack-doc");
  var frags = stage ? [].slice.call(stage.querySelectorAll(".frag")) : [];
  var chaos = [
    { x: .06, y: .06, r: -14, b: 1.6, s: .7 }, { x: .56, y: .14, r: 9, b: .8, s: 1.1 },
    { x: .02, y: .42, r: 6, b: 2.2, s: .9 }, { x: .48, y: .50, r: -8, b: 1.2, s: 1.3 },
    { x: .16, y: .74, r: 12, b: 2.6, s: .8 }, { x: .58, y: .80, r: -5, b: 1, s: 1 },
    { x: .72, y: .34, r: 18, b: 1.8, s: 1.2 }
  ];
  var stack = { p: reduced ? 1 : 0, hover: false, tap: false };
  if (stage) {
    stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") stack.hover = true; });
    stage.addEventListener("pointerleave", function () { stack.hover = false; });
    stage.addEventListener("click", function () { if (!fine.matches) stack.tap = !stack.tap; });
  }
  function updateStack(t) {
    if (!stage) return;
    var sr = stage.getBoundingClientRect();
    if (sr.bottom < -100 || sr.top > vh + 100) return;
    var section = stage.parentElement.getBoundingClientRect();
    var scrollP = smooth(0, 1, (vh * 0.7 - section.top) / (vh * 0.75));
    var target = reduced ? 1 : Math.max(stack.hover || stack.tap ? 1 : 0, scrollP);
    stack.p += (target - stack.p) * 0.07;
    var p = stack.p;
    stackDoc.style.setProperty("--p", smooth(0.7, 1, p).toFixed(3));
    var en = smooth(0.72, 0.95, p).toFixed(3), es = (1 - en).toFixed(3);
    frags.forEach(function (f, i) {
      var c = chaos[i];
      var slot = stackDoc.querySelector('[data-slot="' + f.dataset.for + '"]').getBoundingClientRect();
      var fw = f.offsetWidth, fh = f.offsetHeight;
      var cx = c.x * (sr.width - fw * 0.7) + Math.sin(t * 0.35 * c.s + i) * 14;
      var cy = c.y * (sr.height - fh) + Math.cos(t * 0.3 * c.s + i * 2) * 12;
      var cr = c.r + Math.sin(t * 0.4 * c.s + i) * 4;
      var ox = slot.left - sr.left, oy = slot.top - sr.top + (slot.height - fh) / 2;
      var k = smooth(i * 0.04, 0.62 + i * 0.04, p);
      f.style.transform = "translate(" + (cx + (ox - cx) * k).toFixed(1) + "px," + (cy + (oy - cy) * k).toFixed(1) + "px) rotate(" + (cr * (1 - k)).toFixed(2) + "deg)";
      f.style.filter = k > 0.98 ? "none" : "blur(" + (c.b * (1 - k)).toFixed(2) + "px)";
      f.style.setProperty("--k", k.toFixed(3));
      f.children[1].style.opacity = es;
      f.children[2].style.opacity = en;
    });
  }

  /* ---------- Bucle de animación (se pausa con la pestaña oculta) ---------- */
  var t0 = performance.now(), running = true;
  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;
    var target = (ptr.on || now - ptr.t < 3500) && ptr.x > -9999 ? ptr : { x: W * (0.55 + 0.35 * Math.sin(t * 0.17)), y: H * (0.5 + 0.32 * Math.sin(t * 0.12 + 1)) };
    calm.x += (target.x - calm.x) * 0.08; calm.y += (target.y - calm.y) * 0.08;
    drawWater(t);
    updateLens(now, t);
    updateStack(t);
    if (!reduced) requestAnimationFrame(frame);
  }
  doc.addEventListener("visibilitychange", function () {
    running = !doc.hidden;
    if (running && !reduced) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
  if (reduced) {
    window.addEventListener("resize", function () { requestAnimationFrame(frame); });
    window.addEventListener("scroll", function () { requestAnimationFrame(frame); }, { passive: true });
  }

  /* ---------- Documentos: tarjetas que pasan al inglés ---------- */
  var cards = [].slice.call(doc.querySelectorAll(".card"));
  var cardsWrap = doc.getElementById("cards");
  cards.forEach(function (card, i) {
    card.style.setProperty("--i", String(i));
    card.addEventListener("transitionend", function () { card.classList.add("settled"); }, { once: true });
    card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") card.classList.add("is-en"); });
    card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !card.dataset.lock && !card.classList.contains("is-match")) card.classList.remove("is-en"); });
    card.addEventListener("click", function () {
      var on = !card.classList.contains("is-en") || (fine.matches && !card.dataset.lock);
      card.classList.toggle("is-en", on);
      if (on) card.dataset.lock = "1"; else delete card.dataset.lock;
    });
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
    card.addEventListener("focus", function () { card.classList.add("is-en"); });
    card.addEventListener("blur", function () { if (!card.dataset.lock) card.classList.remove("is-en"); });
  });
  /* En pantallas táctiles: cada tarjeta pasa al inglés cuando cruza el centro de la pantalla */
  if (!fine.matches && "IntersectionObserver" in window && !reduced) {
    var mid = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var c = en.target;
        if (c.dataset.lock || c.classList.contains("is-match")) return;
        c.classList.toggle("is-en", en.isIntersecting);
      });
    }, { rootMargin: "-38% 0px -38% 0px" });
    cards.forEach(function (c) { mid.observe(c); });
  }

  /* ---------- Buscador de documentos ---------- */
  var fold = function (s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); };
  var lookup = doc.getElementById("lookup");
  var lookupStatus = doc.getElementById("lookup-status");
  var lookupAsk = doc.querySelector(".lookup-ask");
  var askLink = doc.querySelector("[data-ask]");
  var docInput = doc.getElementById("f-doc");
  if (lookup) {
    cards.forEach(function (c) { c.dataset.search = fold(c.textContent); });
    lookup.addEventListener("input", function () {
      var q = fold(lookup.value), shown = 0;
      cards.forEach(function (c) {
        var hit = !q || c.dataset.search.indexOf(q) !== -1;
        c.classList.toggle("is-hidden", !hit);
        c.classList.toggle("is-match", !!q && hit);
        if (q && hit) c.classList.add("is-en");
        if (!q && !c.dataset.lock) c.classList.remove("is-en");
        if (hit) shown++;
      });
      if (!q) { lookupStatus.textContent = ""; lookupAsk.hidden = true; }
      else if (!shown) { lookupStatus.textContent = "No match on our list."; lookupAsk.hidden = false; }
      else { lookupStatus.textContent = shown === 1 ? "1 document matches." : shown + " documents match."; lookupAsk.hidden = true; }
    });
    if (askLink && docInput) askLink.addEventListener("click", function () { if (lookup.value.trim()) docInput.value = lookup.value.trim(); });
  }

  /* ---------- Formulario (sin conectar todavía) ---------- */
  var form = doc.getElementById("quote-form");
  doc.querySelectorAll("[data-audience]").forEach(function (a) {
    a.addEventListener("click", function () {
      var r = form && form.querySelector('input[name="audience"][value="' + a.dataset.audience + '"]');
      if (r) r.checked = true;
    });
  });
  if (form) {
    var messages = {
      "f-name": "Please tell us your name.",
      "f-email": "Please enter an email we can reply to, like name@example.com.",
      "f-doc": "Please tell us what kind of document it is.",
      "f-pages": "Please enter a whole number of pages, from 1 to 999.",
      "f-audience": "Please choose: law firm or individual."
    };
    var radios = form.querySelectorAll('input[name="audience"]');
    var errBox = function (el) { return doc.getElementById((el.name === "audience" ? "f-audience" : el.id) + "-error"); };
    var showError = function (el) {
      var id = el.name === "audience" ? "f-audience" : el.id, box = errBox(el);
      if (!box) return;
      box.textContent = messages[id] || "Please check this field.";
      (el.name === "audience" ? radios : [el]).forEach(function (x) { x.setAttribute("aria-invalid", "true"); x.setAttribute("aria-describedby", id + "-error"); });
    };
    var clearError = function (el) {
      var box = errBox(el);
      if (box) box.textContent = "";
      (el.name === "audience" ? radios : [el]).forEach(function (x) { x.removeAttribute("aria-invalid"); });
    };
    radios.forEach(function (r) { r.addEventListener("change", function () { clearError(r); }); });
    form.querySelectorAll("input:not([type=radio]), textarea").forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value && !el.checkValidity()) showError(el); else if (el.checkValidity()) clearError(el); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true" && el.checkValidity()) clearError(el); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = doc.getElementById("form-status"), first = null;
      if (!form.querySelector('input[name="audience"]:checked')) { showError(radios[0]); first = radios[0]; } else clearError(radios[0]);
      form.querySelectorAll("input:not([type=radio]), textarea").forEach(function (el) {
        if (!el.checkValidity()) { showError(el); if (!first) first = el; } else clearError(el);
      });
      if (first) { status.textContent = ""; first.focus(); return; }
      /* [[PENDIENTE: conectar el envío a una función de Cloudflare o a un servicio de formularios]] */
      status.innerHTML = '<span class="pending">[[PENDIENTE: el formulario todavía no envía. Mientras tanto, escribe a info@maremagnum.us]]</span>';
    });
  }
})();

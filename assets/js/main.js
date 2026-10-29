/* Mare Magnum: interacción de la página. Sin librerías ni servicios externos. */
(function () {
  "use strict";
  window.mmReady = true;
  var doc = document;

  /* Año del pie */
  doc.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Menú en móvil */
  var top = doc.querySelector(".top");
  var menuButton = doc.querySelector(".menu-button");
  if (top && menuButton) {
    var setMenu = function (open) {
      top.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Menu");
    };
    menuButton.addEventListener("click", function () {
      setMenu(!top.classList.contains("is-open"));
    });
    doc.querySelectorAll(".top-nav a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && top.classList.contains("is-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  /* Aparición de las secciones al hacer scroll */
  var reveals = doc.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Las cartas se descargan un poco antes de llegar a ellas,
     para que ya estén listas cuando empiece su animación */
  var lazyImgs = doc.querySelectorAll(".chart-frame img[loading='lazy']");
  if ("IntersectionObserver" in window) {
    var preload = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target.querySelector("img");
          if (img) img.loading = "eager";
          preload.unobserve(entry.target);
        }
      });
    }, { rootMargin: "900px 0px" });
    lazyImgs.forEach(function (img) { preload.observe(img.closest(".chart")); });
  }

  /* Buscador de documentos */
  var fold = function (s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  };
  var input = doc.getElementById("lookup-input");
  var statusEl = doc.getElementById("lookup-status");
  var ask = doc.querySelector(".lookup-ask");
  var askLink = doc.querySelector("[data-ask]");
  var rows = Array.prototype.slice.call(doc.querySelectorAll(".doc-group li"));
  var groups = Array.prototype.slice.call(doc.querySelectorAll(".doc-group"));
  var lastQuery = "";

  if (input) {
    rows.forEach(function (li) { li.dataset.search = fold(li.textContent); });
    input.addEventListener("input", function () {
      var q = fold(input.value);
      lastQuery = input.value.trim();
      var shown = 0;
      rows.forEach(function (li) {
        var hit = !q || li.dataset.search.indexOf(q) !== -1;
        li.classList.toggle("is-hidden", !hit);
        li.classList.toggle("is-match", !!q && hit);
        if (hit) shown++;
      });
      groups.forEach(function (g) {
        g.classList.toggle("is-hidden", !g.querySelector("li:not(.is-hidden)"));
      });
      if (!q) {
        statusEl.textContent = "";
        ask.hidden = true;
      } else if (shown === 0) {
        statusEl.textContent = "No match on the list.";
        ask.hidden = false;
      } else {
        statusEl.textContent = shown === 1 ? "1 document matches." : shown + " documents match.";
        ask.hidden = true;
      }
    });
  }

  /* Formulario */
  var form = doc.getElementById("quote-form");
  var firmField = doc.getElementById("field-firm");
  var docInput = doc.getElementById("f-doc");

  var setAudience = function (value) {
    var radio = form && form.querySelector('input[name="audience"][value="' + value + '"]');
    if (radio) { radio.checked = true; syncFirm(); }
  };
  var syncFirm = function () {
    if (!form || !firmField) return;
    var checked = form.querySelector('input[name="audience"]:checked');
    firmField.hidden = !(checked && checked.value === "firm");
  };

  doc.querySelectorAll("[data-audience]").forEach(function (a) {
    a.addEventListener("click", function () { setAudience(a.getAttribute("data-audience")); });
  });
  if (askLink && docInput) {
    askLink.addEventListener("click", function () {
      if (lastQuery) docInput.value = lastQuery;
    });
  }

  if (form) {
    syncFirm();
    form.querySelectorAll('input[name="audience"]').forEach(function (r) {
      r.addEventListener("change", function () { syncFirm(); clearError(r); });
    });

    var messages = {
      "f-name": "Please tell us your name.",
      "f-email": "Please enter an email address we can reply to, like name@example.com.",
      "f-doc": "Please tell us what kind of document it is.",
      "f-pages": "Please enter a whole number of pages, from 1 to 999.",
      "f-audience": "Please choose whether you are a law firm or an individual."
    };

    var errorFor = function (el) {
      var id = el.name === "audience" ? "f-audience" : el.id;
      return { id: id, box: doc.getElementById(id + "-error") };
    };
    var showError = function (el) {
      var e = errorFor(el);
      if (!e.box) return;
      e.box.textContent = messages[e.id] || "Please check this field.";
      if (el.name === "audience") {
        form.querySelectorAll('input[name="audience"]').forEach(function (r) {
          r.setAttribute("aria-invalid", "true");
          r.setAttribute("aria-describedby", e.id + "-error");
        });
      } else {
        el.setAttribute("aria-invalid", "true");
        el.setAttribute("aria-describedby", e.id + "-error");
      }
    };
    var clearError = function (el) {
      var e = errorFor(el);
      if (e.box) e.box.textContent = "";
      if (el.name === "audience") {
        form.querySelectorAll('input[name="audience"]').forEach(function (r) { r.removeAttribute("aria-invalid"); });
      } else {
        el.removeAttribute("aria-invalid");
      }
    };

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("blur", function () {
        if (el.type === "radio") return;
        if (el.value && !el.checkValidity()) showError(el); else if (el.checkValidity()) clearError(el);
      });
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true" && el.checkValidity()) clearError(el);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = doc.getElementById("form-status");
      var firstBad = null;
      var checkedAudience = false;
      form.querySelectorAll("input, textarea").forEach(function (el) {
        if (el.type === "radio") return;
        if (el.closest("[hidden]")) return;
        if (!el.checkValidity()) { showError(el); if (!firstBad) firstBad = el; } else { clearError(el); }
      });
      var audience = form.querySelector('input[name="audience"]');
      if (!form.querySelector('input[name="audience"]:checked')) {
        showError(audience);
        if (!firstBad) firstBad = audience;
      } else {
        checkedAudience = true;
        clearError(audience);
      }
      if (firstBad) {
        status.textContent = "";
        firstBad.focus();
        return;
      }
      /* [[PENDIENTE: conectar el envío a una función de Cloudflare o a un servicio de formularios]] */
      status.innerHTML = '<span class="pending">[[PENDIENTE: el formulario todavía no envía. Mientras tanto, escribe a info@maremagnum.us]]</span>';
      return checkedAudience;
    });
  }
})();

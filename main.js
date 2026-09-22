/* =============================================================================
   Reformas F.S Fonseca — main.js
   Script clásico en IIFE, sin módulos. Cada bloque va aislado: si uno falla,
   el resto sigue funcionando y el contenido nunca queda oculto.
============================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var data = window.__BRAND__ || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Activa las apariciones. Sin esta clase (JS caído) todo se ve.
  root.classList.add("js");

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------------------------------------------------------------------------
     Datos de contacto: una sola fuente (lib/manifest.js)
  --------------------------------------------------------------------------- */
  function initContact() {
    var c = data.contact;
    if (!c) return;
    var tel = "tel:" + String(c.phone || "").replace(/\s+/g, "");

    $$('[data-contact="tel"]').forEach(function (a) {
      a.href = tel;
      a.textContent = c.phoneLabel || c.phone;
    });
    $$('[data-contact="tel-label"]').forEach(function (el) {
      el.textContent = c.phoneLabel || c.phone;
      var a = el.closest("a");
      if (a) a.href = tel;
    });
    if (c.email) {
      $$('[data-contact="mail"]').forEach(function (a) {
        a.href = "mailto:" + c.email;
        a.textContent = c.email;
      });
    }
    $$('[data-contact="wa"]').forEach(function (a) {
      a.href = "https://wa.me/" + c.whatsapp;
    });
  }

  /* ---------------------------------------------------------------------------
     Menú móvil
  --------------------------------------------------------------------------- */
  function initMenu() {
    var burger = $("#burger");
    var menu = $("#menu");
    if (!burger || !menu) return;
    var label = $("[data-burger-label]", burger);

    menu.removeAttribute("hidden");

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var first = $(".menu__a", menu);
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
      }
    }

    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setOpen(false);
        burger.focus();
      }
    });
    window.matchMedia("(min-width: 960px)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------------
     Enlace activo de la navegación
  --------------------------------------------------------------------------- */
  function initNavSpy() {
    var links = $$(".nav__a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").slice(1);
      if (id && document.getElementById(id)) byId[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        if (byId[en.target.id]) byId[en.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------------------------------------------------------------------------
     Apariciones al hacer scroll
  --------------------------------------------------------------------------- */
  function initReveals() {
    var items = $$("[data-reveal]");
    var steps = $("[data-steps]");
    var show = function (el) { el.classList.add("is-in"); };

    if (!("IntersectionObserver" in window)) {
      items.forEach(show);
      if (steps) steps.classList.add("is-drawn");
      return;
    }

    // Un elemento recortado a cero por su propio clip-path no cuenta como
    // visible para el observador: en esos casos se vigila su contenedor.
    var groups = new Map();
    items.forEach(function (el) {
      var type = el.getAttribute("data-reveal");
      var target = (type === "clip" || type === "frame" || type === "mask") ? el.parentElement : el;
      if (!groups.has(target)) groups.set(target, []);
      groups.get(target).push(el);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (groups.get(en.target) || []).forEach(show);
        io.unobserve(en.target);
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -7% 0px" });
    groups.forEach(function (_, target) { io.observe(target); });

    if (steps) {
      var sio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          steps.classList.add("is-drawn");
          sio.disconnect();
        }
      }, { threshold: 0.3 });
      sio.observe(steps);
    }

    // Red de seguridad: a los 6 s, lo que ya está a la vista o por encima
    // se muestra aunque el observador no haya disparado.
    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) show(el);
      });
    }, 2500);
  }

  /* ---------------------------------------------------------------------------
     Cabecera compacta y botón flotante de WhatsApp.
     Con IntersectionObserver: no se escucha el scroll de la ventana, que
     dispara en cada fotograma. El paralaje de la portada y del fondo de la
     opinión los lleva el CSS (animation-timeline), no el JS.
  --------------------------------------------------------------------------- */
  function initScrollState() {
    var hdr = $("#hdr");
    var wa = $("#wa");
    var sentinel = $("[data-sentinel]");
    var hero = $("#hero");
    if (!("IntersectionObserver" in window)) return;

    if (hdr && sentinel) {
      new IntersectionObserver(function (entries) {
        hdr.classList.toggle("is-compact", !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    }

    if (wa && hero) {
      new IntersectionObserver(function (entries) {
        wa.classList.toggle("is-on", !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(hero);
    }
  }

  /* ---------------------------------------------------------------------------
     Carrusel de servicios: flechas, teclado y regla de progreso
  --------------------------------------------------------------------------- */
  function initCarousel() {
    var car = $("#car");
    if (!car) return;
    var prev = $('[data-car="prev"]');
    var next = $('[data-car="next"]');
    var fill = $("[data-car-fill]");
    var rail = fill ? fill.parentElement : null;

    function step() {
      var card = $(".scard", car);
      if (!card) return car.clientWidth;
      var gap = parseFloat(getComputedStyle(car).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function go(dir) {
      car.scrollBy({ left: dir * step(), behavior: reduced ? "auto" : "smooth" });
    }
    function update() {
      var max = car.scrollWidth - car.clientWidth;
      if (prev) prev.disabled = car.scrollLeft <= 2;
      if (next) next.disabled = car.scrollLeft >= max - 2;
      if (fill && rail) {
        var ratio = car.clientWidth / car.scrollWidth;
        fill.style.width = (ratio * 100).toFixed(2) + "%";
        var travel = rail.clientWidth * (1 - ratio);
        var t = max > 0 ? car.scrollLeft / max : 0;
        fill.style.transform = "translateX(" + (t * travel).toFixed(1) + "px)";
      }
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); go(-1); }
    });

    var raf = false;
    car.addEventListener("scroll", function () {
      if (!raf) { raf = true; requestAnimationFrame(function () { raf = false; update(); }); }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------------------------
     Botones que preseleccionan el tipo de obra en el formulario
  --------------------------------------------------------------------------- */
  function initPrefill() {
    var sel = $("#f-type");
    if (!sel) return;
    $$("[data-prefill]").forEach(function (a) {
      a.addEventListener("click", function () {
        var want = a.getAttribute("data-prefill");
        $$("option", sel).forEach(function (o) {
          if (o.textContent === want) sel.value = o.value || o.textContent;
        });
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Formulario: sin servidor, abre el correo con el mensaje redactado
  --------------------------------------------------------------------------- */
  function initForm() {
    var form = $("#form");
    var status = $("#form-status");
    if (!form) return;

    function check(input) {
      var field = input.closest(".field");
      var ok = input.value.trim().length > 0;
      if (field) field.classList.toggle("is-invalid", !ok);
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      var err = document.getElementById(input.id + "-err");
      if (err) {
        if (ok) input.removeAttribute("aria-describedby");
        else input.setAttribute("aria-describedby", err.id);
      }
      return ok;
    }

    var required = $$("[required]", form);
    required.forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) check(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) check(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      required.forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
      if (firstBad) {
        status.textContent = "Revise los campos marcados, por favor.";
        status.classList.add("is-error");
        firstBad.focus();
        return;
      }

      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var wa = (data.contact && data.contact.whatsapp) || "34613766476";
      var texto =
        "Hola, quiero pedir una visita." + "\n" +
        "Nombre: " + v("f-name") + "\n" +
        "Teléfono: " + v("f-phone") + "\n" +
        (v("f-town") ? "Población: " + v("f-town") + "\n" : "") +
        "Tipo de obra: " + v("f-type") +
        (v("f-msg") ? "\n\n" + v("f-msg") : "");

      status.classList.remove("is-error");
      status.textContent = "Abriendo WhatsApp con la solicitud ya escrita…";
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    });
  }

  function initYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function boot() {
    safe(initContact, "contact");
    safe(initMenu, "menu");
    safe(initNavSpy, "navSpy");
    safe(initReveals, "reveals");
    safe(initScrollState, "scrollState");
    safe(initCarousel, "carousel");
    safe(initPrefill, "prefill");
    safe(initForm, "form");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

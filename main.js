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
     Pantalla de carga. Se retira cuando la página está lista, con un mínimo de
     600 ms para que no pegue un salto, y como muy tarde a los 1,5 s. El CSS
     tiene su propia salida por si este script no llega a ejecutarse.
  --------------------------------------------------------------------------- */
  function initSplash() {
    var splash = $("#splash");
    if (!splash) { root.classList.add("is-revealed"); return; }

    var inicio = Date.now();
    var hecho = false;

    function retirar() {
      if (hecho) return;
      hecho = true;
      splash.classList.add("is-done");
      root.classList.add("is-revealed");
      setTimeout(function () { if (splash.parentNode) splash.remove(); }, 900);
    }

    function cuandoToque() {
      var espera = Math.max(0, 600 - (Date.now() - inicio));
      setTimeout(retirar, espera);
    }

    if (document.readyState === "complete") cuandoToque();
    else window.addEventListener("load", cuandoToque, { once: true });

    // Tope: pase lo que pase, a los 1,5 s la web se ve. Si carga antes, sale
    // antes (nunca menos de 0,6 s, para que el logo no sea un parpadeo).
    setTimeout(retirar, 1500);
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
     Vídeo de portada. Es opcional: si el archivo no existe, si el visitante
     pidió menos movimiento o si lleva el ahorro de datos puesto, la portada se
     queda con la fotografía y no se descarga nada.
  --------------------------------------------------------------------------- */
  function initHeroVideo() {
    var video = $("[data-hero-video]");
    if (!video) return;

    var con = navigator.connection || {};
    if (reduced || con.saveData) return;

    var src = video.getAttribute("data-src");
    if (!src) return;

    video.addEventListener("playing", function () {
      video.classList.add("is-playing");
    }, { once: true });

    // Si el archivo no está, no pasa nada: la foto ya se está viendo.
    video.addEventListener("error", function () {
      video.remove();
    }, { once: true });

    // Se carga después de que la página esté lista, para no competir con la
    // fotografía de portada, que es lo que el visitante ve primero.
    var arrancar = function () {
      video.src = src;
      // Si el navegador no deja arrancarlo ahora (pestaña abierta en segundo
      // plano, ahorro de energía), no se quita: sigue invisible detrás de la
      // foto y arranca en cuanto el visitante vuelve a la pestaña. Solo se
      // retira si el archivo falla de verdad (evento error, arriba).
      var intento = video.play();
      if (intento && intento.catch) intento.catch(function () {});
    };
    if (document.readyState === "complete") arrancar();
    else window.addEventListener("load", arrancar, { once: true });

    /* El atributo loop no siempre basta: hay navegadores que suspenden el
       vídeo al cerrar la vuelta, al volver de otra pestaña o al recuperar la
       ventana, y la portada se quedaba congelada. Aquí se vuelve a poner en
       marcha sola. Mientras la portada no se ve, se para: ni gasta batería ni
       datos, y al subir de nuevo arranca donde toca. */
    var enPantalla = true;
    var reanudar = function () {
      if (!video.isConnected || !enPantalla || document.hidden) return;
      if (!video.paused) return;
      if (video.ended || (video.duration && video.currentTime >= video.duration - 0.05)) {
        video.currentTime = 0;
      }
      var i = video.play();
      if (i && i.catch) i.catch(function () {});
    };

    video.addEventListener("ended", reanudar);
    video.addEventListener("pause", function () { setTimeout(reanudar, 80); });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) reanudar();
    });
    window.addEventListener("pageshow", reanudar);
    window.addEventListener("focus", reanudar);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (filas) {
        filas.forEach(function (f) {
          enPantalla = f.isIntersecting;
          if (enPantalla) reanudar();
          else if (!video.paused) video.pause();
        });
      }, { threshold: 0 }).observe(video);
    }
  }

  /* ---------------------------------------------------------------------------
     Golpe de martillo al hacer clic: el cursor se inclina un instante y en el
     punto del clic salta un impacto que se borra solo.
  --------------------------------------------------------------------------- */
  function initGolpe() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var raiz = document.documentElement;
    var suelta;
    document.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      raiz.classList.add("is-golpe");
      clearTimeout(suelta);
      suelta = setTimeout(function () { raiz.classList.remove("is-golpe"); }, 160);
      if (reduced) return;

      var g = document.createElement("span");
      g.className = "golpe";
      g.setAttribute("aria-hidden", "true");
      g.style.left = e.clientX + "px";
      g.style.top = e.clientY + "px";
      [0, 60, 120, 180, 240, 300].forEach(function (a) {
        var i = document.createElement("i");
        i.style.setProperty("--a", a + "deg");
        g.appendChild(i);
      });
      document.body.appendChild(g);
      setTimeout(function () { g.remove(); }, 500);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------------
     La nota de Google cuenta de 0,0 a su valor cuando la franja entra en
     pantalla. El valor real ya está en el HTML: si esto no llega a correr,
     se ve igual.
  --------------------------------------------------------------------------- */
  function initCuenta() {
    var el = $(".strip__score");
    if (!el || reduced || !("IntersectionObserver" in window)) return;
    var fin = parseFloat(el.textContent.replace(",", "."));
    if (isNaN(fin)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = null, dur = 1100;
      var paso = function (t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = (fin * e).toFixed(1).replace(".", ",");
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    }, { threshold: 0.6 });
    io.observe(el);
  }

  function initObraVideo() {
    var video = $("[data-obra-video]");
    if (!video) return;

    var con = navigator.connection || {};
    if (reduced || con.saveData) { video.setAttribute("controls", ""); return; }

    // Solo se reproduce mientras se está viendo: ni gasta datos ni distrae.
    if (!("IntersectionObserver" in window)) return;
    var ob = new IntersectionObserver(function (filas) {
      filas.forEach(function (f) {
        if (f.isIntersecting) {
          var intento = video.play();
          if (intento && intento.catch) intento.catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    ob.observe(video);
  }

  /* ---------------------------------------------------------------------------
     Comparativa antes y después: arrastre, teclado y tacto
  --------------------------------------------------------------------------- */
  function initCompare() {
    var caja = $("[data-cmp]");
    if (!caja) return;
    var rango = caja.querySelector("[data-cmp-range]");
    if (!rango) return;

    var pintar = function () {
      caja.style.setProperty("--pos", rango.value + "%");
    };
    rango.addEventListener("input", pintar);
    pintar();

    // Arrastrar sobre la foto mueve el control, que es quien manda.
    var mover = function (e) {
      var r = caja.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var v = Math.max(0, Math.min(100, (x / r.width) * 100));
      rango.value = v;
      pintar();
    };
    var arrastrando = false;
    var tocada = false;
    caja.addEventListener("pointerdown", function (e) {
      arrastrando = true; tocada = true; mover(e);
      if (caja.setPointerCapture) { try { caja.setPointerCapture(e.pointerId); } catch (err) {} }
    });
    caja.addEventListener("pointermove", function (e) { if (arrastrando) mover(e); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
      caja.addEventListener(ev, function () { arrastrando = false; });
    });

    // Al entrar en pantalla la manija se mueve sola una vez. Sin ese gesto
    // nadie adivina que la foto se puede arrastrar.
    if (reduced || !("IntersectionObserver" in window)) return;
    var ob = new IntersectionObserver(function (filas) {
      if (!filas[0].isIntersecting) return;
      ob.disconnect();
      var t0 = 0;
      var paso = function (t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / 1800, 1);
        if (tocada) return;
        // Va a un lado, vuelve al otro y se queda en el centro
        rango.value = 50 + Math.sin(k * Math.PI * 2) * 17;
        pintar();
        if (k < 1) requestAnimationFrame(paso);
        else { rango.value = 50; pintar(); }
      };
      setTimeout(function () { if (!tocada) requestAnimationFrame(paso); }, 420);
    }, { threshold: 0.45 });
    ob.observe(caja);
  }

  /* ---------------------------------------------------------------------------
     Visor de fotografías de la galería
  --------------------------------------------------------------------------- */
  function initLupa() {
    var lupa = $("#lupa");
    var botones = $$("[data-lupa]");
    if (!lupa || !botones.length) return;

    var img = lupa.querySelector("[data-lupa-img]");
    var pie = lupa.querySelector("[data-lupa-pie]");
    var cerrar = lupa.querySelector("[data-lupa-x]");
    var previo = null;

    var abrir = function (btn) {
      previo = btn;
      img.src = btn.getAttribute("data-lupa");
      img.alt = btn.querySelector("img") ? btn.querySelector("img").alt : "";
      pie.textContent = btn.getAttribute("data-pie") || "";
      lupa.hidden = false;
      document.body.style.overflow = "hidden";
      // Un reflujo forzado basta para que la transicion arranque, y a diferencia
      // de requestAnimationFrame no se queda parado si la pestana esta de fondo.
      void lupa.offsetWidth;
      lupa.classList.add("is-on");
      cerrar.focus();
    };

    var quitar = function () {
      lupa.classList.remove("is-on");
      document.body.style.overflow = "";
      var fin = function () {
        lupa.hidden = true;
        img.removeAttribute("src");
        if (previo) { previo.focus(); previo = null; }
      };
      if (reduced) fin();
      else setTimeout(fin, 300);
    };

    botones.forEach(function (b) {
      b.addEventListener("click", function () { abrir(b); });
    });
    cerrar.addEventListener("click", quitar);
    lupa.addEventListener("click", function (e) {
      if (e.target === lupa) quitar();
    });
    document.addEventListener("keydown", function (e) {
      if (lupa.hidden) return;
      if (e.key === "Escape") quitar();
      // El visor solo tiene un botón: el foco no debe salir de él.
      if (e.key === "Tab") { e.preventDefault(); cerrar.focus(); }
    });
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
    // Se comparan sin mayusculas ni tildes, y si no hay coincidencia exacta
    // vale que la opcion empiece igual: asi "Obra nueva" sigue encontrando
    // a "Obra nueva o ampliacion" aunque se retoque la etiqueta.
    var llano = function (s) {
      return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    };
    $$("[data-prefill]").forEach(function (a) {
      a.addEventListener("click", function () {
        var want = llano(a.getAttribute("data-prefill"));
        var elegida = null;
        $$("option", sel).forEach(function (o) {
          var t = llano(o.textContent);
          if (t === want) elegida = o;
          else if (!elegida && t.indexOf(want) === 0) elegida = o;
        });
        if (elegida) sel.value = elegida.value || elegida.textContent;
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
      var ok = input.type === "checkbox" ? input.checked : input.value.trim().length > 0;
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
      input.addEventListener("blur", function () { if (input.type !== "checkbox" && input.value) check(input); });
      input.addEventListener(input.type === "checkbox" ? "change" : "input", function () {
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
    safe(initSplash, "splash");
    safe(initContact, "contact");
    safe(initMenu, "menu");
    safe(initNavSpy, "navSpy");
    safe(initReveals, "reveals");
    safe(initScrollState, "scrollState");
    safe(initHeroVideo, "heroVideo");
    safe(initObraVideo, "obraVideo");
    safe(initCuenta, "cuenta");
    safe(initGolpe, "golpe");
    safe(initCompare, "compare");
    safe(initLupa, "lupa");
    safe(initCarousel, "carousel");
    safe(initPrefill, "prefill");
    safe(initForm, "form");
    safe(initYear, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

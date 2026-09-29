(function () {
"use strict";
var root = document.documentElement;
var data = window.__BRAND__ || {};
var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var CA = (root.getAttribute("lang") || "").slice(0, 2) === "ca";
var T = CA ? {
menuAbrir: "Obre el menú",
menuCerrar: "Tanca el menú",
revise: "Revisi els camps marcats, si us plau.",
enviando: "Enviant…",
datos: "Revisi el nom i el telèfon, si us plau.",
limite: "Ara mateix no podem rebre més sol·licituds pel web. Truqui’ns o escrigui’ns per WhatsApp, si us plau.",
fallo: "No hem pogut enviar la sol·licitud. Pot enviar-la per WhatsApp amb el missatge ja escrit:",
waBoton: "Enviar per WhatsApp",
waHola: "Hola, voldria demanar una visita.",
waNombre: "Nom",
waTel: "Telèfon",
waPob: "Població",
waTipo: "Tipus d’obra"
} : {
menuAbrir: "Abrir menú",
menuCerrar: "Cerrar menú",
revise: "Revise los campos marcados, por favor.",
enviando: "Enviando…",
datos: "Revise el nombre y el teléfono, por favor.",
limite: "Ahora mismo no podemos recibir más solicitudes por la web. Llámenos o escríbanos por WhatsApp, por favor.",
fallo: "No hemos podido enviar la solicitud. Puede mandarla por WhatsApp con el mensaje ya escrito:",
waBoton: "Enviar por WhatsApp",
waHola: "Hola, quiero pedir una visita.",
waNombre: "Nombre",
waTel: "Teléfono",
waPob: "Población",
waTipo: "Tipo de obra"
};
root.classList.add("js");
var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
function safe(fn, name) {
try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
}
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
setTimeout(retirar, 1500);
}
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
function initMenu() {
var burger = $("#burger");
var menu = $("#menu");
if (!burger || !menu) return;
var label = $("[data-burger-label]", burger);
menu.removeAttribute("hidden");
function setOpen(open) {
menu.classList.toggle("is-open", open);
burger.setAttribute("aria-expanded", open ? "true" : "false");
if (label) label.textContent = open ? T.menuCerrar : T.menuAbrir;
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
window.matchMedia("(min-width: 1100px)").addEventListener("change", function (m) {
if (m.matches) setOpen(false);
});
}
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
function initReveals() {
var items = $$("[data-reveal]");
var lineas = $$("[data-steps], [data-dibujo]");
var show = function (el) { el.classList.add("is-in"); };
var dibujar = function (el) { el.classList.add("is-drawn"); };
if (!("IntersectionObserver" in window)) {
items.forEach(show);
lineas.forEach(dibujar);
return;
}
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
if (lineas.length) {
var sio = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (!en.isIntersecting) return;
dibujar(en.target);
sio.unobserve(en.target);
});
}, { threshold: 0.3 });
lineas.forEach(function (el) { sio.observe(el); });
}
setTimeout(function () {
items.forEach(function (el) {
if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) show(el);
});
}, 2500);
}
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
} else if (wa) {
wa.classList.add("is-on");
}
}
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
if (reduced || !("IntersectionObserver" in window)) return;
var ob = new IntersectionObserver(function (filas) {
if (!filas[0].isIntersecting) return;
ob.disconnect();
var t0 = 0;
var paso = function (t) {
if (!t0) t0 = t;
var k = Math.min((t - t0) / 1800, 1);
if (tocada) return;
rango.value = 50 + Math.sin(k * Math.PI * 2) * 17;
pintar();
if (k < 1) requestAnimationFrame(paso);
else { rango.value = 50; pintar(); }
};
setTimeout(function () { if (!tocada) requestAnimationFrame(paso); }, 420);
}, { threshold: 0.45 });
ob.observe(caja);
}
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
if (e.key === "Tab") { e.preventDefault(); cerrar.focus(); }
});
}
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
function initPrefill() {
var sel = $("#f-type");
if (!sel) return;
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
function initForm() {
var form = $("#form");
var status = $("#form-status");
if (!form || !status) return;
var inicio = Date.now();
var boton = form.querySelector('[type="submit"]');
var etiqueta = boton ? boton.querySelector("span") : null;
var textoBoton = etiqueta ? etiqueta.textContent : "";
var enviando = false;
function valido(input) {
if (input.type === "checkbox") return input.checked;
var v = input.value.trim();
if (input.type === "tel") return v.replace(/\D/g, "").length >= 9;
return v.length > 0;
}
function check(input) {
var field = input.closest(".field");
var ok = valido(input);
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
var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
function enlaceWhatsApp() {
var wa = (data.contact && data.contact.whatsapp) || "34613766476";
var texto =
T.waHola + "\n" +
T.waNombre + ": " + v("f-name") + "\n" +
T.waTel + ": " + v("f-phone") + "\n" +
(v("f-town") ? T.waPob + ": " + v("f-town") + "\n" : "") +
T.waTipo + ": " + v("f-type") +
(v("f-msg") ? "\n\n" + v("f-msg") : "");
return "https://wa.me/" + wa + "?text=" + encodeURIComponent(texto);
}
function avisar(texto, conWhatsApp) {
status.textContent = texto;
status.classList.add("is-error");
if (conWhatsApp) {
var a = document.createElement("a");
a.href = enlaceWhatsApp();
a.target = "_blank";
a.rel = "noopener";
a.className = "form__wa";
a.textContent = T.waBoton;
status.appendChild(document.createTextNode(" "));
status.appendChild(a);
}
}
function listo() {
var hecho = $(".form__done", form);
if (!hecho) { status.classList.remove("is-error"); return; }
var nombre = $("[data-done-nombre]", hecho);
if (nombre) nombre.textContent = v("f-name") ? ", " + v("f-name") : "";
form.reset();
status.textContent = "";
form.classList.add("is-sent");
hecho.hidden = false;
hecho.focus({ preventScroll: true });
hecho.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
}
function ocupado(si) {
enviando = si;
if (boton) boton.disabled = si;
if (etiqueta) etiqueta.textContent = si ? T.enviando : textoBoton;
if (si) form.setAttribute("aria-busy", "true");
else form.removeAttribute("aria-busy");
}
form.addEventListener("submit", function (e) {
e.preventDefault();
if (enviando) return;
var firstBad = null;
required.forEach(function (input) { if (!check(input) && !firstBad) firstBad = input; });
if (firstBad) {
status.textContent = T.revise;
status.classList.add("is-error");
firstBad.focus();
return;
}
var datos = new FormData(form);
datos.append("ms", String(Date.now() - inicio));
status.textContent = "";
status.classList.remove("is-error");
ocupado(true);
var ctrl = "AbortController" in window ? new AbortController() : null;
var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
fetch(form.getAttribute("action") || "/enviar.php", {
method: "POST",
body: datos,
headers: { "X-Requested-With": "fetch", "Accept": "application/json" },
credentials: "same-origin",
signal: ctrl ? ctrl.signal : undefined
})
.then(function (r) { return r.json().catch(function () { return { ok: false, error: "envio" }; }); })
.then(function (res) {
clearTimeout(reloj);
ocupado(false);
if (res && res.ok) listo();
else if (res && res.error === "datos") avisar(T.datos, false);
else if (res && res.error === "limite") avisar(T.limite, true);
else avisar(T.fallo, true);
})
.catch(function () {
clearTimeout(reloj);
ocupado(false);
avisar(T.fallo, true);
});
});
}
function initContar() {
var host = location.hostname;
if (!host || host === "localhost" || host === "127.0.0.1" || !navigator.sendBeacon) return;
var avisar = function (evento) {
var d = new FormData();
d.append("e", evento);
d.append("idioma", CA ? "ca" : "es");
try { navigator.sendBeacon("/contar.php", d); } catch (err) {}
};
avisar("visita");
document.addEventListener("click", function (e) {
var a = e.target.closest ? e.target.closest("a[href]") : null;
if (!a) return;
var href = a.getAttribute("href") || "";
if (href.indexOf("tel:") === 0) avisar("llamada");
else if (href.indexOf("wa.me/") !== -1) avisar("whatsapp");
}, true);
}
function initCopiar() {
$$("[data-copiar]").forEach(function (b) {
var texto = b.textContent;
b.addEventListener("click", function () {
var valor = b.getAttribute("data-copiar");
var hecho = function () {
b.textContent = b.getAttribute("data-hecho") || texto;
b.classList.add("is-hecho");
setTimeout(function () { b.textContent = texto; b.classList.remove("is-hecho"); }, 2000);
};
copiarAntiguo(valor);
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(valor).catch(function () {});
}
hecho();
});
});
function copiarAntiguo(valor) {
var t = document.createElement("textarea");
t.value = valor;
t.setAttribute("readonly", "");
t.style.position = "fixed";
t.style.opacity = "0";
document.body.appendChild(t);
t.select();
try { document.execCommand("copy"); } catch (e) {}
t.remove();
}
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
safe(initObraVideo, "obraVideo");
safe(initCuenta, "cuenta");
safe(initCompare, "compare");
safe(initLupa, "lupa");
safe(initCarousel, "carousel");
safe(initPrefill, "prefill");
safe(initForm, "form");
safe(initYear, "year");
safe(initCopiar, "copiar");
safe(initContar, "contar");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();

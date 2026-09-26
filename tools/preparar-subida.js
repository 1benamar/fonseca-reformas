/* =============================================================================
   Prepara la web para subirla a Hostinger.
   Uso:  node tools/preparar-subida.js

   1. Regenera la versión en catalán (tools/version-catalana.js).
   2. Copia en el Escritorio, en "fonseca-web-publicar", la web completa y
      optimizada: HTML, CSS y JS sin comentarios ni sangrías, datos para Google
      compactados, y solo las imágenes, fuentes y vídeos que se usan de verdad.
      Los archivos del proyecto no se tocan: siguen legibles para editarlos.
   3. Compara esa copia con lo que hay publicado en reformasfonseca.com y deja
      en "fonseca-subir-ahora" únicamente lo que ha cambiado, con la misma
      estructura de carpetas que public_html. Eso es lo que se arrastra.

   El .htaccess de la raíz no se incluye en la subida (el hosting puede haberle
   añadido líneas); para subirlo también:  node tools/preparar-subida.js --htaccess
============================================================================= */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const ESCRITORIO = path.join(process.env.USERPROFILE || process.env.HOME, "Desktop");
const COMPLETA = path.join(ESCRITORIO, "fonseca-web-publicar");
const SUBIDA = path.join(ESCRITORIO, "fonseca-subir-ahora");
const DOMINIO = "https://reformasfonseca.com";
const CON_HTACCESS = process.argv.includes("--htaccess");

/* --- Qué forma parte de la web ------------------------------------------- */
const PAGINAS = ["index.html", "404.html", "aviso-legal.html", "privacidad.html",
  "ca/index.html", "ca/avis-legal.html", "ca/privacitat.html"];
const CODIGO = ["styles.css", "main.js", "lib/manifest.js"];
const SERVIDOR = ["enviar.php", "contar.php", "panel.php", "inc/comun.php", "inc/ajustes.php", "inc/.htaccess"];
const OTROS = [".htaccess", "robots.txt", "sitemap.xml", "apple-touch-icon.png"];

/* --- Minificadores prudentes ------------------------------------------------
   No reescriben nada: quitan comentarios y espacios que el navegador ignora.
   Se mantienen los saltos de línea del JS y del HTML, así nunca cambia cómo
   se interpreta el código ni el espacio entre palabras.                     */
function minCSS(s) {
  let out = "";
  let hueco = false;
  const n = s.length;
  const antesSinHueco = "{};,:(";
  const despuesSinHueco = "{};,!)";
  const emitir = (t) => {
    if (hueco && out && !antesSinHueco.includes(out[out.length - 1]) && !despuesSinHueco.includes(t[0])) out += " ";
    hueco = false;
    if (t === "}" && out.endsWith(";")) out = out.slice(0, -1);
    out += t;
  };
  let i = 0;
  while (i < n) {
    const c = s[i];
    if (c === "/" && s[i + 1] === "*") { const j = s.indexOf("*/", i + 2); i = j < 0 ? n : j + 2; hueco = true; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && s[j] !== c) { if (s[j] === "\\") j++; j++; }
      emitir(s.slice(i, j + 1)); i = j + 1; continue;
    }
    if (s.startsWith("url(", i) && s[i + 4] !== '"' && s[i + 4] !== "'") {
      const j = s.indexOf(")", i);
      emitir(s.slice(i, j + 1)); i = j + 1; continue;
    }
    if (/\s/.test(c)) { hueco = true; i++; continue; }
    emitir(c); i++;
  }
  return out.trim() + "\n";
}

function minJS(s) {
  let out = "";
  let i = 0;
  const n = s.length;
  const ultimoSignificativo = () => { const m = out.match(/(\S)\s*$/); return m ? m[1] : ""; };
  const ultimaPalabra = () => { const m = out.match(/([A-Za-z_$]+)\s*$/); return m ? m[1] : ""; };
  while (i < n) {
    const c = s[i];
    if (c === "/" && s[i + 1] === "/") { while (i < n && s[i] !== "\n") i++; continue; }
    if (c === "/" && s[i + 1] === "*") {
      const j = s.indexOf("*/", i + 2);
      const bloque = s.slice(i, j < 0 ? n : j + 2);
      if (bloque.includes("\n")) out += "\n";
      i = j < 0 ? n : j + 2; continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < n && s[j] !== c) { if (s[j] === "\\") j++; j++; }
      out += s.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === "/") {
      const prev = ultimoSignificativo();
      const esRegex = prev === "" || "(,=:[!&|?{};+-*%<>~^".includes(prev) ||
        /^(return|typeof|case|do|else|in|of|new|delete|void|throw)$/.test(ultimaPalabra());
      if (esRegex) {
        let j = i + 1, clase = false;
        while (j < n) {
          if (s[j] === "\\") { j += 2; continue; }
          if (s[j] === "[") clase = true;
          else if (s[j] === "]") clase = false;
          else if (s[j] === "/" && !clase) break;
          j++;
        }
        j++;
        while (j < n && /[a-z]/i.test(s[j])) j++;
        out += s.slice(i, j); i = j; continue;
      }
    }
    out += c; i++;
  }
  return out.split("\n").map((l) => l.trim()).filter(Boolean).join("\n") + "\n";
}

function minHTML(s) {
  // Los bloques de datos para Google se compactan; los demás scripts y el
  // contenido de <textarea> y <pre> se dejan tal cual.
  const guardados = [];
  const guardar = (t) => { guardados.push(t); return "\u0000" + (guardados.length - 1) + "\u0000"; };
  s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, json, b) => guardar(a + JSON.stringify(JSON.parse(json)) + b));
  s = s.replace(/<(script|textarea|pre)\b[\s\S]*?<\/\1>/g, (m) => guardar(m));
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.split("\n").map((l) => l.trim()).filter(Boolean).join("\n") + "\n";
  return s.replace(/\u0000(\d+)\u0000/g, (m, k) => guardados[+k]);
}

/* --- Archivos que usa la web (imágenes, fuentes, vídeo, logotipos) ---------- */
function recursosUsados(textos) {
  const usados = new Set();
  for (const t of textos) {
    for (const m of t.matchAll(/assets\/[A-Za-z0-9_\-./]+?\.(?:webp|jpe?g|png|svg|gif|avif|ico|mp4|webm|woff2?)/g)) usados.add(m[0]);
  }
  return [...usados].filter((r) => fs.existsSync(path.join(ROOT, r))).sort();
}

/* --- Utilidades ----------------------------------------------------------- */
const leer = (r) => fs.readFileSync(path.join(ROOT, r));
const md5 = (b) => crypto.createHash("md5").update(b).digest("hex");
const kb = (n) => (n / 1024).toFixed(1).replace(".", ",") + " KB";
const gz = (b) => zlib.gzipSync(b, { level: 9 }).length;

function escribir(base, rel, datos) {
  const destino = path.join(base, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, datos);
}

async function publicado(rel, binario) {
  const url = DOMINIO + "/" + rel.replace(/^index\.html$/, "").replace(/(^|\/)index\.html$/, "$1");
  try {
    if (binario) {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok ? { tam: Number(r.headers.get("content-length")) } : null;
    }
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "comprobacion=" + Date.now());
    return r.ok ? { md5: md5(Buffer.from(await r.arrayBuffer())) } : null;
  } catch (e) {
    return null;
  }
}

/* --- Proceso -------------------------------------------------------------- */
(async () => {
  // 1. Catalán al día
  execFileSync(process.execPath, [path.join(__dirname, "version-catalana.js")], { stdio: "inherit" });

  // 2. Web completa y optimizada
  const salida = new Map();
  let antes = 0, despues = 0, antesGz = 0, despuesGz = 0;
  const optimizar = (rel, fn) => {
    const original = leer(rel);
    const nuevo = Buffer.from(fn(original.toString("utf8")), "utf8");
    antes += original.length; despues += nuevo.length;
    antesGz += gz(original); despuesGz += gz(nuevo);
    salida.set(rel, nuevo);
  };
  PAGINAS.forEach((r) => optimizar(r, minHTML));
  optimizar("styles.css", minCSS);
  optimizar("main.js", minJS);
  optimizar("lib/manifest.js", minJS);
  [...SERVIDOR, ...OTROS].forEach((r) => { if (fs.existsSync(path.join(ROOT, r))) salida.set(r, leer(r)); });

  // El JS optimizado tiene que seguir siendo JavaScript válido
  for (const r of ["main.js", "lib/manifest.js"]) new Function(salida.get(r).toString("utf8"));

  const textos = [...PAGINAS, ...CODIGO, ...SERVIDOR.filter((r) => r.endsWith(".php")), "sitemap.xml"].map((r) => leer(r).toString("utf8"));
  const recursos = recursosUsados(textos);
  recursos.forEach((r) => salida.set(r, leer(r)));

  fs.rmSync(COMPLETA, { recursive: true, force: true });
  for (const [rel, datos] of salida) escribir(COMPLETA, rel, datos);

  // 3. Solo lo que ha cambiado respecto a lo publicado
  fs.rmSync(SUBIDA, { recursive: true, force: true });
  const subir = [];
  const binario = (r) => /\.(webp|jpe?g|png|gif|avif|ico|mp4|webm|woff2?)$/.test(r);
  for (const [rel, datos] of salida) {
    if (rel === ".htaccess" && !CON_HTACCESS) continue;
    // Lo del servidor (PHP y la carpeta inc) no se puede descargar para
    // compararlo: va siempre. Pesa poco.
    if (rel.endsWith(".php") || rel.startsWith("inc/")) { subir.push(rel); continue; }
    const live = await publicado(rel, binario(rel));
    const igual = live && (binario(rel) ? live.tam === datos.length : live.md5 === md5(datos));
    if (!igual) subir.push(rel);
  }
  subir.forEach((rel) => escribir(SUBIDA, rel, salida.get(rel)));

  // Resumen
  console.log("\nOptimización del HTML, CSS y JS:");
  console.log("  sin comprimir: " + kb(antes) + " → " + kb(despues));
  console.log("  lo que descarga el navegador (comprimido): " + kb(antesGz) + " → " + kb(despuesGz) +
    " (" + Math.round((1 - despuesGz / antesGz) * 100) + " % menos)");
  console.log("\nWeb completa en " + COMPLETA + ": " + salida.size + " archivos.");
  console.log("\nPara subir (" + subir.length + " archivos) en " + SUBIDA + ":");
  subir.sort().forEach((r) => console.log("  " + r));
})().catch((e) => { console.error(e); process.exit(1); });

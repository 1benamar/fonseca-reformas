/* =============================================================================
   Genera las páginas de servicio (por ahora: obra-nueva/index.html).
   Uso:  node tools/paginas-servicio.js

   Cada página toma de index.html la cabecera, el menú, la franja de datos, el
   proceso, el formulario y el pie, así que todo lo que se cambie ahí (teléfono,
   menú, textos del formulario) llega solo a todas las páginas. Aquí va lo
   propio de cada servicio. Si index.html cambia de forma que no se encuentre
   alguna pieza, el script avisa y no escribe nada.

   Solo se afirma lo que la web ya dice y el cliente ha confirmado: nada de
   plazos, precios ni obras concretas inventadas.
============================================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const D = "https://reformasfonseca.com";
const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const tomar = (re, nombre) => {
  const m = home.match(re);
  if (!m) throw new Error("No encuentro " + nombre + " en index.html");
  return m[0];
};
const version = (home.match(/styles\.css\?v=(\d+)/) || [])[1];
if (!version) throw new Error("No encuentro la versión de styles.css en index.html");

// Enlaces de las piezas comunes: las secciones que solo están en la portada
// y los archivos de la web van desde la raíz, porque estas páginas viven en
// una carpeta. Proceso, preguntas y contacto están también aquí: se quedan.
const aRaiz = (html) => html
  .replace(/href="#(empresa|servicios|obras|reformas)"/g, 'href="/#$1"')
  .replace(/(\s(?:src|href|data-lupa)=")(assets\/|lib\/|styles\.css|main\.js|apple-touch-icon\.png|aviso-legal\.html|privacidad\.html)/g, "$1/$2");

const PIEZAS = {
  cabecera: aRaiz(tomar(/<header class="hdr" id="hdr">[\s\S]*?<\/header>/, "la cabecera")),
  menu: aRaiz(tomar(/<div class="menu" id="menu" hidden>[\s\S]*?\n<\/div>/, "el menú")),
  franja: tomar(/<section class="strip"[\s\S]*?<\/section>/, "la franja de datos"),
  proceso: tomar(/<section class="steps" id="proceso"[\s\S]*?<\/section>/, "el proceso"),
  contacto: aRaiz(tomar(/<section class="contact" id="contacto"[\s\S]*?<\/section>/, "el contacto")),
  pie: aRaiz(tomar(/<footer class="foot">[\s\S]*?<\/footer>/, "el pie")),
  lupa: tomar(/<div class="lupa" id="lupa" hidden>[\s\S]*?\n<\/div>/, "el visor de fotos"),
  wa: aRaiz(tomar(/<a class="wa" id="wa"[\s\S]*?<\/a>/, "el botón de WhatsApp"))
};
const empresa = JSON.parse(tomar(/<script type="application\/ld\+json">\n[\s\S]*?"GeneralContractor"[\s\S]*?\n<\/script>/, "los datos de la empresa")
  .replace(/^<script[^>]*>\n/, "").replace(/\n<\/script>$/, ""));

/** Una foto de la galería de la portada, por su archivo grande. */
const foto = (archivo, i) => aRaiz(tomar(new RegExp('<li class="gal__it"[^>]*>\\s*<button class="gal__btn" type="button" data-lupa="assets/img/' + archivo.replace(".", "\\.") + '"[\\s\\S]*?</li>'), "la foto " + archivo))
  .replace(/style="--i:\d+"/, 'style="--i:' + i + '"');

/** Preguntas de la portada, por su texto. */
const preguntas = (lista) => lista.map((q) => tomar(new RegExp('<details class="faq__it">\\s*<summary><h3 class="faq__q">' + q.replace(/[?¿]/g, "\\$&") + '</h3>[\\s\\S]*?</details>'), "la pregunta «" + q + "»")).join("\n        ");

const flecha = '<svg class="btn__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
const icono = {
  ampliar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M12 12.5v5M9.5 15h5"/></svg>',
  permiso: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14.5l2 2 4-4.5"/></svg>',
  persona: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0113 0"/></svg>'
};

/* --- Páginas ---------------------------------------------------------------- */
const PAGINAS = [{
  carpeta: "obra-nueva",
  titulo: "Construcción de casas y obra nueva en Tordera | Reformas F.S Fonseca",
  descripcion: "Construimos casas desde cero y ampliaciones en Tordera, Blanes, Lloret y Malgrat: del movimiento de tierras a la entrega llave en mano. Visita sin compromiso.",
  ogImagen: "/assets/img/s-obranueva.jpg",
  miga: "Obra nueva",
  opcion: "Construcción de obra nueva o ampliación",
  contactoEntrada: "Cuéntenos qué quiere construir y dónde está la parcela. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
  contactoEjemplo: "Por ejemplo: parcela en Tordera, queremos una casa de dos plantas con garaje.",
  servicio: {
    nombre: "Construcción de obra nueva y ampliaciones",
    tipo: "Construcción de casas",
    descripcion: "Casas de nueva construcción desde cero y ampliaciones: movimiento de tierras, cimentación, estructura, cerramientos, cubierta, instalaciones con boletín y acabados, con entrega llave en mano si el cliente lo prefiere."
  },
  cuerpo: (p) => `
<!-- ============================ CABECERA DE LA PÁGINA =============== -->
<section class="sub" aria-labelledby="sub-t">
  <div class="wrap sub__grid">
    <div class="sub__copy">
      <nav class="migas" aria-label="Ruta">
        <ol>
          <li><a href="/">Inicio</a></li>
          <li><a href="/#servicios">Servicios</a></li>
          <li><span aria-current="page">${p.miga}</span></li>
        </ol>
      </nav>
      <p class="kicker sub__k">Construcción</p>
      <h1 class="sub__t" id="sub-t">Construcción de obra nueva en Tordera y el Maresme</h1>
      <p class="sub__p">Construimos casas desde cero y ampliamos las que se han quedado pequeñas. Del movimiento de tierras a la entrega llave en mano, con la misma persona al frente de principio a fin.</p>
      <div class="sub__cta">
        <a class="btn btn--slate" href="#contacto"><span>Pida su visita</span>${flecha}</a>
        <a class="sub__tel" href="tel:+34613766476"><span>o llame al</span> <strong data-contact="tel-label">613 76 64 76</strong></a>
      </div>
    </div>
    <figure class="about__fig sub__fig">
      <div class="plate">
        <img class="sub__foto" src="/assets/img/s-obranueva-m.webp" alt="Solera de hormigón extendida en la planta baja de una obra nueva" width="1200" height="900" fetchpriority="high" decoding="async">
      </div>
      <span class="about__frame" aria-hidden="true"></span>
    </figure>
  </div>
</section>

${PIEZAS.franja}

<!-- ============================ FASES DE LA OBRA ==================== -->
<section class="fases" id="fases" aria-labelledby="fases-t">
  <div class="wrap fases__grid">
    <div class="fases__head">
      <p class="kicker" data-reveal="kicker">Qué hacemos</p>
      <h2 class="h2" id="fases-t" data-reveal="mask">De la parcela a la llave</h2>
      <p class="lede" data-reveal="up" data-d="1">Nos ocupamos de cada fase y coordinamos a todos los oficios, para que usted trate siempre con la misma persona.</p>
      <a class="more" href="#contacto" data-prefill="Construcción de obra nueva" data-reveal="up" data-d="2">Pedir presupuesto</a>
    </div>
    <ol class="fases__list" data-dibujo>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">01</span>
        <div><h3 class="fase__t">Parcela y movimiento de tierras</h3>
        <p>Desbroce, excavación y nivelación del terreno: la parcela queda limpia y lista para empezar.</p></div>
      </li>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">02</span>
        <div><h3 class="fase__t">Cimentación y solera</h3>
        <p>La base de la casa, en hormigón. Lo que no se ve y lo que lo sostiene todo.</p></div>
      </li>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">03</span>
        <div><h3 class="fase__t">Estructura</h3>
        <p>Pilares, vigas y forjados, planta a planta: el esqueleto de la casa.</p></div>
      </li>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">04</span>
        <div><h3 class="fase__t">Cerramientos y cubierta</h3>
        <p>Fachadas, cerramientos y cubierta. La casa queda cerrada y protegida.</p></div>
      </li>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">05</span>
        <div><h3 class="fase__t">Instalaciones con boletín</h3>
        <p>Luz, agua y gas con su boletín, certificadas y en regla desde el primer día.</p></div>
      </li>
      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">06</span>
        <div><h3 class="fase__t">Interiores y acabados</h3>
        <p>Tabiques y techos de pladur, aislamiento, suelos, pintura y armarios a medida. Si lo prefiere, se la entregamos llave en mano.</p></div>
      </li>
    </ol>
  </div>
</section>

<!-- ============================ FOTO A TODO EL ANCHO ================ -->
<section class="banda" aria-label="Movimiento de tierras en una parcela">
  <div class="banda__foto" aria-hidden="true">
    <img src="/assets/img/o-tierras.jpg" alt="" width="1400" height="933" loading="lazy" decoding="async">
  </div>
  <div class="wrap banda__in">
    <p class="banda__t" data-reveal="up">Cada casa empieza por el terreno.</p>
    <p class="banda__pie" data-reveal="up" data-d="1">Movimiento de tierras y desbroce de una parcela</p>
  </div>
</section>

<!-- ============================ ANTES DE EMPEZAR ==================== -->
<section class="notas" aria-labelledby="notas-t">
  <div class="wrap">
    <div class="notas__head">
      <p class="kicker" data-reveal="kicker">Antes de empezar</p>
      <h2 class="h2" id="notas-t" data-reveal="mask">Lo que conviene saber</h2>
    </div>
    <div class="stance__grid notas__grid">
      <article class="note" data-reveal="left">
        <span class="note__i" aria-hidden="true">${icono.ampliar}</span>
        <h3 class="note__t">Ampliaciones</h3>
        <p>Si la casa se ha quedado pequeña, la ampliamos: estructura, cerramientos, cubierta e instalaciones, bien unidos a lo que ya existe.</p>
      </article>
      <article class="note" data-reveal="up" data-d="1">
        <span class="note__i" aria-hidden="true">${icono.permiso}</span>
        <h3 class="note__t">Permisos y licencia</h3>
        <p>Una casa nueva necesita proyecto técnico y licencia del ayuntamiento. Le decimos qué hace falta en su caso y, si lo prefiere, hacemos los trámites nosotros.</p>
      </article>
      <article class="note" data-reveal="right" data-d="2">
        <span class="note__i" aria-hidden="true">${icono.persona}</span>
        <h3 class="note__t">Una obra, una persona</h3>
        <p>Quien le presupuesta la casa es quien dirige la obra y quien responde de ella, también cuando entran otros gremios.</p>
      </article>
    </div>
  </div>
</section>

<!-- ============================ A PIE DE OBRA ======================= -->
<section class="obras" aria-labelledby="obras-t">
  <div class="wrap">
    <p class="kicker" data-reveal="kicker">Obras</p>
    <h2 class="h2 obras__t" id="obras-t" data-reveal="mask">A pie de obra</h2>
    <p class="lede obras__lede" data-reveal="up" data-d="1">Fases de nuestras obras, fotografiadas mientras trabajamos. Pulse en cualquiera para verla en grande.</p>
    <ul class="gal gal--3">
      ${foto("o-maestreado.webp", 0)}
      ${foto("o-solado.webp", 1)}
      ${foto("o-perfileria.webp", 2)}
    </ul>
  </div>
</section>

${PIEZAS.proceso}

<!-- ============================ PREGUNTAS FRECUENTES ================ -->
<section class="faq" id="preguntas" aria-labelledby="faq-t">
  <div class="wrap faq__grid">
    <div class="faq__head">
      <p class="kicker" data-reveal="kicker">Dudas</p>
      <h2 class="h2" id="faq-t" data-reveal="mask">Preguntas frecuentes</h2>
      <p class="lede" data-reveal="up" data-d="1">Si su duda no está aquí, llámenos al <a href="tel:+34613766476" data-contact="tel">613 76 64 76</a> y se lo explicamos.</p>
    </div>
    <div class="faq__list" data-reveal="up" data-d="1">
        ${preguntas(["¿La visita y el presupuesto tienen coste?", "¿Qué incluye el presupuesto?", "¿Quién se encarga de los permisos y de los escombros?", "¿Con quién trato durante la obra?", "¿En qué poblaciones trabajan?"])}
    </div>
  </div>
</section>
`
}];

/* --- Montaje ---------------------------------------------------------------- */
function montar(p) {
  const url = D + "/" + p.carpeta + "/";
  const cambiar = (html, de, a, nombre) => {
    if (!html.includes(de)) throw new Error("No encuentro " + nombre + " en el contacto de index.html");
    return html.split(de).join(a);
  };

  let contacto = PIEZAS.contacto;
  contacto = cambiar(contacto, "<option>" + p.opcion + "</option>", "<option selected>" + p.opcion + "</option>", "la opción «" + p.opcion + "»");
  contacto = cambiar(contacto, "Cuéntenos en pocas líneas qué quiere hacer. Le llamamos para concertar la visita y, después, le entregamos el presupuesto.", p.contactoEntrada, "la entrada del contacto");
  contacto = cambiar(contacto, 'placeholder="Por ejemplo: piso de 75 m² en Blanes, queremos cambiar el baño y la cocina."', 'placeholder="' + p.contactoEjemplo + '"', "el ejemplo del mensaje");

  // Selector de idioma: el castellano apunta a esta página; el catalán, a la
  // portada en catalán mientras no haya versión de esta página.
  const idioma = (html) => html.replace(/<a href="\/" lang="es" hreflang="es" aria-current="page"/g, '<a href="/' + p.carpeta + '/" lang="es" hreflang="es" aria-current="page"');
  // En el menú de arriba se marca «Servicios», que es donde estamos
  const cabecera = idioma(PIEZAS.cabecera).replace('<a class="nav__a" href="/#servicios">', '<a class="nav__a is-active" href="/#servicios">');

  const datos = [{
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url + "#servicio",
    "name": p.servicio.nombre,
    "serviceType": p.servicio.tipo,
    "description": p.servicio.descripcion,
    "url": url,
    "image": D + p.ogImagen,
    "provider": {
      "@type": "GeneralContractor",
      "@id": empresa["@id"],
      "name": empresa.name,
      "url": empresa.url,
      "telephone": empresa.telephone,
      "address": empresa.address
    },
    "areaServed": empresa.areaServed
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": D + "/" },
      { "@type": "ListItem", "position": 2, "name": p.miga, "item": url }
    ]
  }];

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${p.titulo}</title>
<meta name="description" content="${p.descripcion}">
<meta name="theme-color" content="#0e161f">

<meta property="og:type" content="website">
<meta property="og:title" content="${p.titulo}">
<meta property="og:description" content="${p.descripcion}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${D + p.ogImagen}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<meta property="og:locale" content="es_ES">

<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/jost.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/noto-serif-display.woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${version}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">

${datos.map((d) => '<script type="application/ld+json">\n' + JSON.stringify(d, null, 2) + "\n</script>").join("\n")}
</head>
<body>

<a class="skip" href="#main">Saltar al contenido</a>

<!-- Cabecera, menú, franja, proceso, contacto y pie: copiados de index.html
     por tools/paginas-servicio.js. Para cambiarlos, cambie index.html y
     vuelva a generar esta página. -->
${cabecera}

${idioma(PIEZAS.menu)}

<main id="main">
<span id="top"></span>
<span class="sentinel" data-sentinel aria-hidden="true"></span>
${p.cuerpo(p)}
${contacto}
</main>

${idioma(PIEZAS.pie)}

${PIEZAS.lupa}

${PIEZAS.wa}

<script defer src="/lib/manifest.js?v=${version}"></script>
<script defer src="/main.js?v=${version}"></script>
</body>
</html>
`;
}

for (const p of PAGINAS) {
  const html = montar(p);
  [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)].forEach((m) => JSON.parse(m[1]));
  fs.mkdirSync(path.join(ROOT, p.carpeta), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p.carpeta, "index.html"), html);
  console.log(p.carpeta + "/index.html generada.");
}

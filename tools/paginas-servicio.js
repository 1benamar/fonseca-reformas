/* =============================================================================
   Genera las páginas de servicio en castellano y en catalán:
     obra-nueva/index.html  y  ca/obra-nova/index.html
   Uso:  node tools/paginas-servicio.js
   (Antes hay que tener ca/index.html al día: node tools/version-catalana.js)

   Cada página toma de su portada (index.html o ca/index.html) la cabecera, el
   menú, la franja de datos, el proceso, las preguntas, el formulario y el pie,
   así que lo que se cambie ahí llega solo a todas las páginas. Aquí va lo
   propio de cada servicio. Si una portada cambia de forma que no se encuentre
   alguna pieza, el script avisa y no escribe nada.

   Solo se afirma lo que la web ya dice y el cliente ha confirmado: nada de
   plazos, precios ni obras concretas inventadas.
============================================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const D = "https://reformasfonseca.com";

const flecha = '<svg class="btn__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
const icono = {
  ampliar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M12 12.5v5M9.5 15h5"/></svg>',
  permiso: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14.5l2 2 4-4.5"/></svg>',
  persona: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0113 0"/></svg>'
};

/* --- Piezas comunes de cada portada ---------------------------------------- */
function piezasDe(idioma) {
  const archivo = idioma === "ca" ? "ca/index.html" : "index.html";
  const raiz = idioma === "ca" ? "/ca/" : "/";
  const html = fs.readFileSync(path.join(ROOT, archivo), "utf8");
  const tomar = (re, nombre) => {
    const m = html.match(re);
    if (!m) throw new Error("No encuentro " + nombre + " en " + archivo);
    return m[0];
  };
  // Las secciones que solo están en la portada llevan a la portada; proceso,
  // preguntas y contacto están también en la página y se quedan. Los archivos
  // de la web van desde la raíz, porque estas páginas viven en una carpeta.
  const aRaiz = (t) => t
    .replace(/href="#(empresa|servicios|obras|reformas)"/g, 'href="' + raiz + '#$1"')
    .replace(/(\s(?:src|href|data-lupa)=")(?:\.\.\/)?(assets\/|lib\/|styles\.css|main\.js|apple-touch-icon\.png)/g, "$1/$2")
    .replace(/(\s(?:src|href|data-lupa)=")(aviso-legal\.html|privacidad\.html|avis-legal\.html|privacitat\.html)/g, "$1" + raiz + "$2");
  const version = (html.match(/styles\.css\?v=(\d+)/) || [])[1];
  if (!version) throw new Error("No encuentro la versión de styles.css en " + archivo);
  const empresa = JSON.parse(tomar(/<script type="application\/ld\+json">\n[\s\S]*?"GeneralContractor"[\s\S]*?\n<\/script>/, "los datos de la empresa")
    .replace(/^<script[^>]*>\n/, "").replace(/\n<\/script>$/, ""));
  return {
    idioma, raiz, version, empresa,
    saltar: tomar(/<a class="skip" href="#main">[^<]*<\/a>/, "el enlace de saltar"),
    cabecera: aRaiz(tomar(/<header class="hdr" id="hdr">[\s\S]*?<\/header>/, "la cabecera")),
    menu: aRaiz(tomar(/<div class="menu" id="menu" hidden>[\s\S]*?\n<\/div>/, "el menú")),
    franja: tomar(/<section class="strip"[\s\S]*?<\/section>/, "la franja de datos"),
    proceso: tomar(/<section class="steps" id="proceso"[\s\S]*?<\/section>/, "el proceso"),
    contacto: aRaiz(tomar(/<section class="contact" id="contacto"[\s\S]*?<\/section>/, "el contacto")),
    pie: aRaiz(tomar(/<footer class="foot">[\s\S]*?<\/footer>/, "el pie")),
    lupa: tomar(/<div class="lupa" id="lupa" hidden>[\s\S]*?\n<\/div>/, "el visor de fotos"),
    wa: aRaiz(tomar(/<a class="wa" id="wa"[\s\S]*?<\/a>/, "el botón de WhatsApp")),
    /** Una foto de la galería de la portada, por su archivo grande. */
    foto: (archivoFoto, i) => aRaiz(tomar(new RegExp('<li class="gal__it"[^>]*>\\s*<button class="gal__btn" type="button" data-lupa="(?:\\.\\./)?assets/img/' + archivoFoto.replace(".", "\\.") + '"[\\s\\S]*?</li>'), "la foto " + archivoFoto))
      .replace(/style="--i:\d+"/, 'style="--i:' + i + '"'),
    /** Preguntas de la portada, por su texto. */
    preguntas: (lista) => lista.map((q) => tomar(new RegExp('<details class="faq__it">\\s*<summary><h3 class="faq__q">' + q.replace(/[?¿]/g, "\\$&") + '</h3>[\\s\\S]*?</details>'), "la pregunta «" + q + "»")).join("\n        ")
  };
}

/* --- Obra nueva: los textos en los dos idiomas ------------------------------ */
const OBRA_NUEVA = {
  foto: { src: "/assets/img/s-obranueva-m.webp", ancho: 1200, alto: 900, og: "/assets/img/s-obranueva.jpg" },
  es: {
    carpeta: "obra-nueva",
    titulo: "Construcción de casas y obra nueva en Tordera | Reformas F.S Fonseca",
    descripcion: "Construimos casas desde cero y ampliaciones en Tordera, Blanes, Lloret y Malgrat: del movimiento de tierras a la entrega llave en mano. Visita sin compromiso.",
    inicio: "Inicio", servicios: "Servicios", miga: "Obra nueva", ruta: "Ruta",
    etiqueta: "Construcción",
    h1: "Construcción de obra nueva en Tordera y el Maresme",
    entrada: "Construimos casas desde cero y ampliamos las que se han quedado pequeñas. Del movimiento de tierras a la entrega llave en mano, con la misma persona al frente de principio a fin.",
    visita: "Pida su visita", llame: "o llame al",
    alt: "Solera de hormigón extendida en la planta baja de una obra nueva",
    fasesK: "Qué hacemos", fasesT: "De la parcela a la llave",
    fasesP: "Nos ocupamos de cada fase y coordinamos a todos los oficios, para que usted trate siempre con la misma persona.",
    pedir: "Pedir presupuesto", prefill: "Construcción de obra nueva",
    fases: [
      ["Parcela y movimiento de tierras", "Desbroce, excavación y nivelación del terreno: la parcela queda limpia y lista para empezar."],
      ["Cimentación y solera", "La base de la casa, en hormigón. Lo que no se ve y lo que lo sostiene todo."],
      ["Estructura", "Pilares, vigas y forjados, planta a planta: el esqueleto de la casa."],
      ["Cerramientos y cubierta", "Fachadas, cerramientos y cubierta. La casa queda cerrada y protegida."],
      ["Instalaciones con boletín", "Luz, agua y gas con su boletín, certificadas y en regla desde el primer día."],
      ["Interiores y acabados", "Tabiques y techos de pladur, aislamiento, suelos, pintura y armarios a medida. Si lo prefiere, se la entregamos llave en mano."]
    ],
    bandaAria: "Movimiento de tierras en una parcela", bandaT: "Cada casa empieza por el terreno.", bandaPie: "Movimiento de tierras y desbroce de una parcela",
    notasK: "Antes de empezar", notasT: "Lo que conviene saber",
    notas: [
      ["Ampliaciones", "Si la casa se ha quedado pequeña, la ampliamos: estructura, cerramientos, cubierta e instalaciones, bien unidos a lo que ya existe."],
      ["Permisos y licencia", "Una casa nueva necesita proyecto técnico y licencia del ayuntamiento. Le decimos qué hace falta en su caso y, si lo prefiere, hacemos los trámites nosotros."],
      ["Una obra, una persona", "Quien le presupuesta la casa es quien dirige la obra y quien responde de ella, también cuando entran otros gremios."]
    ],
    obrasK: "Obras", obrasT: "A pie de obra",
    obrasP: "Fases de nuestras obras, fotografiadas mientras trabajamos. Pulse en cualquiera para verla en grande.",
    faqK: "Dudas", faqT: "Preguntas frecuentes",
    faqP: (tel) => "Si su duda no está aquí, llámenos al " + tel + " y se lo explicamos.",
    faq: ["¿La visita y el presupuesto tienen coste?", "¿Qué incluye el presupuesto?", "¿Quién se encarga de los permisos y de los escombros?", "¿Con quién trato durante la obra?", "¿En qué poblaciones trabajan?"],
    opcion: "Construcción de obra nueva o ampliación",
    contactoAntes: "Cuéntenos en pocas líneas qué quiere hacer. Le llamamos para concertar la visita y, después, le entregamos el presupuesto.",
    contactoEntrada: "Cuéntenos qué quiere construir y dónde está la parcela. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
    ejemploAntes: "Por ejemplo: piso de 75 m² en Blanes, queremos cambiar el baño y la cocina.",
    ejemplo: "Por ejemplo: parcela en Tordera, queremos una casa de dos plantas con garaje.",
    servicio: {
      nombre: "Construcción de obra nueva y ampliaciones",
      tipo: "Construcción de casas",
      descripcion: "Casas de nueva construcción desde cero y ampliaciones: movimiento de tierras, cimentación, estructura, cerramientos, cubierta, instalaciones con boletín y acabados, con entrega llave en mano si el cliente lo prefiere."
    },
    locale: "es_ES"
  },
  ca: {
    carpeta: "ca/obra-nova",
    titulo: "Construcció de cases i obra nova a Tordera | Reformas F.S Fonseca",
    descripcion: "Construïm cases des de zero i ampliacions a Tordera, Blanes, Lloret i Malgrat: del moviment de terres al lliurament clau en mà. Visita sense compromís.",
    inicio: "Inici", servicios: "Serveis", miga: "Obra nova", ruta: "Ruta",
    etiqueta: "Construcció",
    h1: "Construcció d’obra nova a Tordera i el Maresme",
    entrada: "Construïm cases des de zero i ampliem les que s’han quedat petites. Del moviment de terres al lliurament clau en mà, amb la mateixa persona al capdavant de principi a fi.",
    visita: "Demani la visita", llame: "o truqui al",
    alt: "Solera de formigó estesa a la planta baixa d’una obra nova",
    fasesK: "Què fem", fasesT: "De la parcel·la a la clau",
    fasesP: "Ens ocupem de cada fase i coordinem tots els oficis, perquè vostè tracti sempre amb la mateixa persona.",
    pedir: "Demani pressupost", prefill: "Construcció d’obra nova",
    fases: [
      ["Parcel·la i moviment de terres", "Desbrossament, excavació i anivellament del terreny: la parcel·la queda neta i a punt per començar."],
      ["Fonaments i solera", "La base de la casa, de formigó. El que no es veu i el que ho sosté tot."],
      ["Estructura", "Pilars, bigues i forjats, planta a planta: l’esquelet de la casa."],
      ["Tancaments i coberta", "Façanes, tancaments i coberta. La casa queda tancada i protegida."],
      ["Instal·lacions amb butlletí", "Llum, aigua i gas amb el seu butlletí, certificades i en regla des del primer dia."],
      ["Interiors i acabats", "Envans i sostres de pladur, aïllament, terres, pintura i armaris a mida. Si ho prefereix, li la lliurem clau en mà."]
    ],
    bandaAria: "Moviment de terres en una parcel·la", bandaT: "Cada casa comença pel terreny.", bandaPie: "Moviment de terres i desbrossament d’una parcel·la",
    notasK: "Abans de començar", notasT: "El que convé saber",
    notas: [
      ["Ampliacions", "Si la casa s’ha quedat petita, l’ampliem: estructura, tancaments, coberta i instal·lacions, ben units al que ja hi ha."],
      ["Permisos i llicència", "Una casa nova necessita projecte tècnic i llicència de l’ajuntament. Li diem què cal en el seu cas i, si ho prefereix, fem els tràmits nosaltres."],
      ["Una obra, una persona", "Qui li pressuposta la casa és qui dirigeix l’obra i qui en respon, també quan hi entren altres gremis."]
    ],
    obrasK: "Obres", obrasT: "A peu d’obra",
    obrasP: "Fases de les nostres obres, fotografiades mentre treballem. Premi qualsevol per veure-la en gran.",
    faqK: "Dubtes", faqT: "Preguntes freqüents",
    faqP: (tel) => "Si el seu dubte no hi és, truqui’ns al " + tel + " i l’hi expliquem.",
    faq: ["La visita i el pressupost tenen cost?", "Què inclou el pressupost?", "Qui s’encarrega dels permisos i de la runa?", "Amb qui tracto durant l’obra?", "En quines poblacions treballen?"],
    opcion: "Construcció d’obra nova o ampliació",
    contactoAntes: "Expliqui’ns en poques línies què vol fer. Li truquem per concertar la visita i, després, li lliurem el pressupost.",
    contactoEntrada: "Expliqui’ns què vol construir i on és la parcel·la. Li truquem per concertar la visita i, després, li lliurem el pressupost per escrit.",
    ejemploAntes: "Per exemple: pis de 75 m² a Blanes, volem canviar el bany i la cuina.",
    ejemplo: "Per exemple: parcel·la a Tordera, volem una casa de dues plantes amb garatge.",
    servicio: {
      nombre: "Construcció d’obra nova i ampliacions",
      tipo: "Construcció de cases",
      descripcion: "Cases de nova construcció des de zero i ampliacions: moviment de terres, fonaments, estructura, tancaments, coberta, instal·lacions amb butlletí i acabats, amb lliurament clau en mà si el client ho prefereix."
    },
    locale: "ca_ES"
  }
};

/* --- Cuerpo de la página ---------------------------------------------------- */
function cuerpo(t, P) {
  const tel = '<a href="tel:+34613766476" data-contact="tel">613 76 64 76</a>';
  const iconos = [icono.ampliar, icono.permiso, icono.persona];
  const revelar = ["left", "up", "right"];
  return `
<!-- ============================ CABECERA DE LA PÁGINA =============== -->
<section class="sub" aria-labelledby="sub-t">
  <div class="wrap sub__grid">
    <div class="sub__copy">
      <nav class="migas" aria-label="${t.ruta}">
        <ol>
          <li><a href="${P.raiz}">${t.inicio}</a></li>
          <li><a href="${P.raiz}#servicios">${t.servicios}</a></li>
          <li><span aria-current="page">${t.miga}</span></li>
        </ol>
      </nav>
      <p class="kicker sub__k">${t.etiqueta}</p>
      <h1 class="sub__t" id="sub-t">${t.h1}</h1>
      <p class="sub__p">${t.entrada}</p>
      <div class="sub__cta">
        <a class="btn btn--slate" href="#contacto"><span>${t.visita}</span>${flecha}</a>
        <a class="sub__tel" href="tel:+34613766476"><span>${t.llame}</span> <strong data-contact="tel-label">613 76 64 76</strong></a>
      </div>
    </div>
    <figure class="about__fig sub__fig">
      <div class="plate">
        <img class="sub__foto" src="${OBRA_NUEVA.foto.src}" alt="${t.alt}" width="${OBRA_NUEVA.foto.ancho}" height="${OBRA_NUEVA.foto.alto}" fetchpriority="high" decoding="async">
      </div>
      <span class="about__frame" aria-hidden="true"></span>
    </figure>
  </div>
</section>

${P.franja}

<!-- ============================ FASES DE LA OBRA ==================== -->
<section class="fases" id="fases" aria-labelledby="fases-t">
  <div class="wrap fases__grid">
    <div class="fases__head">
      <p class="kicker" data-reveal="kicker">${t.fasesK}</p>
      <h2 class="h2" id="fases-t" data-reveal="mask">${t.fasesT}</h2>
      <p class="lede" data-reveal="up" data-d="1">${t.fasesP}</p>
      <a class="more" href="#contacto" data-prefill="${t.prefill}" data-reveal="up" data-d="2">${t.pedir}</a>
    </div>
    <ol class="fases__list" data-dibujo>
${t.fases.map(([titulo, texto], i) => `      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">0${i + 1}</span>
        <div><h3 class="fase__t">${titulo}</h3>
        <p>${texto}</p></div>
      </li>`).join("\n")}
    </ol>
  </div>
</section>

<!-- ============================ FOTO A TODO EL ANCHO ================ -->
<section class="banda" aria-label="${t.bandaAria}">
  <div class="banda__foto" aria-hidden="true">
    <img src="/assets/img/o-tierras.jpg" alt="" width="1400" height="933" loading="lazy" decoding="async">
  </div>
  <div class="wrap banda__in">
    <p class="banda__t" data-reveal="up">${t.bandaT}</p>
    <p class="banda__pie" data-reveal="up" data-d="1">${t.bandaPie}</p>
  </div>
</section>

<!-- ============================ ANTES DE EMPEZAR ==================== -->
<section class="notas" aria-labelledby="notas-t">
  <div class="wrap">
    <div class="notas__head">
      <p class="kicker" data-reveal="kicker">${t.notasK}</p>
      <h2 class="h2" id="notas-t" data-reveal="mask">${t.notasT}</h2>
    </div>
    <div class="stance__grid notas__grid">
${t.notas.map(([titulo, texto], i) => `      <article class="note" data-reveal="${revelar[i]}"${i ? ' data-d="' + i + '"' : ""}>
        <span class="note__i" aria-hidden="true">${iconos[i]}</span>
        <h3 class="note__t">${titulo}</h3>
        <p>${texto}</p>
      </article>`).join("\n")}
    </div>
  </div>
</section>

<!-- ============================ A PIE DE OBRA ======================= -->
<section class="obras" aria-labelledby="obras-t">
  <div class="wrap">
    <p class="kicker" data-reveal="kicker">${t.obrasK}</p>
    <h2 class="h2 obras__t" id="obras-t" data-reveal="mask">${t.obrasT}</h2>
    <p class="lede obras__lede" data-reveal="up" data-d="1">${t.obrasP}</p>
    <ul class="gal gal--3">
      ${P.foto("o-maestreado.webp", 0)}
      ${P.foto("o-solado.webp", 1)}
      ${P.foto("o-perfileria.webp", 2)}
    </ul>
  </div>
</section>

${P.proceso}

<!-- ============================ PREGUNTAS FRECUENTES ================ -->
<section class="faq" id="preguntas" aria-labelledby="faq-t">
  <div class="wrap faq__grid">
    <div class="faq__head">
      <p class="kicker" data-reveal="kicker">${t.faqK}</p>
      <h2 class="h2" id="faq-t" data-reveal="mask">${t.faqT}</h2>
      <p class="lede" data-reveal="up" data-d="1">${t.faqP(tel)}</p>
    </div>
    <div class="faq__list" data-reveal="up" data-d="1">
        ${P.preguntas(t.faq)}
    </div>
  </div>
</section>
`;
}

/* --- Montaje ---------------------------------------------------------------- */
function montar(servicio, idioma) {
  const t = servicio[idioma];
  const P = piezasDe(idioma);
  const url = D + "/" + t.carpeta + "/";
  const urlEs = D + "/" + servicio.es.carpeta + "/";
  const urlCa = D + "/" + servicio.ca.carpeta + "/";
  const cambiar = (html, de, a, nombre) => {
    if (!html.includes(de)) throw new Error("No encuentro " + nombre + " en el contacto (" + idioma + ")");
    return html.split(de).join(a);
  };

  let contacto = P.contacto;
  contacto = cambiar(contacto, "<option>" + t.opcion + "</option>", "<option selected>" + t.opcion + "</option>", "la opción «" + t.opcion + "»");
  contacto = cambiar(contacto, t.contactoAntes, t.contactoEntrada, "la entrada del contacto");
  contacto = cambiar(contacto, 'placeholder="' + t.ejemploAntes + '"', 'placeholder="' + t.ejemplo + '"', "el ejemplo del mensaje");

  // Selector de idioma: cada idioma lleva a esta misma página en ese idioma
  const idiomas = (html) => html
    .replace(/<a href="\/" lang="es" hreflang="es"/g, '<a href="/' + servicio.es.carpeta + '/" lang="es" hreflang="es"')
    .replace(/<a href="\/ca\/" lang="ca" hreflang="ca"/g, '<a href="/' + servicio.ca.carpeta + '/" lang="ca" hreflang="ca"');
  // En el menú de arriba se marca «Servicios», que es donde estamos
  const cabecera = idiomas(P.cabecera).replace('<a class="nav__a" href="' + P.raiz + '#servicios">', '<a class="nav__a is-active" href="' + P.raiz + '#servicios">');

  const datos = [{
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url + "#servicio",
    "name": t.servicio.nombre,
    "serviceType": t.servicio.tipo,
    "description": t.servicio.descripcion,
    "url": url,
    "image": D + servicio.foto.og,
    "provider": {
      "@type": "GeneralContractor",
      "@id": P.empresa["@id"],
      "name": P.empresa.name,
      "url": P.empresa.url,
      "telephone": P.empresa.telephone,
      "address": P.empresa.address
    },
    "areaServed": P.empresa.areaServed
  }, {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t.inicio, "item": D + P.raiz },
      { "@type": "ListItem", "position": 2, "name": t.miga, "item": url }
    ]
  }];

  return `<!DOCTYPE html>
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.titulo}</title>
<meta name="description" content="${t.descripcion}">
<meta name="theme-color" content="#0e161f">

<meta property="og:type" content="website">
<meta property="og:title" content="${t.titulo}">
<meta property="og:description" content="${t.descripcion}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${D + servicio.foto.og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es" href="${urlEs}">
<link rel="alternate" hreflang="ca" href="${urlCa}">
<link rel="alternate" hreflang="x-default" href="${urlEs}">
<meta property="og:locale" content="${t.locale}">

<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/jost.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/noto-serif-display.woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${P.version}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">

${datos.map((d) => '<script type="application/ld+json">\n' + JSON.stringify(d, null, 2) + "\n</script>").join("\n")}
</head>
<body>

${P.saltar}

<!-- Cabecera, menú, franja, proceso, preguntas, contacto y pie: copiados de
     la portada por tools/paginas-servicio.js. Para cambiarlos, cambie la
     portada y vuelva a generar esta página. -->
${cabecera}

${idiomas(P.menu)}

<main id="main">
<span id="top"></span>
<span class="sentinel" data-sentinel aria-hidden="true"></span>
${cuerpo(t, P)}
${contacto}
</main>

${idiomas(P.pie)}

${P.lupa}

${P.wa}

<script defer src="/lib/manifest.js?v=${P.version}"></script>
<script defer src="/main.js?v=${P.version}"></script>
</body>
</html>
`;
}

for (const idioma of ["es", "ca"]) {
  const html = montar(OBRA_NUEVA, idioma);
  [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)].forEach((m) => JSON.parse(m[1]));
  const destino = path.join(ROOT, OBRA_NUEVA[idioma].carpeta, "index.html");
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  console.log(OBRA_NUEVA[idioma].carpeta + "/index.html generada.");
}

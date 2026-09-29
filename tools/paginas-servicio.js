/* =============================================================================
   Genera las páginas de servicio, en castellano y en catalán:
     obra-nueva/            ca/obra-nova/
     reformas-integrales/   ca/reformes-integrals/
     pladur/                ca/pladur/
     suelos-albanileria/    ca/paviments-paleteria/
   Uso:  node tools/paginas-servicio.js
   (Antes hay que tener ca/index.html al día: node tools/version-catalana.js)

   Cada página toma de su portada (index.html o ca/index.html) la cabecera, el
   menú, la franja de datos, el proceso, el comparador, las fotos, el formulario
   y el pie, así que lo que se cambie ahí llega solo a todas. Aquí va lo propio
   de cada servicio. Si una portada cambia de forma que no se encuentre alguna
   pieza, el script avisa y no escribe nada.

   Solo se afirma lo que la web ya dice y el cliente ha confirmado: nada de
   plazos, precios ni obras concretas inventadas.
============================================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const D = "https://reformasfonseca.com";

const flecha = '<svg class="btn__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
const ICONO = {
  ampliar: '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M12 12.5v5M9.5 15h5"/>',
  permiso: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14.5l2 2 4-4.5"/>',
  persona: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0113 0"/>',
  tabique: '<path d="M4 4h16v16H4z"/><path d="M4 9.5h16M4 15h16M9 4v5.5M15 9.5V15M9 15v5"/>',
  techo: '<path d="M3 5h18"/><path d="M12 5v5"/><path d="M8.5 14a3.5 3.5 0 017 0z"/><path d="M12 17v1.5"/>',
  mueble: '<path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M9.5 16h5"/><path d="M9.5 8h5"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  gota: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 01-12 0c0-4.1 6-10.5 6-10.5z"/>',
  llave: '<path d="M14.5 6.5a4 4 0 00-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 005.2-5.2l-2.4 2.4-2.6-.6-.6-2.6z"/>',
  casa: '<path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M9.5 20v-5h5v5"/>',
  calendario: '<path d="M4 5.5h16V20H4z"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'
};
const icono = (n) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONO[n] + "</svg>";

/* --- Preguntas: el banco de las páginas de servicio ------------------------- */
const PREGUNTAS = {
  coste: {
    es: ["¿La visita y el presupuesto tienen coste?", "No. Vamos a ver la vivienda, escuchamos qué necesita y le entregamos el presupuesto por escrito, sin coste y sin compromiso."],
    ca: ["La visita i el pressupost tenen cost?", "No. Anem a veure l’habitatge, escoltem què necessita i li lliurem el pressupost per escrit, sense cost i sense compromís."]
  },
  presupuesto: {
    es: ["¿Qué incluye el presupuesto?", "Va por escrito y detallado, con los materiales y los plazos previstos. Así sabe desde el primer día qué se va a hacer y en qué orden."],
    ca: ["Què inclou el pressupost?", "Va per escrit i detallat, amb els materials i els terminis previstos. Així sap des del primer dia què es farà i en quin ordre."]
  },
  poblaciones: {
    es: ["¿En qué poblaciones trabajan?", "Trabajamos desde Tordera en el Maresme, la Selva y el área de Barcelona y Girona: Tordera, Blanes, Lloret de Mar, Malgrat de Mar, Palafolls, Pineda de Mar, Calella, Mataró, Girona y Barcelona. Si su población no está en la lista, pregúntenos."],
    ca: ["En quines poblacions treballen?", "Treballem des de Tordera al Maresme, la Selva i l’àrea de Barcelona i Girona: Tordera, Blanes, Lloret de Mar, Malgrat de Mar, Palafolls, Pineda de Mar, Calella, Mataró, Girona i Barcelona. Si la seva població no és a la llista, pregunti’ns."]
  },
  pequenos: {
    es: ["¿Hacen también trabajos pequeños o un solo oficio?", "Sí. Tanto una obra completa como un solo oficio: pintura, pladur, albañilería, bajantes o una reparación que conviene hacer bien y de una vez."],
    ca: ["També fan feines petites o un sol ofici?", "Sí. Tant una obra completa com un sol ofici: pintura, pladur, paleteria, baixants o una reparació que convé fer bé i d’una vegada."]
  },
  vivir: {
    es: ["¿Puedo seguir viviendo en casa durante la obra?", "Sí, trabajamos también en viviendas habitadas. Protegemos suelos, muebles y accesos antes de mover nada y dejamos la casa recogida al terminar cada jornada."],
    ca: ["Puc continuar vivint a casa durant l’obra?", "Sí, també treballem en habitatges habitats. Protegim terres, mobles i accessos abans de moure res i deixem la casa endreçada en acabar cada jornada."]
  },
  permisos: {
    es: ["¿Quién se encarga de los permisos y de los escombros?", "Le decimos qué permisos hacen falta y, si lo prefiere, los tramitamos nosotros. El contenedor, la carga y la retirada de escombros van incluidos en el presupuesto."],
    ca: ["Qui s’encarrega dels permisos i de la runa?", "Li diem quins permisos calen i, si ho prefereix, els tramitem nosaltres. El contenidor, la càrrega i la retirada de la runa van inclosos al pressupost."]
  },
  trato: {
    es: ["¿Con quién trato durante la obra?", "Con la misma persona de principio a fin: quien le presupuesta la reforma es quien la dirige y quien responde, también cuando entran otros gremios. Si lo prefiere, le entregamos la obra llave en mano."],
    ca: ["Amb qui tracto durant l’obra?", "Amb la mateixa persona de principi a fi: qui li pressuposta la reforma és qui la dirigeix i qui en respon, també quan entren altres gremis. Si ho prefereix, li lliurem l’obra clau en mà."]
  }
};

/* --- Textos que se repiten en todas las páginas de servicio ----------------- */
const COMUN = {
  es: {
    inicio: "Inicio", servicios: "Servicios", ruta: "Ruta", visita: "Pida su visita", llame: "o llame al",
    pedir: "Pedir presupuesto",
    obrasK: "Obras", obrasT: "A pie de obra",
    obrasP: "Fotografiadas mientras trabajamos. Pulse en cualquiera para verla en grande.",
    faqK: "Dudas", faqT: "Preguntas frecuentes",
    faqP: (tel) => "Si su duda no está aquí, llámenos al " + tel + " y se lo explicamos.",
    contactoAntes: "Cuéntenos en pocas líneas qué quiere hacer. Le llamamos para concertar la visita y, después, le entregamos el presupuesto.",
    ejemploAntes: "Por ejemplo: piso de 75 m² en Blanes, queremos cambiar el baño y la cocina.",
    locale: "es_ES"
  },
  ca: {
    inicio: "Inici", servicios: "Serveis", ruta: "Ruta", visita: "Demani la visita", llame: "o truqui al",
    pedir: "Demani pressupost",
    obrasK: "Obres", obrasT: "A peu d’obra",
    obrasP: "Fotografiades mentre treballem. Premi qualsevol per veure-la en gran.",
    faqK: "Dubtes", faqT: "Preguntes freqüents",
    faqP: (tel) => "Si el seu dubte no hi és, truqui’ns al " + tel + " i l’hi expliquem.",
    contactoAntes: "Expliqui’ns en poques línies què vol fer. Li truquem per concertar la visita i, després, li lliurem el pressupost.",
    ejemploAntes: "Per exemple: pis de 75 m² a Blanes, volem canviar el bany i la cuina.",
    locale: "ca_ES"
  }
};

/* --- Servicios --------------------------------------------------------------- */
const SERVICIOS = [
  {
    foto: { src: "/assets/img/s-obranueva-m.webp", ancho: 1200, alto: 900, og: "/assets/img/s-obranueva.jpg" },
    banda: { src: "/assets/img/o-tierras.jpg", ancho: 1400, alto: 933, clase: "banda--tierras" },
    galeria: ["o-maestreado.webp", "o-solado.webp", "o-perfileria.webp"],
    iconos: ["ampliar", "permiso", "persona"],
    faq: ["coste", "presupuesto", "permisos", "trato", "poblaciones"],
    es: {
      carpeta: "obra-nueva",
      titulo: "Construcción de casas y obra nueva en Tordera | Reformas F.S Fonseca",
      descripcion: "Construimos casas desde cero y ampliaciones en Tordera, Blanes, Lloret y Malgrat: del movimiento de tierras a la entrega llave en mano. Visita sin compromiso.",
      miga: "Obra nueva", etiqueta: "Construcción",
      h1: "Construcción de obra nueva en Tordera y el Maresme",
      entrada: "Construimos casas desde cero y ampliamos las que se han quedado pequeñas. Del movimiento de tierras a la entrega llave en mano, con la misma persona al frente de principio a fin.",
      alt: "Solera de hormigón extendida en la planta baja de una obra nueva",
      fasesK: "Qué hacemos", fasesT: "De la parcela a la llave",
      fasesP: "Nos ocupamos de cada fase y coordinamos a todos los oficios, para que usted trate siempre con la misma persona.",
      prefill: "Construcción de obra nueva",
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
      opcion: "Construcción de obra nueva o ampliación",
      contactoEntrada: "Cuéntenos qué quiere construir y dónde está la parcela. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
      ejemplo: "Por ejemplo: parcela en Tordera, queremos una casa de dos plantas con garaje.",
      servicio: { nombre: "Construcción de obra nueva y ampliaciones", tipo: "Construcción de casas", descripcion: "Casas de nueva construcción desde cero y ampliaciones: movimiento de tierras, cimentación, estructura, cerramientos, cubierta, instalaciones con boletín y acabados, con entrega llave en mano si el cliente lo prefiere." }
    },
    ca: {
      carpeta: "ca/obra-nova",
      titulo: "Construcció de cases i obra nova a Tordera | Reformas F.S Fonseca",
      descripcion: "Construïm cases des de zero i ampliacions a Tordera, Blanes, Lloret i Malgrat: del moviment de terres al lliurament clau en mà. Visita sense compromís.",
      miga: "Obra nova", etiqueta: "Construcció",
      h1: "Construcció d’obra nova a Tordera i el Maresme",
      entrada: "Construïm cases des de zero i ampliem les que s’han quedat petites. Del moviment de terres al lliurament clau en mà, amb la mateixa persona al capdavant de principi a fi.",
      alt: "Solera de formigó estesa a la planta baixa d’una obra nova",
      fasesK: "Què fem", fasesT: "De la parcel·la a la clau",
      fasesP: "Ens ocupem de cada fase i coordinem tots els oficis, perquè vostè tracti sempre amb la mateixa persona.",
      prefill: "Construcció d’obra nova",
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
      opcion: "Construcció d’obra nova o ampliació",
      contactoEntrada: "Expliqui’ns què vol construir i on és la parcel·la. Li truquem per concertar la visita i, després, li lliurem el pressupost per escrit.",
      ejemplo: "Per exemple: parcel·la a Tordera, volem una casa de dues plantes amb garatge.",
      servicio: { nombre: "Construcció d’obra nova i ampliacions", tipo: "Construcció de cases", descripcion: "Cases de nova construcció des de zero i ampliacions: moviment de terres, fonaments, estructura, tancaments, coberta, instal·lacions amb butlletí i acabats, amb lliurament clau en mà si el client ho prefereix." }
    }
  },

  {
    foto: { src: "/assets/img/s-integral.jpg", ancho: 1200, alto: 900, og: "/assets/img/s-integral.jpg" },
    banda: { src: "/assets/img/o-aislamiento.jpg", ancho: 1200, alto: 900 },
    galeria: ["o-tabique.webp", "o-cinta.webp", "o-hidrofuga.webp"],
    iconos: ["casa", "permiso", "calendario"],
    faq: ["coste", "presupuesto", "vivir", "permisos", "trato"],
    es: {
      carpeta: "reformas-integrales",
      titulo: "Reformas integrales de pisos y casas en Tordera | Reformas F.S Fonseca",
      descripcion: "Reformas integrales en Tordera, Blanes, Lloret y Malgrat: nueva distribución, instalaciones con boletín y acabados, con una sola persona al frente. Visita sin compromiso.",
      miga: "Reformas integrales", etiqueta: "Reforma integral",
      h1: "Reformas integrales en Tordera y el Maresme",
      entrada: "Pisos con la instalación original y casas que piden otra distribución: los renovamos de arriba abajo y le entregamos la vivienda limpia y lista para entrar a vivir.",
      alt: "Planta diáfana con tabiquería y falso techo de pladur terminados",
      fasesK: "Qué incluye", fasesT: "Toda la casa, en orden",
      fasesP: "Una reforma integral reúne muchos oficios. Los coordinamos en el orden correcto, para que nadie tenga que deshacer lo que hizo otro.",
      prefill: "Reforma integral",
      fases: [
        ["Derribos y escombros", "Retiramos lo que no sirve y nos llevamos los escombros: contenedor, carga y retirada incluidos."],
        ["Nueva distribución", "Tabiques nuevos donde hacen falta y fuera los que sobran, para que la casa funcione como usted quiere."],
        ["Instalaciones con boletín", "Luz, agua y gas nuevas, con su boletín, certificadas y en regla."],
        ["Suelos y alicatados", "Suelos nuevos y alicatado de baño y cocina."],
        ["Techos y aislamiento", "Falsos techos, luz empotrada y aislamiento donde conviene."],
        ["Pintura y entrega", "Pintura, repasos con usted y la casa entregada limpia y recogida."]
      ],
      bandaAria: "Aislamiento de lana de roca en un tabique", bandaT: "Lo que no se ve, también bien hecho.", bandaPie: "Aislamiento de lana de roca antes de cerrar",
      notasK: "Mientras dura la obra", notasT: "Sin sorpresas",
      notas: [
        ["Con la casa habitada", "Protegemos suelos, muebles y accesos antes de mover nada y dejamos todo recogido al terminar cada jornada."],
        ["Permisos resueltos", "Le decimos cuáles hacen falta y, si lo prefiere, los tramitamos nosotros."],
        ["Un calendario, no una promesa", "Sabe qué semana entra cada gremio y cuándo recupera la casa."]
      ],
      opcion: "Reforma integral",
      contactoEntrada: "Cuéntenos cómo es la vivienda y qué le gustaría cambiar. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
      ejemplo: "Por ejemplo: piso de 80 m² en Malgrat, queremos redistribuir y cambiar las instalaciones.",
      servicio: { nombre: "Reformas integrales", tipo: "Reforma integral de vivienda", descripcion: "Reformas integrales de pisos y casas: derribos y escombros, nueva distribución, instalaciones con boletín, suelos y alicatados, techos, aislamiento y pintura, con entrega llave en mano." }
    },
    ca: {
      carpeta: "ca/reformes-integrals",
      titulo: "Reformes integrals de pisos i cases a Tordera | Reformas F.S Fonseca",
      descripcion: "Reformes integrals a Tordera, Blanes, Lloret i Malgrat: nova distribució, instal·lacions amb butlletí i acabats, amb una sola persona al capdavant. Visita sense compromís.",
      miga: "Reformes integrals", etiqueta: "Reforma integral",
      h1: "Reformes integrals a Tordera i el Maresme",
      entrada: "Pisos amb la instal·lació original i cases que demanen una altra distribució: els renovem de dalt a baix i li lliurem l’habitatge net i a punt per entrar-hi a viure.",
      alt: "Planta diàfana amb envans i fals sostre de pladur acabats",
      fasesK: "Què inclou", fasesT: "Tota la casa, en ordre",
      fasesP: "Una reforma integral aplega molts oficis. Els coordinem en l’ordre correcte, perquè ningú no hagi de desfer el que ha fet un altre.",
      prefill: "Reforma integral",
      fases: [
        ["Enderrocs i runa", "Retirem el que no serveix i ens emportem la runa: contenidor, càrrega i retirada inclosos."],
        ["Nova distribució", "Envans nous on calen i fora els que sobren, perquè la casa funcioni com vostè vol."],
        ["Instal·lacions amb butlletí", "Llum, aigua i gas noves, amb el seu butlletí, certificades i en regla."],
        ["Terres i enrajolats", "Terres nous i enrajolat del bany i la cuina."],
        ["Sostres i aïllament", "Falsos sostres, llum encastada i aïllament on convé."],
        ["Pintura i lliurament", "Pintura, repassos amb vostè i la casa lliurada neta i endreçada."]
      ],
      bandaAria: "Aïllament de llana de roca en un envà", bandaT: "El que no es veu, també ben fet.", bandaPie: "Aïllament de llana de roca abans de tancar",
      notasK: "Mentre dura l’obra", notasT: "Sense sorpreses",
      notas: [
        ["Amb la casa habitada", "Protegim terres, mobles i accessos abans de moure res i ho deixem tot endreçat en acabar cada jornada."],
        ["Permisos resolts", "Li diem quins calen i, si ho prefereix, els tramitem nosaltres."],
        ["Un calendari, no una promesa", "Sap quina setmana entra cada gremi i quan recupera la casa."]
      ],
      opcion: "Reforma integral",
      contactoEntrada: "Expliqui’ns com és l’habitatge i què li agradaria canviar. Li truquem per concertar la visita i, després, li lliurem el pressupost per escrit.",
      ejemplo: "Per exemple: pis de 80 m² a Malgrat, volem redistribuir i canviar les instal·lacions.",
      servicio: { nombre: "Reformes integrals", tipo: "Reforma integral d’habitatge", descripcion: "Reformes integrals de pisos i cases: enderrocs i runa, nova distribució, instal·lacions amb butlletí, terres i enrajolats, sostres, aïllament i pintura, amb lliurament clau en mà." }
    }
  },

  {
    foto: { src: "/assets/img/o-tabique.webp", ancho: 1200, alto: 900, og: "/assets/img/o-tabique.jpg" },
    comparador: true,
    galeria: ["o-cinta.webp", "o-aislamiento.jpg", "o-hidrofuga.webp"],
    iconos: ["tabique", "techo", "mueble"],
    faq: ["coste", "presupuesto", "pequenos", "vivir", "poblaciones"],
    es: {
      carpeta: "pladur",
      titulo: "Pladur y falsos techos en Tordera y el Maresme | Reformas F.S Fonseca",
      descripcion: "Tabiques, falsos techos, muebles a medida y aislamiento de pladur en Tordera, Blanes, Lloret y Malgrat. De la perfilería al acabado pintado. Visita sin compromiso.",
      miga: "Pladur y techos", etiqueta: "Pladur",
      h1: "Pladur y falsos techos en Tordera y el Maresme",
      entrada: "Tabiques, falsos techos, muebles a medida y aislamiento. Montamos la perfilería, cerramos con placa, tratamos las juntas y lo dejamos pintado, con la misma persona al frente de principio a fin.",
      alt: "Tabique de pladur acabado, pintado y con dos puertas montadas",
      fasesK: "Cómo lo montamos", fasesT: "De la perfilería a la pintura",
      fasesP: "Lo que queda dentro de la pared no se ve, pero es lo que más cuenta. Por eso cuidamos cada paso.",
      prefill: "Pladur",
      fases: [
        ["Perfilería y cercos", "Marcamos dónde va cada tabique y montamos la estructura metálica, con los cercos de las puertas ya en su sitio."],
        ["Aislamiento", "Antes de cerrar, lana de roca entre los montantes: aísla del ruido y de la temperatura."],
        ["Instalaciones", "Si hace falta, pasamos por dentro la luz y el agua, con su boletín."],
        ["Placa", "Cerramos con placa de yeso. En baños y cocinas, placa hidrófuga, preparada para la humedad."],
        ["Juntas y alisado", "Encintamos las juntas y alisamos hasta que no se nota dónde acaba una placa y empieza la otra."],
        ["Pintura", "Lo dejamos pintado y listo, con todo lo demás protegido."]
      ],
      cmpK: "Antes y después", cmpT: "De la placa vista al acabado",
      cmpP: "Un mueble de salón levantado en pladur. Arrastre la línea para comparar.",
      notasK: "Qué se puede hacer", notasT: "Tres usos habituales",
      notas: [
        ["Tabiques", "Para dividir o redistribuir: nuevas habitaciones, vestidores o cierres, con las puertas ya montadas."],
        ["Falsos techos", "Para esconder instalaciones, bajar la altura o empotrar la luz."],
        ["Muebles a medida", "Muebles de salón, hornacinas para la televisión y baldas, hechos en obra y pintados como la pared."]
      ],
      opcion: "Pladur y techos",
      contactoEntrada: "Cuéntenos qué quiere hacer y en qué estancia. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
      ejemplo: "Por ejemplo: falso techo en el salón con luz empotrada y un mueble para la televisión.",
      servicio: { nombre: "Pladur y falsos techos", tipo: "Montaje de pladur", descripcion: "Tabiques, falsos techos, muebles a medida y aislamiento de pladur: perfilería, aislamiento, placa, tratamiento de juntas y pintura." }
    },
    ca: {
      carpeta: "ca/pladur",
      titulo: "Pladur i falsos sostres a Tordera i el Maresme | Reformas F.S Fonseca",
      descripcion: "Envans, falsos sostres, mobles a mida i aïllament de pladur a Tordera, Blanes, Lloret i Malgrat. De la perfileria a l’acabat pintat. Visita sense compromís.",
      miga: "Pladur i sostres", etiqueta: "Pladur",
      h1: "Pladur i falsos sostres a Tordera i el Maresme",
      entrada: "Envans, falsos sostres, mobles a mida i aïllament. Muntem la perfileria, tanquem amb placa, tractem les juntes i ho deixem pintat, amb la mateixa persona al capdavant de principi a fi.",
      alt: "Envà de pladur acabat, pintat i amb dues portes muntades",
      fasesK: "Com el muntem", fasesT: "De la perfileria a la pintura",
      fasesP: "El que queda dins la paret no es veu, però és el que més compta. Per això cuidem cada pas.",
      prefill: "Pladur",
      fases: [
        ["Perfileria i bastiments", "Marquem on va cada envà i muntem l’estructura metàl·lica, amb els bastiments de les portes ja al seu lloc."],
        ["Aïllament", "Abans de tancar, llana de roca entre els muntants: aïlla del soroll i de la temperatura."],
        ["Instal·lacions", "Si cal, hi passem per dins la llum i l’aigua, amb el seu butlletí."],
        ["Placa", "Tanquem amb placa de guix. Als banys i a les cuines, placa hidròfuga, preparada per a la humitat."],
        ["Juntes i allisat", "Encintem les juntes i allisem fins que no es nota on acaba una placa i on comença l’altra."],
        ["Pintura", "Ho deixem pintat i a punt, amb tota la resta protegit."]
      ],
      cmpK: "Abans i després", cmpT: "De la placa vista a l’acabat",
      cmpP: "Un moble de sala aixecat en pladur. Arrossegui la línia per comparar.",
      notasK: "Què s’hi pot fer", notasT: "Tres usos habituals",
      notas: [
        ["Envans", "Per dividir o redistribuir: habitacions noves, vestidors o tancaments, amb les portes ja muntades."],
        ["Falsos sostres", "Per amagar instal·lacions, abaixar l’alçada o encastar la llum."],
        ["Mobles a mida", "Mobles de sala, fornícules per a la televisió i prestatges, fets en obra i pintats com la paret."]
      ],
      opcion: "Pladur i sostres",
      contactoEntrada: "Expliqui’ns què vol fer i en quina estança. Li truquem per concertar la visita i, després, li lliurem el pressupost per escrit.",
      ejemplo: "Per exemple: fals sostre a la sala amb llum encastada i un moble per a la televisió.",
      servicio: { nombre: "Pladur i falsos sostres", tipo: "Muntatge de pladur", descripcion: "Envans, falsos sostres, mobles a mida i aïllament de pladur: perfileria, aïllament, placa, tractament de juntes i pintura." }
    }
  },

  {
    foto: { src: "/assets/img/s-suelos.jpg", ancho: 1200, alto: 900, og: "/assets/img/s-suelos.jpg" },
    banda: { src: "/assets/img/o-gres.jpg", ancho: 1000, alto: 1250, pos: "50% 62%" },
    galeria: ["o-maestreado.webp", "o-solado.webp"],
    iconos: ["sol", "gota", "llave"],
    faq: ["coste", "presupuesto", "pequenos", "vivir", "poblaciones"],
    es: {
      carpeta: "suelos-albanileria",
      titulo: "Suelos, terrazas y albañilería en Tordera | Reformas F.S Fonseca",
      descripcion: "Suelos, porches y terrazas, humedades y reparaciones de albañilería en Tordera, Blanes, Lloret y Malgrat, bien hechas y de una sola vez. Visita sin compromiso.",
      miga: "Suelos y albañilería", etiqueta: "Albañilería",
      h1: "Suelos, terrazas y albañilería en Tordera y el Maresme",
      entrada: "Suelos nuevos, porches y terrazas, humedades y reparaciones que conviene hacer bien y de una sola vez. Preparamos la base como es debido, porque de ella depende todo lo que va encima.",
      alt: "Porche exterior solado con gres imitación piedra",
      fasesK: "Cómo lo hacemos", fasesT: "Un buen suelo empieza por debajo",
      fasesP: "Lo que se pisa depende de lo que queda debajo. Por eso cuidamos cada capa, aunque luego no se vea.",
      prefill: "Suelos",
      fases: [
        ["Retirada y preparación", "Si hace falta, retiramos el suelo viejo y dejamos la base limpia y sana."],
        ["Maestreado", "Tiramos maestras de mortero para dejar el suelo a nivel antes de solar."],
        ["Colocación", "Gres con sistema de nivelación, para que las piezas queden a ras y sin cejas."],
        ["Juntas y limpieza", "Rejuntado, remates y el suelo limpio al terminar."]
      ],
      bandaAria: "Colocación de gres en un porche", bandaT: "También en porches y terrazas.", bandaPie: "Colocación de gres en un porche exterior",
      notasK: "Además", notasT: "Lo que también hacemos",
      notas: [
        ["Terrazas y exteriores", "Porches, terrazas y exteriores, con el material adecuado para estar a la intemperie."],
        ["Humedades", "Buscamos de dónde viene la humedad y la resolvemos antes de volver a revestir."],
        ["Pequeñas reparaciones", "Una reparación que conviene hacer bien y de una vez, aunque sea pequeña."]
      ],
      opcion: "Suelos y solados",
      contactoEntrada: "Cuéntenos qué suelo, terraza o reparación tiene en mente. Le llamamos para concertar la visita y, después, le entregamos el presupuesto por escrito.",
      ejemplo: "Por ejemplo: porche de 30 m² en Blanes, queremos cambiar el suelo.",
      servicio: { nombre: "Suelos, terrazas y albañilería", tipo: "Albañilería", descripcion: "Solados, porches y terrazas, humedades y reparaciones de albañilería: preparación de la base, maestreado, colocación con sistema de nivelación y remates." }
    },
    ca: {
      carpeta: "ca/paviments-paleteria",
      titulo: "Paviments, terrasses i paleteria a Tordera | Reformas F.S Fonseca",
      descripcion: "Paviments, porxos i terrasses, humitats i reparacions de paleteria a Tordera, Blanes, Lloret i Malgrat, ben fetes i d’una sola vegada. Visita sense compromís.",
      miga: "Paviments i paleteria", etiqueta: "Paleteria",
      h1: "Paviments, terrasses i paleteria a Tordera i el Maresme",
      entrada: "Terres nous, porxos i terrasses, humitats i reparacions que convé fer bé i d’una sola vegada. Preparem la base com cal, perquè d’ella depèn tot el que hi va a sobre.",
      alt: "Porxo exterior pavimentat amb gres imitació pedra",
      fasesK: "Com ho fem", fasesT: "Un bon terra comença per sota",
      fasesP: "El que es trepitja depèn del que queda a sota. Per això cuidem cada capa, encara que després no es vegi.",
      prefill: "Terres",
      fases: [
        ["Retirada i preparació", "Si cal, retirem el terra vell i deixem la base neta i sana."],
        ["Mestrejat", "Estenem mestres de morter per deixar el terra a nivell abans de pavimentar."],
        ["Col·locació", "Gres amb sistema d’anivellament, perquè les peces quedin a ras i sense esglaons."],
        ["Juntes i neteja", "Rejuntat, remats i el terra net en acabar."]
      ],
      bandaAria: "Col·locació de gres en un porxo", bandaT: "També en porxos i terrasses.", bandaPie: "Col·locació de gres en un porxo exterior",
      notasK: "A més", notasT: "El que també fem",
      notas: [
        ["Terrasses i exteriors", "Porxos, terrasses i exteriors, amb el material adequat per estar a la intempèrie."],
        ["Humitats", "Busquem d’on ve la humitat i la resolem abans de tornar a revestir."],
        ["Petites reparacions", "Una reparació que convé fer bé i d’una vegada, encara que sigui petita."]
      ],
      opcion: "Terres i paviments",
      contactoEntrada: "Expliqui’ns quin terra, terrassa o reparació té al cap. Li truquem per concertar la visita i, després, li lliurem el pressupost per escrit.",
      ejemplo: "Per exemple: porxo de 30 m² a Blanes, volem canviar el terra.",
      servicio: { nombre: "Paviments, terrasses i paleteria", tipo: "Paleteria", descripcion: "Paviments, porxos i terrasses, humitats i reparacions de paleteria: preparació de la base, mestrejat, col·locació amb sistema d’anivellament i remats." }
    }
  }
];

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
  const empresa = JSON.parse([...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)]
    .map((m) => m[1]).find((j) => j.includes('"GeneralContractor"')));
  return {
    idioma, raiz, version, empresa,
    saltar: tomar(/<a class="skip" href="#main">[^<]*<\/a>/, "el enlace de saltar"),
    cabecera: aRaiz(tomar(/<header class="hdr" id="hdr">[\s\S]*?<\/header>/, "la cabecera")),
    menu: aRaiz(tomar(/<div class="menu" id="menu" hidden>[\s\S]*?\n<\/div>/, "el menú")),
    franja: tomar(/<section class="strip"[\s\S]*?<\/section>/, "la franja de datos"),
    proceso: tomar(/<section class="steps" id="proceso"[\s\S]*?<\/section>/, "el proceso"),
    comparador: aRaiz(tomar(/<figure class="cmp"[\s\S]*?<\/figure>/, "el comparador")),
    contacto: aRaiz(tomar(/<section class="contact" id="contacto"[\s\S]*?<\/section>/, "el contacto")),
    pie: aRaiz(tomar(/<footer class="foot">[\s\S]*?<\/footer>/, "el pie")),
    lupa: tomar(/<div class="lupa" id="lupa" hidden>[\s\S]*?\n<\/div>/, "el visor de fotos"),
    wa: aRaiz(tomar(/<a class="wa" id="wa"[\s\S]*?<\/a>/, "el botón de WhatsApp")),
    /** Una foto de la galería de la portada, por su archivo grande. */
    foto: (archivoFoto, i) => aRaiz(tomar(new RegExp('<li class="gal__it"[^>]*>\\s*<button class="gal__btn" type="button" data-lupa="(?:\\.\\./)?assets/img/' + archivoFoto.replace(".", "\\.") + '"[\\s\\S]*?</li>'), "la foto " + archivoFoto))
      .replace(/style="--i:\d+"/, 'style="--i:' + i + '"')
  };
}

/** Preguntas del banco, con el mismo marcado que en la portada. */
function preguntas(claves, idioma) {
  return claves.map((k) => {
    if (!PREGUNTAS[k]) throw new Error("No hay pregunta «" + k + "» en el banco");
    const [q, a] = PREGUNTAS[k][idioma];
    return `<details class="faq__it">
          <summary><h3 class="faq__q">${q}</h3><span class="faq__i" aria-hidden="true"></span></summary>
          <div class="faq__a"><p>${a}</p></div>
        </details>`;
  }).join("\n        ");
}

/* --- Cuerpo de la página ---------------------------------------------------- */
function cuerpo(s, t, c, P) {
  const tel = '<a href="tel:+34613766476" data-contact="tel">613 76 64 76</a>';
  const revelar = ["left", "up", "right"];
  const banda = s.banda ? `
<!-- ============================ FOTO A TODO EL ANCHO ================ -->
<section class="banda${s.banda.clase ? " " + s.banda.clase : ""}" aria-label="${t.bandaAria}">
  <div class="banda__foto" aria-hidden="true">
    <img src="${s.banda.src}" alt="" width="${s.banda.ancho}" height="${s.banda.alto}" loading="lazy" decoding="async"${s.banda.pos ? ' style="object-position:' + s.banda.pos + '"' : ""}>
  </div>
  <div class="wrap banda__in">
    <p class="banda__t" data-reveal="up">${t.bandaT}</p>
    <p class="banda__pie" data-reveal="up" data-d="1">${t.bandaPie}</p>
  </div>
</section>
` : "";
  const comparador = s.comparador ? `
<!-- ============================ ANTES Y DESPUÉS ===================== -->
<section class="antes" aria-labelledby="antes-t">
  <div class="wrap">
    <p class="kicker" data-reveal="kicker">${t.cmpK}</p>
    <h2 class="h2 obras__t" id="antes-t" data-reveal="mask">${t.cmpT}</h2>
    <p class="lede obras__lede" data-reveal="up" data-d="1">${t.cmpP}</p>
    ${P.comparador}
  </div>
</section>
` : "";
  return `
<!-- ============================ CABECERA DE LA PÁGINA =============== -->
<section class="sub" aria-labelledby="sub-t">
  <div class="wrap sub__grid">
    <div class="sub__copy">
      <nav class="migas" aria-label="${c.ruta}">
        <ol>
          <li><a href="${P.raiz}">${c.inicio}</a></li>
          <li><a href="${P.raiz}#servicios">${c.servicios}</a></li>
          <li><span aria-current="page">${t.miga}</span></li>
        </ol>
      </nav>
      <p class="kicker sub__k">${t.etiqueta}</p>
      <h1 class="sub__t" id="sub-t">${t.h1}</h1>
      <p class="sub__p">${t.entrada}</p>
      <div class="sub__cta">
        <a class="btn btn--slate" href="#contacto"><span>${c.visita}</span>${flecha}</a>
        <a class="sub__tel" href="tel:+34613766476"><span>${c.llame}</span> <strong data-contact="tel-label">613 76 64 76</strong></a>
      </div>
    </div>
    <figure class="about__fig sub__fig">
      <div class="plate">
        <img class="sub__foto" src="${s.foto.src}" alt="${t.alt}" width="${s.foto.ancho}" height="${s.foto.alto}" fetchpriority="high" decoding="async">
      </div>
      <span class="about__frame" aria-hidden="true"></span>
    </figure>
  </div>
</section>

${P.franja}

<!-- ============================ FASES DEL TRABAJO =================== -->
<section class="fases" id="fases" aria-labelledby="fases-t">
  <div class="wrap fases__grid">
    <div class="fases__head">
      <p class="kicker" data-reveal="kicker">${t.fasesK}</p>
      <h2 class="h2" id="fases-t" data-reveal="mask">${t.fasesT}</h2>
      <p class="lede" data-reveal="up" data-d="1">${t.fasesP}</p>
      <a class="more" href="#contacto" data-prefill="${t.prefill}" data-reveal="up" data-d="2">${c.pedir}</a>
    </div>
    <ol class="fases__list">
${t.fases.map(([titulo, texto], i) => `      <li class="fase" data-reveal="up">
        <span class="fase__n" aria-hidden="true">0${i + 1}</span>
        <div><h3 class="fase__t">${titulo}</h3>
        <p>${texto}</p></div>
      </li>`).join("\n")}
    </ol>
  </div>
</section>
${banda}${comparador}
<!-- ============================ NOTAS ================================ -->
<section class="notas" aria-labelledby="notas-t">
  <div class="wrap">
    <div class="notas__head">
      <p class="kicker" data-reveal="kicker">${t.notasK}</p>
      <h2 class="h2" id="notas-t" data-reveal="mask">${t.notasT}</h2>
    </div>
    <div class="stance__grid notas__grid">
${t.notas.map(([titulo, texto], i) => `      <article class="note" data-reveal="${revelar[i]}"${i ? ' data-d="' + i + '"' : ""}>
        <span class="note__i" aria-hidden="true">${icono(s.iconos[i])}</span>
        <h3 class="note__t">${titulo}</h3>
        <p>${texto}</p>
      </article>`).join("\n")}
    </div>
  </div>
</section>

<!-- ============================ A PIE DE OBRA ======================= -->
<section class="obras" aria-labelledby="obras-t">
  <div class="wrap">
    <p class="kicker" data-reveal="kicker">${c.obrasK}</p>
    <h2 class="h2 obras__t" id="obras-t" data-reveal="mask">${c.obrasT}</h2>
    <p class="lede obras__lede" data-reveal="up" data-d="1">${c.obrasP}</p>
    <ul class="gal gal--${s.galeria.length}">
      ${s.galeria.map((g, i) => P.foto(g, i)).join("\n      ")}
    </ul>
  </div>
</section>

${P.proceso}

<!-- ============================ PREGUNTAS FRECUENTES ================ -->
<section class="faq" id="preguntas" aria-labelledby="faq-t">
  <div class="wrap faq__grid">
    <div class="faq__head">
      <p class="kicker" data-reveal="kicker">${c.faqK}</p>
      <h2 class="h2" id="faq-t" data-reveal="mask">${c.faqT}</h2>
      <p class="lede" data-reveal="up" data-d="1">${c.faqP(tel)}</p>
    </div>
    <div class="faq__list" data-reveal="up" data-d="1">
        ${preguntas(s.faq, P.idioma)}
    </div>
  </div>
</section>
`;
}

/* --- Montaje ---------------------------------------------------------------- */
function montar(s, idioma) {
  const t = s[idioma];
  const c = COMUN[idioma];
  const P = piezasDe(idioma);
  const url = D + "/" + t.carpeta + "/";
  const urlEs = D + "/" + s.es.carpeta + "/";
  const urlCa = D + "/" + s.ca.carpeta + "/";
  const cambiar = (html, de, a, nombre) => {
    if (!html.includes(de)) throw new Error("No encuentro " + nombre + " en el contacto (" + idioma + ")");
    return html.split(de).join(a);
  };

  let contacto = P.contacto;
  contacto = cambiar(contacto, "<option>" + t.opcion + "</option>", "<option selected>" + t.opcion + "</option>", "la opción «" + t.opcion + "»");
  contacto = cambiar(contacto, c.contactoAntes, t.contactoEntrada, "la entrada del contacto");
  contacto = cambiar(contacto, 'placeholder="' + c.ejemploAntes + '"', 'placeholder="' + t.ejemplo + '"', "el ejemplo del mensaje");

  // Selector de idioma: cada idioma lleva a esta misma página en ese idioma
  const idiomas = (html) => html
    .replace(/<a href="\/" lang="es" hreflang="es"/g, '<a href="/' + s.es.carpeta + '/" lang="es" hreflang="es"')
    .replace(/<a href="\/ca\/" lang="ca" hreflang="ca"/g, '<a href="/' + s.ca.carpeta + '/" lang="ca" hreflang="ca"');
  // En el menú de arriba se marca «Servicios», que es donde estamos
  const cabecera = idiomas(P.cabecera).replace('<a class="nav__a" href="' + P.raiz + '#servicios">', '<a class="nav__a is-active" href="' + P.raiz + '#servicios">');
  // En el pie, el enlace a esta misma página queda marcado
  const pie = idiomas(P.pie).replace('<a href="/' + t.carpeta + '/">', '<a href="/' + t.carpeta + '/" aria-current="page">');

  const datos = [{
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url + "#servicio",
    "name": t.servicio.nombre,
    "serviceType": t.servicio.tipo,
    "description": t.servicio.descripcion,
    "url": url,
    "image": D + s.foto.og,
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
      { "@type": "ListItem", "position": 1, "name": c.inicio, "item": D + P.raiz },
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
<meta property="og:image" content="${D + s.foto.og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="es" href="${urlEs}">
<link rel="alternate" hreflang="ca" href="${urlCa}">
<link rel="alternate" hreflang="x-default" href="${urlEs}">
<meta property="og:locale" content="${c.locale}">

<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/jost.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/noto-serif-display.woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${P.version}">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">

${datos.map((d) => '<script type="application/ld+json">\n' + JSON.stringify(d, null, 2) + "\n</script>").join("\n")}
</head>
<body>

${P.saltar}

<!-- Cabecera, menú, franja, proceso, comparador, fotos, contacto y pie:
     copiados de la portada por tools/paginas-servicio.js. Para cambiarlos,
     cambie la portada y vuelva a generar esta página. -->
${cabecera}

${idiomas(P.menu)}

<main id="main">
<span id="top"></span>
<span class="sentinel" data-sentinel aria-hidden="true"></span>
${cuerpo(s, t, c, P)}
${contacto}
</main>

${pie}

${P.lupa}

${P.wa}

<script defer src="/lib/manifest.js?v=${P.version}"></script>
<script defer src="/main.js?v=${P.version}"></script>
</body>
</html>
`;
}

const hechas = [];
for (const s of SERVICIOS) {
  for (const idioma of ["es", "ca"]) {
    const html = montar(s, idioma);
    [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)].forEach((m) => JSON.parse(m[1]));
    const destino = path.join(ROOT, s[idioma].carpeta, "index.html");
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, html);
    hechas.push(s[idioma].carpeta + "/index.html");
  }
}
console.log("Generadas: " + hechas.join(", "));
module.exports = { SERVICIOS };

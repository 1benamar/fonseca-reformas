/* =============================================================================
   Genera la versión en catalán (ca/index.html) a partir de index.html.
   Uso:  node tools/version-catalana.js

   La tabla de abajo pone cada texto en castellano junto a su traducción. Si un
   texto de la tabla ya no está en index.html (porque se ha cambiado), el
   script avisa y no escribe nada: hay que poner el texto nuevo en la tabla.
   Al final revisa que no quede ninguna frase en castellano sin traducir.
   Las páginas legales en catalán (ca/avis-legal.html, ca/privacitat.html) se
   mantienen a mano: son cortas y cambian poco.
============================================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let h = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const fallos = [];
const cambiar = (es, ca) => {
  if (!h.includes(es)) { fallos.push(es.slice(0, 100)); return; }
  h = h.split(es).join(ca);
};

/* --- Cabecera del documento ---------------------------------------------- */
const CABECERA = [
  ['<html lang="es">', '<html lang="ca">'],
  ["<title>Reformas y obra nueva en Tordera y el Maresme | Reformas F.S Fonseca</title>",
   "<title>Reformes i obra nova a Tordera i el Maresme | Reformas F.S Fonseca</title>"],
  ['content="Reformas integrales, baños, cocinas, construcción de obra nueva e instalaciones de luz, agua y gas con boletín en Tordera, Blanes, Lloret y Malgrat. Presupuesto sin compromiso."',
   'content="Reformes integrals, banys, cuines, construcció d’obra nova i instal·lacions de llum, aigua i gas amb butlletí a Tordera, Blanes, Lloret i Malgrat. Pressupost sense compromís."'],
  ['content="Reformas F.S Fonseca · Reformas y obra nueva en Tordera y alrededores"',
   'content="Reformas F.S Fonseca · Reformes i obra nova a Tordera i rodalies"'],
  ['content="Reformas y construcción de obra nueva en el Maresme, la Selva y el área de Barcelona. Visita y presupuesto sin compromiso."',
   'content="Reformes i construcció d’obra nova al Maresme, la Selva i l’àrea de Barcelona. Visita i pressupost sense compromís."'],
  ['<meta property="og:url" content="https://reformasfonseca.com/">', '<meta property="og:url" content="https://reformasfonseca.com/ca/">'],
  ['<link rel="canonical" href="https://reformasfonseca.com/">', '<link rel="canonical" href="https://reformasfonseca.com/ca/">'],
  ['<meta property="og:locale" content="es_ES">\n<meta property="og:locale:alternate" content="ca_ES">',
   '<meta property="og:locale" content="ca_ES">\n<meta property="og:locale:alternate" content="es_ES">']
];

/* --- Preguntas frecuentes (se usan en la lista y en los datos para Google) --- */
const FAQ = [
  ["¿La visita y el presupuesto tienen coste?", "La visita i el pressupost tenen cost?"],
  ["No. Vamos a ver la vivienda, escuchamos qué necesita y le entregamos el presupuesto por escrito, sin coste y sin compromiso.",
   "No. Anem a veure l’habitatge, escoltem què necessita i li lliurem el pressupost per escrit, sense cost i sense compromís."],
  ["¿Qué incluye el presupuesto?", "Què inclou el pressupost?"],
  ["Va por escrito y detallado, con los materiales y los plazos previstos. Así sabe desde el primer día qué se va a hacer y en qué orden.",
   "Va per escrit i detallat, amb els materials i els terminis previstos. Així sap des del primer dia què es farà i en quin ordre."],
  ["¿También construyen casas nuevas?", "També construeixen cases noves?"],
  ["Sí. Además de reformar, construimos casas de obra nueva desde cero y hacemos ampliaciones: cimentación, estructura, cerramientos y cubierta. Como en cualquier obra, la visita y el presupuesto no tienen coste.",
   "Sí. A més de reformar, construïm cases d’obra nova des de zero i fem ampliacions: fonaments, estructura, tancaments i coberta. Com en qualsevol obra, la visita i el pressupost no tenen cost."],
  ["¿Hacen instalaciones de luz, agua y gas con boletín?", "Fan instal·lacions de llum, aigua i gas amb butlletí?"],
  ["Sí. Hacemos las instalaciones de luz, agua y gas con su boletín, de modo que quedan certificadas y en regla.",
   "Sí. Fem les instal·lacions de llum, aigua i gas amb el seu butlletí, de manera que queden certificades i en regla."],
  ["¿En qué poblaciones trabajan?", "En quines poblacions treballen?"],
  ["Trabajamos desde Tordera en el Maresme, la Selva y el área de Barcelona y Girona: Tordera, Blanes, Lloret de Mar, Malgrat de Mar, Palafolls, Pineda de Mar, Calella, Mataró, Girona y Barcelona. Si su población no está en la lista, pregúntenos.",
   "Treballem des de Tordera al Maresme, la Selva i l’àrea de Barcelona i Girona: Tordera, Blanes, Lloret de Mar, Malgrat de Mar, Palafolls, Pineda de Mar, Calella, Mataró, Girona i Barcelona. Si la seva població no és a la llista, pregunti’ns."]
];

/* --- Servicios en los datos para Google ----------------------------------- */
const SERVICIOS = {
  "Servicios de reforma": "Serveis de reforma",
  "Maresme y Selva": "Maresme i la Selva",
  "Reformas integrales": "Reformes integrals",
  "Nueva distribución, instalaciones con boletín y acabados, con la vivienda entregada limpia.": "Nova distribució, instal·lacions amb butlletí i acabats, amb l’habitatge lliurat net.",
  "Reforma de baños": "Reforma de banys",
  "Fontanería nueva, impermeabilización, alicatado, sanitarios y mampara.": "Lampisteria nova, impermeabilització, enrajolat, sanitaris i mampara.",
  "Reforma de cocinas": "Reforma de cuines",
  "Tomas de agua y gas, electricidad, falso techo e iluminación.": "Preses d’aigua i gas, electricitat, fals sostre i il·luminació.",
  "Construcción de obra nueva y ampliaciones": "Construcció d’obra nova i ampliacions",
  "Casas de nueva construcción desde cero y ampliaciones: cimentación, estructura, cerramientos y cubierta.": "Cases de nova construcció des de zero i ampliacions: fonaments, estructura, tancaments i coberta.",
  "Instalaciones de luz, agua y gas con boletín": "Instal·lacions de llum, aigua i gas amb butlletí",
  "Instalaciones certificadas con su boletín.": "Instal·lacions certificades amb el seu butlletí.",
  "Pladur y techos": "Pladur i sostres",
  "Montaje de pladur y falsos techos.": "Muntatge de pladur i falsos sostres.",
  "Pintura y decoración": "Pintura i decoració",
  "Alisado, plastecido y pintura.": "Allisat, emmassillat i pintura.",
  "Albañilería y paletería": "Paleteria",
  "Solados, terrazas, humedades y reparaciones.": "Paviments, terrasses, humitats i reparacions.",
  "Movimiento de tierras": "Moviment de terres",
  "Preparación y desbroce de parcelas.": "Preparació i desbrossament de parcel·les.",
  "Bajantes": "Baixants",
  "Instalación de bajantes.": "Instal·lació de baixants."
};
const DESCRIPCION = "Empresa de reformes i construcció de Tordera: reformes integrals, banys, cuines, construcció d’obra nova i ampliacions, instal·lacions de llum, aigua i gas amb butlletí, pladur, pintura, paleteria i moviment de terres al Maresme, la Selva, Barcelona i Girona.";

/* --- Textos de la página, de arriba abajo --------------------------------- */
const TEXTOS = [
  // Pie: páginas de servicio (va primero: más abajo se traduce «Servicios»)
  ["    <nav class=\"foot__serv\" aria-label=\"Servicios\">\n      <a href=\"/obra-nueva/\">Obra nueva</a>\n      <a href=\"/reformas-integrales/\">Reformas integrales</a>\n      <a href=\"/pladur/\">Pladur y techos</a>\n      <a href=\"/suelos-albanileria/\">Suelos y albañilería</a>\n    </nav>\n", "    <nav class=\"foot__serv\" aria-label=\"Serveis\">\n      <a href=\"/ca/obra-nova/\">Obra nova</a>\n      <a href=\"/ca/reformes-integrals/\">Reformes integrals</a>\n      <a href=\"/ca/pladur/\">Pladur i sostres</a>\n      <a href=\"/ca/paviments-paleteria/\">Paviments i paleteria</a>\n    </nav>\n"],
  // Pantalla de carga, cabecera y menú
  ['aria-label="Cargando"', 'aria-label="Carregant"'],
  [">Saltar al contenido</a>", ">Salta al contingut</a>"],
  ['aria-label="Reformas F.S Fonseca, volver al inicio"', 'aria-label="Reformas F.S Fonseca, tornar a l’inici"'],
  ['aria-label="Navegación principal"', 'aria-label="Navegació principal"'],
  [">La empresa</a>", ">L’empresa</a>"],
  [">Servicios</a>", ">Serveis</a>"],
  [">Obras</a>", ">Obres</a>"],
  [">Qué incluye</a>", ">Què inclou</a>"],
  [">Cómo trabajamos</a>", ">Com treballem</a>"],
  [">Contacto</a>", ">Contacte</a>"],
  [">Abrir menú</span>", ">Obre el menú</span>"],
  ["<span>Pida su visita</span>", "<span>Demani la visita</span>"],

  // Portada
  [">Reformas y obra nueva en Tordera, Blanes, Lloret y Malgrat</span>", ">Reformes i obra nova a Tordera, Blanes, Lloret i Malgrat</span>"],
  ["<span>Construcción y reformas</span>", "<span>Construcció i reformes</span>"],
  ["<span>hechas con criterio.</span>", "<span>fetes amb criteri.</span>"],
  [">Baños, cocinas, reformas integrales y construcción de obra nueva en el Maresme, la Selva y Barcelona. La visita no cuesta nada.</p>",
   ">Banys, cuines, reformes integrals i construcció d’obra nova al Maresme, la Selva i Barcelona. La visita no costa res.</p>"],
  ["<span>o llame al</span>", "<span>o truqui al</span>"],

  // Franja de datos
  ['aria-label="Datos de la empresa"', 'aria-label="Dades de l’empresa"'],
  [">Zona de trabajo</p>", ">Zona de treball</p>"],
  [">Barcelona y Girona, desde Tordera</p>", ">Barcelona i Girona, des de Tordera</p>"],
  [">Visita y presupuesto</p>", ">Visita i pressupost</p>"],
  [">Sin coste y sin compromiso</p>", ">Sense cost i sense compromís</p>"],
  [">Valoración de clientes</p>", ">Valoració dels clients</p>"],
  ["</strong> sobre 5 en Google</p>", "</strong> sobre 5 a Google</p>"],

  // Manifiesto
  [">Entre presupuestos que cambian a mitad de obra y reformas que no terminan nunca, en F.S Fonseca trabajamos de otra manera:</h2>",
   ">Entre pressupostos que canvien a mitja obra i reformes que no s’acaben mai, a F.S Fonseca treballem d’una altra manera:</h2>"],
  [">Un presupuesto claro, antes de empezar.</h3>", ">Un pressupost clar, abans de començar.</h3>"],
  ["<p>Se lo entregamos por escrito y detallado, después de ver la vivienda. Así sabe desde el primer día qué se va a hacer y en qué orden.</p>",
   "<p>L’hi lliurem per escrit i detallat, després de veure l’habitatge. Així sap des del primer dia què es farà i en quin ordre.</p>"],
  ["<p>Quien le presupuesta la reforma es quien la dirige y quien responde. No tendrá que perseguir a cinco gremios para saber cómo va su casa.</p>",
   "<p>Qui li pressuposta la reforma és qui la dirigeix i qui en respon. No haurà d’empaitar cinc gremis per saber com va casa seva.</p>"],
  [">Y no siempre hay que tirarlo todo.</h3>", ">I no sempre cal enderrocar-ho tot.</h3>"],
  ["<p>Le diremos con franqueza qué merece la pena cambiar y qué no. A veces la mejor reforma es la que se hace a tiempo y sin excesos.</p>",
   "<p>Li direm amb franquesa què val la pena canviar i què no. De vegades la millor reforma és la que es fa a temps i sense excessos.</p>"],

  // La empresa
  ['alt="Jesús Fonseca en su despacho, preparando la planificación de una obra"', 'alt="Jesús Fonseca al seu despatx, preparant la planificació d’una obra"'],
  ['<span class="about__badge-k">Desde</span>', '<span class="about__badge-k">Des de</span>'],
  ['<span class="about__badge-k">en Tordera</span>', '<span class="about__badge-k">a Tordera</span>'],
  [">La empresa</p>", ">L’empresa</p>"],
  [">Diez años de oficio en obra real</h2>", ">Deu anys d’ofici en obra real</h2>"],
  ["<p>Llevamos desde 2016 entrando en casas de verdad: pisos con la instalación original, baños que ya no dan más de sí, cocinas que se quedaron pequeñas y casas que piden crecer.</p>",
   "<p>Des del 2016 entrem a cases de veritat: pisos amb la instal·lació original, banys que ja no donen més de si, cuines que s’han quedat petites i cases que demanen créixer.</p>"],
  ['<p>Y cuando hace falta empezar de cero, también construimos: <a href="/obra-nueva/">casas de obra nueva y ampliaciones</a>, desde la cimentación hasta la cubierta.</p>',
   '<p>I quan cal començar de zero, també construïm: <a href="/ca/obra-nova/">cases d’obra nova i ampliacions</a>, des dels fonaments fins a la coberta.</p>'],
  ["<p>Trabajamos con materiales y sistemas actuales, pero sin perder lo que enseña el oficio: saber qué aguanta, qué da problemas con los años y qué conviene resolver antes de alicatar.</p>",
   "<p>Treballem amb materials i sistemes actuals, però sense perdre el que ensenya l’ofici: saber què aguanta, què dona problemes amb els anys i què convé resoldre abans d’enrajolar.</p>"],
  ["<p>La confianza de quien nos llama se gana igual en cada obra: siendo honestos con lo que hace falta, ordenados en la ejecución y limpios al terminar cada jornada.</p>",
   "<p>La confiança de qui ens truca es guanya igual a cada obra: sent honestos amb el que cal, endreçats en l’execució i nets en acabar cada jornada.</p>"],
  [">Jesús Fonseca · Desde 2016 · Tordera, Barcelona</p>", ">Jesús Fonseca · Des del 2016 · Tordera, Barcelona</p>"],

  // Opiniones (las reseñas se dejan como las escribieron, en castellano)
  [">Opiniones</p>", ">Opinions</p>"],
  [">Lo que dicen nuestros clientes</h2>", ">El que diuen els nostres clients</h2>"],
  ['aria-label="Valoración media de 5 sobre 5 en Google"', 'aria-label="Valoració mitjana de 5 sobre 5 a Google"'],
  ["<blockquote><p>«Todo perfecto", '<blockquote lang="es"><p>«Todo perfecto'],
  ["<figcaption>Isabel Vela · reseña en Google</figcaption>", "<figcaption>Isabel Vela · ressenya a Google</figcaption>"],
  ["<p>«Todo muy bien", '<p lang="es">«Todo muy bien'],
  ["<p>«Montaje rápido", '<p lang="es">«Montaje rápido'],
  ["<strong>5,0 sobre 5</strong> en 6 reseñas de Google y 4,3 sobre 5 en 9 opiniones de habitissimo.",
   "<strong>5,0 sobre 5</strong> en 6 ressenyes de Google i 4,3 sobre 5 en 9 opinions d’habitissimo."],
  [">Leer las reseñas</a>", ">Veure les ressenyes</a>"],

  // Servicios
  [">Servicios</p>", ">Serveis</p>"],
  [">Lo que hacemos</h2>", ">El que fem</h2>"],
  [">Obra completa o un solo oficio. Trabajamos con equipo propio y con gremios de confianza, siempre coordinados por la misma persona.</p>",
   ">Obra completa o un sol ofici. Treballem amb equip propi i amb gremis de confiança, sempre coordinats per la mateixa persona.</p>"],
  ['aria-label="Servicio anterior"', 'aria-label="Servei anterior"'],
  ['aria-label="Servicio siguiente"', 'aria-label="Servei següent"'],
  ['aria-label="Servicios"', 'aria-label="Serveis"'],
  ['alt="Planta diáfana con tabiquería y falso techo de pladur terminados"', 'alt="Planta diàfana amb envans i fals sostre de pladur acabats"'],
  ['><a href="/reformas-integrales/">Reformas integrales</a></h3>', '><a href="/ca/reformes-integrals/">Reformes integrals</a></h3>'],
  ["<p>Nueva distribución, instalaciones con boletín y acabados. Le entregamos la vivienda limpia y lista para entrar a vivir.</p>",
   "<p>Nova distribució, instal·lacions amb butlletí i acabats. Li lliurem l’habitatge net i a punt per entrar-hi a viure.</p>"],
  [">Pedir presupuesto</a>", ">Demani pressupost</a>"],
  ['alt="Baño en reforma: alicatado antiguo retirado y plato de ducha ya colocado"', 'alt="Bany en reforma: rajola antiga retirada i plat de dutxa ja col·locat"'],
  [">Reformas de baños</h3>", ">Reformes de banys</h3>"],
  ["<p>Del derribo al último remate: fontanería nueva, impermeabilización, alicatado, sanitarios y mampara.</p>",
   "<p>De l’enderroc a l’últim retoc: lampisteria nova, impermeabilització, enrajolat, sanitaris i mampara.</p>"],
  ['data-prefill="Baño"', 'data-prefill="Bany"'],
  ['alt="Sala abierta al jardín con falso techo y luz empotrada terminados"', 'alt="Sala oberta al jardí amb fals sostre i llum encastada acabats"'],
  [">Reformas de cocinas</h3>", ">Reformes de cuines</h3>"],
  ["<p>Abrimos la cocina al salón cuando la casa lo permite: tomas de agua y gas, electricidad al día, falso techo e iluminación.</p>",
   "<p>Obrim la cuina a la sala quan la casa ho permet: preses d’aigua i gas, electricitat al dia, fals sostre i il·luminació.</p>"],
  ['data-prefill="Cocina"', 'data-prefill="Cuina"'],
  ['alt="Solera de hormigón extendida en la planta baja de una obra nueva"', 'alt="Solera de formigó estesa a la planta baixa d’una obra nova"'],
  ['><a href="/obra-nueva/">Construcción de obra nueva</a></h3>', '><a href="/ca/obra-nova/">Construcció d’obra nova</a></h3>'],
  ["<p>Construimos casas desde cero y también ampliaciones: cimentación, estructura, cerramientos y cubierta.</p>",
   "<p>Construïm cases des de zero i també ampliacions: fonaments, estructura, tancaments i coberta.</p>"],
  ['data-prefill="Construcción de obra nueva"', 'data-prefill="Construcció d’obra nova"'],
  ['alt="Operario lijando el encuentro de un tabique antes de pintar"', 'alt="Operari polint la trobada d’un envà abans de pintar"'],
  [">Pintura y decoración</h3>", ">Pintura i decoració</h3>"],
  ["<p>Alisado, plastecido y pintura, con ayuda para elegir el color y todo lo demás protegido.</p>",
   "<p>Allisat, emmassillat i pintura, amb ajuda per triar el color i la resta de la casa protegida.</p>"],
  ['alt="Porche exterior solado con gres imitación piedra"', 'alt="Porxo exterior pavimentat amb gres imitació pedra"'],
  ['><a href="/suelos-albanileria/">Suelos y albañilería</a></h3>', '><a href="/ca/paviments-paleteria/">Paviments i paleteria</a></h3>'],
  ["<p>Solados, terrazas, humedades y reparaciones que conviene hacer bien y de una sola vez.</p>",
   "<p>Paviments, terrasses, humitats i reparacions que convé fer bé i d’una sola vegada.</p>"],
  ['data-prefill="Albañilería"', 'data-prefill="Paleteria"'],
  [">También hacemos la <strong>instalación de luz, agua y gas con boletín certificado</strong>, <strong><a href=\"/pladur/\">pladur y techos</a></strong>, <strong>aire acondicionado</strong>, <strong>movimiento de tierras</strong>, paletería, bajantes, armarios a medida, aislamiento acústico y pequeñas reparaciones. Si lo prefiere, entregamos la obra <strong>llave en mano</strong>.</p>",
   ">També fem la <strong>instal·lació de llum, aigua i gas amb butlletí certificat</strong>, <strong><a href=\"/ca/pladur/\">pladur i sostres</a></strong>, <strong>aire condicionat</strong>, <strong>moviment de terres</strong>, paleteria, baixants, armaris a mida, aïllament acústic i petites reparacions. Si ho prefereix, lliurem l’obra <strong>clau en mà</strong>.</p>"],

  // Obras
  [">Obras</p>", ">Obres</p>"],
  [">Obras nuestras</h2>", ">Obres nostres</h2>"],
  [">Obras nuestras, fotografiadas a pie de tajo. Pulse en cualquiera para verla en grande.</p>",
   ">Obres nostres, fotografiades a peu d’obra. Premi qualsevol per veure-la en gran.</p>"],
  ['alt="El mismo mueble ya enlucido y pintado, con la televisión encastrada"', 'alt="El mateix moble ja emmassillat i pintat, amb la televisió encastada"'],
  ['alt="Mueble de salón recién montado en pladur, con las juntas todavía sin tapar"', 'alt="Moble de sala acabat de muntar en pladur, amb les juntes encara sense tapar"'],
  ['aria-hidden="true">Antes</span>', 'aria-hidden="true">Abans</span>'],
  ['aria-hidden="true">Después</span>', 'aria-hidden="true">Després</span>'],
  ['aria-label="Desplazar para comparar el antes y el después"', 'aria-label="Desplaci per comparar l’abans i el després"'],
  ["<figcaption>Mueble de salón levantado en pladur sobre perfilería, con hornacina para la televisión, baldas curvas y luz empotrada. De la placa vista al acabado pintado.</figcaption>",
   "<figcaption>Moble de sala aixecat en pladur sobre perfileria, amb fornícula per a la televisió, prestatges corbats i llum encastada. De la placa vista a l’acabat pintat.</figcaption>"],
  ["Movimiento de tierras y desbroce de parcela", "Moviment de terres i desbrossament de parcel·la"],
  ['alt="Excavadora perfilando el terreno de una parcela"', 'alt="Excavadora perfilant el terreny d’una parcel·la"'],
  ["Solado de gres con sistema de nivelación", "Paviment de gres amb sistema d’anivellament"],
  ['alt="Baldosas de gres con crucetas de nivelación puestas antes del fraguado"', 'alt="Rajoles de gres amb les creuetes d’anivellament posades abans que el morter s’endureixi"'],
  ["Colocación de gres en porche exterior", "Col·locació de gres en un porxo exterior"],
  ['alt="Operario extendiendo cemento cola y colocando el gres del porche"', 'alt="Operari estenent ciment cola i col·locant el gres del porxo"'],
  ["Encintado de juntas, paso previo al alisado", "Encintat de juntes, pas previ a l’allisat"],
  ['alt="Operario encintando la junta entre dos placas de yeso"', 'alt="Operari encintant la junta entre dues plaques de guix"'],
  ["Aislamiento de lana de roca antes de cerrar", "Aïllament de llana de roca abans de tancar"],
  ['alt="Lana de roca colocada entre montantes metálicos antes de cerrar el tabique"', 'alt="Llana de roca col·locada entre muntants metàl·lics abans de tancar l’envà"'],
  ["Placa hidrófuga en cuarto húmedo", "Placa hidròfuga en una cambra humida"],
  ['alt="Cuarto húmedo cerrado con placa hidrófuga verde y tomas de agua vistas"', 'alt="Cambra humida tancada amb placa hidròfuga verda i preses d’aigua vistes"'],
  ["Maestreado del suelo antes de solar", "Mestrejat del terra abans de pavimentar"],
  ['alt="Operario tirando las maestras de mortero sobre el forjado"', 'alt="Operari estenent les mestres de morter sobre el forjat"'],
  ["Perfilería y cercos antes de aplacar", "Perfileria i bastiments abans de plaquejar"],
  ['alt="Perfilería metálica montada con los cercos de las puertas colocados"', 'alt="Perfileria metàl·lica muntada amb els bastiments de les portes col·locats"'],
  ["Tabique nuevo, pintado y con puertas montadas", "Envà nou, pintat i amb les portes muntades"],
  ['alt="Tabique de pladur acabado, pintado y con dos puertas montadas"', 'alt="Envà de pladur acabat, pintat i amb dues portes muntades"'],
  [">Ampliar: ", ">Amplia: "],
  ['aria-label="Vídeo breve de una obra de pladur en marcha"', 'aria-label="Vídeo breu d’una obra de pladur en marxa"'],
  [">Local en obra: tabiques y techo de pladur</span>", ">Local en obres: envans i sostre de pladur</span>"],

  // Qué incluye
  [">Qué incluye</p>", ">Què inclou</p>"],
  [">Da igual el tamaño de la obra</h2>", ">Tant se val la mida de l’obra</h2>"],
  [">Un baño y una casa entera se preparan con el mismo cuidado. Esto entra siempre en el presupuesto: ni se cobra aparte ni hay que pedirlo.</p>",
   ">Un bany i una casa sencera es preparen amb la mateixa cura. Això entra sempre al pressupost: ni es cobra a part ni cal demanar-ho.</p>"],
  ["<p>Cubrimos suelos, muebles y accesos antes de mover nada, también en viviendas habitadas.</p>",
   "<p>Cobrim terres, mobles i accessos abans de moure res, també en habitatges habitats.</p>"],
  ["<h3>Los escombros, fuera</h3>", "<h3>La runa, fora</h3>"],
  ["<p>Contenedor, carga y retirada incluidos. No se quedan en su terraza esperando.</p>",
   "<p>Contenidor, càrrega i retirada inclosos. No es queda a la seva terrassa esperant.</p>"],
  ["<h3>Permisos resueltos</h3>", "<h3>Permisos resolts</h3>"],
  ["<p>Le decimos cuáles hacen falta y, si lo prefiere, los tramitamos nosotros.</p>",
   "<p>Li diem quins calen i, si ho prefereix, els tramitem nosaltres.</p>"],
  ["<h3>Un calendario, no una promesa</h3>", "<h3>Un calendari, no una promesa</h3>"],
  ["<p>Sabe qué semana entra cada gremio y cuándo recupera la casa.</p>", "<p>Sap quina setmana entra cada gremi i quan recupera la casa.</p>"],
  ["<h3>Limpieza de verdad</h3>", "<h3>Neteja de debò</h3>"],
  ["<p>Se entrega limpia y recogida, no barrida por encima el último día.</p>", "<p>Es lliura neta i endreçada, no escombrada per sobre l’últim dia.</p>"],
  ["<h3>Repasos antes de cerrar</h3>", "<h3>Repassos abans de tancar</h3>"],
  ["<p>Revisamos la obra con usted y corregimos lo que no convenza.</p>", "<p>Revisem l’obra amb vostè i corregim el que no quedi bé.</p>"],
  ['<p class="panel__q">¿Por dónde quiere empezar?</p>', '<p class="panel__q">Per on vol començar?</p>'],
  ["<span>Un baño</span>", "<span>Un bany</span>"],
  ["<span>Una cocina</span>", "<span>Una cuina</span>"],
  ["<span>La casa entera</span>", "<span>La casa sencera</span>"],
  ['data-prefill="Otra cosa"', 'data-prefill="Una altra cosa"'],
  ["<span>Otra cosa</span>", "<span>Una altra cosa</span>"],
  ['<p class="panel__note">Le llamamos, vamos a verlo y le pasamos el presupuesto por escrito.</p>',
   '<p class="panel__note">Li truquem, anem a veure-ho i li passem el pressupost per escrit.</p>'],

  // Proceso
  [">Proceso</p>", ">Procés</p>"],
  [">Cómo trabajamos</h2>", ">Com treballem</h2>"],
  [">La obra sigue siempre este orden. Por eso en cada momento sabe en qué punto está su casa y qué queda por hacer.</p>",
   ">L’obra segueix sempre aquest ordre. Per això en cada moment sap en quin punt es troba casa seva i què queda per fer.</p>"],
  ["<p>Vamos a su casa, medimos y escuchamos qué necesita. Sin coste.</p>", "<p>Anem a casa seva, prenem mides i escoltem què necessita. Sense cost.</p>"],
  ['<h3 class="step__t">Presupuesto</h3>', '<h3 class="step__t">Pressupost</h3>'],
  ["<p>Por escrito y detallado, con materiales y plazos previstos.</p>", "<p>Per escrit i detallat, amb materials i terminis previstos.</p>"],
  ['<h3 class="step__t">Planificación</h3>', '<h3 class="step__t">Planificació</h3>'],
  ["<p>Fechas, gremios y permisos resueltos antes de empezar.</p>", "<p>Dates, gremis i permisos resolts abans de començar.</p>"],
  ["<p>Una persona al frente y la casa recogida cada día.</p>", "<p>Una persona al capdavant i la casa endreçada cada dia.</p>"],
  ['<h3 class="step__t">Entrega</h3>', '<h3 class="step__t">Lliurament</h3>'],
  ["<p>Revisamos juntos el resultado y repasamos lo que haga falta.</p>", "<p>Revisem junts el resultat i repassem el que calgui.</p>"],

  // Preguntas frecuentes (encabezado; las preguntas van en FAQ)
  [">Dudas</p>", ">Dubtes</p>"],
  [">Preguntas frecuentes</h2>", ">Preguntes freqüents</h2>"],
  [">Lo que más nos preguntan antes de la primera visita. Si su duda no está aquí, llámenos al <a",
   ">El que més ens pregunten abans de la primera visita. Si el seu dubte no hi és, truqui’ns al <a"],

  // Contacto
  [">Contacto</p>", ">Contacte</p>"],
  [">Pida su visita sin compromiso</h2>", ">Demani la visita sense compromís</h2>"],
  [">Cuéntenos en pocas líneas qué quiere hacer. Le llamamos para concertar la visita y, después, le entregamos el presupuesto.</p>",
   ">Expliqui’ns en poques línies què vol fer. Li truquem per concertar la visita i, després, li lliurem el pressupost.</p>"],
  ["<dt>Teléfono</dt>", "<dt>Telèfon</dt>"],
  [">Escribir por WhatsApp</a>", ">Escriure per WhatsApp</a>"],
  ["<dt>Horario</dt>", "<dt>Horari</dt>"],
  ["<dt>Correo</dt>", "<dt>Correu</dt>"],
  ['data-hecho="Copiado" aria-label="Copiar el correo"', 'data-hecho="Copiat" aria-label="Copiar el correu"'],
  ["<dd>Lunes a viernes, de 9:00 a 19:30</dd>", "<dd>De dilluns a divendres, de 9:00 a 19:30</dd>"],
  [">Trabajamos habitualmente en</p>", ">Treballem habitualment a</p>"],

  // Formulario
  ['<input type="hidden" name="idioma" value="es">', '<input type="hidden" name="idioma" value="ca">'],
  ["<label>Deje este campo vacío ", "<label>Deixi aquest camp buit "],
  ['<h3 class="form__t">Solicitud de visita</h3>', '<h3 class="form__t">Sol·licitud de visita</h3>'],
  ['<span class="field__l">Nombre</span>', '<span class="field__l">Nom</span>'],
  [">Indíquenos su nombre.</span>", ">Indiqui’ns el seu nom.</span>"],
  ['<span class="field__l">Teléfono</span>', '<span class="field__l">Telèfon</span>'],
  [">Necesitamos un teléfono para llamarle.</span>", ">Necessitem un telèfon per trucar-li.</span>"],
  ['<span class="field__l">Población</span>', '<span class="field__l">Població</span>'],
  ['<span class="field__l">Tipo de obra</span>', '<span class="field__l">Tipus d’obra</span>'],
  ['<optgroup label="La obra entera">', '<optgroup label="L’obra sencera">'],
  ["<option>Construcción de obra nueva o ampliación</option>", "<option>Construcció d’obra nova o ampliació</option>"],
  ['<optgroup label="Una estancia">', '<optgroup label="Una estança">'],
  ["<option>Baño</option>", "<option>Bany</option>"],
  ["<option>Cocina</option>", "<option>Cuina</option>"],
  ['<optgroup label="Instalaciones con boletín">', '<optgroup label="Instal·lacions amb butlletí">'],
  ["<option>Electricidad</option>", "<option>Electricitat</option>"],
  ["<option>Fontanería</option>", "<option>Lampisteria</option>"],
  ["<option>Aire acondicionado</option>", "<option>Aire condicionat</option>"],
  ["<option>Bajantes</option>", "<option>Baixants</option>"],
  ['<optgroup label="Albañilería">', '<optgroup label="Paleteria">'],
  ["<option>Albañilería y paletería</option>", "<option>Paleteria</option>"],
  ["<option>Suelos y solados</option>", "<option>Terres i paviments</option>"],
  ["<option>Terrazas y exteriores</option>", "<option>Terrasses i exteriors</option>"],
  ["<option>Humedades</option>", "<option>Humitats</option>"],
  ["<option>Pequeñas reparaciones</option>", "<option>Petites reparacions</option>"],
  ["<option>Movimiento de tierras</option>", "<option>Moviment de terres</option>"],
  ['<optgroup label="Acabados">', '<optgroup label="Acabats">'],
  ["<option>Pladur y techos</option>", "<option>Pladur i sostres</option>"],
  ["<option>Pintura y decoración</option>", "<option>Pintura i decoració</option>"],
  ["<option>Armarios a medida</option>", "<option>Armaris a mida</option>"],
  ["<option>Aislamiento</option>", "<option>Aïllament</option>"],
  ['<optgroup label="Otros">', '<optgroup label="Altres">'],
  ["<option>Otra cosa</option>", "<option>Una altra cosa</option>"],
  ['<span class="field__l">¿Qué le gustaría hacer?</span>', '<span class="field__l">Què li agradaria fer?</span>'],
  ['placeholder="Por ejemplo: piso de 75 m² en Blanes, queremos cambiar el baño y la cocina."',
   'placeholder="Per exemple: pis de 75 m² a Blanes, volem canviar el bany i la cuina."'],
  ['<span>He leído la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a> y acepto que usen mis datos para responderme.</span>',
   '<span>He llegit la <a href="privacitat.html" target="_blank" rel="noopener">política de privacitat</a> i accepto que facin servir les meves dades per respondre’m.</span>'],
  ["<span>Enviar solicitud</span>", "<span>Enviar la sol·licitud</span>"],
  ['<p class="form__note">Le llamaremos para concertar la visita. Solo usamos sus datos para responderle.</p>',
   '<p class="form__note">Li trucarem per concertar la visita. Només fem servir les seves dades per respondre-li.</p>'],
  ['<h3 class="form__t">Solicitud enviada</h3>', '<h3 class="form__t">Sol·licitud enviada</h3>'],
  ["<p>Gracias<span data-done-nombre></span>. Hemos recibido su solicitud y le llamaremos para concertar la visita.</p>",
   "<p>Gràcies<span data-done-nombre></span>. Hem rebut la seva sol·licitud i li trucarem per concertar la visita.</p>"],
  [">Si es urgente, llámenos al <a", ">Si és urgent, truqui’ns al <a"],

  // Pie, visor de fotos y botón de WhatsApp
  ['aria-label="Enlaces del pie"', 'aria-label="Enllaços del peu"'],
  ["<span>Tordera · Barcelona y Girona</span>", "<span>Tordera · Barcelona i Girona</span>"],
  ['aria-label="Información legal"', 'aria-label="Informació legal"'],
  ['<a href="aviso-legal.html">Aviso legal</a>', '<a href="avis-legal.html">Avís legal</a>'],
  ['<a href="privacidad.html">Privacidad</a>', '<a href="privacitat.html">Privacitat</a>'],
  [">Volver arriba<svg", ">Tornar a dalt<svg"],
  ["Las fotografías de obra y las de Jesús son de la empresa. La imagen de ambiente de la sección de opiniones es de muestra, con licencia ",
   "Les fotografies d’obra i les d’en Jesús són de l’empresa. La imatge d’ambient de la secció d’opinions és de mostra, amb llicència "],
  ['aria-label="Fotografía ampliada"', 'aria-label="Fotografia ampliada"'],
  ['aria-label="Cerrar la fotografía"', 'aria-label="Tanca la fotografia"'],
  ['aria-label="Escribir por WhatsApp"', 'aria-label="Escrigui’ns per WhatsApp"']
];

/* --- Aplicar ---------------------------------------------------------------- */
CABECERA.forEach(([es, ca]) => cambiar(es, ca));

// Datos para Google: la empresa y las preguntas
const bloques = [...h.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)];
const trad = (dic, texto) => {
  if (!(texto in dic)) { fallos.push("datos para Google: " + texto.slice(0, 80)); return texto; }
  return dic[texto];
};
const DIC_FAQ = Object.fromEntries(FAQ);
bloques.forEach(([, json]) => {
  const d = JSON.parse(json);
  if (d["@type"] === "GeneralContractor") {
    d.description = DESCRIPCION;
    d.hasOfferCatalog.name = trad(SERVICIOS, d.hasOfferCatalog.name);
    d.hasOfferCatalog.itemListElement.forEach((o) => {
      const s = o.itemOffered;
      s.name = trad(SERVICIOS, s.name);
      s.description = trad(SERVICIOS, s.description);
      if (s.areaServed) s.areaServed.name = trad(SERVICIOS, s.areaServed.name);
    });
  } else if (d["@type"] === "FAQPage") {
    d.mainEntity.forEach((q) => {
      q.name = trad(DIC_FAQ, q.name);
      q.acceptedAnswer.text = trad(DIC_FAQ, q.acceptedAnswer.text);
    });
  }
  h = h.replace(json, JSON.stringify(d, null, 2));
});

// Preguntas visibles
FAQ.forEach(([es, ca]) => cambiar(">" + es + "<", ">" + ca + "<"));
TEXTOS.forEach(([es, ca]) => cambiar(es, ca));

// El idioma marcado como actual pasa a ser el catalán
h = h.replace(/(<a href="\/" lang="es" hreflang="es") aria-current="page"/g, "$1");
h = h.replace(/(<a href="\/ca\/" lang="ca" hreflang="ca")/g, '$1 aria-current="page"');

// Rutas: la página vive en /ca/, así que los archivos de la web están un
// nivel más arriba.
const RAIZ = /^(assets\/|styles\.css|main\.js|lib\/|apple-touch-icon\.png)/;
h = h.replace(/(\s(?:src|href|data-lupa)=")([^"]+)"/g, (m, a, url) => RAIZ.test(url) ? a + "../" + url + '"' : m);
h = h.replace(/(\s(?:srcset|imagesrcset)=")([^"]+)"/g, (m, a, lista) =>
  a + lista.split(",").map((p) => p.trim()).map((p) => RAIZ.test(p) ? "../" + p : p).join(", ") + '"');

/* --- Revisión: que no quede castellano sin traducir ------------------------ */
const soloTexto = h
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<(blockquote|p) lang="es">[\s\S]*?<\/\1>/g, "")
  .replace(/(?:alt|aria-label|placeholder|data-pie|content|label|title)="([^"]*)"/g, " $1 ")
  .replace(/<[^>]+>/g, " ")
  .replace(/Reformas F\.S Fonseca/g, "");
const CASTELLANO = /[ñ¿¡]|\b(y|los|las|con|para|por|sus?|nuestr\w+|presupuesto\w*|cocinas?|baños?|obras|desde|hacemos|trabajamos|usted|llámenos|pida|pulse|vivienda\w*|también|después|antes|ampliar|escribir|teléfono|población|nombre|fontanería|albañilería|techo\w*|suelos?|reformas|quiere|cuando|puede)\b/gi;
const restos = [...new Set((soloTexto.match(CASTELLANO) || []).map((s) => s.toLowerCase()))];

if (fallos.length) {
  console.error("No se ha escrito ca/index.html. Estos textos de la tabla ya no están en index.html:\n- " + fallos.join("\n- "));
  process.exit(1);
}
if (restos.length) {
  const contexto = restos.map((w) => {
    const i = soloTexto.toLowerCase().search(new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"));
    return w + "  →  …" + soloTexto.slice(Math.max(0, i - 50), i + 60).replace(/\s+/g, " ") + "…";
  });
  console.error("No se ha escrito ca/index.html. Queda castellano sin traducir:\n- " + contexto.join("\n- "));
  process.exit(1);
}

fs.mkdirSync(path.join(ROOT, "ca"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "ca", "index.html"), h);
console.log("ca/index.html generado.");

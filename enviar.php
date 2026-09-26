<?php
/* =============================================================================
   Reformas F.S Fonseca — recibe el formulario de contacto
   -----------------------------------------------------------------------------
   1. Descarta robots: campo trampa relleno, envío en menos de 2,5 s u origen
      ajeno. Al robot se le contesta que todo fue bien, para que no insista.
   2. Comprueba los datos: nombre, teléfono de 9 a 15 cifras y la casilla de
      privacidad marcada.
   3. Manda la solicitud por correo a Jesús y guarda una copia en la carpeta de
      datos, que se consulta en panel.php. Si el correo no sale, la copia queda.
   4. Contesta en JSON al script de la web o, si el navegador no tiene
      JavaScript, con una página sencilla.
============================================================================= */
define('FONSECA', true);
require __DIR__ . '/inc/comun.php';

$ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'fetch';
$ca = isset($_POST['idioma']) && $_POST['idioma'] === 'ca';

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    responder_json(405, ['ok' => false, 'error' => 'metodo']);
}
if (!origen_propio()) {
    terminar(false, 'origen', 403);
}

$trampa = trim(isset($_POST['web']) ? (string) $_POST['web'] : '') !== '';
$ms = isset($_POST['ms']) ? (int) $_POST['ms'] : -1;
if ($trampa || ($ajax && $ms < 2500)) {
    terminar(true);
}

$nombre    = texto(isset($_POST['name']) ? $_POST['name'] : '', 80);
$telefono  = texto(isset($_POST['phone']) ? $_POST['phone'] : '', 30);
$poblacion = texto(isset($_POST['town']) ? $_POST['town'] : '', 80);
$tipo      = texto(isset($_POST['type']) ? $_POST['type'] : '', 80);
$mensaje   = texto(isset($_POST['message']) ? $_POST['message'] : '', 2000, true);
$acepta    = !empty($_POST['privacidad']);
$cifras    = (string) preg_replace('/\D+/', '', $telefono);

if ($nombre === '' || strlen($cifras) < 9 || strlen($cifras) > 15 || !$acepta) {
    terminar(false, 'datos', 422);
}

$ajustes = ajustes();
$ahora = time();
$solicitud = [
    't'         => $ahora,
    'nombre'    => $nombre,
    'telefono'  => $telefono,
    'poblacion' => $poblacion,
    'tipo'      => $tipo,
    'mensaje'   => $mensaje,
    'idioma'    => $ca ? 'ca' : 'es',
    'correo'    => false,
];

// Con el archivo bloqueado: se borran las solicitudes de hace más de un año,
// se frena una avalancha de envíos (no a los clientes: el tope es alto) y se
// manda el correo antes de guardar la copia con el resultado.
$resultado = actualizar_json('solicitudes.json', function ($lista) use ($solicitud, $ajustes, $ahora) {
    $hace_un_ano = $ahora - 365 * 86400;
    $lista = array_values(array_filter($lista, function ($s) use ($hace_un_ano) {
        return is_array($s) && isset($s['t']) && $s['t'] >= $hace_un_ano;
    }));
    $ultima_hora = 0;
    foreach ($lista as $s) {
        if ($s['t'] > $ahora - 3600) {
            $ultima_hora++;
        }
    }
    if ($ultima_hora >= (int) $ajustes['max_por_hora']) {
        return [$lista, 'limite'];
    }
    $solicitud['correo'] = enviar_correo($solicitud, $ajustes);
    $lista[] = $solicitud;
    if (count($lista) > 300) {
        $lista = array_slice($lista, -300);
    }
    return [$lista, $solicitud['correo'] ? 'enviada' : 'guardada'];
});

// Sin carpeta de datos no hay copia ni tope: queda el correo.
if ($resultado === null) {
    $resultado = enviar_correo($solicitud, $ajustes) ? 'enviada' : 'fallo';
}

if ($resultado === 'limite') {
    terminar(false, 'limite', 429);
}
if ($resultado === 'enviada' || $resultado === 'guardada') {
    contar('formulario');
}
if ($resultado === 'enviada') {
    terminar(true);
}
// El correo no salió. Si quedó la copia, Jesús la verá en el panel, pero al
// cliente se le ofrece WhatsApp para que su solicitud llegue seguro.
terminar(false, 'envio', 502);


/* ---------------------------------------------------------------------------
   Funciones
--------------------------------------------------------------------------- */

/** Contesta y termina: JSON para el script, página sencilla sin JavaScript. */
function terminar($ok, $error = '', $codigo = 200)
{
    global $ajax, $ca;
    if ($ajax) {
        responder_json($ok ? 200 : $codigo, $ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    }
    pagina_resultado($ok, $error, $ca, $ok ? 200 : $codigo);
}

/** Manda la solicitud al correo de Jesús. Devuelve si el servidor la aceptó. */
function enviar_correo(array $s, array $ajustes)
{
    if (!function_exists('mail')) {
        return false;
    }

    // Enlace para contestar por WhatsApp, si el teléfono lo permite.
    $cifras = (string) preg_replace('/\D+/', '', $s['telefono']);
    $wa = '';
    if (strlen($cifras) === 9 && ($cifras[0] === '6' || $cifras[0] === '7')) {
        $wa = '34' . $cifras;
    } elseif (strpos($cifras, '0034') === 0 && strlen($cifras) === 13) {
        $wa = substr($cifras, 2);
    } elseif (strpos($cifras, '34') === 0 && strlen($cifras) === 11) {
        $wa = $cifras;
    }

    $lineas = [
        'Nueva solicitud de visita desde la web' . ($s['idioma'] === 'ca' ? ' (versión en catalán)' : '') . '.',
        '',
        'Nombre: ' . $s['nombre'],
        'Teléfono: ' . $s['telefono'],
        'Población: ' . ($s['poblacion'] !== '' ? $s['poblacion'] : '—'),
        'Tipo de obra: ' . ($s['tipo'] !== '' ? $s['tipo'] : '—'),
        '',
        'Mensaje:',
        $s['mensaje'] !== '' ? $s['mensaje'] : '(sin mensaje)',
        '',
    ];
    if ($wa !== '') {
        $lineas[] = 'Contestar por WhatsApp: https://wa.me/' . $wa;
    }
    $lineas[] = 'Recibida el ' . date('d/m/Y', $s['t']) . ' a las ' . date('H:i', $s['t']) . '.';
    $lineas[] = '';
    $lineas[] = '--';
    $lineas[] = 'Este correo lo envía el formulario de reformasfonseca.com. Para contestar, llame o escriba al cliente: si responde a este correo, no le llegará.';

    $asunto = 'Solicitud de visita: ' . $s['nombre'] . ($s['poblacion'] !== '' ? ' (' . $s['poblacion'] . ')' : '');
    $remitente = $ajustes['correo_remitente'];
    $cabeceras = implode("\r\n", [
        'From: "Web Reformas F.S Fonseca" <' . $remitente . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'X-Mailer: reformasfonseca.com',
    ]);
    // El cuerpo va en base64: así ninguna línea del mensaje, por larga que
    // sea, rompe el envío, y las tildes llegan bien.
    $cuerpo = chunk_split(base64_encode(implode("\r\n", $lineas)), 76, "\n");

    return (bool) @mail($ajustes['correo_destino'], asunto_codificado($asunto), $cuerpo, $cabeceras);
}

/** Asunto con tildes, partido en trozos cortos como pide la norma del correo. */
function asunto_codificado($asunto)
{
    $letras = preg_split('//u', $asunto, -1, PREG_SPLIT_NO_EMPTY);
    if (!$letras) {
        return 'Solicitud de visita';
    }
    $trozos = [];
    $actual = '';
    foreach ($letras as $l) {
        if (strlen($actual . $l) > 42) {
            $trozos[] = $actual;
            $actual = '';
        }
        $actual .= $l;
    }
    $trozos[] = $actual;
    return implode(' ', array_map(function ($t) {
        return '=?UTF-8?B?' . base64_encode($t) . '?=';
    }, $trozos));
}

/** Página de respuesta para quien envía el formulario sin JavaScript. */
function pagina_resultado($ok, $error, $ca, $codigo)
{
    if ($ok) {
        $titulo = $ca ? 'Sol·licitud enviada' : 'Solicitud enviada';
        $texto = $ca
            ? 'Gràcies. Hem rebut la seva sol·licitud i li trucarem per concertar la visita.'
            : 'Gracias. Hemos recibido su solicitud y le llamaremos para concertar la visita.';
    } elseif ($error === 'datos') {
        $titulo = $ca ? 'Hi falta alguna dada' : 'Falta algún dato';
        $texto = $ca
            ? 'Necessitem el seu nom, un telèfon de contacte i que marqui la casella de privacitat. Torni enrere i revisi el formulari.'
            : 'Necesitamos su nombre, un teléfono de contacto y que marque la casilla de privacidad. Vuelva atrás y revise el formulario.';
    } elseif ($error === 'limite') {
        $titulo = $ca ? 'Ara no la podem rebre' : 'Ahora no podemos recibirla';
        $texto = $ca
            ? 'Hem rebut massa sol·licituds en poc temps. Truqui’ns al 613 76 64 76 o escrigui’ns per WhatsApp, si us plau.'
            : 'Hemos recibido demasiadas solicitudes en poco tiempo. Llámenos al 613 76 64 76 o escríbanos por WhatsApp, por favor.';
    } else {
        $titulo = $ca ? 'No s’ha pogut enviar' : 'No se ha podido enviar';
        $texto = $ca
            ? 'Truqui’ns al 613 76 64 76 o escrigui’ns per WhatsApp, si us plau.'
            : 'Llámenos al 613 76 64 76 o escríbanos por WhatsApp, por favor.';
    }
    $inicio = $ca ? '/ca/' : '/';
    $volver = $ca ? 'Tornar al web' : 'Volver a la web';

    http_response_code($codigo);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    echo '<!DOCTYPE html><html lang="' . ($ca ? 'ca' : 'es') . '"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex">'
        . '<title>' . e($titulo) . ' · Reformas F.S Fonseca</title>'
        . '<link rel="stylesheet" href="/styles.css"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">'
        . '</head><body class="legal"><main class="legal__in wrap">'
        . '<a class="legal__logo" href="' . $inicio . '"><img src="/assets/logo-horizontal-claro.svg" alt="Reformas F.S Fonseca" width="1177" height="208"></a>'
        . '<h1 class="h2" style="margin-top:2.4rem">' . e($titulo) . '</h1>'
        . '<p>' . e($texto) . '</p>'
        . '<p><a href="' . $inicio . '">' . e($volver) . '</a></p>'
        . '</main></body></html>';
    exit;
}

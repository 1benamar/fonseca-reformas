<?php
/* =============================================================================
   Reformas F.S Fonseca — utilidades del servidor
   -----------------------------------------------------------------------------
   Lo usan enviar.php, contar.php y panel.php. No se abre desde el navegador:
   la carpeta inc/ está bloqueada por su .htaccess y, además, sin la constante
   FONSECA este archivo no hace nada.
============================================================================= */
if (!defined('FONSECA')) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Europe/Madrid');

/** Ajustes privados (inc/ajustes.php), con valores por defecto. */
function ajustes()
{
    static $a = null;
    if ($a === null) {
        $propios = [];
        if (is_file(__DIR__ . '/ajustes.php')) {
            $propios = include __DIR__ . '/ajustes.php';
        }
        $a = array_merge([
            'correo_destino'   => 'reformasf.s.fonseca@gmail.com',
            'correo_remitente' => 'web@reformasfonseca.com',
            'clave_panel'      => '',
            'max_por_hora'     => 20,
        ], is_array($propios) ? $propios : []);
    }
    return $a;
}

/**
 * Carpeta donde se guardan las solicitudes y el contador. Primero se intenta
 * fuera de public_html, donde nadie puede pedirla por una dirección web; si el
 * hosting no lo permite, se usa inc/datos, que también está bloqueada.
 */
function carpeta_datos()
{
    static $dir = null;
    if ($dir !== null) {
        return $dir;
    }
    $opciones = [dirname(__DIR__, 2) . '/fonseca-datos', __DIR__ . '/datos'];
    foreach ($opciones as $d) {
        if ((@is_dir($d) || @mkdir($d, 0750, true)) && @is_writable($d)) {
            return $dir = $d;
        }
    }
    return $dir = '';
}

/**
 * Abre un archivo JSON de la carpeta de datos con bloqueo, deja que $cambio lo
 * modifique y lo vuelve a guardar. $cambio recibe los datos y devuelve
 * [datos nuevos, resultado]. Devuelve el resultado, o null si no se pudo abrir.
 */
function actualizar_json($nombre, callable $cambio)
{
    $dir = carpeta_datos();
    if ($dir === '') {
        return null;
    }
    $ruta = $dir . '/' . $nombre;
    $h = @fopen($ruta, 'c+');
    if (!$h) {
        return null;
    }
    $resultado = null;
    if (flock($h, LOCK_EX)) {
        $texto = stream_get_contents($h);
        $datos = ($texto === false || $texto === '') ? [] : json_decode($texto, true);
        if (!is_array($datos)) {
            // Archivo dañado: se aparta una copia y se empieza de nuevo.
            @file_put_contents($ruta . '.danado-' . date('Ymd-His'), (string) $texto);
            $datos = [];
        }
        list($datos, $resultado) = $cambio($datos);
        rewind($h);
        ftruncate($h, 0);
        fwrite($h, json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        fflush($h);
        flock($h, LOCK_UN);
    }
    fclose($h);
    return $resultado;
}

/** Lee un archivo JSON de la carpeta de datos (para el panel). */
function leer_json($nombre)
{
    $dir = carpeta_datos();
    if ($dir === '' || !is_file($dir . '/' . $nombre)) {
        return [];
    }
    $datos = json_decode((string) @file_get_contents($dir . '/' . $nombre), true);
    return is_array($datos) ? $datos : [];
}

/**
 * Suma uno al contador del día. Solo se guardan números por día y por tipo:
 * ni direcciones IP, ni navegador, ni nada que identifique a nadie.
 */
function contar($evento, $idioma = '')
{
    $clave = $evento === 'visita' ? 'visita_' . ($idioma === 'ca' ? 'ca' : 'es') : $evento;
    $hoy = date('Y-m-d');
    $limite = date('Y-m-d', strtotime('-400 days'));
    actualizar_json('contador.json', function ($dias) use ($clave, $hoy, $limite) {
        if (!isset($dias[$hoy]) || !is_array($dias[$hoy])) {
            $dias[$hoy] = [];
        }
        $dias[$hoy][$clave] = (isset($dias[$hoy][$clave]) ? (int) $dias[$hoy][$clave] : 0) + 1;
        foreach (array_keys($dias) as $dia) {
            if ($dia < $limite) {
                unset($dias[$dia]);
            }
        }
        return [$dias, true];
    });
}

/**
 * Texto recibido de un formulario, limpio: sin caracteres de control, sin
 * espacios de sobra y con un largo máximo. Si no es UTF-8 válido, queda vacío.
 */
function texto($valor, $max, $varias_lineas = false)
{
    $v = is_string($valor) ? str_replace(["\r\n", "\r"], "\n", $valor) : '';
    $v = $varias_lineas ? preg_replace('/[^\P{C}\n]/u', '', $v) : preg_replace('/\p{C}/u', ' ', $v);
    if ($v === null) {
        return '';
    }
    $v = $varias_lineas ? preg_replace("/\n{3,}/", "\n\n", $v) : preg_replace('/\s+/u', ' ', $v);
    $v = trim((string) $v);
    return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}

/** Respuesta en JSON para el script de la web. */
function responder_json($codigo, array $datos)
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Respuesta vacía (para el contador). */
function sin_contenido()
{
    http_response_code(204);
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex, nofollow');
    exit;
}

/** La petición viene de la propia web (o no dice de dónde viene). */
function origen_propio()
{
    $origen = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
    if ($origen === '') {
        return true;
    }
    $host = strtolower((string) parse_url($origen, PHP_URL_HOST));
    $propio = strtolower((string) preg_replace('/:\d+$/', '', isset($_SERVER['HTTP_HOST']) ? (string) $_SERVER['HTTP_HOST'] : ''));
    return $host !== '' && ($host === $propio || $host === 'reformasfonseca.com' || $host === 'www.reformasfonseca.com');
}

/** Robots, buscadores y herramientas: no cuentan como visitas. */
function es_robot()
{
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
    return $ua === '' || (bool) preg_match('/bot|crawl|spider|slurp|preview|lighthouse|headless|curl|wget|python|java\/|http-client|go-http|axios|node-fetch/i', $ua);
}

/* ---------------------------------------------------------------------------
   Correo
   Los avisos salen por el buzón del dominio (p. ej. web@reformasfonseca.com)
   con usuario y contraseña, como cualquier programa de correo. Así llegan
   firmados por el dominio y Gmail no los rechaza. La contraseña la escribe el
   dueño en panel.php y se guarda en la carpeta de datos, fuera de la web; no
   está en ningún archivo del proyecto. Sin buzón configurado, se intenta con
   el correo básico del servidor.
--------------------------------------------------------------------------- */

/** Buzón configurado en el panel: ['cuenta' => ..., 'clave' => ...] o vacío. */
function correo_buzon()
{
    $b = leer_json('correo.json');
    return (!empty($b['cuenta']) && !empty($b['clave'])) ? $b : [];
}

/** Guarda el buzón (desde el panel). */
function correo_guardar_buzon($cuenta, $clave)
{
    return actualizar_json('correo.json', function () use ($cuenta, $clave) {
        return [['cuenta' => $cuenta, 'clave' => $clave, 'fecha' => time()], true];
    }) === true;
}

/** Último error del envío, para mostrarlo en el panel. */
$GLOBALS['correo_error'] = '';

/**
 * Manda un aviso a correo_destino. Devuelve si salió. Por el buzón del
 * dominio si está configurado; si no, o si falla, con mail() del servidor.
 */
function correo_enviar($asunto, $texto)
{
    $a = ajustes();
    $buzon = correo_buzon();
    $remitente = $buzon ? $buzon['cuenta'] : $a['correo_remitente'];
    $cabeceras = [
        'Date: ' . date('r'),
        'From: "Web Reformas F.S Fonseca" <' . $remitente . '>',
        'To: <' . $a['correo_destino'] . '>',
        'Subject: ' . asunto_codificado($asunto),
        'Message-ID: <' . bin2hex(random_bytes(8)) . '.' . time() . '@reformasfonseca.com>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'X-Mailer: reformasfonseca.com',
    ];
    // Cuerpo en base64: ninguna línea, por larga que sea, rompe el envío.
    $cuerpo = chunk_split(base64_encode($texto), 76, "\r\n");

    if ($buzon) {
        $error = '';
        if (smtp_enviar($buzon, $a['correo_destino'], implode("\r\n", $cabeceras) . "\r\n\r\n" . $cuerpo, $error)) {
            $GLOBALS['correo_error'] = '';
            return true;
        }
        $GLOBALS['correo_error'] = $error;
    }
    if (!function_exists('mail')) {
        return false;
    }
    // mail() pone por su cuenta el destinatario y el asunto
    $resto = array_values(array_filter($cabeceras, function ($c) {
        return strpos($c, 'To:') !== 0 && strpos($c, 'Subject:') !== 0 && strpos($c, 'Date:') !== 0;
    }));
    return (bool) @mail($a['correo_destino'], asunto_codificado($asunto), str_replace("\r\n", "\n", $cuerpo), implode("\r\n", $resto));
}

/**
 * Envío por SMTP con SSL (smtp.hostinger.com:465) y usuario y contraseña.
 * En $error queda qué paso falló, sin la contraseña.
 */
function smtp_enviar(array $buzon, $para, $mensaje, &$error)
{
    $a = ajustes();
    // Cuenta de Gmail: por el servidor de Google, con una contraseña de
    // aplicación. Cualquier otra (buzón del dominio): por Hostinger.
    $gmail = (bool) preg_match('/@(gmail|googlemail)\.com$/i', $buzon['cuenta']);
    $servidor = $gmail ? 'smtp.gmail.com' : (isset($a['smtp_servidor']) ? $a['smtp_servidor'] : 'smtp.hostinger.com');
    $puerto = $gmail ? 465 : (isset($a['smtp_puerto']) ? (int) $a['smtp_puerto'] : 465);
    // Google enseña la contraseña de aplicación en grupos con espacios
    if ($gmail) {
        $buzon['clave'] = str_replace(' ', '', $buzon['clave']);
    }
    $fp = @stream_socket_client('ssl://' . $servidor . ':' . $puerto, $errno, $errstr, 15);
    if (!$fp) {
        $error = 'No se pudo conectar con ' . $servidor . ' (' . $errstr . ')';
        return false;
    }
    stream_set_timeout($fp, 20);
    $leer = function () use ($fp) {
        $respuesta = '';
        while (($linea = fgets($fp, 515)) !== false) {
            $respuesta .= $linea;
            if (strlen($linea) < 4 || $linea[3] === ' ') {
                break;
            }
        }
        return $respuesta;
    };
    // Cada paso: lo que se manda, qué respuesta se espera y cómo se llama si falla
    $pasos = [
        [null, '220', 'saludo del servidor'],
        ['EHLO reformasfonseca.com', '250', 'presentación'],
        ['AUTH LOGIN', '334', 'inicio de sesión'],
        [base64_encode($buzon['cuenta']), '334', 'cuenta de correo'],
        [base64_encode($buzon['clave']), '235', 'contraseña (revise la cuenta y la contraseña)'],
        ['MAIL FROM:<' . $buzon['cuenta'] . '>', '250', 'remitente'],
        ['RCPT TO:<' . $para . '>', '250', 'destinatario'],
        ['DATA', '354', 'inicio del mensaje'],
    ];
    foreach ($pasos as $p) {
        if ($p[0] !== null) {
            fwrite($fp, $p[0] . "\r\n");
        }
        $r = $leer();
        if (strpos($r, $p[1]) !== 0) {
            $error = 'Falló: ' . $p[2] . ' → ' . trim(preg_replace('/\s+/', ' ', $r));
            fclose($fp);
            return false;
        }
    }
    // Una línea que empiece por punto se dobla, como manda el protocolo
    fwrite($fp, preg_replace('/^\./m', '..', $mensaje) . "\r\n.\r\n");
    $r = $leer();
    fwrite($fp, "QUIT\r\n");
    fclose($fp);
    if (strpos($r, '250') !== 0) {
        $error = 'Falló: envío del mensaje → ' . trim(preg_replace('/\s+/', ' ', $r));
        return false;
    }
    return true;
}

/** Asunto con tildes, partido en trozos cortos como pide la norma del correo. */
function asunto_codificado($asunto)
{
    $letras = preg_split('//u', $asunto, -1, PREG_SPLIT_NO_EMPTY);
    if (!$letras) {
        return 'Aviso de la web';
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

/** Escapa texto para meterlo en HTML. */
function e($texto)
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

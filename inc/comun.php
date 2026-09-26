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

/** Escapa texto para meterlo en HTML. */
function e($texto)
{
    return htmlspecialchars((string) $texto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

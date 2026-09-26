<?php
/* =============================================================================
   Reformas F.S Fonseca — panel privado
   -----------------------------------------------------------------------------
   Cuántas visitas y contactos trae la web, y las solicitudes que han llegado
   por el formulario. Solo se abre con la clave de inc/ajustes.php:
       https://reformasfonseca.com/panel.php?k=CLAVE
   Con otra clave o sin ella, responde como una página que no existe.
============================================================================= */
define('FONSECA', true);
require __DIR__ . '/inc/comun.php';

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

$ajustes = ajustes();
$clave = isset($_GET['k']) ? (string) $_GET['k'] : '';
if (strlen($ajustes['clave_panel']) < 20 || !hash_equals($ajustes['clave_panel'], $clave)) {
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    if (is_file(__DIR__ . '/404.html')) {
        readfile(__DIR__ . '/404.html');
    } else {
        echo 'Página no encontrada';
    }
    exit;
}

$dias = leer_json('contador.json');
$solicitudes = array_reverse(leer_json('solicitudes.json'));
$claves = ['visita_es', 'visita_ca', 'llamada', 'whatsapp', 'formulario'];

/** Suma de cada contador desde una fecha (AAAA-MM-DD) hasta hoy. */
function sumar(array $dias, $desde, array $claves)
{
    $total = array_fill_keys($claves, 0);
    foreach ($dias as $dia => $cuentas) {
        if ($dia >= $desde && is_array($cuentas)) {
            foreach ($claves as $c) {
                $total[$c] += isset($cuentas[$c]) ? (int) $cuentas[$c] : 0;
            }
        }
    }
    return $total;
}

$hoy = sumar($dias, date('Y-m-d'), $claves);
$semana = sumar($dias, date('Y-m-d', strtotime('-6 days')), $claves);
$mes = sumar($dias, date('Y-m-d', strtotime('-29 days')), $claves);

$dias_semana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
$filas = [];
for ($i = 0; $i < 30; $i++) {
    $t = strtotime('-' . $i . ' days');
    $d = date('Y-m-d', $t);
    $c = isset($dias[$d]) && is_array($dias[$d]) ? $dias[$d] : [];
    $v = [];
    foreach ($claves as $k) {
        $v[$k] = isset($c[$k]) ? (int) $c[$k] : 0;
    }
    if (array_sum($v) > 0) {
        $filas[] = [$dias_semana[(int) date('w', $t)] . ' ' . date('d/m', $t), $v];
    }
}

$datos = carpeta_datos();
if ($datos === '') {
    $donde = 'no se pueden guardar (revise los permisos de la carpeta inc)';
} elseif (strpos($datos, dirname(__DIR__)) === 0 && strpos($datos, __DIR__) !== 0) {
    $donde = 'fuera de la web, donde nadie puede abrirlos';
} else {
    $donde = 'en la carpeta protegida inc/datos';
}

function cifra($numero, $texto, $detalle)
{
    return '<div class="pp-cifra"><span>' . e($texto) . '</span><b>' . (int) $numero . '</b><small>' . $detalle . '</small></div>';
}
?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Panel · Reformas F.S Fonseca</title>
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<style>
  .pp { max-width: 66rem; padding-block: clamp(2rem, 5vw, 3.5rem) 5rem; }
  .pp__logo img { width: 190px; height: auto; }
  .pp h1 { margin-top: 2rem; }
  .pp h2 { margin-top: 3.2rem; font-size: 1.35rem; }
  .pp p { margin-top: .8rem; color: var(--ink-2); line-height: 1.7; }
  .pp-sub { color: var(--muted); }
  .pp-cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 1px; margin-top: 1.4rem; background: var(--line-2); border: 1px solid var(--line-2); }
  .pp-cifra { padding: 1.2rem 1.3rem 1.3rem; background: var(--paper); }
  .pp-cifra span { display: block; font-size: .7rem; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .pp-cifra b { display: block; margin-top: .4rem; font-family: var(--serif); font-size: 2.2rem; font-weight: 400; line-height: 1; color: var(--ink); font-variant-numeric: lining-nums tabular-nums; }
  .pp-cifra small { display: block; margin-top: .55rem; font-size: .8rem; color: var(--muted); }
  .pp-tabla { width: 100%; margin-top: 1.2rem; border-collapse: collapse; font-size: .92rem; font-variant-numeric: tabular-nums; }
  .pp-tabla th, .pp-tabla td { padding: .6rem .7rem; border-bottom: 1px solid var(--line); text-align: right; }
  .pp-tabla th:first-child, .pp-tabla td:first-child { text-align: left; }
  .pp-tabla th { font-size: .68rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .pp-tabla td { color: var(--ink); }
  .pp-tabla td.cero { color: var(--muted); }
  .pp-scroll { overflow-x: auto; }
  .pp-sol { margin-top: 1.2rem; display: grid; gap: 1px; background: var(--line-2); border: 1px solid var(--line-2); }
  .pp-sol article { padding: 1.3rem 1.4rem; background: var(--paper); }
  .pp-sol h3 { font-size: 1.15rem; }
  .pp-sol .cuando { font-size: .8rem; color: var(--muted); }
  .pp-sol dl { display: grid; grid-template-columns: 7.5rem 1fr; gap: .35rem 1rem; margin-top: .8rem; font-size: .95rem; }
  .pp-sol dt { font-size: .68rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); padding-top: .2rem; }
  .pp-sol dd { color: var(--ink); overflow-wrap: anywhere; }
  .pp-sol a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--line-2); }
  .pp-aviso { color: var(--error); }
  .pp-nota { margin-top: 1rem; padding: 1rem 1.2rem; border-left: 2px solid var(--marca); background: var(--paper); font-size: .92rem; }
  .pp-nota p { margin-top: .35rem; }
  .pp-nota p:first-child { margin-top: 0; }
</style>
</head>
<body class="legal">
<main class="pp wrap">
  <a class="pp__logo" href="/"><img src="/assets/logo-horizontal-claro.svg" alt="Reformas F.S Fonseca" width="1177" height="208"></a>

  <h1 class="h2">Panel de la web</h1>
  <p class="pp-sub">Datos de reformasfonseca.com a <?= e(date('d/m/Y, H:i')) ?>. Guarde esta página en favoritos: la dirección lleva la clave.</p>

  <h2>Últimos 30 días</h2>
  <div class="pp-cifras">
    <?= cifra($mes['visita_es'] + $mes['visita_ca'], 'Visitas', 'Hoy ' . ($hoy['visita_es'] + $hoy['visita_ca']) . ' · 7 días ' . ($semana['visita_es'] + $semana['visita_ca']) . '<br>En catalán: ' . $mes['visita_ca']) ?>
    <?= cifra($mes['llamada'], 'Pulsan llamar', 'Hoy ' . $hoy['llamada'] . ' · 7 días ' . $semana['llamada']) ?>
    <?= cifra($mes['whatsapp'], 'Pulsan WhatsApp', 'Hoy ' . $hoy['whatsapp'] . ' · 7 días ' . $semana['whatsapp']) ?>
    <?= cifra($mes['formulario'], 'Solicitudes', 'Hoy ' . $hoy['formulario'] . ' · 7 días ' . $semana['formulario']) ?>
  </div>
  <div class="pp-nota">
    <p><strong>Visitas:</strong> veces que se abre la web. Una misma persona cuenta cada vez que entra; los buscadores y robots no cuentan.</p>
    <p><strong>Pulsan llamar y WhatsApp:</strong> veces que alguien toca el teléfono o el botón de WhatsApp. Se sabe que lo intentó, no si llegó a llamar o a escribir.</p>
    <p><strong>Solicitudes:</strong> formularios recibidos. Están todas abajo.</p>
  </div>

  <h2>Día a día</h2>
  <?php if (!$filas): ?>
    <p>Todavía no hay datos. La web cuenta desde que se subió esta versión.</p>
  <?php else: ?>
    <div class="pp-scroll">
      <table class="pp-tabla">
        <thead><tr><th>Día</th><th>Visitas</th><th>Catalán</th><th>Llamar</th><th>WhatsApp</th><th>Solicitudes</th></tr></thead>
        <tbody>
        <?php foreach ($filas as $f): list($etiqueta, $v) = $f; ?>
          <tr>
            <td><?= e($etiqueta) ?></td>
            <?php foreach ([$v['visita_es'] + $v['visita_ca'], $v['visita_ca'], $v['llamada'], $v['whatsapp'], $v['formulario']] as $n): ?>
              <td<?= $n ? '' : ' class="cero"' ?>><?= (int) $n ?></td>
            <?php endforeach; ?>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>

  <h2>Solicitudes recibidas</h2>
  <?php if (!$solicitudes): ?>
    <p>Todavía no ha llegado ninguna por el formulario.</p>
  <?php else: ?>
    <p class="pp-sub">Las más recientes primero. Cada solicitud llega también por correo; se borran solas al cabo de un año.</p>
    <div class="pp-sol">
      <?php foreach (array_slice($solicitudes, 0, 100) as $s):
          if (!is_array($s)) continue;
          $cifras = (string) preg_replace('/\D+/', '', isset($s['telefono']) ? $s['telefono'] : '');
          $tel = strlen($cifras) === 9 ? '+34' . $cifras : '+' . ltrim($cifras, '0');
          $wa = (strlen($cifras) === 9 && ($cifras[0] === '6' || $cifras[0] === '7')) ? '34' . $cifras : '';
      ?>
        <article>
          <p class="cuando"><?= e(date('d/m/Y, H:i', isset($s['t']) ? (int) $s['t'] : 0)) ?><?= (isset($s['idioma']) && $s['idioma'] === 'ca') ? ' · desde la versión en catalán' : '' ?></p>
          <h3><?= e(isset($s['nombre']) ? $s['nombre'] : '') ?></h3>
          <dl>
            <dt>Teléfono</dt>
            <dd><a href="tel:<?= e($tel) ?>"><?= e(isset($s['telefono']) ? $s['telefono'] : '') ?></a><?php if ($wa): ?> · <a href="https://wa.me/<?= e($wa) ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a><?php endif; ?></dd>
            <?php if (!empty($s['poblacion'])): ?><dt>Población</dt><dd><?= e($s['poblacion']) ?></dd><?php endif; ?>
            <?php if (!empty($s['tipo'])): ?><dt>Obra</dt><dd><?= e($s['tipo']) ?></dd><?php endif; ?>
            <?php if (!empty($s['mensaje'])): ?><dt>Mensaje</dt><dd><?= nl2br(e($s['mensaje'])) ?></dd><?php endif; ?>
            <dt>Correo</dt>
            <dd><?= !empty($s['correo']) ? 'Enviado' : '<span class="pp-aviso">No salió: esta solicitud solo está aquí</span>' ?></dd>
          </dl>
        </article>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <h2>Estado</h2>
  <div class="pp-nota">
    <p><strong>Correo del servidor:</strong> <?= function_exists('mail') ? 'disponible' : '<span class="pp-aviso">no disponible: las solicitudes solo llegan a este panel</span>' ?>.</p>
    <p><strong>Datos guardados:</strong> <?= e($donde) ?>.</p>
    <p><strong>Aviso por correo a:</strong> <?= e($ajustes['correo_destino']) ?>. Si no llegan, mire en la carpeta de spam y marque el mensaje como «No es spam».</p>
  </div>
</main>
</body>
</html>

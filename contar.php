<?php
/* =============================================================================
   Reformas F.S Fonseca — contador de la web
   -----------------------------------------------------------------------------
   Recibe un aviso cuando alguien abre la web o pulsa el teléfono o WhatsApp,
   y suma uno al número de ese día. Sin cookies y sin guardar nada de la
   persona: ni su IP, ni su navegador. Los robots no cuentan.
   Las solicitudes del formulario las cuenta enviar.php al recibirlas.
============================================================================= */
define('FONSECA', true);
require __DIR__ . '/inc/comun.php';

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    responder_json(405, ['ok' => false, 'error' => 'metodo']);
}
if (!origen_propio() || es_robot()) {
    sin_contenido();
}

$evento = isset($_POST['e']) ? (string) $_POST['e'] : '';
if (!in_array($evento, ['visita', 'llamada', 'whatsapp'], true)) {
    sin_contenido();
}

contar($evento, isset($_POST['idioma']) ? (string) $_POST['idioma'] : '');
sin_contenido();

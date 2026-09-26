<?php
/* =============================================================================
   Reformas F.S Fonseca — ajustes privados del servidor (PLANTILLA)
   -----------------------------------------------------------------------------
   Copie este archivo como inc/ajustes.php y ponga una clave larga y al azar.
   inc/ajustes.php no se sube a GitHub (.gitignore): el repositorio es público.
============================================================================= */
return [
    // Adónde llegan las solicitudes del formulario
    'correo_destino'   => 'reformasf.s.fonseca@gmail.com',
    // Remitente que aparece en esos correos
    'correo_remitente' => 'web@reformasfonseca.com',
    // Clave del panel: https://reformasfonseca.com/panel.php?k=CLAVE
    'clave_panel'      => 'CAMBIAR-POR-UNA-CLAVE-LARGA-Y-AL-AZAR',
    // Tope de solicitudes por hora, para frenar una avalancha de spam
    'max_por_hora'     => 20,
];

# Reformas F.S Fonseca

Web de [Reformas F.S Fonseca](https://www.google.com/search?q=Reformas+F.S+Fonseca&ludocid=10882672693632433816), empresa de reformas e instalaciones que trabaja en Barcelona y Girona desde Tordera.

Sitio estático: HTML, CSS y JavaScript sin dependencias, sin compilación y sin base de datos. Se sube tal cual a Hostinger o a cualquier alojamiento estático.

## Cómo verla en local

```bash
node tools/serve.js 8850
```

Y abrir `http://localhost:8850`.

## Qué hay en cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La página entera |
| `styles.css` | Todos los estilos. La web va siempre en azul oscuro, sin variante clara |
| `main.js` | Menú, apariciones al hacer scroll, carrusel y formulario |
| `lib/manifest.js` | Teléfono y WhatsApp. Es el único sitio donde tocar los datos de contacto |
| `assets/img/` | Fotografías |
| `assets/logo.svg` | El logo en archivo suelto |
| `assets/credits.json` | Autoría de las fotos de muestra |
| `.htaccess` | Cabeceras de caché y compresión para el servidor |
| `tools/serve.js` | Servidor local, solo para desarrollo |
| `LEEME.txt` | Instrucciones para el cliente, en lenguaje llano |
| `PRODUCT.md` | Ficha del negocio que sirvió de base para el diseño |

## Pendiente

- Sustituir las nueve fotografías de muestra por fotos de obras propias. Al hacerlo, borrar del `index.html` el párrafo `footer__credits`.
- Añadir la dirección de la web al perfil de empresa de Google.

## Créditos de las fotografías

Todas las fotografías y el vídeo son obra del propio cliente, tomadas en sus reformas. No queda material de banco de imágenes. La titularidad está recogida en `assets/credits.json`.

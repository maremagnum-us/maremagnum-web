# maremagnum.us

Web de Mare Magnum: traducción de documentos legales y de inmigración del español al inglés.

Web estática (HTML, CSS y JavaScript, sin frameworks ni proceso de build). Se publica en Cloudflare Pages desde la rama `main`.

## Estructura

```
index.html            Página principal (inglés)
privacy/index.html    Política de privacidad
404.html              Página de "no encontrado"
assets/css/tokens.css Colores y tipografía: el único sitio donde se definen
assets/css/base.css   Reglas generales
assets/css/main.css   Diseño de cada sección y animaciones
assets/js/main.js     Menú móvil, apariciones, buscador de documentos y formulario
assets/fonts/         Libre Baskerville y DM Sans (alojadas en la propia web)
assets/img/           Cartas náuticas de dominio público y favicon
_headers              Cabeceras de seguridad para Cloudflare Pages
```

## Cambiar de paleta

Las tres paletas están en `assets/css/tokens.css`. Para usar la 2 o la 3, añade `data-palette="2"` (o `"3"`) a la etiqueta `<html>` de cada página.

## Ver la web en local

Cualquier servidor estático sirve, por ejemplo:

```
npx serve .
```

## Imágenes

Las cartas náuticas son de dominio público (Wikimedia Commons). Los créditos están en el pie de la página y en `assets/credits.json`.

## Si cambias el script del `<head>`

El pequeño script en línea de `index.html` está autorizado por su huella (hash) en `_headers`. Si lo cambias, hay que recalcular esa huella o el navegador lo bloqueará.

# maremagnum.us

Web de MAREMAGNUM: traducción de documentos legales y de inmigración del español al inglés.

Web estática (HTML, CSS y JavaScript, sin frameworks ni proceso de build). Se publica en Cloudflare Pages desde la rama `main`.

## Estructura

```
index.html            Página principal en español (idioma por defecto)
privacidad/index.html Política de privacidad en español
en/index.html         Página principal en inglés (/en/)
en/privacy/index.html Política de privacidad en inglés
404.html              Página de "no encontrado"
assets/css/tokens.css Colores (paleta A · Abismo), tipografía y medidas: el único sitio donde se definen
assets/css/base.css   Reglas generales, botones y nombre de marca
assets/css/main.css   Diseño de cada sección y animaciones
assets/js/early.js    Activa las animaciones de entrada antes de pintar
assets/js/main.js     Marea de fondo, lupa, papeles que se ordenan, tarjetas, buscador, menú y formulario
assets/fonts/         Fraunces, Instrument Sans y Montserrat (alojadas en la propia web)
assets/brand/         Icono de MAREMAGNUM (SVG y PNG para favicon)
_headers              Cabeceras de seguridad para Cloudflare Pages
```

## Dos idiomas

Español en `/` (idioma por defecto) e inglés en `/en/`. Cualquier cambio de contenido se aplica a los dos archivos. Los textos que escribe el JavaScript (errores del formulario, buscador, menú) están en `assets/js/main.js`, en el bloque `I18N`.

## Ver la web en local

Cualquier servidor estático sirve, por ejemplo:

```
npx serve .
```

## Reglas rápidas

- El nombre se escribe siempre **MAREMAGNUM**, en el color de marca `#1498D5` (sobre papel, `#0D6FA0`).
- Los datos que faltan se marcan como `[[PENDIENTE: ...]]` y se ven resaltados en amarillo.
- Todo efecto que depende del ratón tiene su versión táctil y respeta "reducir movimiento".

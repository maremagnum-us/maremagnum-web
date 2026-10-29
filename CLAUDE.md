# Web de Mare Magnum (maremagnum.us)

Web estática de Mare Magnum, empresa de traducciones español → inglés de documentos legales y de inmigración, con sede en Texas y alcance nacional. Quien la mantiene no es desarrollador: explica cada cambio en español y de forma sencilla, y enséñale lo que estás haciendo.

## Para quién es la web
1. **Firmas de abogados de inmigración** (público principal).
2. Clientes particulares hispanohablantes; hoy todos son venezolanos.

Objetivo inmediato: publicar una web de calidad para completar el registro de la empresa en la American Translators Association (ATA).

## Contexto ampliado (privado, fuera del repositorio)
La especificación completa y el backlog están en la carpeta `../maremagnum-context/`, junto al repositorio pero fuera de él:
- `../maremagnum-context/especificacion-web.md`: qué tiene que tener la web. Léela antes de diseñar o añadir secciones.
- `../maremagnum-context/backlog.md`: tareas por prioridad (P1 Prioritario, P2 Pendiente, P3 Futuro) y preguntas para Freddy.

Nunca copies esos documentos ni su contenido interno dentro del repositorio, que es público.

## Stack
- HTML, CSS y JS estáticos. Sin frameworks ni proceso de build salvo que se acuerde.
- Publicación: Cloudflare Pages, automática al subir cambios a la rama `main`.
- Bilingüe: inglés en `/` y español en `/es/`. Cualquier cambio de contenido se aplica a los dos idiomas.
- Formulario de contacto sin adjuntos, con protección antispam. Se procesa con una función de Cloudflare o con un servicio externo (por decidir). Las claves van como secretos en Cloudflare, nunca en el código.

## Estructura de la página
Portada → Para firmas de abogados → Servicios (documentos en ambos idiomas) → Cómo funciona → Para particulares → Precio ("te enviamos un presupuesto") → Preguntas frecuentes → Contacto (formulario y info@) → Pie (nombre legal, política de privacidad, idioma).

## Diseño
- Skills por tarea:
  - Dirección artística y maquetación: `design-taste-frontend` e `impeccable`.
  - Pulido y animaciones: `emil-design-eng`.
  - Que se sienta bien en móvil y tablet (toque, teclado, zoom, notch): `mobile-native`.
  - Probar el diseño con textos largos y casos extremos (sobre todo la versión en español): `break-ui`.
  - Textos de la página: `copywriting`; revisión de conversión (que la gente rellene el formulario): `cro`.
  - Comprobación en navegador real (móvil y escritorio, ambos idiomas): `webapp-testing`.
- Queremos pulido y animaciones: transiciones suaves, aparición al hacer scroll y olas con movimiento sutil. Respeta siempre `prefers-reduced-motion` y no penalices la velocidad de carga.
- Azules claros con varios matices, más claros que los de la competencia, y un motivo de ola o mar.
- Hay tres paletas candidatas en `../maremagnum-context/especificacion-web.md`. Define los colores como variables CSS en un único sitio para poder cambiar de paleta sin tocar el resto.
- Limpio y con poco texto.
- **Totalmente responsive:** debe verse y funcionar bien en móvil, tablet y escritorio, en vertical y horizontal. Diseña primero para móvil. Comprueba siempre en 360, 390–430, 768, 1024 y 1440 px. Botones de al menos 44 × 44 px, sin depender del hover, sin scroll horizontal y sin zoom al escribir en el formulario.
- Un guiño discreto a Venezuela (bandera o colores en un detalle).
- Accesible: contraste, textos alternativos y formulario usable con teclado.

## Reglas
- El repositorio es **público**: nunca incluir contraseñas, tokens, claves ni datos de clientes.
- No escribir "certified translator", "ATA certified" ni usar el logo de la ATA mientras la membresía no esté aprobada. Después, solo "ATA Member".
- No inventar servicios, plazos, precios, reseñas ni certificaciones. Si falta un dato, dejar un marcador visible `[[PENDIENTE: ...]]` y avisar.
- Nada de subida de documentos, inicio de sesión, base de datos ni chat con IA en esta versión.
- Sin rastreadores ni scripts de terceros sin acordarlo antes.
- Antes de hacer commit, revisar la web en local y comprobar ambos idiomas en las cinco anchuras de referencia (con `webapp-testing`).
- Mensajes de commit cortos y descriptivos, en español.

# holygrailcss — Guía completa de maquetación

Referencia completa para desarrolladores que usan holygrailcss. Cubre instalación, configuración, y todas las clases CSS disponibles: colores, spacing, tipografía, helpers, grid, aspect ratios y temas.

## Instalación en tu proyecto

### npm

```bash
npm install holygrailcss
```

### Importar el CSS

Una vez instalado, importa el CSS generado en tu proyecto. Elige el método según tu stack:

**HTML directo:**

```html
<link rel="stylesheet" href="node_modules/holygrailcss/dist/output.css">
```

**Bundler (Vite, Webpack, etc.):**

```js
import 'holygrailcss/dist/output';
```

**React / Next.js** (en tu layout o _app):

```js
import 'holygrailcss/dist/output';
```

**Con tema Black&White** (opcional — importar después del base):

```js
import 'holygrailcss/dist/output';
import 'holygrailcss/dist/black-and-white';
```

**CodePen / JSFiddle / playground online:**

```html
<link rel="stylesheet" href="https://unpkg.com/holygrailcss/dist/output.css">
```

Con tema Black&White:

```html
<link rel="stylesheet" href="https://unpkg.com/holygrailcss/dist/output.css">
<link rel="stylesheet" href="https://unpkg.com/holygrailcss/dist/themes/black-and-white.css">
```

En CodePen, pega la URL en **Settings → CSS → Add External Stylesheets**.

### Generar CSS personalizado

Si necesitas personalizar el design system (colores, breakpoints, spacing, etc.), copia el `config.json` a tu proyecto y genera tu propio CSS:

```bash
# Copiar config al proyecto
cp node_modules/holygrailcss/config.json ./hg-config.json

# Editar hg-config.json con tus valores

# Generar CSS personalizado
npx holygrailcss
```

Esto genera `dist/output.css` con las clases adaptadas a tu configuración.

### Desarrollo en caliente

```bash
# Watch mode — regenera CSS al cambiar config.json
npm run dev
```

## Antes de maquetar

Siempre consulta el `config.json` del proyecto antes de maquetar. Todo el CSS se genera desde ese archivo. Las clases disponibles dependen directamente de lo que esté configurado ahí.

El prefijo por defecto es `hg`. Todas las clases de helpers usan este prefijo (`.hg-d-flex`), mientras que las clases de spacing no llevan prefijo (`.p-16`, `.m-8`).

## Variables CSS

holygrailcss genera variables CSS en `:root` que son la base de todo el sistema. Nunca hardcodees valores — usa siempre las variables.

### Colores

Definidos en `config.colors`. Cada color genera una variable `--hg-color-{nombre}`.

```css
/* Uso en CSS */
color: var(--hg-color-primary);
background: var(--hg-color-bg-cream);
border-color: var(--hg-color-error);

/* Uso inline en HTML (cuando no hay clase específica) */
<div style="color: var(--hg-color-dark-grey)">Texto</div>
```

Colores disponibles por defecto: `white`, `black`, `dark-grey`, `middle-grey`, `light-grey`, `grey-ultra`, `orange`, `mustard`, `primary`, `error`, `info`, `success`, `warning`, `feel`, `feel-dark`, `silver`, `gold`, `platinum`, `bg-light`, `bg-cream`.

### Spacing

Definido en `config.spacingMap`. Cada valor genera `--hg-spacing-{key}`.

```css
/* Variables de spacing */
--hg-spacing-0: 0;
--hg-spacing-4: 0.25rem;
--hg-spacing-8: 0.5rem;
--hg-spacing-16: 1rem;
--hg-spacing-24: 1.5rem;
--hg-spacing-32: 2rem;
/* ... hasta 160 */

/* Porcentajes */
--hg-spacing-50-percent: 50%;
--hg-spacing-100-percent: 100%;
```

Los valores px se convierten automáticamente a rem (base 16px).

### Tipografía

Las variables tipográficas se generan automáticamente y se deduplicam para evitar repeticiones:

```css
--hg-typo-font-family-primary-regular: arial, sans-serif;
--hg-typo-font-family-secondary: "ms-serif", serif;
--hg-typo-font-size-12: 0.75rem;
--hg-typo-font-size-14: 0.875rem;
--hg-typo-font-size-24: 1.5rem;
--hg-typo-line-height-1-2: 1.2;
--hg-typo-line-height-1-5: 1.5;
--hg-typo-font-weight-100: 100;
--hg-typo-font-weight-700: 700;
```

## Spacing — Clases de padding y margin

El generador crea clases de spacing para cada valor en `spacingMap`. Las clases no llevan prefijo `hg-` para mayor brevedad.

### Padding

| Clase | Propiedad CSS | Ejemplo |
|-------|--------------|---------|
| `.p-{key}` | padding (4 lados) | `.p-16` → 1rem |
| `.pt-{key}` | padding-top | `.pt-24` → 1.5rem |
| `.pb-{key}` | padding-bottom | `.pb-8` → 0.5rem |
| `.pl-{key}` | padding-inline-start (left) | `.pl-32` |
| `.pr-{key}` | padding-inline-end (right) | `.pr-0` |
| `.hg-px-{key}` | padding-inline (horizontal) | `.hg-px-16` |
| `.hg-py-{key}` | padding-block (vertical) | `.hg-py-24` |

### Margin

| Clase | Propiedad CSS | Ejemplo |
|-------|--------------|---------|
| `.m-{key}` | margin (4 lados) | `.m-16` |
| `.mt-{key}` | margin-top | `.mt-32` |
| `.mb-{key}` | margin-bottom | `.mb-8` |
| `.ml-{key}` | margin-inline-start (left) | `.ml-0` |
| `.mr-{key}` | margin-inline-end (right) | `.mr-16` |
| `.hg-mx-{key}` | margin-inline (horizontal) | `.hg-mx-24` |
| `.hg-my-{key}` | margin-block (vertical) | `.hg-my-16` |

### Variantes responsive

Todas las clases de spacing tienen variante desktop con prefijo `md\:`:

```html
<!-- 8px de padding en mobile, 32px en desktop -->
<div class="p-8 md:p-32">Contenido</div>

<!-- Sin margen en mobile, 24px abajo en desktop -->
<div class="mb-0 md:mb-24">Contenido</div>
```

### Variante !important

Los keys listados en `spacingImportant` generan clases con `!important`:

```html
<div class="p-0!">Padding 0 con !important</div>
```

## Helpers de layout

Todas las clases de helpers llevan el prefijo `hg-`. Se configuran en `config.helpers`. Cada helper puede tener variante responsive `md\:`.

### Display

```html
<div class="hg-d-flex">Flex</div>
<div class="hg-d-block">Block</div>
<div class="hg-d-none">Oculto</div>
<div class="hg-d-inline-block">Inline block</div>
<div class="hg-d-inline-flex">Inline flex</div>
<div class="hg-d-contents">Contents</div>

<!-- Responsive: oculto en mobile, visible en desktop -->
<div class="hg-d-none md:hg-d-block">Solo desktop</div>
```

### Flexbox

```html
<!-- Dirección -->
<div class="hg-flex-row">Horizontal</div>
<div class="hg-flex-column">Vertical</div>

<!-- Wrap -->
<div class="hg-flex-wrap">Wrap</div>
<div class="hg-flex-nowrap">No wrap</div>

<!-- Grow / Shrink -->
<div class="hg-grow-1">Crece</div>
<div class="hg-shrink-0">No encoge</div>

<!-- Flex shorthand -->
<div class="hg-flex-1">flex: 1 1 0%</div>
<div class="hg-flex-auto">flex: 1 1 auto</div>
<div class="hg-flex-none">flex: none</div>

<!-- Basis -->
<div class="hg-basis-auto">Basis auto</div>
<div class="hg-basis-full">Basis 100%</div>

<!-- Order -->
<div class="hg-order-1">Orden 1</div>
<div class="hg-order-first">Primero (-9999)</div>
<div class="hg-order-last">Último (9999)</div>
```

### Alineación

```html
<!-- Justify content (eje principal) -->
<div class="hg-d-flex hg-justify-start">Inicio</div>
<div class="hg-d-flex hg-justify-center">Centro</div>
<div class="hg-d-flex hg-justify-end">Final</div>
<div class="hg-d-flex hg-justify-between">Space between</div>
<div class="hg-d-flex hg-justify-around">Space around</div>
<div class="hg-d-flex hg-justify-evenly">Space evenly</div>

<!-- Align items (eje cruzado) -->
<div class="hg-d-flex hg-items-start">Arriba</div>
<div class="hg-d-flex hg-items-center">Centro vertical</div>
<div class="hg-d-flex hg-items-end">Abajo</div>
<div class="hg-d-flex hg-items-baseline">Baseline</div>
<div class="hg-d-flex hg-items-stretch">Stretch</div>

<!-- Align content (múltiples líneas) -->
<div class="hg-d-flex hg-flex-wrap hg-content-center">Centro</div>
```

### Gap (usa spacingMap)

```html
<div class="hg-d-flex hg-gap-8">Gap 8px</div>
<div class="hg-d-flex hg-gap-16">Gap 16px</div>
<div class="hg-d-flex hg-gap-24">Gap 24px</div>
<div class="hg-d-flex hg-gap-y-16">Row gap 16px</div>
<div class="hg-d-flex hg-gap-x-8">Column gap 8px</div>

<!-- Responsive -->
<div class="hg-d-flex hg-gap-8 md:hg-gap-24">8px mobile, 24px desktop</div>
```

### Dimensiones

```html
<!-- Width -->
<div class="hg-w-100-percent">100%</div>
<div class="hg-w-50-percent">50%</div>
<div class="hg-w-auto">Auto</div>
<div class="hg-w-fit-content">Fit content</div>
<div class="hg-w-100vw">100vw</div>

<!-- Height -->
<div class="hg-h-100-percent">100%</div>
<div class="hg-h-100vh">100vh</div>
<div class="hg-h-100dvh">100dvh (dynamic)</div>
<div class="hg-h-auto">Auto</div>

<!-- Min height -->
<div class="hg-min-h-100vh">Min 100vh</div>
<div class="hg-min-h-100dvh">Min 100dvh</div>
```

### Posicionamiento

```html
<div class="hg-position-relative">Relative</div>
<div class="hg-position-absolute">Absolute</div>
<div class="hg-position-fixed">Fixed</div>
<div class="hg-position-sticky">Sticky</div>

<!-- Z-index -->
<div class="hg-z-10">z-index: 10</div>
<div class="hg-z-50">z-index: 50</div>
```

### Margin auto (centrado)

```html
<div class="hg-mx-auto">Centrado horizontal (margin: 0 auto)</div>
<div class="hg-ml-auto">Alinear derecha</div>
<div class="hg-mr-auto">Alinear izquierda</div>
```

### Texto

```html
<div class="hg-text-left">Izquierda</div>
<div class="hg-text-center">Centro</div>
<div class="hg-text-right">Derecha</div>
<div class="hg-text-justify">Justificado</div>
```

### Overflow

```html
<div class="hg-overflow-hidden">Hidden</div>
<div class="hg-overflow-auto">Auto</div>
<div class="hg-overflow-x-auto">Scroll horizontal</div>
<div class="hg-overflow-y-hidden">Sin scroll vertical</div>
```

### Visibilidad y opacidad

```html
<div class="hg-visibility-hidden">Invisible (ocupa espacio)</div>
<div class="hg-opacity-0">Transparente</div>
<div class="hg-opacity-50">50% opacidad</div>
<div class="hg-opacity-100">Totalmente visible</div>
```

### Cursor e interacción

```html
<div class="hg-cursor-pointer">Pointer</div>
<div class="hg-cursor-not-allowed">No permitido</div>
<div class="hg-cursor-grab">Grab</div>
<div class="hg-pointer-events-none">Sin eventos</div>
```

### Object fit (imágenes)

```html
<img class="hg-object-cover" src="..." alt="">
<img class="hg-object-contain" src="..." alt="">
```

## Tipografía

Las clases tipográficas se generan desde `config.typo`. Cada clase se aplica directamente con el nombre definido en el config, precedido del prefijo.

### Clases disponibles

```html
<!-- Títulos -->
<h2 class="hg-h2">Título principal (18px mobile → 24px desktop)</h2>
<h3 class="hg-title-l-b">Título bold uppercase (14px)</h3>
<h3 class="hg-title-l">Título light (14px)</h3>
<h4 class="hg-title-m">Título medium (12px)</h4>
<h4 class="hg-title-s">Título small (12px, weight 400)</h4>

<!-- Textos -->
<p class="hg-text-l">Texto large (12px, light)</p>
<p class="hg-text-m">Texto medium (12→13px responsive)</p>
<p class="hg-semantic">Semántico (13px)</p>
<span class="hg-p-tag">Tag pequeño (8px)</span>

<!-- Fuente secundaria (serif) -->
<p class="hg-neutrif-1">Neutrif 1 (16→20px responsive)</p>
<p class="hg-neutrif-2">Neutrif 2 (13→14px)</p>
<p class="hg-neutrif-body">Neutrif body (10→12px)</p>

<!-- Body variants -->
<p class="hg-hg-body-m">Body medium (12→13px)</p>
<p class="hg-hg-body-m-b">Body medium bold (weight 400)</p>
```

### Cómo funciona

Las clases son mobile-first. Los valores base aplican a mobile y un media query `@media (min-width: 992px)` sobrescribe para desktop.

```css
/* CSS generado (ejemplo) */
.hg-h2 {
  font-family: var(--hg-typo-font-family-primary-regular);
  font-weight: var(--hg-typo-font-weight-900);
  font-size: var(--hg-typo-font-size-18);     /* mobile */
  line-height: var(--hg-typo-line-height-1-976);
}

@media (min-width: 992px) {
  .hg-h2 {
    font-size: var(--hg-typo-font-size-24);   /* desktop */
    line-height: var(--hg-typo-line-height-1-2);
  }
}
```

## Grid

El grid se activa con `grid.enabled: true` en config.json. Genera un sistema de columnas flexbox.

### Breakpoints del grid

| Breakpoint | Min-width | Columnas |
|-----------|-----------|----------|
| xs | 1px | 12 |
| sm | 768px | 12 |
| md | 992px | 12 |
| lg | 1280px | 12 |
| xl | 1440px | 24 |

### Uso básico

```html
<!-- Row como contenedor -->
<div class="row">
  <div class="col-xs-12 col-md-6">Mitad en desktop</div>
  <div class="col-xs-12 col-md-6">Mitad en desktop</div>
</div>

<!-- 3 columnas en desktop -->
<div class="row">
  <div class="col-xs-12 col-md-4">Tercio</div>
  <div class="col-xs-12 col-md-4">Tercio</div>
  <div class="col-xs-12 col-md-4">Tercio</div>
</div>

<!-- Sidebar + contenido -->
<div class="row">
  <aside class="col-xs-12 col-lg-3">Sidebar</aside>
  <main class="col-xs-12 col-lg-9">Contenido</main>
</div>

<!-- XL con 24 columnas -->
<div class="row">
  <div class="col-xl-8">8 de 24</div>
  <div class="col-xl-16">16 de 24</div>
</div>
```

### Bleed (sin gutter)

```html
<!-- Eliminar gutter entre columnas -->
<div class="row bleed">
  <div class="col-md-6">Sin padding lateral</div>
  <div class="col-md-6">Sin padding lateral</div>
</div>
```

### Propiedades del grid

- Gutter: `8px` (padding lateral en cada columna)
- Container margin: `16px`
- `.row` usa `display: flex; flex-wrap: wrap;` con márgenes negativos

## Aspect Ratios

Clases para mantener proporciones en contenedores.

### Uso

```html
<!-- Ratio por defecto (2:3 vertical) -->
<div class="hg-aspect">
  <img class="hg-aspect-image" src="foto.jpg" alt="">
</div>

<!-- 16:9 widescreen -->
<div class="hg-aspect hg-aspect-16-9">
  <img class="hg-aspect-image" src="video-thumb.jpg" alt="">
</div>

<!-- 1:1 cuadrado -->
<div class="hg-aspect hg-aspect-1-1">
  <img class="hg-aspect-image" src="avatar.jpg" alt="">
</div>

<!-- Contenido custom posicionado -->
<div class="hg-aspect hg-aspect-4-3">
  <div class="hg-aspect-content">
    <h3 class="hg-title-l-b">Texto sobre imagen</h3>
  </div>
</div>
```

### Ratios disponibles

| Clase | Ratio | Uso típico |
|-------|-------|-----------|
| `.hg-aspect` | 2:3 | Default vertical |
| `.hg-aspect-1-1` | 1:1 | Avatar, cuadrado |
| `.hg-aspect-4-3` | 4:3 | Foto tradicional |
| `.hg-aspect-16-9` | 16:9 | Video, widescreen |
| `.hg-aspect-2-1` | 2:1 | Banner doble ancho |
| `.hg-aspect-2-3` | 2:3 | Vertical |
| `.hg-aspect-3-4` | 3:4 | Vertical |
| `.hg-aspect-3-1` | 3:1 | Separador XL |
| `.hg-aspect-7-1` | 7:1 | Separador LG |
| `.hg-aspect-12-1` | 12:1 | Separador MD |
| `.hg-aspect-24-1` | 24:1 | Separador SM |
| `.hg-aspect-9-20` | 9:20 | Vertical móvil |
| `.hg-aspect-16-4` | 16:4 | Banner |

### Clases auxiliares

- `.hg-aspect-image` — para `<img>` y `<video>`: aplica `display: block; width: 100%; height: 100%; object-fit: cover;`
- `.hg-aspect-content` — posiciona contenido con `position: absolute; inset: 0;`

## Patrones comunes de maquetación

### Card de producto

```html
<div class="row hg-gap-16">
  <div class="col-xs-12 col-md-6">
    <div class="hg-aspect hg-aspect-2-3">
      <img class="hg-aspect-image" src="product.jpg" alt="Producto">
    </div>
  </div>
  <div class="col-xs-12 col-md-6 hg-d-flex hg-flex-column hg-justify-center hg-gap-8">
    <h2 class="hg-title-l-b">Nombre del producto</h2>
    <p class="hg-text-m" style="color: var(--hg-color-dark-grey)">Descripción corta.</p>
    <span class="hg-h2" style="color: var(--hg-color-primary)">49,90 €</span>
  </div>
</div>
```

### Hero centrado

```html
<section class="hg-d-flex hg-items-center hg-justify-center hg-min-h-100vh hg-text-center p-24">
  <div>
    <h1 class="hg-h2">Bienvenido</h1>
    <p class="hg-neutrif-1" style="color: var(--hg-color-dark-grey)">Subtítulo descriptivo</p>
  </div>
</section>
```

### Grid de cards

```html
<div class="row hg-gap-16">
  <div class="col-xs-12 col-sm-6 col-lg-4 mb-16">
    <div class="hg-aspect hg-aspect-16-9">
      <img class="hg-aspect-image" src="img1.jpg" alt="">
    </div>
    <div class="pt-8">
      <h3 class="hg-title-l-b">Título card</h3>
      <p class="hg-text-m">Descripción breve.</p>
    </div>
  </div>
  <!-- Repetir para más cards -->
</div>
```

### Navbar sticky

```html
<header class="hg-position-sticky hg-z-50 hg-d-flex hg-justify-between hg-items-center p-16"
        style="top: 0; background: var(--hg-color-white); border-bottom: 1px solid var(--hg-color-middle-grey);">
  <span class="hg-title-l-b">Logo</span>
  <nav class="hg-d-flex hg-gap-24">
    <a class="hg-text-m" href="#">Inicio</a>
    <a class="hg-text-m" href="#">Productos</a>
    <a class="hg-text-m" href="#">Contacto</a>
  </nav>
</header>
```

### Layout sidebar

```html
<div class="row">
  <aside class="col-xs-12 col-md-3 hg-d-none md:hg-d-block p-16"
         style="border-right: 1px solid var(--hg-color-middle-grey);">
    <nav class="hg-d-flex hg-flex-column hg-gap-8">
      <a class="hg-text-m" href="#">Sección 1</a>
      <a class="hg-text-m" href="#">Sección 2</a>
    </nav>
  </aside>
  <main class="col-xs-12 col-md-9 p-16 md:p-32">
    <h1 class="hg-h2">Contenido principal</h1>
    <p class="hg-text-m">Texto del contenido.</p>
  </main>
</div>
```

### Footer multicolumna

```html
<footer class="pt-48 pb-24" style="background: var(--hg-color-grey-ultra); color: var(--hg-color-white);">
  <div class="row hg-px-16 md:hg-px-32 hg-gap-24">
    <div class="col-xs-12 col-md-4">
      <h4 class="hg-title-l-b" style="color: var(--hg-color-white);">Empresa</h4>
      <p class="hg-text-m" style="color: var(--hg-color-middle-grey);">Descripción breve.</p>
    </div>
    <div class="col-xs-6 col-md-4">
      <h4 class="hg-title-l-b" style="color: var(--hg-color-white);">Enlaces</h4>
    </div>
    <div class="col-xs-6 col-md-4">
      <h4 class="hg-title-l-b" style="color: var(--hg-color-white);">Legal</h4>
    </div>
  </div>
</footer>
```

## Reglas importantes

1. **Mobile-first siempre**: las clases base son para mobile, `md:` para desktop
2. **Nunca hardcodees valores**: usa `var(--hg-color-*)` y `var(--hg-spacing-*)`
3. **Valida contra config.json**: si un valor no está en spacingMap, no tendrá clase
4. **RTL-safe**: usa `.hg-px-*`, `.hg-py-*`, `.hg-mx-*`, `.hg-my-*` (usan `inline`/`block`)
5. **Spacing sin prefijo**: `.p-*`, `.m-*` no llevan `hg-`. Los helpers sí: `.hg-d-flex`
6. **Grid es flex**: `.row` + `.col-{bp}-{n}`, no CSS Grid nativo
7. **Ratios con fallback**: usan `aspect-ratio` nativo + `padding-top` para navegadores antiguos

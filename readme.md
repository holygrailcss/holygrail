# holygrailcss

[![npm](https://img.shields.io/npm/v/holygrailcss.svg)](https://www.npmjs.com/package/holygrailcss)
[![license](https://img.shields.io/npm/l/holygrailcss.svg)](#license)

Generador de CSS dirigido por configuración. Declaras tu paleta, tipografía, spacing, grid y temas en un único `config.json` y obtienes en `dist/`:

- `output.css` — variables CSS, helpers responsive, spacing, grid, aspect ratios y la escala tipográfica completa.
- `index.html` — guía interactiva navegable.
- `themes/<name>.css` + `themes/<name>-demo.html` por cada tema activo.

Sin SASS, sin toolchain. Node puro.

---

## Instalación

```bash
npm install holygrailcss --save-dev
```

```html
<link rel="stylesheet" href="node_modules/holygrailcss/dist/output.css">
<!-- y opcionalmente, un tema -->
<link rel="stylesheet" href="node_modules/holygrailcss/dist/themes/black-yellow.css">
```

```js
// Vite / Webpack / Next
import 'holygrailcss/dist/output';
import 'holygrailcss/dist/themes/black-yellow';
```

```html
<!-- CDN (sandbox / playground) -->
<link rel="stylesheet" href="https://unpkg.com/holygrailcss/dist/output.css">
```

---

## Uso rápido

```html
<button class="btn btn-primary btn-lg">Get started</button>

<div class="row">
  <div class="col-md-8">Contenido</div>
  <div class="col-md-4">Sidebar</div>
</div>

<h1 class="headline-xl">Title</h1>
<p class="body-l muted">Subtitle</p>

<div class="p-24 m-16 hg-d-flex hg-justify-between hg-gap-16">…</div>
```

**Convenciones**:
- Mobile-first. `md\:` para desktop (≥992px).
- Spacing sin prefijo (`.p-16`), helpers con `hg-` (`.hg-d-flex`).
- Variables CSS siempre: `var(--hg-color-primary)`, `var(--hg-spacing-16)`.

---

## Personalización

Copia el config y edítalo:

```bash
cp node_modules/holygrailcss/config.json ./hg-config.json
npx holygrailcss --config=./hg-config.json --output=./dist/output.css
```

Para crear un tema, mira `themes/black-yellow/` como ejemplo (`_variables.css`, `theme.css`, `theme.json`, `demo.html`) y actívalo en `config.json` → `themes[]`.

---

## Componentes

35 componentes base en `themes/_base/`:

**Form**: button, input, textarea, select, label, checkbox, radio, switch, slider, input-otp, toggle-group, form
**Display**: typography (headline-*, body-*), card, badge, alert, avatar, separator, progress, skeleton, table
**Navigation**: tabs, accordion, breadcrumb, pagination, sidebar
**Overlays**: dialog, drawer, dropdown, tooltip, toast
**Layout**: container, grid, aspect ratios, icons

Demo viva en `dist/componentes.html`.

---

## Documentación

- **Para asistentes/AI** que vayan a editar este repo: lee `CLAUDE.md` (raíz). Es un mapa de 5 minutos.
- **Para mantenimiento profundo**: `.claude/skills/holygrailcss/SKILL.md` (~300 líneas, cubre arquitectura, generadores, watch, publicación).
- **Para extender**: `skills/theme-creator/SKILL.md` (crear temas), `skills/component-generator/SKILL.md` (crear componentes), `skills/config-builder/SKILL.md` (modificar config), `skills/migration-helper/SKILL.md` (migrar desde Bootstrap/Tailwind).

---

## Scripts

```bash
npm run build      # genera dist/
npm run watch      # rebuild on change
npm run serve      # sirve dist/
npm run dev        # build + serve
npm test           # tests
```

---

## License

MIT — ver `LICENSE`.

Repo: [github.com/holygrailcss/holygrail](https://github.com/holygrailcss/holygrail)

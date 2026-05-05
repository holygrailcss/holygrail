# CLAUDE.md — guía rápida de orientación

Lee esto **primero**. No leas el README hasta que esto no baste.

`holygrailcss` es un **generador de CSS dirigido por `config.json`**. Node puro, sin SASS. El consumidor instala el paquete vía npm e importa `dist/output.css`.

---

## Mapa: dónde tocar para cada tarea

| Quieres… | Edita… | Detalle |
|---|---|---|
| Cambiar un color global | `config/colors.json` | Genera `--hg-color-{name}` |
| Cambiar tipografía global (headlines, body) | `config/typography.json` → `typo` | Genera reglas con mobile/desktop |
| Cambiar tipografía solo en un tema | `themes/<theme>/_variables.css` | Override de `--hg-typo-font-family-*` |
| Cambiar spacing scale | `config/spacing.json` → `spacingMap` | Genera `.p-N`, `.m-N`, `.hg-px-N` |
| Cambiar paleta de un tema | `themes/<theme>/_variables.css` | Tokens `--by-*` y `--btn-*-*` |
| Modificar comportamiento de un componente | `themes/_base/_<component>.css` | Lógica + clases |
| Añadir un componente nuevo | (1) `themes/_base/_<name>.css` (auto-discovery: NO hace falta tocar `theme.css`) (2) sección en `src/build/components.data.json` para que aparezca en la demo |
| Añadir/cambiar un tema | `themes/<name>/{theme.css, _variables.css, theme.json, demo.html}` + activarlo en `config/meta.json` → `themes[]` |
| Cambiar el layout de la página de docs | `src/docs-generator/guide-styles.css` |
| Cambiar la página `componentes.html` | `src/build/components.data.json` (datos) o `src/build/components-generator.js` (lógica de render) |
| Reconstruir todo | `npm run build` (= `node generate-css.js`) |

> **Importante**: edita SIEMPRE en `config/<section>.json`. El build regenera `config.json` (raíz) automáticamente como espejo plano para los consumidores npm — NO lo edites tú directamente o se sobrescribe.

---

## Build pipeline (qué genera cada cosa)

```
generate-css.js
  └─ src/build/build-orchestrator.js  ← entry point real
      ├─ src/config-loader.js         ← lee config/*.json (modular) o config.json (legacy)
      │                                 y sincroniza config.json al final
      ├─ src/generators/*.js          ← genera output.css desde la config cargada
      │     - reset-generator.js      → reset CSS mínimo (html, *, box-sizing)
      │     - variables-generator.js  → :root con --hg-color-*, --hg-spacing-*, --hg-typo-*
      │     - typo-generator.js       → .headline-*, .body-* (mobile + desktop)
      │     - spacing-generator.js    → .p-*, .m-*, .hg-px-*, .hg-mx-*
      │     - grid-generator.js       → .row, .col-{bp}-{n}
      │     - helpers-generator.js    → .hg-d-flex, .hg-justify-*, etc.
      │     - ratio-generator.js      → .aspect-1-1, .aspect-16-9, …
      │     - utils.js                → combineThemeCSS, resolveActiveThemes
      ├─ src/docs-generator/html-generator.js   ← genera dist/index.html
      ├─ src/build/theme-transformer.js         ← genera dist/themes/<name>.css + demo.html
      │                                           (auto-discovery: enumera themes/_base/**/*.css)
      ├─ src/build/components-generator.js      ← genera dist/componentes.html
      │                                           (datos en components.data.json)
      ├─ src/build/skills-generator.js          ← genera dist/skills.html
      └─ src/build/asset-manager.js             ← copia src/assets/ → dist/assets/
```

Outputs en `dist/` (gitignored, pero **sí publicado a npm** vía `.npmignore`).

**Auto-discovery de componentes**: cuando `combineThemeCSS` ensambla un tema, primero procesa los `@import` explícitos del `theme.css` (sólo `_variables.css` por convención), luego enumera `themes/_base/**/*.css` **recursivamente** (incluye `_base/_*.css`, `_base/objects/*.css` y `_base/components/*.css`) y añade los que falten. Resultado: nuevos componentes en `_base/` aparecen sin tocar nada más.

---

## Convenciones invariantes

- **Mobile-first**. Sin prefijo = mobile. `md\:` activa desktop (`992px`).
- **Prefijo `hg-` para helpers; spacing SIN prefijo**. Ej: `.hg-d-flex` pero `.p-16`.
- **Variables CSS siempre, nunca hardcode**: `var(--hg-color-primary)`, `var(--hg-spacing-16)`.
- **RTL-safe**: prefiere `.hg-px-*`, `.hg-mx-*` (inline/block) sobre `pl-`, `mr-`.
- **Grid es flex** (no CSS Grid). `.row` + `.col-{bp}-{n}`.
- **Esquinas cuadradas por default** (`--border-radius: 0`). Botones tienen su propio `--btn-radius` (6px en black-yellow).
- **`box-sizing: border-box`** en todo lo que tenga padding + width.
- **Idioma**: comentarios y commits en **español**.

---

## Tema actual y rebrandings

- Tema activo: **`black-yellow`** (slug) / **Black&Yellow** (display). Inspiración: ramp.com.
- CTA primary = `--by-solar` (#e4f222) sobre ink (#0c0a08). Hover = solar-light (#f5ff78).
- **Nunca reintroducir** nombres antiguos: "Holygrail 5", "Massimo Dutti", "dutti", "Black&White". Son del cliente original; el repo es público/genérico.
- Tema secundario: **`limited`** (lujo dorado).

---

## Convenciones de los componentes (`themes/_base/_*.css`)

Cada componente tiene un comentario-cabecera estandarizado:

```
/* PURPOSE: ...
   KEY CLASSES: .foo, .foo-primary, .foo-sm
   DEPENDS ON: --foo-bg (theme), --hg-spacing-* (config)
   DEMO: dist/componentes.html#foo */
```

Si añades un componente, **añade ese cabecero**.

Componentes existentes (34 = 32 archivos en `themes/_base/_*.css` + `objects/_grid.css` + `components/_icons.css`): accordion, alert, avatar, badge, breadcrumb, buttons, card, checkboxes, containers, dialog, drawer, dropdown, forms, grid, icons, input-otp, inputs, labels, pagination, progress, radios, select, separator, sidebar, skeleton, slider, switches, table, tabs, textarea, toast, toggle-group, tooltip, typography.

---

## Tipografía (Ramp scale)

Generada desde `config.json` → `typo`. Diez clases:

- **Headlines** (familia primary-bold = neutrif-semibold/bold):
  - `.headline-xs` 20/24 → 24/28
  - `.headline-s` 22/26 → 28/32
  - `.headline-m` 28/32 → 40/42
  - `.headline-l` 34/38 → 48/50
  - `.headline-xl` 40/42 → 64/64
- **Body** (familia primary-regular = neutrif-regular):
  - `.body-xs` 12/18 → 13/19
  - `.body-s` 14/20
  - `.body-m` 15/21 → 16/22
  - `.body-l` 17/23 → 18/24
  - `.body-xl` 18/22 → 20/26

Formato: `font-size / line-height` (mobile → desktop).

---

## Botones (dos tamaños canon)

- `.btn-sm`: padding `0 16 3`, font 14/20, height **40px** fijo. Tipo "See a demo".
- `.btn-lg`: padding `0 16 3` (`0 20 3` desktop), height **42px → 51px** fijo. Tipo "Get started for free".
- `padding-bottom: 3px` es **corrección óptica** intencional (Neutrif sienta el texto bajo respecto al centro geométrico).
- Variantes: `btn-primary`, `btn-secondary`, `btn-tertiary`, `btn-outline`, `btn-ghost`, `btn-link`, `btn-label-m`, `btn-badge`. Modificadores: `btn-full` (100% ancho), `disabled`.
- Border-radius: `var(--btn-radius, var(--border-radius))`. En black-yellow `--btn-radius: 6px`.

---

## Anti-patrones que cuestan tokens (NO hacer)

- **No leas `dist/`** salvo para verificar el output. Está gitignored y se regenera.
- **No leas `brief/`** ni `*.psd`/`*.pptx`. Diseño bruto, no código.
- **No dupliques colores en `_variables.css` si están en `config.json`**. Single source of truth = config.
- **No añadas reglas tipo `.btn-primary svg path { fill: white }` por variante**. Usa `currentColor` + 1 regla.
- **No edites `dist/themes/*.css`** directamente. Edita `themes/_base/_*.css` o `themes/<theme>/_variables.css` y rebuilds.
- **No publiques sin bump de versión**. Estamos en `4.x` en npm; `1.x` es del cliente original (`holygrail5`, no tocar).

---

## Comandos

```bash
npm run build           # genera dist/
npm run watch           # rebuild on change
npm run serve           # dist server local
npm run dev             # build + serve
npm test                # tests (tests/run-all.js)
npm run vars:report     # reporte de variables CSS sin usar
npm run vars:remove-unused   # elimina variables sin usar
npm publish             # publica a npm (corre prepublishOnly = build)
```

Repo: `github.com/holygrailcss/holygrail`. Paquete npm: `holygrailcss`.

---

## Detalle exhaustivo (skills)

Las skills viven en `skills/` (raíz, no en `.claude/`) y cubren tareas concretas. Léelas cuando esta guía no baste:

- `skills/developer-guide/SKILL.md` — referencia completa de clases (colores, spacing, tipografía, helpers, grid, ratios, temas) para quien usa el framework.
- `skills/theme-creator/SKILL.md` — crear un tema nuevo reutilizando `themes/_base/`.
- `skills/component-generator/SKILL.md` — generar HTML que usa las clases correctamente.
- `skills/layout-builder/SKILL.md` — construir layouts responsive con grid + helpers.
- `skills/config-builder/SKILL.md` — crear o modificar `config.json` sin romper el build.
- `skills/migration-helper/SKILL.md` — migrar proyectos desde Bootstrap/Tailwind.

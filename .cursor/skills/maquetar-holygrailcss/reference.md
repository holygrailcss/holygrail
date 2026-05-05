# Referencia holygrailcss – Variables y componentes

Documento de apoyo a la skill **maquetar-holygrailcss**. Detalle de variables generadas y clases de componentes del tema Black&White.

## config.json – Qué genera variables

| Sección | Genera |
|--------|--------|
| `colors` | `--hg-color-{key}` (ej. `"primary": "#000"` → `--hg-color-primary`) |
| `spacingMap` | `--hg-spacing-{key}` (ej. `"8": "8px"` → `--hg-spacing-8` en rem) |
| `fontFamilyMap` | `--hg-typo-font-family-{key}` (ej. `primary`, `primary-bold`, `secondary`) |
| `typo` (clases) | `--hg-typo-font-size-*`, `--hg-typo-font-weight-*`, `--hg-typo-line-height-*`, `--hg-typo-letter-spacing-*` |

Tras cambiar `config.json` hay que ejecutar `npm run build` para regenerar `dist/output.css`.

## Colores típicos (--hg-color-*)

- `primary`, `white`, `black`, `dark-grey`, `middle-grey`, `light-grey`, `error`, `success`, `warning`, `feel`, `feel-dark`, `bg-light`, `bg-cream`, etc.  
Listado completo en `config.json` → `colors`; nombres con guión → `--hg-color-{nombre}`.

## Espaciado (--hg-spacing-*)

Valores numéricos del mapa (0, 4, 8, 12, 16, 24, 32, …) y porcentajes (20-percent, 50-percent, …). Uso: `var(--hg-spacing-8)`, `var(--hg-spacing-16)`.

## Tipografía

- **Familias**: `--hg-typo-font-family-primary-regular`, `--hg-typo-font-family-primary-bold`, `--hg-typo-font-family-secondary`.
- **Pesos**: `--hg-typo-font-weight-400`, `--hg-typo-font-weight-500`, `--hg-typo-font-weight-700`, etc.
- **Tamaños**: `--hg-typo-font-size-12`, `--hg-typo-font-size-13`, `--hg-typo-font-size-14`, etc.
- **Line-height**: `--hg-typo-line-height-1`, `--hg-typo-line-height-1-5`, etc.
- **Letter-spacing**: `--hg-typo-letter-spacing-0-02`, etc.

## Tema Black&White – Variables de componente (_variables.css)

El tema redefine tokens que los módulos usan (no las --hg-* base). Ejemplos:

- Botones: `--btn-primary-bg`, `--btn-padding-x-md`, `--border-radius`, `--transition`.
- Inputs: `--input-border`, `--input-border-focus`, `--input-padding-x`.
- Labels: `--label-color`, `--label-required`.
- Checkboxes/radios/switches: `--checkbox-*`, `--radio-*`, `--switch-*`.

Siempre referenciar `var(--hg-*)` desde estas variables del tema.

## Clases de componentes (resumen)

### Botones
- Base: `.btn`. Variantes: `.btn-primary`, `.btn-secondary`, `.btn-tertiary`, `.btn-label-m`, `.btn-link`, `.btn-badge` (pill, compacto).
- Tamaños: `.btn-sm`, `.btn-md`, `.btn-lg`. Ancho completo: `.btn-full`. Disabled: `disabled` o `.disabled`.
- Badge en fondo oscuro: contenedor con clase `.has-light`; dentro, `.btn-badge` usa texto blanco y fondo transparente.

### Formularios
- Input: `.input`; estados: `.input-error`, `.input-success`, `.input-warning`.
- Select: `.select`; mismos estados.
- Textarea: `.textarea`; mismos estados.
- Label: `.label`; requerido: `.label-required`; inline: `.label-inline`.
- Ayuda: `.helper-text`, `.helper-text-error`, `.helper-text-success`, `.helper-text-warning`.
- Contenedores: `.form-group`, `.form-row`.

### Checkboxes
- Contenedor: `<label class="checkbox">` con `<input type="checkbox">`, `.checkbox-indicator`, `.checkbox-label`.

### Radios
- Contenedor: `<label class="radio">` con `<input type="radio" name="...">`, `.radio-indicator`, `.radio-label`. Mismo `name` en el grupo.

### Switches
- Contenedor: `<label class="switch">` con `<input type="checkbox">`, `.switch-indicator`, `.switch-label`.

## Archivos clave

- `config.json` – Fuente de verdad para colores, spacing, fuentes, grid, tipografías.
- `themes/black-and-white/_variables.css` – Tokens del tema (mapeo a --hg-*).
- `themes/black-and-white/_buttons.css`, `_inputs.css`, `_labels.css`, `_checkboxes.css`, `_radios.css`, `_switches.css`, `_forms.css` – Componentes.
- `themes/black-and-white/demo.html` – Demo; actualizar al añadir variantes o componentes.
- `themes/black-and-white/README.md` – Documentación del tema; mantener al día.

## Orden en CSS (docs/ESTRUCTURA-CSS.md)

1. Variables en `:root` (mobile first).
2. Media queries para variables (desktop).
3. Clases base usando `var(--hg-*)` o variables del tema.
4. Estados y pseudo-clases.
5. Media queries para clases si aplica.

No usar valores hardcodeados en los módulos del tema; solo variables.

# holygrailcss — Theme Creator

Crea temas personalizados para holygrailcss reutilizando los componentes compartidos en `themes/_base/`.

## Contexto

holygrailcss soporta **múltiples temas simultáneos** en la carpeta `themes/`. Todos los temas comparten los mismos CSS de componente (`_buttons.css`, `_inputs.css`, `_checkboxes.css`, `_radios.css`, `_switches.css`, `_labels.css`, `_forms.css`, `_containers.css`, `objects/_grid.css`, `components/_icons.css`), que viven en `themes/_base/` como fuente única de verdad.

Cada tema solo define **lo que lo hace distinto**: paleta de colores (`tokenOverrides.color`), tipografías (`--hg-typo-font-family-*`), bordes, transiciones y el mapeo de `componentVars` (`--btn-*`, `--input-*`, …) a los tokens `--hg-color-*` y `--hg-spacing-*`. Como los CSS de `_base/` consumen esas variables, el cambio de look & feel se propaga automáticamente sin tocar los componentes.

El `BuildOrchestrator` itera sobre `config.themes[]` y, para cada tema activo, combina su CSS en `dist/themes/<name>.css` y transforma su demo a `dist/themes/<name>-demo.html` añadiendo sidebar, header y nav con enlaces cruzados entre temas.

## Instrucciones

Cuando el usuario pida crear un tema:

1. **Lee los temas existentes como referencia**: `themes/black-yellow/` (paleta negro + sans-serif) y `themes/limited/` (paleta dorada + 100% serif). Ambos son ejemplos mínimos de la nueva estructura.

2. **Crea la carpeta del tema** en `themes/{nombre}/` SOLO con estos cuatro ficheros (los componentes se heredan de `_base/`, no se duplican):

   ```
   themes/{nombre}/
   ├── theme.json         # Meta + tokenOverrides + componentVars + design
   ├── _variables.css     # Overrides de --hg-color-*, --hg-typo-font-family-* y mapeo de componentVars
   ├── theme.css          # @import de _variables.css + de ../_base/*.css
   └── demo.html          # Demo interactiva con placeholders HG_THEME_BLOCK y HG_TYPO_TABLE
   ```

3. **`theme.json`** — metadata y datos que el generador usa para pintar el bloque de "Variables del tema" en la demo:

   ```json
   {
     "meta": {
       "name": "{nombre}",
       "displayName": "{Nombre}",
       "description": "Descripción corta del tema y su propósito.",
       "version": "1.0.0",
       "author": "Tu nombre"
     },
     "tokenOverrides": {
       "color": {
         "primary": "#1D1D1D",
         "feel": "#A38A6B",
         "error": "#9B2A1E"
       },
       "spacing": {}
     },
     "componentVars": {
       "btn": {
         "primary-bg": "var(--hg-color-primary)",
         "primary-color": "var(--hg-color-white)",
         "primary-hover-bg": "var(--hg-color-feel-dark)"
       },
       "input": {
         "border": "var(--hg-color-middle-grey)",
         "border-focus": "var(--hg-color-feel-dark)"
       }
     },
     "design": {
       "border-radius": "0",
       "border-width": "1px",
       "border-style": "solid",
       "transition": "all 0.2s ease"
     }
   }
   ```

4. **`_variables.css`** — redeclara los tokens base que necesites y el mapeo a componentVars. Importa Google Fonts aquí si el tema cambia tipografía:

   ```css
   /* Si tu tema usa fuentes auto-hospedadas (recomendado), declara las
      @font-face en src/docs-generator/guide-styles.css y copia los
      .woff2 a src/assets/fonts/ (se registrarán como assets en
      config.json → assets.fonts). Evita @import de Google Fonts. */

   :root {
     /* Overrides de tokens base holygrailcss */
     --hg-color-primary: #1D1D1D;
     --hg-color-feel: #A38A6B;
     --hg-color-feel-dark: #7A6346;

     /* Overrides de tipografía */
     --hg-typo-font-family-primary-regular: "Neutrif", Georgia, serif;
     --hg-typo-font-family-secondary: "Neutrif", Georgia, serif;

     /* Mapeo de componentVars a los tokens */
     --btn-primary-bg: var(--hg-color-primary);
     --btn-primary-color: var(--hg-color-white);
     --input-border-focus: var(--hg-color-feel-dark);

     /* Design tokens */
     --border-radius: 0;
     --border-width: 1px;
     --border-style: solid;
     --transition: all 0.3s ease;
   }
   ```

5. **`theme.css`** — importa `_variables.css` local y todos los componentes compartidos desde `../_base/`. Esta es la plantilla estándar:

   ```css
   /* Variables del tema */
   @import url('_variables.css');

   /* Componentes compartidos ─ themes/_base/ */
   @import url('../_base/_buttons.css');
   @import url('../_base/_inputs.css');
   @import url('../_base/_labels.css');
   @import url('../_base/_checkboxes.css');
   @import url('../_base/_radios.css');
   @import url('../_base/_switches.css');
   @import url('../_base/_forms.css');

   /* Objects / layout compartidos */
   @import url('../_base/_containers.css');
   @import url('../_base/objects/_grid.css');

   /* Components (icons) compartidos */
   @import url('../_base/components/_icons.css');
   ```

6. **`demo.html`** — copia `themes/black-yellow/demo.html` como base, cambia el título a `{Nombre} Theme`, y **mantén los placeholders** `<!-- HG_THEME_BLOCK -->` y `<!-- HG_TYPO_TABLE -->`. El build los sustituye automáticamente por la tabla de variables del tema y la tabla de tipografía.

7. **Registra el tema** en `config.json` dentro del array `themes`:

   ```json
   {
     "themes": [
       { "name": "black-yellow", "enabled": true },
       { "name": "limited", "enabled": true },
       { "name": "{nombre}", "enabled": true }
     ]
   }
   ```

8. **Actualiza la nav** si el nombre es uno nuevo: añade una entrada en `THEMES_IN_NAV` de `src/build/theme-transformer.js` y en los nav estáticos de `src/docs-generator/html-generator.js`, `src/build/skills-generator.js` y `src/skills.html`.

## Cómo sobrescribir un componente SOLO en un tema

La regla es: "si quieres un componente distinto, machácalo en el tema".

1. Copia el CSS del componente desde `themes/_base/_inputs.css` a `themes/{nombre}/_inputs.css` y modifícalo.
2. En `themes/{nombre}/theme.css`, cambia el `@import` correspondiente para que apunte al fichero local:

   ```css
   /* antes */
   @import url('../_base/_inputs.css');
   /* después */
   @import url('_inputs.css');
   ```

3. El resto de componentes sigue heredando de `_base/`. El build detectará el fichero local gracias al cambio de ruta.

## Validación

- `npm run build` debe generar `dist/themes/{nombre}.css` y `dist/themes/{nombre}-demo.html` sin warnings.
- Abre la demo y comprueba que:
  - Los colores semánticos con override llevan el badge "tema" y muestran el swatch correcto.
  - Las tipografías del tema aparecen reflejadas en la tabla `HG_TYPO_TABLE` y en titulares/cuerpo.
  - La nav muestra el tema nuevo y otros temas como enlaces cruzados.
- No debe haber CSS de componente duplicado en `themes/{nombre}/` a menos que sea un override intencionado.

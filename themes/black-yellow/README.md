# Sistema de Theming Black&Yellow

Sistema de componentes UI basado en las variables CSS de **holygrailcss**. Todos los componentes utilizan las variables CSS generadas por holygrailcss, lo que permite una personalización completa y consistente desde el archivo `config.json`.

## 📦 Instalación

1. Incluye el CSS de holygrailcss:
```html
<link rel="stylesheet" href="dist/output.css">
```

2. Incluye el CSS del tema Black&Yellow:
```html
<link rel="stylesheet" href="themes/black-yellow/theme.css">
```

**Nota**: El archivo `theme.css` importa automáticamente todos los módulos. Los componentes (botones, inputs, checkboxes, radios, switches, labels, forms, containers, grid, icons) **no viven dentro de `themes/black-yellow/`**: se comparten desde `themes/_base/` y el `theme.css` hace `@import url('../_base/_buttons.css')` para cada uno. Si solo necesitas ciertos componentes, puedes importarlos directamente desde `_base/`:

```html
<!-- Solo variables del tema y botones compartidos -->
<link rel="stylesheet" href="themes/black-yellow/_variables.css">
<link rel="stylesheet" href="themes/_base/_buttons.css">
```

## 📁 Estructura de Archivos

La carpeta del tema solo contiene **lo que hace distinto a Black&Yellow** — el resto se hereda de `themes/_base/`:

```
themes/
├── _base/                # Componentes compartidos (fuente única de verdad)
│   ├── _buttons.css
│   ├── _inputs.css
│   ├── _labels.css
│   ├── _checkboxes.css
│   ├── _radios.css
│   ├── _switches.css
│   ├── _forms.css
│   ├── _containers.css
│   ├── objects/_grid.css
│   └── components/_icons.css
│
└── black-yellow/
    ├── theme.json        # Meta + tokenOverrides + componentVars + design
    ├── _variables.css    # Overrides de --hg-color-* y mapeo de componentVars (--btn-*, --input-*, …)
    ├── theme.css         # @import de _variables.css + @import de ../_base/*.css
    └── demo.html         # Demo interactiva (usa placeholders HG_THEME_BLOCK y HG_TYPO_TABLE)
```

Los componentes apuntan a los componentVars (`var(--btn-primary-bg)`, `var(--input-border-focus)`, …) y esos componentVars se mapean en `_variables.css` a los tokens base `--hg-color-*`. Como todos los temas comparten `_base/`, cambiar la paleta en `_variables.css` repinta automáticamente todos los componentes sin duplicar CSS.

### Sobrescribir un componente SOLO en Black&Yellow

Si Black&Yellow necesita un componente distinto al de `_base/`:

1. Copia, p. ej., `themes/_base/_inputs.css` → `themes/black-yellow/_inputs.css` y modifícalo.
2. En `themes/black-yellow/theme.css` cambia el `@import` correspondiente:

   ```css
   /* antes */
   @import url('../_base/_inputs.css');
   /* después */
   @import url('_inputs.css');
   ```

El resto de componentes sigue heredando de `_base/`.

## 🎨 Componentes Disponibles

### Botones

#### Variantes

- **Primary**: `.btn .btn-primary`
- **Secondary**: `.btn .btn-secondary`
- **Tertiary**: `.btn .btn-tertiary`
- **Label M**: `.btn .btn-label-m` (similar a tertiary)
- **Link**: `.btn .btn-link`
- **Badge**: `.btn .btn-badge` (pill, compacto; en contexto `.has-light` usa texto blanco sobre fondo oscuro)
- **Outline**: `.btn .btn-outline`
- **Ghost**: `.btn .btn-ghost`
- **Feel**: `.btn .btn-feel`

#### Tamaños

- **Small**: `.btn-sm`
- **Large**: `.btn-lg`

#### Utilidades

- **Ancho completo**: `.btn-full`
- **Disabled**: `disabled` o `[disabled]`

#### Ejemplo

```html
<button class="btn btn-primary btn-lg">Enviar</button>
<button class="btn btn-outline btn-lg">Cancelar</button>
<button class="btn btn-primary btn-full">Botón completo</button>
<button class="btn btn-primary" disabled>Deshabilitado</button>
```

### Inputs

#### Tipos básicos

Todos los tipos de input HTML5 están soportados: `text`, `email`, `password`, `number`, `tel`, `url`, `search`, etc.

```html
<label class="label" for="nombre">Nombre</label>
<input type="text" id="nombre" class="input" placeholder="Tu nombre">
```

#### Estados

- **Error**: `.input-error`
- **Success**: `.input-success`
- **Warning**: `.input-warning`
- **Disabled**: `disabled`

```html
<input type="text" class="input input-error" value="Valor inválido">
<span class="helper-text helper-text-error">Este campo tiene un error</span>
```

### Selects

```html
<label class="label" for="pais">País</label>
<select id="pais" class="select">
  <option value="">Selecciona un país</option>
  <option value="es">España</option>
  <option value="fr">Francia</option>
</select>
```

#### Estados

- **Error**: `.select-error`
- **Success**: `.select-success`
- **Warning**: `.select-warning`
- **Disabled**: `disabled`

### Textareas

```html
<label class="label" for="mensaje">Mensaje</label>
<textarea id="mensaje" class="textarea" placeholder="Escribe tu mensaje..."></textarea>
```

#### Estados

- **Error**: `.textarea-error`
- **Success**: `.textarea-success`
- **Warning**: `.textarea-warning`
- **Disabled**: `disabled`

### Checkboxes

```html
<label class="checkbox">
  <input type="checkbox">
  <span class="checkbox-indicator"></span>
  <span class="checkbox-label">Acepto los términos</span>
</label>
```

**Nota**: La estructura HTML es importante. El input debe ir antes del indicador.

### Radios

```html
<label class="radio">
  <input type="radio" name="opcion" value="1">
  <span class="radio-indicator"></span>
  <span class="radio-label">Opción 1</span>
</label>

<label class="radio">
  <input type="radio" name="opcion" value="2">
  <span class="radio-indicator"></span>
  <span class="radio-label">Opción 2</span>
</label>
```

**Nota**: Todos los radios del mismo grupo deben compartir el mismo `name`.

### Switches / Toggles

```html
<label class="switch">
  <input type="checkbox">
  <span class="switch-indicator"></span>
  <span class="switch-label">Activar notificaciones</span>
</label>
```

### Labels

#### Label básico

```html
<label class="label" for="campo">Nombre del campo</label>
<input type="text" id="campo" class="input">
```

#### Label con asterisco (requerido)

```html
<label class="label label-required" for="email">Email</label>
<input type="email" id="email" class="input">
```

#### Label inline

```html
<label class="label label-inline">
  <input type="checkbox">
  <span>Checkbox inline</span>
</label>
```

### Form Groups

Agrupa labels, inputs y mensajes de ayuda:

```html
<div class="form-group">
  <label class="label label-required" for="nombre">Nombre</label>
  <input type="text" id="nombre" class="input" placeholder="Tu nombre">
  <span class="helper-text">Este campo es obligatorio</span>
</div>
```

### Form Row

Coloca varios campos en la misma fila:

```html
<div class="form-row">
  <div class="form-group">
    <label class="label" for="nombre">Nombre</label>
    <input type="text" id="nombre" class="input">
  </div>
  <div class="form-group">
    <label class="label" for="apellidos">Apellidos</label>
    <input type="text" id="apellidos" class="input">
  </div>
</div>
```

### Helper Text / Mensajes

Mensajes de ayuda, error, éxito o advertencia:

```html
<span class="helper-text">Mensaje de ayuda normal</span>
<span class="helper-text helper-text-error">Mensaje de error</span>
<span class="helper-text helper-text-success">Mensaje de éxito</span>
<span class="helper-text helper-text-warning">Mensaje de advertencia</span>
```

## 🎨 Personalización

Todos los componentes utilizan variables CSS de holygrailcss. Hay **dos niveles** de personalización:

1. **Globales** — edita `config.json` de holygrailcss (colores base, spacing, tipografías). Afecta a todos los temas.
2. **Por tema** — edita `themes/black-yellow/theme.json` o `themes/black-yellow/_variables.css` para overridear los tokens solo para Black&Yellow. Esto es lo que usa, por ejemplo, el tema `limited` para cambiar toda su paleta y tipografía sin tocar `config.json`.

En ambos casos, después regenera con `npm run build`.

### Variables principales

El sistema de theming Black&Yellow utiliza estas variables de holygrailcss:

#### Colores
- `--hg-color-primary`: Color principal
- `--hg-color-white`: Color blanco
- `--hg-color-dark-grey`: Gris oscuro
- `--hg-color-middle-grey`: Gris medio
- `--hg-color-light-grey`: Gris claro
- `--hg-color-error`: Color de error
- `--hg-color-success`: Color de éxito
- `--hg-color-warning`: Color de advertencia
- `--hg-color-feel`: Color feel
- `--hg-color-feel-dark`: Color feel oscuro

#### Espaciados
- `--hg-spacing-4`, `--hg-spacing-8`, `--hg-spacing-12`, `--hg-spacing-16`, etc.

#### Tipografía
- `--hg-typo-font-family-primary-regular`: Fuente principal
- `--hg-typo-font-size-*`: Tamaños de fuente
- `--hg-typo-font-weight-*`: Pesos de fuente
- `--hg-typo-line-height-*`: Alturas de línea

### Personalizar globalmente (todos los temas)

Para cambiar los colores base compartidos, edita `config.json`:

```json
{
  "colors": {
    "primary": "#000000",
    "error": "#b40016",
    "success": "#12882C",
    "warning": "#ffc700",
    "feel": "#fb9962"
  }
}
```

### Personalizar solo Black&Yellow

Para cambiar la paleta o la tipografía únicamente del tema Black&Yellow, edita `themes/black-yellow/_variables.css` y añade overrides sobre los tokens base:

```css
:root {
  --hg-color-primary: #111;
  --hg-color-feel: #fb9962;
  --hg-typo-font-family-primary-regular: "Inter", sans-serif;
}
```

Los componentes de `themes/_base/` consumen estas variables a través del mapeo en `componentVars`, así que se repintan automáticamente sin duplicar CSS.

Luego regenera:

```bash
npm run build
```

## 📱 Responsive

Todos los componentes son responsive por defecto. Puedes usar las clases responsive de holygrailcss junto con los componentes:

```html
<div class="hg-d-flex hg-flex-column md:hg-flex-row hg-gap-16">
  <input type="text" class="input">
  <button class="btn btn-primary">Enviar</button>
</div>
```

## ♿ Accesibilidad

- Todos los inputs tienen labels asociados
- Los estados de focus son visibles
- Los componentes disabled tienen el cursor correcto
- Los checkboxes y radios tienen indicadores visuales claros
- Soporte para lectores de pantalla

## 🚀 Ejemplo completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formulario con Black&Yellow</title>
  <link rel="stylesheet" href="dist/output.css">
  <link rel="stylesheet" href="themes/black-yellow/theme.css">
</head>
<body>
  <form>
    <div class="form-group">
      <label class="label label-required" for="nombre">Nombre completo</label>
      <input type="text" id="nombre" class="input" placeholder="Tu nombre" required>
      <span class="helper-text">Este campo es obligatorio</span>
    </div>
    
    <div class="form-group">
      <label class="label" for="email">Email</label>
      <input type="email" id="email" class="input" placeholder="tu@email.com">
    </div>
    
    <div class="form-group">
      <label class="label" for="mensaje">Mensaje</label>
      <textarea id="mensaje" class="textarea" placeholder="Escribe tu mensaje..."></textarea>
    </div>
    
    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" required>
        <span class="checkbox-indicator"></span>
        <span class="checkbox-label">Acepto los términos y condiciones</span>
      </label>
    </div>
    
    <div class="form-group">
      <button type="submit" class="btn btn-primary btn-lg">Enviar</button>
      <button type="button" class="btn btn-outline btn-lg">Cancelar</button>
    </div>
  </form>
</body>
</html>
```

## 📄 Ver Demo

Abre `demo.html` en tu navegador para ver todos los componentes en acción:

```bash
# Si estás en la raíz del proyecto
open themes/black-yellow/demo.html

# O con el servidor de desarrollo
npm run serve
# Luego navega a: http://localhost:5000/themes/black-yellow/demo.html
```

## 🔧 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari (últimas versiones)
- ✅ Navegadores móviles modernos

## 📝 Notas

- Todos los componentes usan las variables CSS de holygrailcss
- Los estilos son completamente personalizables desde `config.json`
- El sistema es compatible con RTL (Right-to-Left) gracias a las propiedades lógicas de CSS
- Los componentes siguen las mejores prácticas de accesibilidad web

## 🤝 Integración con sistemas de componentes

Este sistema de theming está diseñado para integrarse fácilmente con cualquier design system o librería de componentes externa, utilizando las mismas variables CSS base de holygrailcss.


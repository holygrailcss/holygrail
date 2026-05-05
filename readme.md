# holygrailcss

[![npm version](https://img.shields.io/npm/v/holygrailcss.svg)](https://www.npmjs.com/package/holygrailcss)
[![npm downloads](https://img.shields.io/npm/dm/holygrailcss.svg)](https://www.npmjs.com/package/holygrailcss)

Generador de CSS + guía HTML pensado para design systems ligeros: declaras tu `config.json`, holygrailcss crea variables compartidas, helpers responsive, tipografías y documentación navegable en `dist/` sin depender de SASS ni toolchains complejos.

---

## Índice
- [holygrailcss](#holygrailcss)
  - [Índice](#índice)
  - [1. Instalación](#1-instalación)
  - [2. Flujo rápido](#2-flujo-rápido)
  - [3. Scripts disponibles](#3-scripts-disponibles)
  - [4. ¿Qué se genera?](#4-qué-se-genera)
  - [5. Estructura del proyecto](#5-estructura-del-proyecto)
  - [6. Configurar `config.json`](#6-configurar-configjson)
    - [6.1 Ejemplo mínimo](#61-ejemplo-mínimo)
    - [6.2 Propiedades globales](#62-propiedades-globales)
    - [6.3 Configuración de Assets (Opcional)](#63-configuración-de-assets-opcional)
    - [6.4 Helpers y grid](#64-helpers-y-grid)
    - [6.5 Ratios de Aspecto](#65-ratios-de-aspecto)
    - [6.6 Tipografías](#66-tipografías)
  - [7. CLI y argumentos](#7-cli-y-argumentos)
  - [8. Guía HTML interactiva](#8-guía-html-interactiva)
  - [9. Gestión de variables históricas](#9-gestión-de-variables-históricas)
  - [10. Temas (Black&White, Limited) y demos](#10-temas-black-and-white-limited-y-demos)
    - [Arquitectura compartida: `themes/_base/`](#arquitectura-compartida-themes_base)
    - [Crear un tema nuevo](#crear-un-tema-nuevo)
    - [Sobrescribir un componente SOLO en un tema](#sobrescribir-un-componente-solo-en-un-tema)
    - [Flujo de desarrollo de temas](#flujo-de-desarrollo-de-temas)
  - [11. Arquitectura del sistema](#11-arquitectura-del-sistema)
    - [Módulos principales](#módulos-principales)
      - [**`BuildOrchestrator`** (`src/build/build-orchestrator.js`)](#buildorchestrator-srcbuildbuild-orchestratorjs)
      - [**`AssetManager`** (`src/build/asset-manager.js`)](#assetmanager-srcbuildasset-managerjs)
      - [**`ThemeTransformer`** (`src/build/theme-transformer.js`)](#themetransformer-srcbuildtheme-transformerjs)
    - [Ventajas de la arquitectura](#ventajas-de-la-arquitectura)
    - [Diagrama de flujo](#diagrama-de-flujo)
  - [12. Tests y calidad](#12-tests-y-calidad)
    - [Suite de tests completa](#suite-de-tests-completa)
  - [13. Documentos complementarios](#13-documentos-complementarios)
    - [Publicación de la guía](#publicación-de-la-guía)
  - [14. Recursos y soporte](#14-recursos-y-soporte)
    - [Contribuir](#contribuir)
  - [15. Licencia](#15-licencia)
  - [Changelog](#changelog)
    - [v1.0.12 - Diciembre 2024](#v1012---diciembre-2024)

---

## 1. Instalación

```bash
# Instalación global
npm install -g holygrailcss

# Instalación local (recomendada)
npm install holygrailcss --save-dev
```
> Requiere Node.js >= 12 (probado hasta v20).

---

## 2. Flujo rápido

```bash
# 1) Genera CSS + guía
npx holygrailcss

# 2) Sirve dist/ en local
npm run serve
# http://localhost:3000/index.html

# 3) Trabaja en caliente
npm run watch   # regenera al guardar config.json
npm run dev     # watch + servidor

# 4) Genera CSS y todos los temas activos (Black&White, Limited, …)
npm run build   # genera CSS, HTML, assets y temas automáticamente
```

---

## 3. Scripts disponibles

| Script | Descripción |
| ------ | ----------- |
| `npm run build` | Genera CSS, HTML, assets y transforma temas automáticamente usando `BuildOrchestrator`. |
| `npm run watch` | Observa `config.json`, CSS y temas, regenerando automáticamente al detectar cambios. |
| `npm run serve` | Abre el navegador y sirve `dist/` en el puerto 3000. |
| `npm run dev` | Alias práctico: `watch` + `serve` (desarrollo en caliente). |
| `npm run test` | Ejecuta todos los tests (20 tests unitarios). |
| `npm run vars:report` | Informe completo de variables CSS. |
| `npm run vars:remove-unused` | Limpia variables históricas no usadas. |

---

## 4. ¿Qué se genera?

- **`dist/output.css`** → Reset, variables compartidas, helpers de spacing, helpers de layout, grid opcional, aspect ratios y tipografías mobile/desktop.
- **`dist/index.html`** → Guía interactiva con navegación sticky, buscador y diffs visuales.
- **`dist/guide-styles.css`** → Estilos de la guía de documentación.
- **`dist/assets/`** → Imágenes y recursos estáticos.
- **`dist/themes/<name>.css`** + **`dist/themes/<name>-demo.html`** → Un par de ficheros por cada tema activo en `config.themes[]`. Actualmente se generan `black-and-white.css` / `black-and-white-demo.html` y `limited.css` / `limited-demo.html`.

---

## 5. Estructura del proyecto

```
holygrailcss/
├── config.json                    # Configuración principal
├── generate-css.js                # Entry point del build
├── package.json                   # Dependencias y scripts
│
├── src/
│   ├── assets/                    # Assets estáticos (imágenes)
│   │   ├── intro.jpg
│   │   ├── introm.jpg
│   │   └── margen.webp
│   │
│   ├── build/                     # Sistema de build modular
│   │   ├── asset-manager.js       # Gestión de assets
│   │   ├── build-orchestrator.js  # Orquestador principal
│   │   └── theme-transformer.js   # Transformación de temas
│   │
│   ├── generators/                # Generadores de CSS
│   │   ├── grid-generator.js
│   │   ├── helpers-generator.js
│   │   ├── reset-generator.js
│   │   ├── spacing-generator.js
│   │   ├── typo-generator.js
│   │   ├── utils.js
│   │   └── variables-generator.js
│   │
│   ├── docs-generator/            # Generación de documentación
│   │   ├── guide-styles.css
│   │   ├── html-generator.js
│   │   ├── variables-cli.js
│   │   └── variables-tracker.js
│   │
│   ├── config-loader.js           # Carga y validación de config
│   ├── css-generator.js           # Generador CSS principal
│   ├── dev-server.js              # Servidor de desarrollo
│   └── watch-config.js            # Sistema de watch
│
├── themes/                        # Sistema de temas
│   ├── _base/                     # Componentes compartidos (fuente única)
│   │   ├── _buttons.css
│   │   ├── _inputs.css
│   │   ├── _labels.css
│   │   ├── _checkboxes.css
│   │   ├── _radios.css
│   │   ├── _switches.css
│   │   ├── _forms.css
│   │   ├── _containers.css
│   │   ├── objects/
│   │   │   └── _grid.css
│   │   └── components/
│   │       └── _icons.css
│   │
│   ├── black-and-white/                     # Tema Black&White (paleta neutra + sans-serif)
│   │   ├── theme.json
│   │   ├── _variables.css
│   │   ├── theme.css              # @imports a ../_base/*
│   │   └── demo.html
│   │
│   └── limited/                   # Tema Limited (dorados + serif)
│       ├── theme.json
│       ├── _variables.css
│       ├── theme.css              # @imports a ../_base/*
│       └── demo.html
│
├── tests/                         # Tests unitarios
│   ├── asset-manager.test.js
│   ├── build-orchestrator.test.js
│   ├── theme-transformer.test.js
│   ├── config-loader.test.js
│   ├── css-generator.test.js
│   ├── helpers.test.js
│   ├── html-generator.test.js
│   └── run-all.js
│
├── docs/                          # Documentación complementaria
│   ├── ANALISIS-ARQUITECTURA.md
│   ├── CHANGELOG-MEJORAS.md
│   ├── GUIA-USO-OTRO-PROYECTO.md
│   └── SUPERPROMPT.md
│
└── dist/                          # Archivos generados (gitignored)
    ├── output.css
    ├── index.html
    ├── guide-styles.css
    ├── assets/                    # Assets copiados
    └── themes/                    # Temas generados
```

---

## 6. Configurar `config.json`

### 6.1 Ejemplo mínimo

```jsonc
{
  "prefix": "hg",
  "baseFontSize": 16,
  "breakpoints": { "mobile": "1px", "desktop": "992px" },
  "fontFamilyMap": {
    "primary": "arial, sans-serif",
    "secondary": "\"ms-serif\", serif"
  },
  "colors": { "white": "#fff", "black": "#000" },
  "spacingMap": { "0": "0", "16": "16px", "100-percent": "100%" },
  "spacingImportant": ["0"],
  "helpers": {
    "display": { "property": "display", "class": "d", "responsive": true, "values": ["flex", "block", "none"] }
  },
  "grid": { "enabled": true, "gutter": "8px", "breakpoints": { "md": { "minWidth": "992px", "columns": 12 } } },
  "aspectRatios": [
    { "class": "aspect-16-9", "width": 16, "height": 9, "description": "Ratio 16:9 (widescreen)" },
    { "class": "aspect-1-1", "width": 1, "height": 1, "description": "Ratio 1:1 (cuadrado)" }
  ],
  "typo": {
    "h2": {
      "fontFamily": "arial, sans-serif",
      "fontWeight": "900",
      "mobile": { "fontSize": "18px", "lineHeight": "1.2" },
      "desktop": { "fontSize": "24px", "lineHeight": "1.2" }
    }
  }
}
```

### 6.2 Propiedades globales

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `prefix` | string | Prefijo usado en todas las variables (`--hg-color-*`). |
| `baseFontSize` | number | Conversión automática px → rem (default `16`). |
| `breakpoints.mobile` / `.desktop` | string | Valores usados en media queries (`992px`, etc.). |
| `fontFamilyMap` | object | Alias legibles para las fuentes declaradas en tipografías. |
| `colors` | object | Paleta exportada como `--hg-color-*`. |
| `spacingMap` | object | Escala lógica de spacing (px o %). |
| `spacingImportant` | string[] | Keys de spacing con `!important`. |
| `helpers` | object | Helpers de layout. Permite arrays simples o mapas clave → valor. |
| `grid` | object | Define breakpoints, columnas y gutter por tamaño. |
| `aspectRatios` | array | **Opcional**: Define ratios de aspecto como `.hg-aspect-16-9` con fallback automático. |
| `typo` | object | Clases de tipografía (obligatorio al menos un breakpoint). |
| `themes` | array | Lista de temas a combinar desde `themes/<name>/`. Cada entrada es `{ name, enabled }`. El `BuildOrchestrator` genera un par `dist/themes/<name>.css` + `dist/themes/<name>-demo.html` por cada tema con `enabled: true`. Por compatibilidad hacia atrás se sigue aceptando el antiguo `theme: { name, enabled }` (un único tema). |
| `assets` | object | **Opcional**: `{ css: [...], images: [...] }` para configurar qué archivos copiar a `dist/`. |

### 6.3 Configuración de Assets (Opcional)

Puedes configurar qué archivos CSS e imágenes se copian a `dist/` agregando una sección `assets` en tu `config.json`:

```json
{
  "assets": {
    "css": [
      {
        "source": "src/docs-generator/guide-styles.css",
        "dest": "dist/guide-styles.css"
      }
    ],
    "images": [
      {
        "source": "src/assets/intro.jpg",
        "dest": "dist/assets/intro.jpg"
      },
      {
        "source": "src/assets/margen.webp",
        "dest": "dist/assets/margen.webp"
      }
    ]
  }
}
```

**Ventajas:**
- ✅ Configuración sin modificar código
- ✅ Fácil agregar nuevos assets
- ✅ Flexible para diferentes proyectos

Si no se especifica `assets`, el sistema usa una configuración por defecto.

### 6.4 Helpers y grid

- `src/generators/helpers-generator.js` crea clases del tipo `.hg-d-flex`, `.md\:hg-justify-center`, `.hg-gap-16`, etc.
- Puedes mezclar helpers basados en `values` y helpers que reutilizan `spacingMap` con `useSpacing: true` (gap, row-gap, column-gap...).
- El grid (`grid.enabled=true`) genera utilidades `.row`, `.col-md-6`, offsets, contenedores fluidos y variantes por breakpoint.

### 6.5 Ratios de Aspecto

- `src/generators/ratio-generator.js` crea clases de aspect ratio como `.hg-aspect`, `.hg-aspect-16-9`, `.hg-aspect-1-1`, etc.
- La clase `.hg-aspect` sin sufijo usa el ratio 2:3 por defecto.
- Usa la propiedad CSS `aspect-ratio` nativa con fallback automático para navegadores antiguos (padding-top).
- Incluye `.hg-aspect-image` para imágenes/videos con `object-fit: cover`.
- Incluye `.hg-aspect-content` para posicionar contenido personalizado absolutamente dentro del ratio.
- Cada ratio se define con `class`, `width`, `height` y `description`.
- Útil para mantener proporciones consistentes en imágenes, videos y contenedores.
- Incluye ratios comunes (1:1, 4:3, 16:9) y especializados (separadores 3:1, 7:1, 12:1, 24:1).

### 6.6 Tipografías

- El generador (`src/generators/typo-generator.js`) deduplica valores y crea variables compartidas (`--hg-typo-font-size-24`).
- Cada clase admite propiedades base (`fontFamily`, `fontWeight`, `letterSpacing`, `textTransform`) y propiedades por breakpoint (`fontSize`, `lineHeight`).
- Los valores px se convierten automáticamente a rem respetando `baseFontSize`.

---

## 7. CLI y argumentos

`generate-css.js` puede ejecutarse como binario (`holygrailcss`) o mediante `node generate-css.js`.

Argumentos soportados:
```bash
npx holygrailcss \
  --config=./config.personal.json \
  --output=./dist/custom.css \
  --html=./dist/guia.html
```
- Todos los parámetros son opcionales. Si omites alguno, se usan las rutas por defecto (`config.json` y `dist/*`).
- El script ajusta automáticamente el `href="output.css"` del HTML si CSS y HTML viven en carpetas distintas.

---

## 8. Guía HTML interactiva

El módulo `src/docs-generator/html-generator.js` produce `dist/index.html` con:
- ✅ Resumen visual de colores, tipografías y spacing
- ✅ Detección de cambios: los valores modificados respecto a `.data/.previous-values.json` se resaltan
- ✅ Buscador instantáneo y navegación lateral fija
- ✅ Información de metadata (versión del paquete y último commit disponible)
- ✅ Diseño responsive con smooth scroll (Lenis)

---

## 9. Gestión de variables históricas

El binario `src/docs-generator/variables-cli.js` + el módulo `variables-tracker` guardan un historial en `.data/.historical-variables.json` para que ninguna variable desaparezca sin que lo decidas.

Comandos útiles:
```bash
npm run vars:report          # Estadísticas y listado completo
npm run vars:remove-unused   # Limpia todas las variables no utilizadas
node src/docs-generator/variables-cli.js list --css=./dist/output.css
node src/docs-generator/variables-cli.js remove -- --hg-typo-font-size-18
```
> Después de borrar variables históricas conviene volver a ejecutar `npm run build` para regenerar el CSS sin referencias huérfanas.

---

## 10. Temas (Black&White, Limited) y demos

holygrailcss soporta **múltiples temas simultáneos** bajo `themes/`. El build recorre el array `config.themes[]` y, para cada entrada con `enabled: true`, produce un par `dist/themes/<name>.css` + `dist/themes/<name>-demo.html`. Por defecto vienen dos temas:

- **Black&White** (`themes/black-and-white/`): paleta neutra con tipografía sans-serif (Neutrif).
- **Limited** (`themes/limited/`): paleta de lujo cálido (dorados + crema) con tipografía 100% serif (Neutrif).

### Arquitectura compartida: `themes/_base/`

Los CSS de componente (`_buttons.css`, `_inputs.css`, `_checkboxes.css`, `_radios.css`, `_switches.css`, `_labels.css`, `_forms.css`, `_containers.css`, `objects/_grid.css`, `components/_icons.css`) viven **una sola vez** en `themes/_base/` y se comparten entre todos los temas. Cada tema aporta únicamente lo que lo hace distinto:

- `theme.json` — meta + `tokenOverrides.color` + `componentVars` + `design`
- `_variables.css` — overrides de `--hg-color-*`, `--hg-typo-font-family-*` y mapeo de componentVars (`--btn-*`, `--input-*`, …) a los tokens base
- `theme.css` — `@import` de `_variables.css` local + `@import` de los componentes de `../_base/*.css`
- `demo.html` — demo interactiva con placeholders `HG_THEME_BLOCK` y `HG_TYPO_TABLE` que el build sustituye por las tablas de variables y tipografía del tema

Como los componentes de `_base/` consumen `var(--btn-*)`, `var(--input-*)`, etc., cambiar la paleta o la tipografía en el `_variables.css` de un tema se propaga automáticamente sin tocar los componentes.

### Crear un tema nuevo

1. Crea `themes/<nombre>/` con los 4 ficheros descritos arriba (puedes partir copiando `themes/black-and-white/` o `themes/limited/` y ajustar `theme.json` y `_variables.css`).
2. Registra el tema en `config.json`:

   ```json
   {
     "themes": [
       { "name": "black-and-white",   "enabled": true },
       { "name": "limited", "enabled": true },
       { "name": "<nombre>", "enabled": true }
     ]
   }
   ```

3. Añade una entrada a `THEMES_IN_NAV` en `src/build/theme-transformer.js` (y a los nav estáticos de `src/docs-generator/html-generator.js`, `src/build/skills-generator.js` y `src/skills.html`) para que el nuevo tema aparezca como enlace cruzado en los demos.
4. `npm run build` → verifica `dist/themes/<nombre>.css` y `dist/themes/<nombre>-demo.html`.

Para guía detallada paso a paso y plantillas completas ver `skills/theme-creator/SKILL.md`.

### Sobrescribir un componente SOLO en un tema

La regla es: *"si quieres un componente distinto, machácalo en el tema"*.

1. Copia el CSS de `themes/_base/_inputs.css` a `themes/<nombre>/_inputs.css` y modifícalo.
2. En `themes/<nombre>/theme.css` cambia el `@import` para apuntar al fichero local:

   ```css
   /* antes */
   @import url('../_base/_inputs.css');
   /* después */
   @import url('_inputs.css');
   ```

3. El resto de componentes sigue heredando de `_base/`. Así evitas duplicar ficheros salvo cuando realmente haya override.

### Flujo de desarrollo de temas

1. `npm run watch` detecta cambios en `themes/` automáticamente (tanto en `_base/` como en cada tema).
2. Los cambios en `demo.html`, `theme.css`, `_variables.css` o en los componentes compartidos se procesan al guardar.
3. Los resultados se regeneran en `dist/themes/<name>-demo.html` y `dist/themes/<name>.css`.
4. `npm run serve` sirve los demos en tiempo real con navegación cruzada entre todos los temas activos.

---

## 11. Arquitectura del sistema

holygrailcss usa una arquitectura modular y centralizada construida en diciembre 2024:

### Módulos principales

#### **`BuildOrchestrator`** (`src/build/build-orchestrator.js`)
- Coordina todo el proceso de build de forma centralizada
- Genera CSS, HTML, copia assets y transforma temas
- Soporta modo watch con cache busting automático
- ~175 líneas, 100% testeado

#### **`AssetManager`** (`src/build/asset-manager.js`)
- Gestiona la copia de CSS e imágenes a `dist/`
- Configuración centralizada desde `config.json` o fallback
- API simple: `copyCSS()`, `copyImages()`, `copyAssets()`
- Soporte para agregar assets dinámicamente
- ~153 líneas, 10 tests

#### **`ThemeTransformer`** (`src/build/theme-transformer.js`)
- Transforma HTML de temas agregando sidebar, header y scripts
- Inyecta Lenis para scroll suave y navegación
- Manejo dinámico de múltiples temas
- ~234 líneas, 5 tests

### Ventajas de la arquitectura

- ✅ **Sin duplicación de código** (~150 líneas eliminadas)
- ✅ **Consistencia** entre build y watch
- ✅ **Testeable** (20 tests unitarios, 100% pasando)
- ✅ **Mantenible** (responsabilidades claramente separadas)
- ✅ **Extensible** (fácil agregar nuevas funcionalidades)

### Diagrama de flujo

```
generate-css.js
     ↓
BuildOrchestrator
     ├── config-loader.js → Carga config.json
     ├── css-generator.js → Genera CSS
     ├── html-generator.js → Genera HTML
     ├── AssetManager → Copia assets
     └── ThemeTransformer → Transforma temas
```

---

## 12. Tests y calidad

### Suite de tests completa

```bash
npm test  # Ejecuta todos los tests
```

**Tests disponibles:**
- ✅ `config-loader.test.js` - Validación de configuración
- ✅ `css-generator.test.js` - Generación de CSS
- ✅ `helpers.test.js` - Utilidades compartidas
- ✅ `html-generator.test.js` - Generación de HTML
- ✅ `asset-manager.test.js` - Gestión de assets (10 tests)
- ✅ `theme-transformer.test.js` - Transformación de temas (5 tests)
- ✅ `build-orchestrator.test.js` - Orquestador de build (5 tests)

**Resultados:**
```
📊 Resumen Total de Tests de Build:
   ✅ Pasados: 20
   ❌ Fallidos: 0
   📈 Total: 20
```

Los tests:
- Imprimen resultados en consola sin necesidad de frameworks pesados
- Funciones puras fáciles de testear en aislamiento
- Cobertura completa del sistema de build
- Se ejecutan en menos de 1 segundo

---

## 13. Documentos complementarios

| Archivo | Contenido |
| ------- | --------- |
| `docs/SUPERPROMPT.md` | Prompt detallado para asistentes/IA que necesiten generar HTML usando holygrailcss. |
| `docs/GUIA-USO-OTRO-PROYECTO.md` | Pasos para integrar holygrailcss en proyectos existentes. |
| `docs/ANALISIS-ARQUITECTURA.md` | Análisis completo de la arquitectura y problemas resueltos. |
| `docs/CHANGELOG-MEJORAS.md` | Registro detallado de la refactorización de diciembre 2024. |

### Publicación de la guía

Puedes publicar `dist/index.html` como documentación estática en:
- GitHub Pages
- Netlify (configurado en `netlify.toml`)
- Vercel
- Cualquier hosting estático

```bash
npm run build
# Publica el contenido de dist/ en tu hosting
```

---

## 14. Recursos y soporte

- **Repositorio**: [github.com/holygrailcss/holygrail](https://github.com/holygrailcss/holygrail)
- **npm**: [holygrailcss](https://www.npmjs.com/package/holygrailcss)
- **Issues y PRs**: Bienvenidos. Sigue el flujo clásico: fork → rama → PR
- **Documentación**: Ver `docs/` para guías detalladas

### Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: agregar AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 15. Licencia

MIT © holygrailcss

Usa, adapta y comparte libremente mientras conserves la atribución.

---

## Changelog

### v1.0.12 - Diciembre 2024

**🎉 Refactorización arquitectural completa**

- ✅ Nueva arquitectura modular con `BuildOrchestrator`, `AssetManager` y `ThemeTransformer`
- ✅ Eliminadas ~150 líneas de código duplicado
- ✅ Assets organizados en `src/assets/` y `dist/assets/`
- ✅ Configuración de assets desde `config.json`
- ✅ 20 tests unitarios agregados (100% pasando)
- ✅ Sistema de watch mejorado
- ✅ Documentación actualizada

Ver `docs/CHANGELOG-MEJORAS.md` para detalles completos.

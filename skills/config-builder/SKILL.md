# holygrailcss — Config Builder

Ayuda a crear o modificar el `config.json` de holygrailcss de forma correcta y completa.

## Contexto

El `config.json` es el corazón de holygrailcss. Define todo el design system: colores, spacing, tipografía, helpers, grid y temas. Cada propiedad genera CSS automáticamente.

## Instrucciones

Cuando el usuario pida crear o modificar un config.json:

1. **Lee el config.json actual** si existe para entender la configuración base.

2. **Valida la estructura** — las propiedades obligatorias son:
   - `prefix` (string): prefijo para todas las variables CSS
   - `breakpoints.mobile` y `breakpoints.desktop` (string con unidad CSS)
   - `typo` (object): al menos una clase tipográfica con al menos un breakpoint

3. **Propiedades opcionales pero recomendadas:**
   - `colors` → genera `--{prefix}-color-{nombre}`
   - `spacingMap` → genera `--{prefix}-spacing-{valor}` y clases `.p-*`, `.m-*`
   - `spacingImportant` → array de keys con `!important`
   - `fontFamilyMap` → alias para familias tipográficas
   - `helpers` → utilidades de layout configurables
   - `grid` → sistema de grid con breakpoints y columnas
   - `aspectRatios` → ratios de aspecto con fallback
   - `theme` → `{ name, enabled }` para activar temas
   - `assets` → configuración de archivos a copiar a dist/

4. **Para cada clase tipográfica** (`typo`), asegura que tenga:
   - `fontFamily` (string)
   - Al menos un breakpoint (`mobile` o `desktop`) con `fontSize` y/o `lineHeight`
   - Opcionales: `fontWeight`, `letterSpacing`, `textTransform`

5. **Para cada helper**, asegura que tenga:
   - `property` (propiedad CSS)
   - `class` (nombre base de la clase)
   - `responsive` (boolean)
   - `values` (array o object) O `useSpacing: true` para usar spacingMap

6. **Para el grid**, asegura:
   - `enabled` (boolean)
   - `gutter` (string con unidad CSS)
   - `breakpoints` → objeto con `{ minWidth, columns }` por breakpoint

## Ejemplo de config mínimo

```json
{
  "prefix": "hg",
  "breakpoints": { "mobile": "1px", "desktop": "992px" },
  "colors": { "primary": "#000", "white": "#fff" },
  "spacingMap": { "0": "0", "8": "8px", "16": "16px" },
  "typo": {
    "body": {
      "fontFamily": "arial, sans-serif",
      "mobile": { "fontSize": "14px", "lineHeight": "1.5" },
      "desktop": { "fontSize": "16px", "lineHeight": "1.5" }
    }
  }
}
```

## Validación

Después de crear/modificar el config.json:
- Ejecuta `npx holygrailcss` para verificar que genera CSS sin errores
- Revisa que no haya duplicados en spacingMap, colors o typo
- Verifica que breakpoints.desktop > breakpoints.mobile

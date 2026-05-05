# holygrailcss — Migration Helper

Asiste en la migración de proyectos existentes a holygrailcss.

## Contexto

holygrailcss reemplaza frameworks CSS tradicionales (Bootstrap, Tailwind, CSS custom) con un sistema generado desde config.json. La migración implica mapear clases antiguas a clases holygrailcss y configurar el design system.

## Instrucciones

Cuando el usuario pida ayuda para migrar:

1. **Analiza el CSS actual** del proyecto:
   - Identifica clases de framework existentes (Bootstrap, Tailwind, Foundation, etc.)
   - Identifica CSS custom con valores hardcodeados
   - Detecta patrones de spacing, colores y tipografía

2. **Crea un mapa de equivalencias** entre clases antiguas y holygrailcss:

   ### Bootstrap → holygrailcss
   | Bootstrap | holygrailcss |
   |-----------|-------------|
   | `.d-flex` | `.hg-d-flex` |
   | `.d-none` | `.hg-d-none` |
   | `.d-md-block` | `.md\:hg-d-block` |
   | `.justify-content-center` | `.hg-justify-center` |
   | `.align-items-center` | `.hg-items-center` |
   | `.text-center` | `.hg-text-center` |
   | `.p-3` | `.p-16` (16px) |
   | `.mb-4` | `.mb-24` (24px) |
   | `.col-md-6` | `.col-md-6` (similar) |
   | `.row` | `.row` (similar) |

   ### Tailwind → holygrailcss
   | Tailwind | holygrailcss |
   |---------|-------------|
   | `flex` | `.hg-d-flex` |
   | `hidden` | `.hg-d-none` |
   | `justify-center` | `.hg-justify-center` |
   | `items-center` | `.hg-items-center` |
   | `gap-4` | `.hg-gap-16` |
   | `p-4` | `.p-16` |
   | `w-full` | `.hg-w-100-percent` |
   | `text-center` | `.hg-text-center` |

3. **Genera el config.json** a partir del análisis:
   - Extrae colores usados → `colors`
   - Extrae valores de spacing → `spacingMap`
   - Extrae tipografías → `typo`
   - Configura helpers necesarios → `helpers`

4. **Plan de migración paso a paso:**
   1. Instalar: `npm install holygrailcss --save-dev`
   2. Crear config.json con los tokens del proyecto
   3. Generar CSS: `npx holygrailcss`
   4. Enlazar output.css en el HTML
   5. Reemplazar clases archivo por archivo
   6. Eliminar framework antiguo
   7. Limpiar: `npm run vars:remove-unused`

5. **Ofrece buscar y reemplazar** clases en lote cuando sea posible (grep + sed o find/replace).

## Validación

- Tras cada archivo migrado, verifica visualmente que el layout no se rompe
- Ejecuta `npm run vars:report` para detectar variables no usadas
- Comprueba responsive en mobile y desktop

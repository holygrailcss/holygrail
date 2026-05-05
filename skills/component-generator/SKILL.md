# holygrailcss — Component Generator

Genera componentes HTML que usan las clases de holygrailcss correctamente.

## Contexto

holygrailcss es un generador CSS basado en config.json. Todas las clases usan el prefijo `.hg-`. Este skill genera marcado HTML que aprovecha el sistema de utilidades de holygrailcss.

## Instrucciones

Cuando el usuario pida crear un componente HTML con holygrailcss:

1. **Lee el config.json** del proyecto para conocer las clases disponibles (colores, spacing, tipografía, helpers, grid, aspect ratios).

2. **Usa SOLO clases de holygrailcss** — nunca escribas CSS inline ni clases inventadas. Las clases siguen este patrón:
   - Spacing: `.p-{valor}`, `.m-{valor}`, `.pt-{valor}`, `.hg-px-{valor}`, `.hg-py-{valor}`
   - Helpers: `.hg-d-flex`, `.hg-d-none`, `.hg-justify-center`, `.hg-items-center`, `.hg-gap-{valor}`
   - Responsive: `.md\:hg-d-flex`, `.md\:hg-justify-between`
   - Grid: `.row`, `.col-{bp}-{n}` (ej: `.col-md-6`, `.col-lg-4`)
   - Tipografía: `.hg-{nombre}` (ej: `.hg-h2`, `.hg-title-l`, `.hg-text-m`, `.hg-neutrif-1`)
   - Colores (via variables): `var(--hg-color-{nombre})`
   - Spacing (via variables): `var(--hg-spacing-{valor})`
   - Ratios: `.hg-aspect`, `.hg-aspect-16-9`, `.hg-aspect-1-1`

3. **Enfoque mobile-first**: las clases base aplican a mobile; usa el prefijo `md\:` para desktop.

4. **Usa el grid cuando sea necesario**: `.row` como contenedor flex, `.col-{bp}-{n}` para columnas. El grid soporta breakpoints: xs, sm, md, lg, xl.

5. **Naming consistente**: el nombre del componente React y la primera clase CSS del `<div>` raíz deben coincidir, usando formato kebab-case (minúsculas con guiones). Los nombres deben ser cortos y únicos. Por ejemplo, si el componente se llama `ProductCard`, la primera clase del div contenedor debe ser `product-card`:
   ```jsx
   function ProductCard() {
     return <div className="product-card hg-gap-16">...</div>
   }
   ```

6. **Devuelve HTML limpio** con comentarios explicando las decisiones de layout.

## Ejemplo de salida

```html
<!-- Card de producto — mobile stack, desktop side-by-side -->
<div class="row hg-gap-16">
  <div class="col-md-6">
    <div class="hg-aspect hg-aspect-16-9">
      <img class="hg-aspect-image" src="product.jpg" alt="Producto">
    </div>
  </div>
  <div class="col-md-6 hg-d-flex hg-flex-column hg-justify-center hg-gap-8">
    <h2 class="hg-title-l-b">Nombre del producto</h2>
    <p class="hg-text-m" style="color: var(--hg-color-dark-grey)">Descripción del producto.</p>
    <span class="hg-h2" style="color: var(--hg-color-primary)">49,90 €</span>
  </div>
</div>
```

## Validación

Antes de entregar, verifica que:
- Todas las clases existen en el config.json del proyecto
- Los valores de spacing están en el spacingMap
- Los colores referenciados existen en la paleta
- El layout es responsive (funciona en mobile y desktop)

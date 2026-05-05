# holygrailcss — Layout Builder

Construye layouts completos y responsive usando el sistema de grid y helpers de holygrailcss.

## Contexto

holygrailcss ofrece un grid flexible (12-24 columnas por breakpoint), helpers de flexbox, spacing responsive y aspect ratios. Este skill combina todos estos sistemas para crear layouts de página completos.

## Instrucciones

Cuando el usuario pida un layout:

1. **Lee el config.json** para conocer los breakpoints y grid disponibles:
   - Breakpoints del grid: xs (1px), sm (768px), md (992px), lg (1280px), xl (1440px)
   - Columnas por breakpoint (normalmente 12, xl puede ser 24)
   - Gutter y container margin

2. **Usa el sistema de grid** para la estructura principal:
   ```html
   <div class="row">
     <div class="col-xs-12 col-md-8">Contenido principal</div>
     <div class="col-xs-12 col-md-4">Sidebar</div>
   </div>
   ```

3. **Usa helpers de flexbox** para alineación dentro de componentes:
   - `.hg-d-flex` + `.hg-flex-column` para stack vertical
   - `.hg-justify-between` para distribuir espacio
   - `.hg-items-center` para centrar verticalmente
   - `.hg-gap-{valor}` para separación entre items

4. **Aplica spacing responsive:**
   - Base (mobile): `.p-16`, `.mb-24`
   - Desktop: usa variables CSS o clases responsive `md\:` cuando estén disponibles
   - Usa `.hg-px-{valor}` y `.hg-py-{valor}` para padding inline/block (RTL-safe)

5. **Usa aspect ratios** para imágenes y media:
   ```html
   <div class="hg-aspect hg-aspect-16-9">
     <img class="hg-aspect-image" src="hero.jpg" alt="">
   </div>
   ```

6. **Patrones de layout comunes:**

   **Hero full-width:**
   ```html
   <section class="hg-d-flex hg-items-center hg-justify-center" style="min-height: 100vh;">
     <div class="hg-text-center p-24">
       <h1 class="hg-h2">Título principal</h1>
       <p class="hg-text-m">Subtítulo descriptivo</p>
     </div>
   </section>
   ```

   **Grid de cards:**
   ```html
   <div class="row hg-gap-16">
     <div class="col-xs-12 col-sm-6 col-lg-4"><!-- Card --></div>
     <div class="col-xs-12 col-sm-6 col-lg-4"><!-- Card --></div>
     <div class="col-xs-12 col-sm-6 col-lg-4"><!-- Card --></div>
   </div>
   ```

   **Sidebar layout:**
   ```html
   <div class="row">
     <aside class="col-md-3 md\:hg-d-block hg-d-none">Nav</aside>
     <main class="col-xs-12 col-md-9">Content</main>
   </div>
   ```

## Validación

- Verifica que el layout funciona en todos los breakpoints del config
- Comprueba que no hay overflow horizontal en mobile
- Asegura que los elementos del grid suman el total de columnas correcto
- Usa `.bleed` solo cuando se necesite eliminar el gutter deliberadamente

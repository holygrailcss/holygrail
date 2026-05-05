/**
 * Components Page Generator
 *
 * Genera dist/componentes.html: una página que muestra todos los
 * componentes base (themes/_base/) con preview vivo + el nombre de
 * clase junto a cada variante.
 *
 * Se renderiza con el tema DUTTI como base genérica (tema neutro del
 * framework). Sobre él se pueden aplicar otros temas en el futuro si
 * añadimos un theme switcher. Por tanto la página enlaza:
 *   - dist/output.css          → tokens --hg-* del framework
 *   - dist/themes/black-and-white.css    → mapeo de variables + reglas de componente
 */

const fs = require('fs');
const path = require('path');
const { resolveActiveThemes } = require('../generators/utils');

/**
 * Nombre del tema que se usa como "base genérica" para renderizar la
 * página. Si en algún momento se quiere cambiar, basta con modificar
 * esta constante (o exponerla en config.json).
 */
const BASE_THEME = 'black-and-white';

/**
 * Lista canónica de componentes mostrados en la página.
 */
const COMPONENT_SECTIONS = [
  {
    id: 'buttons',
    title: 'Botones',
    description:
      'Variantes estándar del framework: <code>primary</code>, <code>secondary</code>, <code>tertiary</code>, <code>label-m</code>, <code>link</code> y <code>badge</code>. Clases en <code>themes/_base/_buttons.css</code>. Cada tema puede sobreescribirlas con su propia identidad visual.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<button class="btn btn-primary">Primary</button>', cls: '.btn .btn-primary' },
          { html: '<button class="btn btn-secondary">Secondary</button>', cls: '.btn .btn-secondary' },
          { html: '<button class="btn btn-tertiary">Tertiary</button>', cls: '.btn .btn-tertiary' },
          {
            html: '<button class="btn btn-tertiary hg-text-underline">Tertiary underline</button>',
            cls: '.btn .btn-tertiary .hg-text-underline'
          },
          { html: '<button class="btn btn-label-m">Label M</button>', cls: '.btn .btn-label-m' },
          { html: '<button class="btn btn-link">Link</button>', cls: '.btn .btn-link' },
          { html: '<button class="btn btn-badge">Badge</button>', cls: '.btn .btn-badge' },
          { html: '<button class="btn btn-primary" disabled>Disabled</button>', cls: '.btn[disabled]' }
        ]
      },
      {
        subtitle: 'Tamaños',
        items: [
          { html: '<button class="btn btn-primary btn-sm">Small</button>', cls: '.btn .btn-sm' },
          { html: '<button class="btn btn-primary btn-md">Medium</button>', cls: '.btn .btn-md' },
          { html: '<button class="btn btn-primary btn-lg">Large</button>', cls: '.btn .btn-lg' }
        ]
      },
      {
        subtitle: 'Ancho completo',
        items: [
          {
            html: '<button class="btn btn-primary btn-md btn-full">Botón ancho completo</button>',
            cls: '.btn .btn-full'
          }
        ]
      }
    ]
  },
  {
    id: 'inputs',
    title: 'Inputs',
    description:
      'Campos de formulario base con <strong>floating label</strong>: texto, email, password, textarea y select. Cada input vive dentro de <code>.form-input-label-2</code> para que el label se anime al enfocar o al contener valor. Clases en <code>themes/_base/_inputs.css</code>.',
    examples: [
      {
        subtitle: 'Tipos',
        items: [
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-text" class="input" placeholder=" " /><label for="cmp-input-text">Texto</label></div>',
            cls: '.form-input-label-2 > .input'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="email" id="cmp-input-email" class="input" placeholder=" " /><label for="cmp-input-email">Email</label></div>',
            cls: '.input (type=email)'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="password" id="cmp-input-password" class="input" placeholder=" " /><label for="cmp-input-password">Contraseña</label></div>',
            cls: '.input (type=password)'
          },
          {
            html:
              '<div class="form-input-label-2"><textarea id="cmp-input-textarea" class="input" placeholder=" " rows="3"></textarea><label for="cmp-input-textarea">Comentario</label></div>',
            cls: '.input (textarea)'
          },
          {
            html:
              '<div class="form-input-label-2"><select id="cmp-input-select" class="input"><option>Opción A</option><option>Opción B</option></select><label for="cmp-input-select">Selecciona</label></div>',
            cls: '.input (select)'
          }
        ]
      },
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-error" class="input input-error" value="Valor inválido" placeholder=" " /><label for="cmp-input-error">Error</label></div><span class="helper-text helper-text-error">Este campo tiene un error</span>',
            cls: '.input-error + .helper-text-error'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-success" class="input input-success" value="Valor válido" placeholder=" " /><label for="cmp-input-success">Success</label></div><span class="helper-text helper-text-success">Campo válido</span>',
            cls: '.input-success + .helper-text-success'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-warning" class="input input-warning" value="Atención" placeholder=" " /><label for="cmp-input-warning">Warning</label></div><span class="helper-text helper-text-warning">Revisa este campo</span>',
            cls: '.input-warning + .helper-text-warning'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-disabled" class="input" value="No editable" placeholder=" " disabled /><label for="cmp-input-disabled">Disabled</label></div>',
            cls: '.input[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'labels',
    title: 'Labels',
    description:
      'Etiquetas de formulario: base, obligatoria e inline. Clases en <code>themes/_base/_labels.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<label class="label">Nombre</label>', cls: '.label' },
          { html: '<label class="label label-required">Email</label>', cls: '.label .label-required' },
          {
            html:
              '<label class="label label-inline"><input type="checkbox" /> Acepto los términos</label>',
            cls: '.label .label-inline'
          }
        ]
      }
    ]
  },
  {
    id: 'checkboxes',
    title: 'Checkboxes',
    description:
      'Checkbox con input nativo oculto y marca SVG inline dentro de <code>.checkbox-indicator</code>. El estado visible se controla 100% con CSS (sin JS). Clases en <code>themes/_base/_checkboxes.css</code>.',
    examples: [
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<label class="checkbox"><input type="checkbox" /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Sin marcar</span></label>',
            cls: '.checkbox'
          },
          {
            html:
              '<label class="checkbox"><input type="checkbox" checked /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Marcado</span></label>',
            cls: '.checkbox (checked)'
          },
          {
            html:
              '<label class="checkbox"><input type="checkbox" disabled /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Disabled</span></label>',
            cls: '.checkbox[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'radios',
    title: 'Radios',
    description:
      'Radio buttons con el patrón <code>.checkbox-radio</code>: el input nativo se oculta visualmente y el círculo se pinta con <code>label::before</code>. Clases en <code>themes/_base/_radios.css</code>.',
    examples: [
      {
        subtitle: 'Grupo',
        items: [
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-1" name="cmp-radio" type="radio" value="A" /><label for="cmp-radio-1"><i class="ico-radio"></i><span class="title-m">Opción A</span></label></div>',
            cls: '.checkbox-radio'
          },
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-2" name="cmp-radio" type="radio" value="B" checked /><label for="cmp-radio-2"><i class="ico-radio"></i><span class="title-m">Opción B (activa)</span></label></div>',
            cls: '.checkbox-radio (checked)'
          },
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-3" name="cmp-radio-2" type="radio" value="C" disabled /><label for="cmp-radio-3"><i class="ico-radio"></i><span class="title-m">Disabled</span></label></div>',
            cls: '.checkbox-radio[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'switches',
    title: 'Switches',
    description:
      'Interruptores on/off con el patrón <code>.checkbox-item-2</code>: pista rectangular y un <code>.checkbox-circle</code> que se desplaza al marcar. Clases en <code>themes/_base/_switches.css</code>.',
    examples: [
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-1" name="cmp-switch-1" type="checkbox" /><label for="cmp-switch-1"><div class="checkbox-circle"></div><span class="theta">Inactivo</span></label></div>',
            cls: '.checkbox-item-2'
          },
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-2" name="cmp-switch-2" type="checkbox" checked /><label for="cmp-switch-2"><div class="checkbox-circle"></div><span class="theta">Activado</span></label></div>',
            cls: '.checkbox-item-2 (checked)'
          },
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-3" name="cmp-switch-3" type="checkbox" disabled /><label for="cmp-switch-3"><div class="checkbox-circle"></div><span class="theta">Disabled</span></label></div>',
            cls: '.checkbox-item-2[disabled]'
          },
          {
            html:
              '<div class="checkbox-item-2 is-error"><input id="cmp-switch-4" name="cmp-switch-4" type="checkbox" /><label for="cmp-switch-4"><div class="checkbox-circle"></div><span class="theta">Error</span></label></div>',
            cls: '.checkbox-item-2.is-error'
          }
        ]
      }
    ]
  },
  {
    id: 'forms',
    title: 'Formularios',
    description:
      'Composición de campos con label flotante + estado. <code>.form-group</code> apila verticalmente los campos; cada uno usa <code>.form-input-label-2</code> para el floating label y (opcionalmente) <code>.helper-text</code> para el mensaje de estado. Clases en <code>themes/_base/_forms.css</code>.',
    examples: [
      {
        subtitle: 'Grupo de formulario',
        items: [
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><input type="email" id="cmp-form-email" class="input" placeholder=" " /><label for="cmp-form-email">Email</label></div></div>',
            cls: '.form-group > .form-input-label-2'
          },
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><textarea id="cmp-form-msg" class="input" rows="3" placeholder=" "></textarea><label for="cmp-form-msg">Mensaje</label></div></div>',
            cls: '.form-group (con textarea)'
          },
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><input type="text" id="cmp-form-err" class="input input-error" value="" placeholder=" " /><label for="cmp-form-err">Nombre</label></div><span class="helper-text helper-text-error">Este campo es obligatorio</span></div>',
            cls: '.form-group (con helper-text)'
          }
        ]
      }
    ]
  },
  {
    id: 'containers',
    title: 'Containers',
    description:
      'Contenedores centrados con <code>max-width</code> responsivo y/o fijo. <code>.container</code> escala con los breakpoints; <code>.container-2</code> es más estrecho; las variantes <code>.container-640</code>, <code>.container-512</code> y <code>.container-360</code> fijan un ancho concreto. Clases en <code>themes/_base/_containers.css</code>.',
    examples: [
      {
        subtitle: 'Responsivos',
        items: [
          {
            html:
              '<div class="container" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container</div>',
            cls: '.container'
          },
          {
            html:
              '<div class="container-2" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-2</div>',
            cls: '.container-2'
          }
        ]
      },
      {
        subtitle: 'Anchos fijos',
        items: [
          {
            html:
              '<div class="container-640" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-640</div>',
            cls: '.container-640'
          },
          {
            html:
              '<div class="container-512" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-512</div>',
            cls: '.container-512'
          },
          {
            html:
              '<div class="container-360" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-360</div>',
            cls: '.container-360'
          }
        ]
      }
    ]
  },
  {
    id: 'grid',
    title: 'Grid',
    description:
      'Utilidades de CSS Grid inspiradas en Tailwind. El contenedor debe tener <code>display:grid</code> y usar <code>.hg-grid-cols-N</code> para definir N columnas; los hijos usan <code>.hg-col-span-N</code> para ocupar varias. Con el prefijo <code>md:</code> se activan a partir de 768&nbsp;px. Clases en <code>themes/_base/objects/_grid.css</code>.',
    examples: [
      {
        subtitle: 'Columnas iguales',
        items: [
          {
            html:
              '<div class="hg-grid-cols-3" style="display:grid; gap:var(--hg-spacing-8);"><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">1</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">2</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">3</div></div>',
            cls: '.hg-grid-cols-3'
          },
          {
            html:
              '<div class="hg-grid-cols-4" style="display:grid; gap:var(--hg-spacing-8);"><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">1</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">2</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">3</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">4</div></div>',
            cls: '.hg-grid-cols-4'
          }
        ]
      },
      {
        subtitle: 'Col-span',
        items: [
          {
            html:
              '<div class="hg-grid-cols-12" style="display:grid; gap:var(--hg-spacing-8);"><div class="hg-col-span-8" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 8</div><div class="hg-col-span-4" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 4</div></div>',
            cls: '.hg-grid-cols-12 > .hg-col-span-{8,4}'
          },
          {
            html:
              '<div class="hg-grid-cols-12" style="display:grid; gap:var(--hg-spacing-8);"><div class="hg-col-span-6" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 6</div><div class="hg-col-span-6" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 6</div></div>',
            cls: '.hg-grid-cols-12 > .hg-col-span-6'
          }
        ]
      }
    ]
  }
];

// Escape HTML para mostrar el nombre de clase dentro de <code>.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSection(section) {
  const blocks = section.examples
    .map((group) => {
      const items = group.items
        .map(
          (it) => `
          <div class="demo-item">
            <div class="cmp-preview">${it.html}</div>
            <div class="demo-code">${escapeHtml(it.cls)}</div>
          </div>`
        )
        .join('');
      return `
        <h3 class="demo-subtitle">${group.subtitle}</h3>
        <div class="demo-grid">${items}
        </div>`;
    })
    .join('');

  return `
      <section class="demo-section" id="${section.id}">
        <h2 class="demo-title">${section.title}</h2>
        <p class="cmp-desc">${section.description}</p>
        ${blocks}
      </section>`;
}

/**
 * Construye el header + sidebar de la página Componentes, usando la
 * misma estructura que las demos de tema (`buildHeaderAndSidebar` en
 * theme-transformer.js). Enlaces relativos al mismo nivel que los
 * theme demos para mantener coherencia.
 */
function buildHeaderAndSidebar(activeThemes) {
  const themeLinks = (activeThemes || [])
    .map((t) => `        <a href="themes/${t.name}-demo.html">${t.label}</a>`)
    .join('\n');

  const sidebarLinks = COMPONENT_SECTIONS.map(
    (s) => `      <a href="#${s.id}" class="guide-menu-item">${s.title}</a>`
  ).join('\n');

  return `
  <div class="guide-header">
    <a href="index.html" class="guide-logo" style="text-decoration:none;">holygrailcss</a>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <nav class="guide-nav">
        <a href="index.html">Guía</a>
        <a href="componentes.html" class="active">Componentes</a>
${themeLinks}
        <a href="skills.html">Skills</a>
      </nav>
      <button class="guide-header-button" onclick="toggleSidebar()">☰</button>
    </div>
  </div>

  <div class="guide-sidebar-overlay" onclick="toggleSidebar()"></div>

  <aside class="guide-sidebar">
    <div class="guide-sidebar-header">
      <div>holygrailcss</div>
      <p class="guide-sidebar-subtitle">Componentes base</p>
    </div>

    <nav class="guide-sidebar-nav">
      <p class="guide-sidebar-title">Componentes</p>

${sidebarLinks}
    </nav>
  </aside>

  <script>
    function toggleSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }

    function closeSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
  </script>`;
}

/**
 * Genera el HTML completo de dist/componentes.html.
 *
 * La página adopta la misma estructura que las demos de tema
 * (`guide-header` + `guide-sidebar` + `demo-container.guide-main-content`)
 * y reutiliza `guide-styles.css` para mantener un flow consistente
 * con el resto del sitio.
 *
 * @param {string} projectRoot
 * @param {Object} [configData] - Config ya cargado (para nav dinámica).
 * @returns {string|null}
 */
function generateComponentsPage(projectRoot, configData = null) {
  const baseDir = path.join(projectRoot, 'themes', '_base');
  if (!fs.existsSync(baseDir)) {
    console.warn('⚠️  No se encontró themes/_base/, omitiendo componentes.html');
    return null;
  }

  const activeThemes = configData ? resolveActiveThemes(configData) : [];
  const sectionsHtml = COMPONENT_SECTIONS.map(renderSection).join('\n');
  const headerAndSidebar = buildHeaderAndSidebar(activeThemes);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>holygrailcss — Componentes base</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Instrument+Sans:regular,100,500,600,700">
  <!-- Framework base -->
  <link rel="stylesheet" href="output.css">
  <!-- Tema base genérico: ${BASE_THEME} (variables + componentes) -->
  <link rel="stylesheet" href="themes/${BASE_THEME}.css">
  <!-- Estilos compartidos de guía (header, sidebar, demo-*) -->
  <link rel="stylesheet" href="guide-styles.css">
  <style>
    body {
      font-family: 'Instrument Sans', sans-serif !important;
    }

    /* Descripción de cada sección (debajo del título) */
    .cmp-desc {
      font-size: 14px;
      line-height: 1.6;
      color: #555;
      margin: 0 0 1.5rem;
      max-width: 720px;
    }
    .cmp-desc code {
      background: #f3f3f3;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.88em;
    }

    /* Preview de cada componente dentro de .demo-item */
    .cmp-preview {
      min-height: 48px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: var(--hg-spacing-12);
    }

    /* Los inputs con floating label necesitan respirar: el label flota
       encima, el helper-text se apila debajo. */
    #inputs .cmp-preview,
    #forms .cmp-preview {
      display: block;
    }
    #inputs .cmp-preview > .form-input-label-2,
    #forms .cmp-preview > .form-group {
      width: 100%;
    }

    /* Containers y Grid son estructuras de layout: interesan como
       bloques a 100% del item, no como chips alineados horizontalmente. */
    #containers .demo-grid,
    #grid .demo-grid {
      grid-template-columns: 1fr;
    }
    #containers .cmp-preview,
    #grid .cmp-preview {
      display: block;
    }
    #containers .cmp-preview > [class^="container"],
    #grid .cmp-preview > [class^="hg-grid-"] {
      width: 100%;
      max-width: 100%;
    }
  </style>
</head>
<body>
${headerAndSidebar}

  <main class="demo-container guide-main-content">
    <h2 class="demo-title">Componentes base</h2>

    <div class="demo-section-2">
      <h3>¿Qué es esta página?</h3>
      <p class="mb-16">
        Librería de componentes compartidos que viven en
        <code>themes/_base/</code>. Se renderizan con el tema
        <strong>${BASE_THEME[0].toUpperCase() + BASE_THEME.slice(1)}</strong>
        como base genérica del framework; cualquier otro tema puede
        aplicarse encima para redefinir la identidad visual sin tocar
        el HTML.
      </p>
    </div>

${sectionsHtml}
  </main>
</body>
</html>`;
}

// CLI
if (require.main === module) {
  const projectRoot = path.join(__dirname, '..', '..');
  const html = generateComponentsPage(projectRoot);
  if (html) {
    const outputPath = path.join(projectRoot, 'dist', 'componentes.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log('✅ componentes.html generado en dist/');
  }
}

module.exports = { generateComponentsPage };

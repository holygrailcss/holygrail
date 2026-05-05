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
 *   - dist/themes/black-yellow.css    → mapeo de variables + reglas de componente
 */

const fs = require('fs');
const path = require('path');
const { resolveActiveThemes } = require('../generators/utils');

/**
 * Nombre del tema que se usa como "base genérica" para renderizar la
 * página. Si en algún momento se quiere cambiar, basta con modificar
 * esta constante (o exponerla en config.json).
 */
const BASE_THEME = 'black-yellow';

/**
 * Lista canónica de componentes mostrados en la página.
 */
/**
 * Lista canónica de componentes mostrados en la página.
 * El contenido (HTML por componente) vive en components.data.json
 * para que sea editable sin tocar este archivo.
 */
const COMPONENT_SECTIONS = require('./components.data.json');


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

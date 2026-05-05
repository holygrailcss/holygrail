// Transformador de temas
// Transforma el HTML del tema agregando sidebar, header y scripts de Lenis

const fs = require('fs');
const path = require('path');
const { generateTypographyHTML } = require('./typo-table-generator');
const { generateThemeBlockHTML } = require('./theme-vars-table-generator');
const { applyThemeTypographyOverrides } = require('../generators/utils');

// Estilos del sidebar + Lenis (solo para black-and-white-demo.html en dist)
const SIDEBAR_STYLES = `
    /* Lenis Smooth Scroll - Solo para demo Black&White */
    html.lenis {
      height: auto;
    }

    .lenis.lenis-smooth {
      scroll-behavior: auto;
    }

    .lenis.lenis-smooth[data-lenis-prevent] {
      overscroll-behavior: contain;
    }

    .lenis.lenis-stopped {
      overflow: hidden;
    }
`;

// Fallback de temas conocidos para la navegación de cada demo, usado
// cuando el llamador NO inyecta una lista dinámica (p. ej. tests o
// ejecuciones standalone del ThemeTransformer sin pasar por
// BuildOrchestrator). En modo build normal, esta lista se sustituye por
// los temas realmente activos en `config.themes[]`, de forma que
// nunca se genere un enlace `../themes/<x>-demo.html` a un fichero
// que no existe en `dist/themes/`.
// El orden aquí determina el orden en el que aparecen los enlaces.
// `name` es el slug del tema (coincide con la carpeta themes/<name>/ y
// con el fichero generado themes/<name>-demo.html). `label` es el
// texto visible en la nav principal.
const THEMES_IN_NAV = [
  { name: 'black-and-white', label: 'Tema Black&White' },
  { name: 'limited', label: 'Tema Limited' }
];

// Capitaliza un slug para usarlo como nombre legible en el sidebar
// (p. ej. 'black-and-white' → 'Black&White', 'limited' → 'Limited').
function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Construye el HTML del header + sidebar para una demo concreta.
 * El enlace del tema actual se marca con la clase `active` para que
 * el usuario vea en qué tema está. Los enlaces a otros temas apuntan
 * al fichero `../themes/<slug>-demo.html` correspondiente.
 *
 * @param {string} currentTheme - slug del tema activo (p. ej. 'black-and-white')
 * @param {Array<{name:string,label:string}>} [themesForNav] - Lista de
 *   temas a mostrar en la nav. Si se omite o viene vacía, se usa el
 *   fallback `THEMES_IN_NAV`. Inyectar esta lista desde el build evita
 *   que la demo enlace a temas que no se han generado en `dist/themes/`.
 * @returns {string} HTML listo para inyectar tras `<body>`.
 */
function buildHeaderAndSidebar(currentTheme, themesForNav = null) {
  const list = Array.isArray(themesForNav) && themesForNav.length > 0
    ? themesForNav
    : THEMES_IN_NAV;

  const themeLinks = list.map(t => {
    const cls = t.name === currentTheme ? ' class="active"' : '';
    return `        <a href="../themes/${t.name}-demo.html"${cls}>${t.label}</a>`;
  }).join('\n');

  const displayName = capitalize(currentTheme);

  return `
  <div class="guide-header">
    <a href="../index.html" class="guide-logo" style="text-decoration:none;">holygrailcss</a>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <nav class="guide-nav">
        <a href="../index.html">Guía</a>
        <a href="../componentes.html">Componentes</a>
${themeLinks}
        <a href="../skills.html">Skills</a>
      </nav>
      <button class="guide-header-button" onclick="toggleSidebar()">☰</button>
    </div>
  </div>

  <div class="guide-sidebar-overlay" onclick="toggleSidebar()"></div>

  <aside class="guide-sidebar">
    <div class="guide-sidebar-header">
      <div>holygrailcss</div>
      <p class="guide-sidebar-subtitle">Demo Tema ${displayName}</p>
    </div>

    <nav class="guide-sidebar-nav">
      <p class="guide-sidebar-title">Tema</p>

      <a href="#theme-vars" class="guide-menu-item">Variables del tema</a>

      <p class="guide-sidebar-title">Componentes</p>

      <a href="#typography" class="guide-menu-item">Tipografía</a>
      <a href="#buttons" class="guide-menu-item">Botones</a>
      <a href="#inputs" class="guide-menu-item">Inputs</a>
      <a href="#checkboxes" class="guide-menu-item">Checkboxes</a>
      <a href="#radios" class="guide-menu-item">Radios</a>
      <a href="#switches" class="guide-menu-item">Switches</a>
      <a href="#forms" class="guide-menu-item">Formularios</a>
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

    // Hacer funciones globales
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
  </script>
`;
}

// Script de Lenis para el head
const LENIS_HEAD_SCRIPT = `
  <!-- Lenis Smooth Scroll - Solo para demo Tema Black&White -->
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>`;

// Script de inicialización de Lenis
const LENIS_INIT_SCRIPT = `
  <script>
    // Inicializar Lenis Smooth Scroll - Solo para demo Tema Black&White
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Hacer Lenis global para que esté disponible en otros scripts
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    
    // Manejar clic en menú para scroll suave (después de que Lenis esté inicializado)
    // Usar setTimeout para asegurar que el DOM esté completamente cargado
    setTimeout(function() {
      const menuItems = document.querySelectorAll('.guide-menu-item[href^="#"]');
      
      menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const href = item.getAttribute('href');
          
          // Solo procesar enlaces internos (que empiezan con #)
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1); // Remover el #
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
              const offset = 80; // Offset para compensar header
              
              // Usar Lenis para scroll suave
              lenis.scrollTo(targetSection, { offset: -offset });
              
              // Cerrar sidebar después de hacer clic
              if (typeof closeSidebar === 'function') {
                closeSidebar();
              }
            }
          }
        });
      });
    }, 100);
  </script>`;

class ThemeTransformer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || path.join(__dirname, '..', '..');
  }

  /**
   * Transforma el HTML del tema agregando sidebar, header y scripts
   * @param {string} sourcePath - Ruta al archivo HTML fuente
   * @param {string} destPath - Ruta donde guardar el HTML transformado
   * @param {string} themeName - Nombre del tema (para personalización)
   * @param {boolean} silent - Si true, no muestra mensajes
   * @param {Object} [config] - Config cargado de config.json (para inyectar tablas dinámicas como tipografía)
   * @param {Object} [themeData] - theme.json parseado (para inyectar meta + tablas de variables del tema)
   * @param {Array<{name:string,label:string}>} [themesForNav] - Lista de
   *   temas activos a exponer en la nav del demo. Si se omite, se usa
   *   el fallback estático de theme-transformer (black-and-white + limited).
   * @returns {boolean} - true si se transformó exitosamente
   */
  transform(sourcePath, destPath, themeName = 'black-and-white', silent = false, config = null, themeData = null, themesForNav = null) {
    const fullSourcePath = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.join(this.projectRoot, sourcePath);
    
    const fullDestPath = path.isAbsolute(destPath)
      ? destPath
      : path.join(this.projectRoot, destPath);

    if (!fs.existsSync(fullSourcePath)) {
      if (!silent) {
        console.warn(`⚠️  No se encontró ${fullSourcePath}`);
      }
      return false;
    }

    try {
      // Leer el contenido
      let content = fs.readFileSync(fullSourcePath, 'utf8');

      // Inyectar bloques dinámicos derivados del config (p. ej. tabla de tipografía).
      // Si el HTML fuente no contiene el placeholder, se ignora silenciosamente.
      //
      // Para cada tema aplicamos los overrides de tipografía declarados
      // en `theme.json → typography.fontFamilyMap`. Así la tabla
      // muestra la fuente real del tema (Neutrif en Limited, por
      // ejemplo) en vez de la fuente base de config.json.
      if (config) {
        const typoConfig = applyThemeTypographyOverrides(config, themeData);
        const typoSection = generateTypographyHTML(typoConfig);
        content = content.replace(/<!--\s*HG_TYPO_TABLE\s*-->/g, typoSection);
      } else {
        // Sin config, eliminamos el placeholder para no mostrarlo en crudo
        content = content.replace(/<!--\s*HG_TYPO_TABLE\s*-->/g, '');
      }

      // Inyectar bloque del tema (meta + tablas de variables) si hay theme.json.
      // Si no lo hay, quitamos el placeholder para no dejar comentarios huérfanos.
      if (themeData) {
        const themeBlock = generateThemeBlockHTML(themeData, config);
        content = content.replace(/<!--\s*HG_THEME_BLOCK\s*-->/g, themeBlock);
      } else {
        content = content.replace(/<!--\s*HG_THEME_BLOCK\s*-->/g, '');
      }

      // Ajustar rutas CSS
      content = content.replace(/href="\.\.\/\.\.\/dist\/output\.css"/g, 'href="../output.css"');
      content = content.replace(/href="\.\.\/output\.css"/g, 'href="../output.css"');
      content = content.replace(/href="theme\.css"/g, `href="${themeName}.css"`);
      content = content.replace(new RegExp(`href="${themeName}\\.css"`, 'g'), `href="${themeName}.css"`);
      
      // Agregar link a guide-styles.css
      const guideStylesCSS = '<link rel="stylesheet" href="../guide-styles.css">';
      content = content.replace(
        new RegExp(`<link rel="stylesheet" href="${themeName}\\.css">`, 'g'),
        `<link rel="stylesheet" href="${themeName}.css">\n    ${guideStylesCSS}`
      );
      
      // Añadir estilos del sidebar antes del </style>
      content = content.replace('</style>', SIDEBAR_STYLES + '\n  </style>');

      // Añadir script de Lenis en el <head>
      content = content.replace('</head>', `${LENIS_HEAD_SCRIPT}\n</head>`);

      // Añadir inicialización de Lenis antes de </body>
      content = content.replace('</body>', `${LENIS_INIT_SCRIPT}\n</body>`);
      
      // Añadir header y sidebar después del <body>.
      // La nav principal se construye dinámicamente a partir del tema
      // activo, marcando su enlace con `active` y dejando los otros
      // temas accesibles como enlaces normales. Si el build ha pasado
      // la lista de temas activos, se respeta; si no, se cae al
      // fallback estático THEMES_IN_NAV (compatibilidad).
      const headerAndSidebarHTML = buildHeaderAndSidebar(themeName, themesForNav);
      content = content.replace(/(<body[^>]*>)/i, '$1\n' + headerAndSidebarHTML);

      // Eliminar el título h1 del contenido si existe (ya está en el header)
      content = content.replace(/<h1 class="demo-title">Sistema de Theming [^<]+<\/h1>\s*/g, '');
      
      // Envolver el contenido de demo-container con guide-container
      content = content.replace(
        /<div class="demo-container">([\s\S]*?)<\/div>\s*(?=<\/body>)/,
        '<div class="demo-container"><div class="guide-container">$1</div></div>'
      );
      
      // Asegurar que el directorio destino existe
      const destDir = path.dirname(fullDestPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Escribir archivo transformado
      fs.writeFileSync(fullDestPath, content, 'utf8');
      
      if (!silent) {
        console.log(`✅ Demo HTML transformado: ${path.relative(this.projectRoot, fullDestPath)}`);
      }
      
      return true;
    } catch (error) {
      if (!silent) {
        console.error('❌ Error al transformar demo HTML:', error.message);
      }
      return false;
    }
  }
}

module.exports = { ThemeTransformer };



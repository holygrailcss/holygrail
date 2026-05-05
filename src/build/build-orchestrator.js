// Orquestador centralizado de build
// Coordina la generación de CSS, HTML, copia de assets y transformación de temas

const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../config-loader');
const { generateCSS } = require('../css-generator');
const { generateHTML } = require('../docs-generator/html-generator');
const { writeFile, combineThemeCSS, resolveActiveThemes } = require('../generators/utils');
const { AssetManager } = require('./asset-manager');
const { ThemeTransformer } = require('./theme-transformer');
const { generateSkillsPage } = require('./skills-generator');
const { generateComponentsPage } = require('./components-generator');
const { loadThemeConfig } = require('./theme-config-loader');

class BuildOrchestrator {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || path.join(__dirname, '..', '..');
    this.configPath = options.configPath || path.join(this.projectRoot, 'config.json');
    this.outputPath = options.outputPath || path.join(this.projectRoot, 'dist', 'output.css');
    this.htmlPath = options.htmlPath || path.join(this.projectRoot, 'dist', 'index.html');
    this.silent = options.silent || false;
    this.watchMode = options.watchMode || false; // Indica si estamos en modo watch
    
    // Cargar config para obtener assets si están definidos
    let assetsConfig = null;
    try {
      const configData = loadConfig(this.configPath);
      if (configData.assets) {
        assetsConfig = configData.assets;
      }
    } catch (error) {
      // Si no se puede cargar config, usar configuración por defecto
    }
    
    this.assetManager = new AssetManager(this.projectRoot, assetsConfig);
    this.themeTransformer = new ThemeTransformer(this.projectRoot);
  }

  /**
   * Si la config se cargó desde la carpeta `config/` (modular), regenera
   * `config.json` en raíz como espejo plano. Esto permite que los
   * consumidores externos sigan copiándolo y editándolo igual que antes,
   * mientras los humanos/AI editan los archivos modulares.
   *
   * Idempotente: si el contenido no cambió, no toca el archivo.
   */
  syncMonolithicConfig(configData) {
    const splitDir = path.join(this.projectRoot, 'config');
    if (!fs.existsSync(splitDir) || !fs.statSync(splitDir).isDirectory()) {
      return; // No hay carpeta modular, nada que sincronizar
    }
    const monolithicPath = path.join(this.projectRoot, 'config.json');
    const newContent = JSON.stringify(configData, null, 2) + '\n';
    if (fs.existsSync(monolithicPath)) {
      const current = fs.readFileSync(monolithicPath, 'utf-8');
      if (current === newContent) return;
    }
    fs.writeFileSync(monolithicPath, newContent, 'utf-8');
    if (!this.silent) {
      console.log('✅ config.json sincronizado desde config/ (espejo para npm consumers)');
    }
  }

  /**
   * Ajusta las rutas del CSS en el HTML según la ubicación relativa
   * @param {string} htmlContent - Contenido HTML
   * @param {boolean} addTimestamp - Si true, agrega timestamp para cache busting (modo watch)
   * @returns {string} - HTML con rutas ajustadas
   */
  adjustHTMLPaths(htmlContent, addTimestamp = false) {
    const outputDir = path.dirname(this.outputPath);
    const htmlDir = path.dirname(this.htmlPath);
    
    const timestamp = addTimestamp ? `?v=${Date.now()}` : '';
    
    // Si el HTML y CSS están en carpetas diferentes, ajustar la ruta del CSS
    if (outputDir !== htmlDir) {
      // Calcular ruta relativa del HTML al CSS
      const relativePath = path.relative(htmlDir, outputDir);
      const cssFileName = path.basename(this.outputPath);
      const cssRelativePath = path.join(relativePath, cssFileName).replace(/\\/g, '/');
      // Reemplazar href con o sin query string
      htmlContent = htmlContent.replace(/href="output\.css[^"]*"/, `href="${cssRelativePath}${timestamp}"`);
    } else {
      // Si están en la misma carpeta, usar solo el nombre del archivo
      htmlContent = htmlContent.replace(/href="output\.css[^"]*"/, `href="output.css${timestamp}"`);
    }
    
    return htmlContent;
  }

  /**
   * Genera el CSS combinado del tema
   * @param {Object} themeConfig - Configuración del tema
   * @returns {boolean} - true si se generó exitosamente
   */
  buildThemeCSS(themeConfig) {
    if (!themeConfig || !themeConfig.enabled || !themeConfig.name) {
      return false;
    }

    const themeName = themeConfig.name;
    const themeSourceDir = path.join(this.projectRoot, 'themes', themeName);
    const outputDir = path.dirname(this.outputPath);
    const themeOutputDir = path.join(outputDir, 'themes');
    const themeOutputPath = path.join(themeOutputDir, `${themeName}.css`);
    
    if (!require('fs').existsSync(themeSourceDir)) {
      if (!this.silent) {
        console.warn(`⚠️  El tema '${themeName}' no existe en ${themeSourceDir}`);
      }
      return false;
    }
    
    try {
      // Asegurar que el directorio de temas existe
      if (!require('fs').existsSync(themeOutputDir)) {
        require('fs').mkdirSync(themeOutputDir, { recursive: true });
      }
      
      // Generar CSS combinado del tema
      const combinedCSS = combineThemeCSS(themeSourceDir);
      writeFile(themeOutputPath, combinedCSS, `Tema '${themeName}' combinado`);
      
      return true;
    } catch (error) {
      if (!this.silent) {
        console.warn(`⚠️  No se pudo generar el tema '${themeName}':`, error.message);
      }
      return false;
    }
  }

  /**
   * Transforma el HTML del tema agregando sidebar y scripts
   * @param {Object} themeConfig - Configuración del tema en config.json (name + enabled)
   * @param {Object} [fullConfig] - Config completo, para inyectar tablas dinámicas (typo, etc.)
   * @param {Array<{name:string,label:string}>} [themesForNav] - Lista de
   *   temas activos a exponer en la nav. Si se omite, el ThemeTransformer
   *   cae al fallback estático.
   * @returns {boolean} - true si se transformó exitosamente
   */
  buildThemeHTML(themeConfig, fullConfig = null, themesForNav = null) {
    if (!themeConfig || !themeConfig.enabled || !themeConfig.name) {
      return false;
    }

    const themeName = themeConfig.name;
    const sourceFile = path.join(this.projectRoot, 'themes', themeName, 'demo.html');
    const outputDir = path.dirname(this.outputPath);
    const targetFile = path.join(outputDir, 'themes', `${themeName}-demo.html`);

    // Cargar el theme.json del tema activo (opcional). Pasarlo al transformer
    // permite a la demo mostrar metadatos y tablas de variables del tema.
    const themeData = loadThemeConfig(this.projectRoot, themeName, this.silent);

    return this.themeTransformer.transform(
      sourceFile,
      targetFile,
      themeName,
      this.silent,
      fullConfig,
      themeData,
      themesForNav
    );
  }

  /**
   * Ejecuta el proceso completo de build
   * @returns {Object} - Resultado del build con estadísticas
   */
  build() {
    const result = {
      success: false,
      css: false,
      html: false,
      assets: { css: 0, images: 0 },
      theme: { css: false, html: false }
    };

    try {
      // 1. Cargar configuración (modular desde config/ o legacy desde config.json)
      const configData = loadConfig(this.configPath);

      // 1b. Si la fuente fue config/ (modo modular), regenerar config.json
      //     en raíz como espejo plano para los consumidores npm que copian
      //     ese archivo y lo editan en sus proyectos.
      this.syncMonolithicConfig(configData);

      // 2. Generar CSS
      const cssContent = generateCSS(configData);
      writeFile(this.outputPath, cssContent, 'CSS');
      result.css = true;
      
      // 3. Generar HTML
      let htmlContent = generateHTML(configData);
      // En modo watch, agregar timestamp para cache busting
      htmlContent = this.adjustHTMLPaths(htmlContent, this.watchMode);
      writeFile(this.htmlPath, htmlContent, 'HTML');
      result.html = true;
      
      // 4. Copiar assets (CSS e imágenes)
      const assetsResult = this.assetManager.copyAssets('all', this.silent);
      result.assets = assetsResult;
      
      // 5. Generar tema(s) si están habilitados.
      // La resolución de temas activos (soporte de `config.themes[]` +
      // fallback a `config.theme` singular) está centralizada en
      // `resolveActiveThemes` para que todos los generadores (HTML de
      // guía, nav de demos, skills.html, watch-config) usen la misma
      // lista. Devuelve entradas con `{ name, enabled:true, label }`.
      const activeThemes = resolveActiveThemes(configData);

      // La lista para la nav sólo necesita `name` + `label`; el flag
      // `enabled` ya fue filtrado por el helper.
      const themesForNav = activeThemes.map(t => ({ name: t.name, label: t.label }));

      // Para iterar el build, necesitamos las entradas originales del
      // config (pueden incluir flags adicionales específicos de un
      // tema). Igual que antes, seguimos soportando la forma antigua.
      const themeList = Array.isArray(configData.themes)
        ? configData.themes
        : (configData.theme ? [configData.theme] : []);

      // Resultado agregado: true si AL MENOS un tema se generó correctamente.
      // Se expone además `themes` con el detalle por tema.
      result.theme = { css: false, html: false };
      result.themes = [];

      for (const themeConfig of themeList) {
        const cssOk = this.buildThemeCSS(themeConfig);
        const htmlOk = this.buildThemeHTML(themeConfig, configData, themesForNav);
        result.themes.push({
          name: themeConfig && themeConfig.name,
          css: cssOk,
          html: htmlOk
        });
        if (cssOk) result.theme.css = true;
        if (htmlOk) result.theme.html = true;
      }

      // 6. Generar página de skills si existe la carpeta skills/.
      // Pasamos el config para que la nav de skills.html enlace sólo a
      // demos de temas realmente activos (black-yellow+limited por defecto,
      // pero un consumidor puede tener sólo uno).
      try {
        const skillsHtml = generateSkillsPage(this.projectRoot, configData);
        if (skillsHtml) {
          const distDir = path.dirname(this.outputPath);
          const skillsPath = path.join(distDir, 'skills.html');
          writeFile(skillsPath, skillsHtml, 'Skills');
          // Copiar SKILL.md a dist para descarga
          const mdSrc = path.join(this.projectRoot, 'skills', 'developer-guide', 'SKILL.md');
          const mdDest = path.join(distDir, 'developer-guide.md');
          if (require('fs').existsSync(mdSrc)) {
            require('fs').copyFileSync(mdSrc, mdDest);
          }
          result.skills = true;
        }
      } catch (err) {
        if (!this.silent) console.warn('⚠️  No se pudo generar skills.html:', err.message);
      }

      // 7. Generar página de componentes base si existe themes/_base/.
      // Se renderiza con el tema Black&Yellow como base genérica (ver
      // components-generator.js → BASE_THEME). La nav recibe la lista
      // de temas activos para enlazar a sus demos.
      try {
        const componentsHtml = generateComponentsPage(this.projectRoot, configData);
        if (componentsHtml) {
          const distDir = path.dirname(this.outputPath);
          const componentsPath = path.join(distDir, 'componentes.html');
          writeFile(componentsPath, componentsHtml, 'Componentes');
          result.components = true;
        }
      } catch (err) {
        if (!this.silent) console.warn('⚠️  No se pudo generar componentes.html:', err.message);
      }

      result.success = true;
      
      if (!this.silent) {
        console.log('\n🎉 Generación completada exitosamente!');
      }
      
      return result;
    } catch (error) {
      if (!this.silent) {
        console.error('❌ Error:', error.message);
      }
      throw error;
    }
  }
}

module.exports = { BuildOrchestrator };


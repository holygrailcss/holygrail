// Gestor centralizado de assets
// Maneja la copia de archivos CSS, imágenes y otros recursos a dist/

const fs = require('fs');
const path = require('path');

// Configuración de assets a copiar
const ASSETS_CONFIG = {
  css: [
    {
      source: 'src/docs-generator/guide-styles.css',
      dest: 'dist/guide-styles.css'
    }
  ],
  images: [
    {
      source: 'src/assets/intro.jpg',
      dest: 'dist/assets/intro.jpg'
    },
    {
      source: 'src/assets/introm.jpg',
      dest: 'dist/assets/introm.jpg'
    },
    {
      source: 'src/assets/margen.webp',
      dest: 'dist/assets/margen.webp'
    }
  ],
  fonts: [
    {
      source: 'src/assets/fonts/neutrif-light.woff2',
      dest: 'dist/assets/fonts/neutrif-light.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-light.woff',
      dest: 'dist/assets/fonts/neutrif-light.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-regular.woff2',
      dest: 'dist/assets/fonts/neutrif-regular.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-regular.woff',
      dest: 'dist/assets/fonts/neutrif-regular.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-medium.woff2',
      dest: 'dist/assets/fonts/neutrif-medium.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-medium.woff',
      dest: 'dist/assets/fonts/neutrif-medium.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-semibold.woff2',
      dest: 'dist/assets/fonts/neutrif-semibold.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-semibold.woff',
      dest: 'dist/assets/fonts/neutrif-semibold.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-regular.woff2',
      dest: 'dist/assets/fonts/neutrif-regular.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-regular.woff',
      dest: 'dist/assets/fonts/neutrif-regular.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-medium.woff2',
      dest: 'dist/assets/fonts/neutrif-medium.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-medium.woff',
      dest: 'dist/assets/fonts/neutrif-medium.woff'
    },
    {
      source: 'src/assets/fonts/neutrif-bold.woff2',
      dest: 'dist/assets/fonts/neutrif-bold.woff2'
    },
    {
      source: 'src/assets/fonts/neutrif-bold.woff',
      dest: 'dist/assets/fonts/neutrif-bold.woff'
    }
  ]
};

class AssetManager {
  constructor(projectRoot, assetsConfig = null) {
    this.projectRoot = projectRoot || path.join(__dirname, '..', '..');
    // Usar config pasada o fallback a ASSETS_CONFIG por defecto
    this.assetsConfig = assetsConfig || ASSETS_CONFIG;
  }

  /**
   * Copia un archivo desde source a dest
   * @param {string} source - Ruta relativa al proyecto o absoluta
   * @param {string} dest - Ruta relativa al proyecto o absoluta
   * @param {boolean} silent - Si true, no muestra mensajes
   * @returns {boolean} - true si se copió exitosamente
   */
  copyFile(source, dest, silent = false) {
    const sourcePath = path.isAbsolute(source) 
      ? source 
      : path.join(this.projectRoot, source);
    const destPath = path.isAbsolute(dest) 
      ? dest 
      : path.join(this.projectRoot, dest);

    if (!fs.existsSync(sourcePath)) {
      if (!silent) {
        console.warn(`⚠️  Archivo no encontrado: ${sourcePath}`);
      }
      return false;
    }

    try {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      if (!silent) {
        const fileName = path.basename(sourcePath);
        console.log(`✅ ${fileName} copiado a ${path.relative(this.projectRoot, destPath)}`);
      }
      return true;
    } catch (error) {
      if (!silent) {
        console.error(`❌ Error al copiar ${path.basename(sourcePath)}:`, error.message);
      }
      return false;
    }
  }

  /**
   * Copia todos los archivos CSS configurados
   * @param {boolean} silent - Si true, no muestra mensajes
   * @returns {number} - Número de archivos copiados exitosamente
   */
  copyCSS(silent = false) {
    let count = 0;
    this.assetsConfig.css.forEach(({ source, dest }) => {
      if (this.copyFile(source, dest, silent)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Copia todas las imágenes configuradas
   * @param {boolean} silent - Si true, no muestra mensajes
   * @returns {number} - Número de archivos copiados exitosamente
   */
  copyImages(silent = false) {
    let count = 0;
    this.assetsConfig.images.forEach(({ source, dest }) => {
      if (this.copyFile(source, dest, silent)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Copia todas las fuentes configuradas
   * @param {boolean} silent - Si true, no muestra mensajes
   * @returns {number} - Número de archivos copiados exitosamente
   */
  copyFonts(silent = false) {
    let count = 0;
    const fonts = this.assetsConfig.fonts || [];
    fonts.forEach(({ source, dest }) => {
      if (this.copyFile(source, dest, silent)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Copia todos los assets (CSS, imágenes y fuentes)
   * @param {string|Array} types - 'all', 'css', 'images', 'fonts', o array de tipos
   * @param {boolean} silent - Si true, no muestra mensajes
   * @returns {Object} - Objeto con conteo de archivos copiados por tipo
   */
  copyAssets(types = 'all', silent = false) {
    const result = {
      css: 0,
      images: 0,
      fonts: 0
    };

    if (types === 'all' || (Array.isArray(types) && types.includes('css')) || types === 'css') {
      result.css = this.copyCSS(silent);
    }

    if (types === 'all' || (Array.isArray(types) && types.includes('images')) || types === 'images') {
      result.images = this.copyImages(silent);
    }

    if (types === 'all' || (Array.isArray(types) && types.includes('fonts')) || types === 'fonts') {
      result.fonts = this.copyFonts(silent);
    }

    return result;
  }

  /**
   * Agrega un archivo CSS a la configuración
   * @param {string} source - Ruta relativa al proyecto
   * @param {string} dest - Ruta relativa al proyecto
   */
  addCSSAsset(source, dest) {
    this.assetsConfig.css.push({ source, dest });
  }

  /**
   * Agrega una imagen a la configuración
   * @param {string} source - Ruta relativa al proyecto
   * @param {string} dest - Ruta relativa al proyecto
   */
  addImageAsset(source, dest) {
    this.assetsConfig.images.push({ source, dest });
  }

  /**
   * Agrega una fuente a la configuración
   * @param {string} source - Ruta relativa al proyecto
   * @param {string} dest - Ruta relativa al proyecto
   */
  addFontAsset(source, dest) {
    if (!this.assetsConfig.fonts) {
      this.assetsConfig.fonts = [];
    }
    this.assetsConfig.fonts.push({ source, dest });
  }
}

module.exports = { AssetManager, ASSETS_CONFIG };


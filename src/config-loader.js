/**
 * Config loader.
 *
 * Acepta dos formatos:
 *   1. Carpeta `config/` con un JSON por sección (config/colors.json,
 *      config/typography.json, config/spacing.json, config/grid.json, etc.).
 *      Los merges se hacen al primer nivel: cada archivo aporta una o varias
 *      claves al objeto config final.
 *   2. Archivo único `config.json` con todas las secciones (legacy / formato
 *      público que copian los consumidores npm).
 *
 * Si recibe una RUTA explícita (`--config=...`), lee ese archivo o carpeta.
 * Si NO recibe ruta, intenta `<root>/config/` primero y cae a `<root>/config.json`.
 */

const fs = require('fs');
const path = require('path');

const BREAKPOINTS = ['mobile', 'desktop'];

/**
 * Lee y mergea todos los archivos *.json de una carpeta.
 * El merge es shallow (primer nivel). Cada archivo debe definir claves
 * distintas; si dos archivos definen la misma clave, gana el último.
 */
function loadConfigDirectory(dirPath) {
  const merged = {};
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .sort();
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    Object.assign(merged, data);
  }
  return merged;
}

/**
 * Resuelve la fuente de configuración: si configPath apunta a un archivo,
 * lo lee. Si apunta a una carpeta o si está en `<root>/config/`, mergea.
 */
function resolveConfigSource(configPath) {
  // 1. Si configPath fue pasado y es una carpeta → modo split
  if (configPath && fs.existsSync(configPath) && fs.statSync(configPath).isDirectory()) {
    return loadConfigDirectory(configPath);
  }

  // 2. Si configPath fue pasado y existe como archivo → leer ese archivo
  if (configPath && fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  // 3. Si NO se pasó configPath, autodetectar:
  //    a) primero <root>/config/ (modo nuevo modular)
  //    b) luego <root>/config.json (modo legacy)
  const projectRoot = path.join(__dirname, '..');
  const splitDir = path.join(projectRoot, 'config');
  if (fs.existsSync(splitDir) && fs.statSync(splitDir).isDirectory()) {
    return loadConfigDirectory(splitDir);
  }

  const legacyFile = path.join(projectRoot, 'config.json');
  if (fs.existsSync(legacyFile)) {
    return JSON.parse(fs.readFileSync(legacyFile, 'utf-8'));
  }

  throw new Error(`No se encontró ninguna configuración. Probé: ${configPath}, ${splitDir}, ${legacyFile}`);
}

function validateConfig(config) {
  if (!config.typo || typeof config.typo !== 'object') {
    throw new Error('La configuración debe tener un objeto "typo"');
  }
  if (!config.breakpoints || typeof config.breakpoints !== 'object') {
    throw new Error('La configuración debe tener un objeto "breakpoints"');
  }
  if (!config.breakpoints.mobile || !config.breakpoints.desktop) {
    throw new Error('Los breakpoints deben tener propiedades "mobile" y "desktop"');
  }

  Object.entries(config.typo).forEach(([className, cls]) => {
    if (!cls || typeof cls !== 'object') {
      throw new Error(`La clase "${className}" debe ser un objeto`);
    }
    if (!cls.mobile && !cls.desktop) {
      throw new Error(`La clase "${className}" debe tener al menos un breakpoint (mobile o desktop)`);
    }
    BREAKPOINTS.forEach(bp => {
      if (cls[bp] && (!cls[bp].fontSize && !cls[bp].lineHeight)) {
        console.warn(`Advertencia: La clase "${className}" tiene breakpoint "${bp}" sin fontSize ni lineHeight`);
      }
    });
  });
}

function loadConfig(configPath) {
  try {
    const config = resolveConfigSource(configPath);
    validateConfig(config);
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Error al parsear JSON: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  loadConfig,
  loadConfigDirectory,
  BREAKPOINTS
};

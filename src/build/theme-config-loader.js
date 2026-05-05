// Loader del JSON de configuración de tema
// Cada tema vive en themes/<nombre>/ y puede tener un theme.json con:
//   - meta              → nombre, descripción, versión, autor (para la demo)
//   - tokenOverrides    → overrides de tokens holygrailcss por tema (color/spacing)
//   - componentVars     → variables CSS de componentes (--btn-*, --input-*, etc.)
//   - design            → tokens de diseño del tema (border-radius, transition…)
//
// El archivo es OPCIONAL. Si no existe, devolvemos null y el resto del build
// sigue funcionando exactamente como antes — la única consecuencia es que la
// demo no mostrará la cabecera de meta ni las tablas de variables del tema.

const fs = require('fs');
const path = require('path');

/**
 * Devuelve la ruta absoluta esperada del theme.json para un tema dado.
 */
function getThemeConfigPath(projectRoot, themeName) {
  return path.join(projectRoot, 'themes', themeName, 'theme.json');
}

/**
 * Carga themes/<themeName>/theme.json si existe. Si no existe o el JSON es
 * inválido, devuelve null (con un warning si silent === false). Nunca lanza:
 * el config de tema es opcional y no debe romper el build.
 */
function loadThemeConfig(projectRoot, themeName, silent = false) {
  if (!themeName) return null;

  const themeConfigPath = getThemeConfigPath(projectRoot, themeName);
  if (!fs.existsSync(themeConfigPath)) return null;

  try {
    const raw = fs.readFileSync(themeConfigPath, 'utf8');
    const parsed = JSON.parse(raw);

    // Normalizamos para que el resto del código asuma que las claves existen
    parsed.meta = parsed.meta || {};
    parsed.tokenOverrides = parsed.tokenOverrides || {};
    parsed.componentVars = parsed.componentVars || {};
    parsed.design = parsed.design || {};

    // Si el JSON no trae nombre, usamos el del directorio
    if (!parsed.meta.name) parsed.meta.name = themeName;

    if (!silent) {
      console.log(`✅ theme.json cargado: themes/${themeName}/theme.json`);
    }
    return parsed;
  } catch (error) {
    if (!silent) {
      console.warn(`⚠️  No se pudo cargar themes/${themeName}/theme.json:`, error.message);
    }
    return null;
  }
}

module.exports = { loadThemeConfig, getThemeConfigPath };

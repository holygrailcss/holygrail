// Utilidades compartidas
// Funciones auxiliares utilizadas por el parseador y el generador de guía

const fs = require('fs');
const path = require('path');

// Convierte nombres de propiedades de JavaScript (camelCase) a formato CSS (kebab-case)
// Por ejemplo, "fontSize" se convierte en "font-size" para usarlo en CSS
function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Convierte valores en píxeles a unidades rem para hacer el CSS responsive

function pxToRem(value, baseFontSize = 16) {
  if (typeof value === 'string' && value.endsWith('px')) {
    const pxValue = parseFloat(value);
    const remValue = pxValue / baseFontSize;
    return `${parseFloat(remValue.toFixed(4))}rem`;
  }
  return value;
}

// Convierte valores rem de vuelta a píxeles para mostrarlos en la guía HTML
// Esto ayuda a los desarrolladores a entender mejor los valores, ya que
// muchos están más familiarizados con píxeles que con rem
function remToPx(remValue, baseFontSize = 16) {
  const remMatch = remValue.toString().match(/^([\d.]+)rem$/);
  return remMatch ? `${parseFloat(remMatch[1]) * baseFontSize}px` : '-';
}

// Busca el nombre de una fuente en el mapa de fuentes configurado
// Si la fuente está en el mapa (como "primary" o "secondary"), devuelve ese nombre
// Si no está, genera un nombre automático desde el valor de la fuente
// Esto se usa para crear variables CSS compartidas con nombres consistentes
function getFontFamilyName(fontFamilyValue, fontFamilyMap) {
  // Primero busca en el mapa de fuentes si existe
  if (fontFamilyMap) {
    for (const [name, value] of Object.entries(fontFamilyMap)) {
      if (value === fontFamilyValue) return name;
    }
  }
  // Si no está en el mapa, genera un nombre automático limpiando el valor
  // Elimina comillas, espacios y toma solo el primer nombre de la lista de fuentes
  return fontFamilyValue.replace(/["']/g, '').replace(/\s+/g, '-').toLowerCase().split(',')[0].trim();
}

// Escribe un archivo en el sistema de archivos con validación y mensajes de confirmación
// Crea el directorio si no existe y verifica que el archivo se escribió correctamente
function writeFile(filePath, content, description) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Forzar escritura del archivo para asegurar que se actualice
    fs.writeFileSync(filePath, content, 'utf8');
    // Verificar que el archivo se escribió correctamente
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description} generado exitosamente en ${filePath} (${stats.size} bytes)`);
  } catch (error) {
    console.error(`❌ Error al escribir ${description} en ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Combina todos los archivos CSS de un tema en un solo archivo
// Lee el theme.css principal y resuelve todos los @import
function combineThemeCSS(themeDir) {
  try {
    const themeCSSPath = path.join(themeDir, 'theme.css');
    
    if (!fs.existsSync(themeCSSPath)) {
      throw new Error(`No se encontró theme.css en ${themeDir}`);
    }

    let combinedCSS = '';
    const themeContent = fs.readFileSync(themeCSSPath, 'utf8');
    
    // Procesar cada línea del theme.css
    const lines = themeContent.split('\n');
    
    for (const line of lines) {
      // Buscar @import
      const importMatch = line.match(/@import\s+url\(['"]?([^'"]+)['"]?\)/);
      
      if (importMatch) {
        // Resolver la ruta del archivo importado
        const importPath = importMatch[1];
        const importedFilePath = path.join(themeDir, importPath);
        
        if (fs.existsSync(importedFilePath)) {
          // Leer el contenido del archivo importado
          const importedContent = fs.readFileSync(importedFilePath, 'utf8');
          // Añadir comentario con el nombre del archivo
          combinedCSS += `\n/* === ${path.basename(importPath)} === */\n`;
          combinedCSS += importedContent;
          combinedCSS += '\n';
        } else {
          console.warn(`⚠️  Archivo importado no encontrado: ${importedFilePath}`);
        }
      } else if (line.trim() && !line.trim().startsWith('/*') && !line.trim().startsWith('*')) {
        // Si no es un @import ni un comentario, añadirlo tal cual (por si hay otros estilos)
        combinedCSS += line + '\n';
      }
    }
    
    return combinedCSS.trim();
  } catch (error) {
    console.error(`❌ Error al combinar CSS del tema:`, error.message);
    throw error;
  }
}

/**
 * Devuelve la lista canónica de temas activos a partir de un config.
 *
 * Soporta dos formatos de configuración:
 *   - Nuevo:  { themes: [{ name, enabled }, ...] }
 *   - Antiguo: { theme:  { name, enabled } }
 *
 * Cuando hay ambos, `themes[]` tiene prioridad. Los consumidores que
 * heredan configs antiguos siguen funcionando sin cambios. El objeto
 * devuelto por cada tema se enriquece con `label` (capitalización del
 * slug) para que los generadores de nav no tengan que recalcularlo.
 *
 * @param {Object} configData - Config ya cargado (objeto JS).
 * @returns {Array<{name:string, enabled:boolean, label:string}>}
 */
function resolveActiveThemes(configData) {
  if (!configData) return [];

  const rawList = Array.isArray(configData.themes)
    ? configData.themes
    : (configData.theme ? [configData.theme] : []);

  return rawList
    .filter(t => t && t.enabled && t.name)
    .map(t => ({
      name: t.name,
      enabled: true,
      label: 'Tema ' + t.name.charAt(0).toUpperCase() + t.name.slice(1)
    }));
}

/**
 * Aplica los overrides de tipografía de un tema sobre el config base.
 *
 * Motivación: la tabla de tipografía lee `config.typo.*.fontFamily`
 * (strings CSS crudos). Cuando un tema redefine las variables
 * `--hg-typo-font-family-*` en su `_variables.css`, el Preview se
 * renderiza con la fuente del tema (porque las variables ganan), pero
 * las columnas "Font family" seguirían mostrando las de la base. Para
 * que la tabla refleje lo que realmente se pinta, mapeamos cada
 * `fontFamily` del typo a través de su alias en la fontFamilyMap base
 * y lo sustituimos por el override del tema.
 *
 * Convención: el tema declara sus overrides en
 *   theme.json → typography.fontFamilyMap
 * con las MISMAS claves que la base (`primary-light`, `primary-regular`,
 * `primary-bold`, `secondary`, …). Así seguimos teniendo una única
 * fuente de verdad para la tabla y evitamos duplicar la lista de clases
 * (`title-xxl`, `title-l`, …) en cada tema.
 *
 * Devuelve un NUEVO objeto (no muta el config original). Si no hay
 * overrides, devuelve el config tal cual.
 *
 * @param {Object} config   - Config base (config.json parseado).
 * @param {Object} themeData - theme.json parseado (puede ser null).
 * @returns {Object} Config con `fontFamilyMap` y `typo.*.fontFamily` remapeados.
 */
function applyThemeTypographyOverrides(config, themeData) {
  if (!config) return config;
  const overrides =
    themeData &&
    themeData.typography &&
    themeData.typography.fontFamilyMap;
  if (!overrides || Object.keys(overrides).length === 0) return config;

  const baseMap = config.fontFamilyMap || {};
  const mergedMap = { ...baseMap, ...overrides };

  const remappedTypo = {};
  Object.entries(config.typo || {}).forEach(([className, cls]) => {
    const alias = getFontFamilyName(cls.fontFamily, baseMap);
    // `alias` será una clave conocida (primary-regular, …) cuando el
    // fontFamily del typo coincida con un valor de la base. Si coincide
    // y el tema la sobreescribe, sustituimos el fontFamily por el del
    // tema. Si no, dejamos el string original (no hay nada que remapear).
    const overriddenFamily =
      overrides[alias] !== undefined ? overrides[alias] : cls.fontFamily;
    remappedTypo[className] = { ...cls, fontFamily: overriddenFamily };
  });

  return {
    ...config,
    fontFamilyMap: mergedMap,
    typo: remappedTypo
  };
}

module.exports = {
  toKebabCase,
  pxToRem,
  remToPx,
  getFontFamilyName,
  writeFile,
  combineThemeCSS,
  resolveActiveThemes,
  applyThemeTypographyOverrides
};


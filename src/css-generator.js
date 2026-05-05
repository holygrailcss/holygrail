// Generador CSS Principal (Orquestador)
// Combina todos los generadores especializados para crear el CSS completo

const { generateResetCSS } = require('./generators/reset-generator');
const { 
  generateSpacingVariables, 
  generateColorVariables, 
  generateRootVariables 
} = require('./generators/variables-generator');
const { 
  buildValueMap, 
  generateTypographyBlock 
} = require('./generators/typo-generator');
const { generateSpacingHelpers } = require('./generators/spacing-generator');
const { generateLayoutHelpers } = require('./generators/helpers-generator');
const { generateGridSystem } = require('./generators/grid-generator');
const { generateAspectRatios } = require('./generators/ratio-generator');

/**
 * Función principal que genera todo el CSS desde la configuración JSON
 * Organiza el CSS en bloques separados: reset, variables, tipografías mobile y desktop
 * 
 * @param {Object} configData - Configuración completa del proyecto
 * @returns {string} CSS completo generado
 */
function generateCSS(configData) {
  const prefix = configData.prefix || 'hg';
  const category = configData.category || 'typo';
  const baseFontSize = configData.baseFontSize || 16;
  
  // 1. Construye el mapa de variables de tipografía compartidas
  const { 
    valueMap, 
    fontFamilyVars, 
    lineHeightVars, 
    fontWeightVars, 
    letterSpacingVars, 
    textTransformVars, 
    fontSizeVars 
  } = buildValueMap(configData.typo, configData.fontFamilyMap, prefix, category);
  
  // 2. Genera variables de spacing y colores
  const spacingVars = generateSpacingVariables(configData.spacingMap, prefix, baseFontSize);
  const colorVars = generateColorVariables(configData.colors, prefix);
  
  // 3. Genera cada bloque del CSS
  const resetCSS = generateResetCSS(baseFontSize);
  const rootVars = generateRootVariables(
    fontFamilyVars, 
    lineHeightVars, 
    fontWeightVars, 
    letterSpacingVars, 
    textTransformVars, 
    fontSizeVars, 
    spacingVars, 
    colorVars, 
    configData.fontFamilyMap || null, 
    prefix, 
    category
  );
  
  // 4. Genera helpers de spacing (padding/margin)
  const spacingHelpers = generateSpacingHelpers(
    configData.spacingMap, 
    prefix, 
    configData.breakpoints.desktop, 
    baseFontSize, 
    configData.spacingImportant
  );
  
  // 5. Genera helpers de layout (display, flexbox, etc.)
  const layoutHelpers = configData.helpers 
    ? generateLayoutHelpers(
        configData.helpers, 
        configData.spacingMap, 
        prefix, 
        configData.breakpoints.desktop, 
        baseFontSize
      ) 
    : '';
  
  // 6. Genera sistema de grid
  const gridSystem = configData.grid 
    ? generateGridSystem(configData.grid, baseFontSize) 
    : '';
  
  // 7. Genera aspect ratios
  const aspectRatios = configData.aspectRatios 
    ? generateAspectRatios(configData.aspectRatios, prefix) 
    : '';
  
  // 8. Genera bloques de tipografías para mobile y desktop
  const mobileTypography = generateTypographyBlock(
    'mobile', 
    configData.breakpoints.mobile, 
    configData.typo, 
    valueMap, 
    prefix, 
    category, 
    baseFontSize, 
    configData.fontFamilyMap
  );
  
  const desktopTypography = generateTypographyBlock(
    'desktop', 
    configData.breakpoints.desktop, 
    configData.typo, 
    valueMap, 
    prefix, 
    category, 
    baseFontSize, 
    configData.fontFamilyMap
  );
  
  // 9. Combina todos los bloques en el orden correcto
  return `${resetCSS}/* Variables CSS Compartidas */
:root {
${rootVars}
}

${spacingHelpers}${layoutHelpers}${gridSystem}${aspectRatios}${mobileTypography}

${desktopTypography}`;
}

// Exportar funciones principales
module.exports = {
  generateCSS,
  buildValueMap,
  generateSpacingVariables,
  generateColorVariables
};

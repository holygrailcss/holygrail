// Generador de Variables CSS
// Maneja la creación de variables CSS para :root y variables históricas

const fs = require('fs');
const path = require('path');
const { pxToRem } = require('./utils');

/**
 * Carga las variables CSS históricas guardadas previamente
 * Esto asegura que las variables nunca se eliminen aunque se borren las clases que las usaban
 */
function loadHistoricalVariables(historicalVarsPath) {
  try {
    if (fs.existsSync(historicalVarsPath)) {
      const content = fs.readFileSync(historicalVarsPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Si no existe o hay error, devuelve objeto vacío
  }
  return {
    fontFamilyVars: {},
    lineHeightVars: {},
    fontWeightVars: {},
    letterSpacingVars: {},
    textTransformVars: {},
    fontSizeVars: {}
  };
}

/**
 * Guarda las variables CSS actuales para mantenerlas en el futuro
 * Esto asegura que las variables nunca se eliminen aunque se borren las clases
 */
function saveHistoricalVariables(variables, historicalVarsPath) {
  try {
    const dir = path.dirname(historicalVarsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Convertir Maps a objetos para guardar en JSON
    const varsToSave = {
      fontFamilyVars: {},
      lineHeightVars: {},
      fontWeightVars: {},
      letterSpacingVars: {},
      textTransformVars: {},
      fontSizeVars: {}
    };
    
    // Convertir cada Map a objeto
    variables.fontFamilyVars.forEach((value, key) => {
      varsToSave.fontFamilyVars[key] = value;
    });
    variables.lineHeightVars.forEach((value, key) => {
      varsToSave.lineHeightVars[key] = value;
    });
    variables.fontWeightVars.forEach((value, key) => {
      varsToSave.fontWeightVars[key] = value;
    });
    variables.letterSpacingVars.forEach((value, key) => {
      varsToSave.letterSpacingVars[key] = value;
    });
    variables.textTransformVars.forEach((value, key) => {
      varsToSave.textTransformVars[key] = value;
    });
    variables.fontSizeVars.forEach((value, key) => {
      varsToSave.fontSizeVars[key] = value;
    });
    
    fs.writeFileSync(historicalVarsPath, JSON.stringify(varsToSave, null, 2), 'utf8');
  } catch (error) {
    console.warn('⚠️  No se pudo guardar las variables históricas:', error.message);
  }
}

/**
 * Genera variables CSS para spacing (padding y margin)
 * Crea variables como --hg-spacing-4, --hg-spacing-8, etc.
 */
function generateSpacingVariables(spacingMap, prefix, baseFontSize = 16) {
  if (!spacingMap || typeof spacingMap !== 'object') {
    return [];
  }
  
  const variables = [];
  
  Object.entries(spacingMap).forEach(([key, value]) => {
    // Si el valor termina en %, no lo convierte a rem
    const finalValue = value.endsWith('%') ? value : pxToRem(value, baseFontSize);
    const varName = `--${prefix}-spacing-${key}`;
    variables.push({ varName, value: finalValue, key });
  });
  
  return variables;
}

/**
 * Genera variables CSS para colores
 * Crea variables como --hg-color-white, --hg-color-black, etc.
 */
function generateColorVariables(colorsMap, prefix) {
  if (!colorsMap || typeof colorsMap !== 'object') {
    return [];
  }
  
  const variables = [];
  
  Object.entries(colorsMap).forEach(([key, value]) => {
    const varName = `--${prefix}-color-${key}`;
    variables.push({ varName, value, key });
  });
  
  return variables;
}

/**
 * Genera todas las variables CSS en el bloque :root
 * Recorre todos los mapas de variables y las convierte en declaraciones CSS.
 * Si se pasa fontFamilyMap, las variables font-family se generan desde el map (una por entrada).
 */
function generateRootVariables(fontFamilyVars, lineHeightVars, fontWeightVars, letterSpacingVars, textTransformVars, fontSizeVars, spacingVars = [], colorVars = [], fontFamilyMap = null, prefix = 'hg', category = 'typo') {
  const variables = [];
  // Font-family: usar fontFamilyMap si existe (todas las entradas en :root), si no usar fontFamilyVars
  if (fontFamilyMap && typeof fontFamilyMap === 'object') {
    Object.entries(fontFamilyMap).forEach(([name, value]) => {
      variables.push(`  --${prefix}-${category}-font-family-${name}: ${value};`);
    });
  } else {
    Array.from(fontFamilyVars.values()).forEach(item => {
      variables.push(`  ${item.varName}: ${item.value};`);
    });
  }
  const restMaps = [
    { map: lineHeightVars, name: 'line-height' },
    { map: fontWeightVars, name: 'font-weight' },
    { map: letterSpacingVars, name: 'letter-spacing' },
    { map: textTransformVars, name: 'text-transform' },
    { map: fontSizeVars, name: 'font-size' }
  ];
  
  restMaps.forEach(({ map }) => {
    Array.from(map.values()).forEach(item => {
      variables.push(`  ${item.varName}: ${item.value};`);
    });
  });
  
  // Agregar variables de spacing
  spacingVars.forEach(item => {
    variables.push(`  ${item.varName}: ${item.value};`);
  });
  
  // Agregar variables de colores
  colorVars.forEach(item => {
    variables.push(`  ${item.varName}: ${item.value};`);
  });
  
  return variables.join('\n');
}

module.exports = {
  loadHistoricalVariables,
  saveHistoricalVariables,
  generateSpacingVariables,
  generateColorVariables,
  generateRootVariables
};


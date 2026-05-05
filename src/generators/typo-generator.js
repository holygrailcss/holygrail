// Generador de Tipografías
// Maneja la creación de clases de tipografía y sus variables

const path = require('path');
const { toKebabCase, pxToRem, getFontFamilyName } = require('./utils');
const { BREAKPOINTS } = require('../config-loader');
const { loadHistoricalVariables, saveHistoricalVariables } = require('./variables-generator');

// Lista de propiedades de tipografía que se procesan
const PROPERTIES = ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'textTransform'];

/**
 * Genera el nombre de variable CSS para una fuente
 * Usa el nombre de la fuente (como "primary" o "secondary") para crear la variable
 */
function getFontFamilyVarName(fontFamilyName, prefix, category) {
  return `--${prefix}-${category}-font-family-${fontFamilyName}`;
}

/**
 * Genera el nombre de variable CSS para line-height
 * Convierte el valor numérico a un formato válido para nombres de variables
 */
function getLineHeightVarName(lineHeightValue, prefix, category) {
  return `--${prefix}-${category}-line-height-${lineHeightValue.toString().replace('.', '-')}`;
}

/**
 * Genera el nombre de variable CSS compartida para cualquier propiedad
 * Convierte el nombre de la propiedad a kebab-case y el valor a un formato válido
 * Para fontSize y letterSpacing, limpia las unidades (px, rem) y puntos
 */
function getSharedVarName(prop, value, prefix, category) {
  const propName = toKebabCase(prop);
  let name = value.toString();
  
  if (prop === 'fontSize') {
    name = name.endsWith('px') ? name.replace('px', '').replace('.', '-') : name.replace(/rem/g, '').replace('.', '-');
  } else if (prop === 'letterSpacing') {
    name = name.replace(/rem/g, '').replace('.', '-');
  }
  
  return `--${prefix}-${category}-${propName}-${name}`;
}

/**
 * Construye un mapa de todas las variables CSS compartidas y sus valores
 * Recorre todas las clases y agrupa valores únicos para crear variables compartidas
 * Esto evita duplicar variables cuando varias clases usan el mismo valor
 * También carga variables históricas para que nunca se eliminen
 */
function buildValueMap(classes, fontFamilyMap, prefix, category, historicalVarsPath = null) {
  // Cargar variables históricas si existe el archivo
  const historicalVarsPathDefault = historicalVarsPath || path.join(__dirname, '..', '..', '.data', '.historical-variables.json');
  const historicalVars = loadHistoricalVariables(historicalVarsPathDefault);
  
  // Inicializar Maps con variables históricas
  const fontFamilyVars = new Map(Object.entries(historicalVars.fontFamilyVars || {}));
  const lineHeightVars = new Map(Object.entries(historicalVars.lineHeightVars || {}));
  const fontWeightVars = new Map(Object.entries(historicalVars.fontWeightVars || {}));
  const letterSpacingVars = new Map(Object.entries(historicalVars.letterSpacingVars || {}));
  const textTransformVars = new Map(Object.entries(historicalVars.textTransformVars || {}));
  const fontSizeVars = new Map(Object.entries(historicalVars.fontSizeVars || {}));
  
  const valueMap = {};
  
  Object.entries(classes).forEach(([className, cls]) => {
    valueMap[className] = {};
    
    // Procesa la fuente de la clase
    // Si la fuente ya existe en el mapa, reutiliza la variable
    if (cls.fontFamily !== undefined) {
      const fontFamilyName = getFontFamilyName(cls.fontFamily, fontFamilyMap);
      const varName = getFontFamilyVarName(fontFamilyName, prefix, category);
      if (!fontFamilyVars.has(cls.fontFamily)) {
        fontFamilyVars.set(cls.fontFamily, { varName, value: cls.fontFamily, name: fontFamilyName });
      }
      valueMap[className].fontFamily = {
        varName: fontFamilyVars.get(cls.fontFamily).varName,
        value: cls.fontFamily
      };
    }
    
    // Procesa propiedades base que se comparten entre breakpoints
    // Estas propiedades no cambian entre mobile y desktop
    ['fontWeight', 'letterSpacing', 'textTransform'].forEach(prop => {
      if (cls[prop] !== undefined) {
        const varName = getSharedVarName(prop, cls[prop], prefix, category);
        const varMap = prop === 'fontWeight' ? fontWeightVars : prop === 'letterSpacing' ? letterSpacingVars : textTransformVars;
        
        // Solo crea la variable si no existe ya
        if (!varMap.has(cls[prop])) {
          varMap.set(cls[prop], { varName, value: cls[prop] });
        }
        valueMap[className][prop] = {
          varName: varMap.get(cls[prop]).varName,
          value: cls[prop]
        };
      }
    });
    
    // Procesa propiedades que cambian según el breakpoint
    // fontSize y lineHeight pueden ser diferentes en mobile y desktop
    BREAKPOINTS.forEach(bp => {
      if (cls[bp]) {
        if (cls[bp].fontSize !== undefined) {
          const fontSizeValue = cls[bp].fontSize;
          const fontSizeRem = pxToRem(fontSizeValue);
          const varName = getSharedVarName('fontSize', fontSizeValue, prefix, category);
          
          // Solo crea la variable si no existe ya
          if (!fontSizeVars.has(fontSizeValue)) {
            fontSizeVars.set(fontSizeValue, { varName, value: fontSizeRem });
          }
          if (!valueMap[className].fontSize) valueMap[className].fontSize = {};
          valueMap[className].fontSize[bp] = {
            varName: fontSizeVars.get(fontSizeValue).varName,
            value: fontSizeRem
          };
        }
        
        if (cls[bp].lineHeight !== undefined) {
          const lineHeightValue = cls[bp].lineHeight;
          const varName = getLineHeightVarName(lineHeightValue, prefix, category);
          
          // Solo crea la variable si no existe ya
          if (!lineHeightVars.has(lineHeightValue)) {
            lineHeightVars.set(lineHeightValue, { varName, value: lineHeightValue });
          }
          if (!valueMap[className].lineHeight) valueMap[className].lineHeight = {};
          valueMap[className].lineHeight[bp] = {
            varName: lineHeightVars.get(lineHeightValue).varName,
            value: lineHeightValue
          };
        }
      }
    });
  });
  
  // Guardar las variables actuales (incluyendo las históricas) para la próxima vez
  const allVariables = {
    fontFamilyVars,
    lineHeightVars,
    fontWeightVars,
    letterSpacingVars,
    textTransformVars,
    fontSizeVars
  };
  saveHistoricalVariables(allVariables, historicalVarsPathDefault);
  
  return { valueMap, fontFamilyVars, lineHeightVars, fontWeightVars, letterSpacingVars, textTransformVars, fontSizeVars };
}

/**
 * Obtiene las propiedades finales de una clase para un breakpoint específico
 * Combina las propiedades base (que no cambian) con las del breakpoint (que sí cambian)
 */
function getFinalProps(cls, breakpoint, baseFontSize) {
  const props = {};
  
  // Propiedades base que se aplican a todos los breakpoints
  ['fontFamily', 'fontWeight', 'letterSpacing', 'textTransform'].forEach(prop => {
    if (cls[prop] !== undefined) props[prop] = cls[prop];
  });
  
  // Propiedades específicas del breakpoint (fontSize y lineHeight)
  if (cls[breakpoint]) {
    if (cls[breakpoint].fontSize !== undefined) props.fontSize = pxToRem(cls[breakpoint].fontSize, baseFontSize);
    if (cls[breakpoint].lineHeight !== undefined) props.lineHeight = cls[breakpoint].lineHeight;
  }
  
  return props;
}

/**
 * Genera el CSS para una clase específica en un breakpoint
 * Crea las propiedades CSS usando las variables compartidas
 */
function generateClassCSS(className, cls, breakpointName, valueMap, prefix, category, baseFontSize, fontFamilyMap) {
  const props = getFinalProps(cls, breakpointName, baseFontSize);
  const cssProps = [];
  
  PROPERTIES.forEach(prop => {
    if (props[prop] === undefined) return;
    
    // Obtiene el nombre de la variable CSS según el tipo de propiedad
    let varName;
    if (prop === 'fontFamily') {
      const fontFamilyName = getFontFamilyName(props[prop], fontFamilyMap);
      varName = getFontFamilyVarName(fontFamilyName, prefix, category);
    } else if (prop === 'lineHeight') {
      varName = getLineHeightVarName(props[prop], prefix, category);
    } else if (prop === 'fontSize') {
      // Para fontSize, usa el valor original en px para generar el nombre de variable
      const originalValue = cls[breakpointName]?.fontSize ?? cls.fontSize;
      varName = getSharedVarName(prop, originalValue, prefix, category);
    } else {
      varName = getSharedVarName(prop, props[prop], prefix, category);
    }
    
    const importantFlag = prop === 'lineHeight' ? ' !important' : '';
    cssProps.push(`    ${toKebabCase(prop)}: var(${varName})${importantFlag};`);
  });
  
  return cssProps.length ? `  .${className} {\n${cssProps.join('\n')}\n  }` : '';
}

/**
 * Genera un bloque de tipografías para un breakpoint específico con comentario descriptivo
 * Incluye un comentario que indica qué breakpoint es y el min-width
 */
function generateTypographyBlock(breakpointName, minWidth, classes, valueMap, prefix, category, baseFontSize, fontFamilyMap) {
  // Convertir breakpoint a rem de forma consistente
  const minWidthRem = typeof minWidth === 'string' && minWidth.includes('px')
    ? pxToRem(minWidth, baseFontSize)
    : minWidth;
  const breakpointLabel = breakpointName === 'mobile' ? 'Mobile' : 'Desktop';
  
  const cssClasses = Object.entries(classes)
    .map(([className, cls]) => generateClassCSS(className, cls, breakpointName, valueMap, prefix, category, baseFontSize, fontFamilyMap))
    .filter(Boolean);
  
  return `/* Tipografías - ${breakpointLabel} (min-width: ${minWidthRem}) */
@media (min-width: ${minWidthRem}) {

${cssClasses.join('\n\n')}

}`;
}

module.exports = {
  buildValueMap,
  generateTypographyBlock,
  getFontFamilyVarName,
  getLineHeightVarName,
  getSharedVarName
};


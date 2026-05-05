// Generador de Layout Helpers
// Genera helpers de layout (display, flexbox, alignment, etc.)

const { pxToRem } = require('./utils');

/**
 * Genera helpers de layout (display, flexbox, alignment, etc.)
 * Crea clases como hg-d-flex, hg-justify-center, etc.
 * Agrupa todos los helpers responsive en un solo media query
 */
function generateLayoutHelpers(helpers, spacingMap, prefix, desktopBreakpoint, baseFontSize = 16) {
  if (!helpers || typeof helpers !== 'object') {
    return '';
  }

  // Convertir breakpoint a rem de forma consistente
  const breakpointInRem = typeof desktopBreakpoint === 'string' && desktopBreakpoint.includes('px')
    ? pxToRem(desktopBreakpoint, baseFontSize)
    : desktopBreakpoint;

  let css = '\n/* Layout Helpers */\n';
  let responsiveCSS = '';

  // Primero generar todas las clases base
  Object.entries(helpers).forEach(([helperName, config]) => {
    const { property, class: className, responsive, values, useSpacing } = config;

    if (useSpacing && spacingMap) {
      Object.entries(spacingMap).forEach(([key, value]) => {
        const finalValue = value.endsWith('%') ? value : pxToRem(value, baseFontSize);
        css += `.${prefix}-${className}-${key} { ${property}: ${finalValue}; }\n`;
      });

      if (responsive) {
        Object.entries(spacingMap).forEach(([key, value]) => {
          const finalValue = value.endsWith('%') ? value : pxToRem(value, baseFontSize);
          responsiveCSS += `  .md\\:${prefix}-${className}-${key} { ${property}: ${finalValue}; }\n`;
        });
      }
    } else if (values) {
      if (Array.isArray(values)) {
        values.forEach(value => {
          css += `.${prefix}-${className}-${value} { ${property}: ${value}; }\n`;
        });

        if (responsive) {
          values.forEach(value => {
            responsiveCSS += `  .md\\:${prefix}-${className}-${value} { ${property}: ${value}; }\n`;
          });
        }
      } else if (typeof values === 'object') {
        Object.entries(values).forEach(([key, value]) => {
          css += `.${prefix}-${className}-${key} { ${property}: ${value}; }\n`;
        });

        if (responsive) {
          Object.entries(values).forEach(([key, value]) => {
            responsiveCSS += `  .md\\:${prefix}-${className}-${key} { ${property}: ${value}; }\n`;
          });
        }
      }
    }
  });

  // Agrupar todos los helpers responsive en un solo media query
  if (responsiveCSS) {
    css += `\n@media (min-width: ${breakpointInRem}) {\n${responsiveCSS}}\n`;
  }

  return css;
}

module.exports = {
  generateLayoutHelpers
};


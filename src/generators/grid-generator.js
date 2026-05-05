// Generador de Grid System
// Genera el sistema de grid (row y columnas)

const { pxToRem } = require('./utils');

/**
 * Genera el sistema de grid (row y columnas)
 * Incluye filas, columnas responsive, y utilidades de bleed
 */
function generateGridSystem(gridConfig, baseFontSize = 16) {
  if (!gridConfig || !gridConfig.enabled) {
    return '';
  }

  // Validar que existan los valores necesarios
  if (!gridConfig.gutter || !gridConfig.breakpoints) {
    throw new Error('La configuración del grid debe incluir: gutter y breakpoints');
  }

  const gutter = gridConfig.gutter;
  const gutterValue = gutter;
  const breakpoints = gridConfig.breakpoints;

  // Función helper para convertir breakpoints a rem de forma consistente
  const breakpointToRem = (value) => {
    if (typeof value === 'string' && value.includes('px')) {
      return pxToRem(value, baseFontSize);
    }
    return value;
  };

  let css = '\n/* Grid System */\n';

  // Genera .row
  css += `.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -${gutterValue};
  margin-right: -${gutterValue};
}\n\n`;

  // Genera .row para cada breakpoint
  Object.entries(breakpoints).forEach(([name, config]) => {
    if (name !== 'xs') {
      const minWidth = config.minWidth || config;
      const remValue = breakpointToRem(minWidth);
      css += `@media (min-width: ${remValue}) {
  .row {
    margin-left: -${gutterValue};
    margin-right: -${gutterValue};
  }
}\n\n`;
    }
  });

  // Función helper para formatear porcentajes
  const formatPercentage = (value) => {
    const percentage = (value * 100).toFixed(10);
    // Elimina ceros finales pero mantiene al menos un decimal si es necesario
    return percentage.replace(/\.?0+$/, '') || '0';
  };

  // Genera columnas para cada breakpoint
  Object.entries(breakpoints).forEach(([name, config]) => {
    const minWidth = config.minWidth || config;
    const columns = config.columns || 12; // Default a 12 columnas si no se especifica
    const breakpointValue = breakpointToRem(minWidth);
    
    css += `@media (min-width: ${breakpointValue}) {\n`;
    for (let i = 1; i <= columns; i++) {
      const percentage = formatPercentage(i / columns);
      css += `  .col-${name}-${i} {
    flex: 0 0 ${percentage}%;
    max-width: ${percentage}%;
  }\n`;
    }
    css += '}\n\n';
  });

  // Genera estilos para todas las columnas
  css += `[class*=" col-"], [class^="col-"] {
  box-sizing: border-box;
  min-height: 1px;
  padding-left: ${gutterValue};
  padding-right: ${gutterValue};
  position: relative;
}\n\n`;

  // Estilos para bleed
  css += `.bleed {
  margin-left: -${gutterValue};
  margin-right: -${gutterValue};
  width: auto;
}\n\n`;

  css += `.bleed.row {
  margin-left: -${gutterValue};
  margin-right: -${gutterValue};
}\n\n`;

  css += `.bleed-0 {
  padding: 0 0px 0 0px;
  overflow: hidden;
}\n\n`;

  css += `.bleed-0 .container-fluid {
  margin-left: -0px;
  margin-right: -0px;
  padding: 0 0px 0 0px;
}\n\n`;

  css += `.bleed-0 > .row {
  margin-left: 0;
  margin-right: 0;
  box-sizing: border-box;
  display: flex;
  flex: 0 1 auto;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-flow: row wrap;
  flex-wrap: wrap;
}\n\n`;

  css += `.bleed-0 > [class*=" col-"],
.bleed-0 > [class^="col-"],
.bleed-0 > .col {
  padding: 0px;
  box-sizing: border-box;
}\n\n`;

  return css;
}

module.exports = {
  generateGridSystem
};


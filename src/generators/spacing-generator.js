// Generador de Spacing Helpers
// Genera helpers de padding y margin basados en el spacingMap

const { pxToRem } = require('./utils');

/**
 * Genera helpers de padding y margin basados en el spacingMap del config.json
 * Crea clases como p-4, pr-4, pl-4, pb-4, pt-4 para padding
 * y m-4, mr-4, ml-4, mb-4, mt-4 para margin
 * También genera versiones con prefijo md: para el breakpoint desktop
 * Usa las variables CSS definidas en :root
 */
function generateSpacingHelpers(spacingMap, prefix, desktopBreakpoint, baseFontSize = 16, spacingImportant = []) {
  if (!spacingMap || typeof spacingMap !== 'object') {
    return '';
  }
  
  const helpers = [];
  const desktopHelpers = [];
  
  // Convertir breakpoint a rem de forma consistente
  const desktopBreakpointRem = typeof desktopBreakpoint === 'string' && desktopBreakpoint.includes('px')
    ? pxToRem(desktopBreakpoint, baseFontSize)
    : desktopBreakpoint;
  
  // Generar helpers para cada valor en spacingMap
  Object.entries(spacingMap).forEach(([key, value]) => {
    const varName = `--${prefix}-spacing-${key}`;
    
    // Padding helpers base (mobile) usando variables CSS con propiedades lógicas para RTL
    helpers.push(`  .p-${key} { padding: var(${varName}); }`);
    helpers.push(`  .pr-${key} { padding-inline-end: var(${varName}); }`);
    helpers.push(`  .pl-${key} { padding-inline-start: var(${varName}); }`);
    helpers.push(`  .pb-${key} { padding-bottom: var(${varName}); }`);
    helpers.push(`  .pt-${key} { padding-top: var(${varName}); }`);
    
    // Margin helpers base (mobile) usando variables CSS con propiedades lógicas para RTL
    helpers.push(`  .m-${key} { margin: var(${varName}); }`);
    helpers.push(`  .mr-${key} { margin-inline-end: var(${varName}); }`);
    helpers.push(`  .ml-${key} { margin-inline-start: var(${varName}); }`);
    helpers.push(`  .mb-${key} { margin-bottom: var(${varName}); }`);
    helpers.push(`  .mt-${key} { margin-top: var(${varName}); }`);
    
    // Padding helpers con prefijo md: (desktop) usando variables CSS con propiedades lógicas para RTL
    desktopHelpers.push(`    .md\\:p-${key} { padding: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:pr-${key} { padding-inline-end: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:pl-${key} { padding-inline-start: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:pb-${key} { padding-bottom: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:pt-${key} { padding-top: var(${varName}); }`);
    
    // Margin helpers con prefijo md: (desktop) usando variables CSS con propiedades lógicas para RTL
    desktopHelpers.push(`    .md\\:m-${key} { margin: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:mr-${key} { margin-inline-end: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:ml-${key} { margin-inline-start: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:mb-${key} { margin-bottom: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:mt-${key} { margin-top: var(${varName}); }`);
    
    // NUEVAS: Padding helpers con prefijo hg- usando propiedades inline/block (mobile)
    helpers.push(`  .${prefix}-px-${key} { padding-inline: var(${varName}); }`);
    helpers.push(`  .${prefix}-py-${key} { padding-block: var(${varName}); }`);
    
    // NUEVAS: Margin helpers con prefijo hg- usando propiedades inline/block (mobile)
    helpers.push(`  .${prefix}-mx-${key} { margin-inline: var(${varName}); }`);
    helpers.push(`  .${prefix}-my-${key} { margin-block: var(${varName}); }`);
    
    // NUEVAS: Padding helpers con prefijo hg- y md: usando propiedades inline/block (desktop)
    desktopHelpers.push(`    .md\\:${prefix}-px-${key} { padding-inline: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:${prefix}-py-${key} { padding-block: var(${varName}); }`);
    
    // NUEVAS: Margin helpers con prefijo hg- y md: usando propiedades inline/block (desktop)
    desktopHelpers.push(`    .md\\:${prefix}-mx-${key} { margin-inline: var(${varName}); }`);
    desktopHelpers.push(`    .md\\:${prefix}-my-${key} { margin-block: var(${varName}); }`);
  });
  
  // Generar helpers con !important para los valores especificados en spacingImportant
  if (spacingImportant && Array.isArray(spacingImportant)) {
    spacingImportant.forEach(key => {
      if (spacingMap[key]) {
        const varName = `--${prefix}-spacing-${key}`;
        
        // Padding helpers con !important (mobile)
        helpers.push(`  .p-${key}\\! { padding: var(${varName}) !important; }`);
        helpers.push(`  .pr-${key}\\! { padding-inline-end: var(${varName}) !important; }`);
        helpers.push(`  .pl-${key}\\! { padding-inline-start: var(${varName}) !important; }`);
        helpers.push(`  .pb-${key}\\! { padding-bottom: var(${varName}) !important; }`);
        helpers.push(`  .pt-${key}\\! { padding-top: var(${varName}) !important; }`);
        
        // Margin helpers con !important (mobile)
        helpers.push(`  .m-${key}\\! { margin: var(${varName}) !important; }`);
        helpers.push(`  .mr-${key}\\! { margin-inline-end: var(${varName}) !important; }`);
        helpers.push(`  .ml-${key}\\! { margin-inline-start: var(${varName}) !important; }`);
        helpers.push(`  .mb-${key}\\! { margin-bottom: var(${varName}) !important; }`);
        helpers.push(`  .mt-${key}\\! { margin-top: var(${varName}) !important; }`);
        
        // Padding helpers con !important y prefijo md: (desktop)
        desktopHelpers.push(`    .md\\:p-${key}\\! { padding: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:pr-${key}\\! { padding-inline-end: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:pl-${key}\\! { padding-inline-start: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:pb-${key}\\! { padding-bottom: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:pt-${key}\\! { padding-top: var(${varName}) !important; }`);
        
        // Margin helpers con !important y prefijo md: (desktop)
        desktopHelpers.push(`    .md\\:m-${key}\\! { margin: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:mr-${key}\\! { margin-inline-end: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:ml-${key}\\! { margin-inline-start: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:mb-${key}\\! { margin-bottom: var(${varName}) !important; }`);
        desktopHelpers.push(`    .md\\:mt-${key}\\! { margin-top: var(${varName}) !important; }`);
      }
    });
  }
  
  if (helpers.length === 0) {
    return '';
  }
  
  // Generar bloque base (mobile) y bloque con media query (desktop)
  return `/* Helpers de Spacing (Padding y Margin) - Mobile */
${helpers.join('\n')}

/* Helpers de Spacing (Padding y Margin) - Desktop (md:) */
@media (min-width: ${desktopBreakpointRem}) {
${desktopHelpers.join('\n')}
}

`;
}

module.exports = {
  generateSpacingHelpers
};


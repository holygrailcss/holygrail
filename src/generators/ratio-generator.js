// Generador de Aspect Ratios
// Genera clases para ratios de aspecto

/**
 * Genera clases de aspect ratio
 * Crea clases como .aspect-1-1, .aspect-16-9, etc.
 */
function generateAspectRatios(ratios, prefix) {
  if (!ratios || !Array.isArray(ratios)) {
    return '';
  }

  let css = '\n/* Aspect Ratios */\n';
  
  // Clase para el contenido dentro del ratio
  css += `.${prefix}-aspect-content {
  position: absolute;
  inset: 0;
}\n\n`;

  // Clase para imágenes y videos dentro del ratio
  css += `.${prefix}-aspect-image {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  color: transparent;
}\n\n`;

  // Clase genérica .hg-aspect con ratio por defecto 2:3
  const defaultWidth = 2;
  const defaultHeight = 3;
  const defaultPaddingPercent = (defaultHeight / defaultWidth * 100).toFixed(4);
  
  css += `/* Ratio por defecto (2:3) */\n`;
  css += `.${prefix}-aspect {
  aspect-ratio: ${defaultWidth} / ${defaultHeight};
  position: relative;
  width: 100%;
  overflow: hidden;
}\n\n`;
  
  css += `@supports not (aspect-ratio: ${defaultWidth} / ${defaultHeight}) {
  .${prefix}-aspect {
    padding-top: ${defaultPaddingPercent}%;
  }
}\n\n`;

  // Generar clases para cada ratio
  ratios.forEach(ratio => {
    const { class: className, width, height, description } = ratio;
    
    // Calcular el padding-top en porcentaje
    const paddingPercent = (height / width * 100).toFixed(4);
    
    css += `/* ${description} */\n`;
    css += `.${prefix}-${className} {
  aspect-ratio: ${width} / ${height};
  position: relative;
  width: 100%;
  overflow: hidden;
}\n\n`;
    
    // Añadir fallback para navegadores que no soporten aspect-ratio
    css += `@supports not (aspect-ratio: ${width} / ${height}) {
  .${prefix}-${className} {
    padding-top: ${paddingPercent}%;
  }
}\n\n`;
  });

  return css;
}

module.exports = { generateAspectRatios };

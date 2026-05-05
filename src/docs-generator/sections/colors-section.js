// colors-section.js
// Genera el HTML de la sección "Colores" de la guía.
//
// Se extrae de html-generator.js porque es el bloque más
// auto-contenido del generador: sólo depende de `configData.colors`,
// `prefix` y del set `changedValues` para marcar diffs.
//
// La clasificación primarios vs semánticos se hace por convención:
//   - Si el config define `colorsPrimaryKeys`, se usa tal cual.
//   - Si no, se aplica una heurística: blancos, negros, grises y
//     fondos neutros (`bg-light`, `bg-cream`, `orange`, `mustard`)
//     → primarios. El resto → semánticos.

const DEFAULT_PRIMARY_KEYS = ['bg-light', 'bg-cream', 'orange', 'mustard'];

function isPrimaryColorKey(key) {
  return (
    key === 'white' ||
    key === 'black' ||
    /grey|gray/i.test(key) ||
    DEFAULT_PRIMARY_KEYS.includes(key)
  );
}

function classifyColors(colors, explicitPrimaryKeys) {
  if (!colors) return { primary: [], semantic: [] };
  const keys = Object.keys(colors);
  const primary = explicitPrimaryKeys || keys.filter(isPrimaryColorKey);
  const primarySet = new Set(primary);
  const semantic = keys.filter(k => !primarySet.has(k));
  return { primary, semantic };
}

function renderColorCard(key, value, prefix, changedValues) {
  const varName = `--${prefix}-color-${key}`;
  const isChanged = changedValues && changedValues.has(`colors.${key}`);
  const normalizedValue = String(value).trim().toLowerCase();
  // Los colores muy claros necesitan un patrón de fondo en la preview
  // para que se distingan del blanco del lienzo.
  const isLight =
    normalizedValue === '#ffffff' ||
    normalizedValue === '#f9f9f9' ||
    normalizedValue === '#f4f2ed';
  // Si el color tiene alpha (#RRGGBBAA), lo mostramos opaco en la
  // preview para que el usuario vea el hue real, no una mezcla con
  // el fondo.
  const opaqueValue =
    normalizedValue.length === 7
      ? normalizedValue
      : (normalizedValue.length === 9 ? normalizedValue.substring(0, 7) : normalizedValue);

  return `
          <div class="guide-color-card" data-copy-value="${varName}" title="Click para copiar ${varName}">
            <div class="guide-color-preview" style="--color-value: ${opaqueValue};">
              ${isLight ? `<div class="guide-color-pattern"></div>` : ''}
            </div>
            <div class="guide-color-card-content">
              <div class="guide-color-name">${key}</div>
              <div class="guide-color-var-name" data-copy-value="${varName}" title="Click para copiar ${varName}">${varName}</div>
              <div class="guide-color-value ${isChanged ? 'guide-changed' : ''}" data-copy-value="${value}" title="Click para copiar ${value}">${value}</div>
            </div>
          </div>`;
}

/**
 * Genera los dos bloques (primarios + semánticos) concatenados.
 * Devuelve string vacío si no hay colores definidos, así el callsite
 * puede condicionalmente mostrar la sección sin checks extra.
 */
function generateColorsGridHTML(configData, prefix, changedValues) {
  if (!configData.colors) return '';

  const { primary, semantic } = classifyColors(
    configData.colors,
    configData.colorsPrimaryKeys
  );

  const primaryHTML = primary.length > 0
    ? `
        <h3 class="guide-colors-subtitle title-m mb-16">Colores primarios</h3>
        <p class="guide-section-description mb-24">Blancos, negros, grises y fondos neutros.</p>
        <div class="guide-colors-grid">
          ${primary
            .filter(k => configData.colors[k])
            .map(key => renderColorCard(key, configData.colors[key], prefix, changedValues))
            .join('')}
        </div>`
    : '';

  const semanticHTML = semantic.length > 0
    ? `
        <h3 class="guide-colors-subtitle title-m mb-16 mt-48">Colores semánticos</h3>
        <p class="guide-section-description mb-24">Colores por significado (marca, estados, feedback).</p>
        <div class="guide-colors-grid">
          ${semantic
            .map(key => renderColorCard(key, configData.colors[key], prefix, changedValues))
            .join('')}
        </div>`
    : '';

  return primaryHTML + semanticHTML;
}

module.exports = {
  generateColorsGridHTML,
  // Exportados para tests
  classifyColors,
  renderColorCard
};

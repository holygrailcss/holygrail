// Generador de la sección "Tipografía" para las demos de tema
// Lee config.typo y produce una tabla HTML con: clase, family, weight,
// mobile (size), desktop (size), line-height compartida, preview en vivo.
// La fuente de verdad es config.json — así el demo siempre refleja
// exactamente lo que existe en dist/output.css.
//
// Nota: el line-height casi siempre coincide entre breakpoints, por
// eso se muestra en una sola columna. Si mobile y desktop divergen,
// formatLineHeight cae a mostrar ambos separados por una barra.

const { getFontFamilyName } = require('../generators/utils');

const SAMPLE_TEXT = 'Aa Bb Cc 123';

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSize(bp) {
  if (!bp || !bp.fontSize) return '<span class="hg-typo-empty">—</span>';
  return `<span class="hg-typo-num">${escapeHtml(bp.fontSize)}</span>`;
}

function formatLineHeight(mobile, desktop) {
  const m = mobile && mobile.lineHeight;
  const d = desktop && desktop.lineHeight;
  if (!m && !d) return '<span class="hg-typo-empty">—</span>';
  if (m && d && m === d) return `<span class="hg-typo-num">${escapeHtml(m)}</span>`;
  // Fallback: valores distintos → mostrar mobile / desktop explícitamente
  return `<span class="hg-typo-num">${escapeHtml(m || '—')}</span> <span class="hg-typo-meta">/ ${escapeHtml(d || '—')}</span>`;
}

function formatFamily(fontFamily, fontFamilyMap) {
  if (!fontFamily) return '—';
  const alias = getFontFamilyName(fontFamily, fontFamilyMap || {});
  // alias puede coincidir con la familia real; si difiere, mostramos ambas
  if (alias && alias !== fontFamily) {
    return `<code>${escapeHtml(alias)}</code> <span class="hg-typo-meta">${escapeHtml(fontFamily)}</span>`;
  }
  return `<code>${escapeHtml(fontFamily)}</code>`;
}

function generateRow(className, cls, fontFamilyMap) {
  const family = formatFamily(cls.fontFamily, fontFamilyMap);
  const weight = cls.fontWeight ? escapeHtml(cls.fontWeight) : '—';
  const ls = cls.letterSpacing ? escapeHtml(cls.letterSpacing) : '—';
  const tt = cls.textTransform ? escapeHtml(cls.textTransform) : '—';

  return `        <tr>
          <td class="hg-typo-preview"><span class="${escapeHtml(className)}">${SAMPLE_TEXT}</span></td>
          <td><code>.${escapeHtml(className)}</code></td>
          <td>${family}</td>
          <td>${weight}</td>
          <td>${formatSize(cls.mobile)}</td>
          <td>${formatSize(cls.desktop)}</td>
          <td>${formatLineHeight(cls.mobile, cls.desktop)}</td>
          <td>${ls}</td>
          <td>${tt}</td>
        </tr>`;
}

/**
 * Genera la sección HTML con la tabla de tipografías.
 * Devuelve string vacío si no hay clases en config.typo (sin romper builds).
 */
function generateTypographyHTML(config) {
  const typo = config && config.typo;
  if (!typo || Object.keys(typo).length === 0) return '';

  const fontFamilyMap = (config && config.fontFamilyMap) || {};

  const rows = Object.entries(typo)
    .map(([className, cls]) => generateRow(className, cls, fontFamilyMap))
    .join('\n');

  // Estilos locales: la tabla vive dentro de la demo, no del CSS principal.
  // Mantengo todo en línea para que el snippet sea autocontenido y
  // ThemeTransformer pueda inyectarlo donde encuentre el placeholder.
  return `      <section class="demo-section" id="typography">
        <h2 class="demo-title">Tipografía</h2>
        <p class="mb-24">
          Cada fila usa la clase real generada en <code>dist/output.css</code> a partir de <code>config.json → typo</code>.
          La columna <em>Preview</em> aplica la clase tal cual, así puedes comparar el valor numérico con el render en vivo.
        </p>

        <style>
          .hg-typo-table-wrap { overflow-x: auto; }
          .hg-typo-table {
            width: 100%;
            border-collapse: collapse;
            font-family: arial, sans-serif;
            font-size: 13px;
          }
          .hg-typo-table th,
          .hg-typo-table td {
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid var(--hg-color-middle-grey, #a9a9a9);
            vertical-align: middle;
          }
          .hg-typo-table thead th {
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--hg-color-dark-grey, #737373);
            border-bottom: 2px solid var(--hg-color-middle-grey, #a9a9a9);
            background: var(--hg-color-bg-light, #f0f0f0);
          }
          .hg-typo-table tbody tr:hover { background: var(--hg-color-bg-light, #f0f0f0); }
          .hg-typo-table code {
            background: var(--hg-color-bg-light, #f0f0f0);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
          }
          .hg-typo-preview {
            min-width: 180px;
            color: var(--hg-color-primary, #1d1d1d);
          }
          .hg-typo-num { font-weight: 700; }
          .hg-typo-meta { color: var(--hg-color-dark-grey, #737373); font-size: 12px; }
          .hg-typo-empty { color: var(--hg-color-middle-grey, #a9a9a9); }
        </style>

        <div class="hg-typo-table-wrap">
          <table class="hg-typo-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Clase</th>
                <th>Font family</th>
                <th>Weight</th>
                <th>Mobile</th>
                <th>Desktop</th>
                <th>Line height</th>
                <th>Letter spacing</th>
                <th>Text transform</th>
              </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </section>`;
}

module.exports = { generateTypographyHTML };

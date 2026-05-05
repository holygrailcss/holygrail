// Generador de guía HTML desde JSON
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { pxToRem, remToPx, getFontFamilyName, resolveActiveThemes } = require('../generators/utils');
const { buildValueMap } = require('../css-generator');
const { generateTypographyHTML } = require('../build/typo-table-generator');
const {
  loadPreviousValues,
  saveCurrentValues,
  getChangedValues
} = require('./value-tracker');
const { generateColorsGridHTML } = require('./sections/colors-section');
// Obtiene el autor del último commit de git
function getLastCommitAuthor() {
  try {
    const authorName = execSync('git log -1 --pretty=format:"%an"', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return authorName || null;
  } catch (error) {
    // Si no es un repo git o hay error, devolver null
    return null;
  }
}
// Obtiene la versión del package.json
function getPackageVersion() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageData.version || null;
    }
  } catch (error) {
    // Si hay error, devolver null
  }
  return null;
}
function generateHTML(configData, previousValuesPath = null) {
  const classNames = Object.keys(configData.typo);
  const prefix = configData.prefix || 'hg';
  const category = configData.category || 'typo';
  const baseFontSize = configData.baseFontSize || 16;
  // Obtener autor del último commit
  const lastCommitAuthor = getLastCommitAuthor();
  // Obtener versión del package.json
  const packageVersion = getPackageVersion();
  // Construir variables CSS primero para poder guardarlas
  const { fontFamilyVars, lineHeightVars, fontWeightVars, letterSpacingVars, textTransformVars, fontSizeVars } = 
    buildValueMap(configData.typo, configData.fontFamilyMap, prefix, category);
  // Generar variables de spacing
  const { generateSpacingVariables } = require('../css-generator');
  const spacingVars = generateSpacingVariables(configData.spacingMap, prefix, baseFontSize);
  // Generar variables de colores
  const { generateColorVariables } = require('../css-generator');
  const colorVars = generateColorVariables(configData.colors, prefix);
  // Construir array de variables (incluyendo spacing y colores)
  const allVariables = [
    ...Array.from(fontFamilyVars.values()),
    ...Array.from(lineHeightVars.values()),
    ...Array.from(fontWeightVars.values()),
    ...Array.from(letterSpacingVars.values()),
    ...Array.from(textTransformVars.values()),
    ...Array.from(fontSizeVars.values()),
    ...spacingVars,
    ...colorVars
  ].map(item => ({ name: item.varName, value: item.value }));
  // Preparar valores actuales para comparación
  const currentValues = {
    breakpoints: {
      mobile: configData.breakpoints.mobile,
      desktop: configData.breakpoints.desktop
    },
    fontFamilyMap: configData.fontFamilyMap || {},
    spacingMap: configData.spacingMap || {},
    colors: configData.colors || {},
    typo: {},
    variables: {}
  };
  // Guardar variables CSS en currentValues
  allVariables.forEach(variable => {
    currentValues.variables[variable.name] = variable.value;
  });
  classNames.forEach(className => {
    const cls = configData.typo[className];
    currentValues.typo[className] = {
      fontFamily: cls.fontFamily,
      fontWeight: cls.fontWeight,
      letterSpacing: cls.letterSpacing,
      textTransform: cls.textTransform,
      mobile: {
        fontSize: cls.mobile?.fontSize,
        lineHeight: cls.mobile?.lineHeight
      },
      desktop: {
        fontSize: cls.desktop?.fontSize,
        lineHeight: cls.desktop?.lineHeight
      }
    };
  });
  // Cargar valores anteriores y detectar cambios
  const previousValuesPathDefault = previousValuesPath || path.join(__dirname, '..', '.data', '.previous-values.json');
  const previousValues = loadPreviousValues(previousValuesPathDefault);
  const changedValues = getChangedValues(currentValues, previousValues);
  // Guardar valores actuales para la próxima vez
  saveCurrentValues(currentValues, previousValuesPathDefault);
  // Función auxiliar para verificar si un valor cambió
  function isChanged(className, prop, breakpoint = null) {
    const key = breakpoint ? `${className}.${breakpoint}.${prop}` : `${className}.${prop}`;
    return changedValues.has(key);
  }
  // Convierte fontSize (px o rem) a string en px para la tabla
  function fontSizeToPx(value, baseFontSize) {
    if (value == null || value === '') return '-';
    const s = String(value).trim();
    if (s.endsWith('px')) return s;
    if (s.endsWith('rem')) return remToPx(s, baseFontSize);
    const n = parseFloat(s);
    return Number.isNaN(n) ? '-' : `${n}px`;
  }
  // Generar tabla de clases
  const tableRows = classNames.map(className => {
    const cls = configData.typo[className];
    const fontFamilyName = getFontFamilyName(cls.fontFamily, configData.fontFamilyMap);
    const fontFamilyChanged = isChanged(className, 'fontFamily');
    const fontWeightChanged = isChanged(className, 'fontWeight');
    const letterSpacingChanged = isChanged(className, 'letterSpacing');
    const textTransformChanged = isChanged(className, 'textTransform');
    const mobileFontSizeChanged = isChanged(className, 'fontSize', 'mobile');
    const mobileLineHeightChanged = isChanged(className, 'lineHeight', 'mobile');
    const desktopFontSizeChanged = isChanged(className, 'fontSize', 'desktop');
    const desktopLineHeightChanged = isChanged(className, 'lineHeight', 'desktop');
    const mobileRem = cls.mobile?.fontSize ? pxToRem(cls.mobile.fontSize, baseFontSize) : '-';
    const mobilePx = cls.mobile?.fontSize ? fontSizeToPx(cls.mobile.fontSize, baseFontSize) : '-';
    const desktopRem = cls.desktop?.fontSize ? pxToRem(cls.desktop.fontSize, baseFontSize) : '-';
    const desktopPx = cls.desktop?.fontSize ? fontSizeToPx(cls.desktop.fontSize, baseFontSize) : '-';
    return `
      <tr>
        <td class="guide-table-name">.${className}</td>
        <td class="guide-preview-cell">
          <div class="guide-typography-preview ${className}">Aa</div>
        </td>
        <td class="guide-table-value ${fontFamilyChanged ? 'guide-changed' : ''}">${fontFamilyName || cls.fontFamily || '-'}</td>
        <td class="guide-table-value ${fontWeightChanged ? 'guide-changed' : ''}">${cls.fontWeight || '-'}</td>
        <td class="guide-table-value ${letterSpacingChanged ? 'guide-changed' : ''}">${cls.letterSpacing || '-'}</td>
        <td class="guide-table-value ${textTransformChanged ? 'guide-changed' : ''}">${cls.textTransform || '-'}</td>
        <td class="guide-mobile-value guide-value-center-blue ${mobileFontSizeChanged ? 'guide-changed' : ''}">${mobileRem}</td>
        <td class="guide-mobile-value guide-value-center-orange ${mobileFontSizeChanged ? 'guide-changed' : ''}">${mobilePx}</td>
        <td class="guide-mobile-value ${mobileLineHeightChanged ? 'guide-changed' : ''}">${cls.mobile?.lineHeight || '-'}</td>
        <td class="guide-desktop-value guide-value-center-blue ${desktopFontSizeChanged ? 'guide-changed' : ''}">${desktopRem}</td>
        <td class="guide-desktop-value guide-value-center-orange ${desktopFontSizeChanged ? 'guide-changed' : ''}">${desktopPx}</td>
        <td class="guide-desktop-value ${desktopLineHeightChanged ? 'guide-changed' : ''}">${cls.desktop?.lineHeight || '-'}</td>
      </tr>`;
  }).join('');
  const classesHTML = `
    <div class="guide-table-wrapper">
      <table class="guide-table">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Preview</th>
            <th>Font Family</th>
            <th>Font Weight</th>
            <th>Letter Spacing</th>
            <th>Text Transform</th>
            <th colspan="3" class="guide-mobile-header">Mobile</th>
            <th colspan="3" class="guide-desktop-header">Desktop</th>
          </tr>
          <tr class="guide-sub-header">
            <th colspan="6"></th>
            <th class="guide-mobile-value">Font Size (rem)</th>
            <th class="guide-mobile-value">Font Size (px)</th>
            <th class="guide-mobile-value">Line Height</th>
            <th class="guide-desktop-value">Font Size (rem)</th>
            <th class="guide-desktop-value">Font Size (px)</th>
            <th class="guide-desktop-value">Line Height</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>`;
  // Generar tabla de font families
  const fontFamiliesHTML = configData.fontFamilyMap ? Object.entries(configData.fontFamilyMap).map(([name, value]) => {
    const varName = `--${prefix}-${category}-font-family-${name}`;
    const styleValue = value.replace(/'/g, "\\'");
    const isChanged = changedValues.has(`fontFamilyMap.${name}`);
    return `
      <tr>
        <td class="guide-table-name">${name}</td>
        <td class="guide-font-family-preview" style='font-family: ${styleValue};'>Aa</td>
        <td class="guide-table-value ${isChanged ? 'guide-changed' : ''}">${value}</td>
        <td class="guide-table-value">${varName}</td>
      </tr>`;
  }).join('') : '';
  const fontFamiliesTableHTML = configData.fontFamilyMap ? `
    <div class="guide-table-wrapper">
      <table class="guide-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Preview</th>
            <th>Valor</th>
            <th>Variable CSS</th>
          </tr>
        </thead>
        <tbody>
          ${fontFamiliesHTML}
        </tbody>
      </table>
    </div>` : '';
      // Generar items de variables agrupados por categoría.
      // Sólo las categorías cuyo valor puede expresarse en rem/px
      // (spacing y font-size) muestran la columna de conversión;
      // el resto se renderiza con una única columna de valor.
      const VAR_GROUPS = [
        { id: 'font-family',    label: 'Font family',    prefix: '--hg-typo-font-family-',    showUnits: false },
        { id: 'font-weight',    label: 'Font weight',    prefix: '--hg-typo-font-weight-',    showUnits: false },
        { id: 'line-height',    label: 'Line height',    prefix: '--hg-typo-line-height-',    showUnits: false },
        { id: 'letter-spacing', label: 'Letter spacing', prefix: '--hg-typo-letter-spacing-', showUnits: false },
        { id: 'text-transform', label: 'Text transform', prefix: '--hg-typo-text-transform-', showUnits: false },
        { id: 'font-size',      label: 'Font size',      prefix: '--hg-typo-font-size-',      showUnits: true  },
        { id: 'spacing',        label: 'Spacing',        prefix: '--hg-spacing-',             showUnits: true  },
        { id: 'color',          label: 'Color',          prefix: '--hg-color-',               showUnits: false }
      ];
      const isRemValue = v => /^([\d.]+)rem$/.test(String(v || ''));
      const isColorValue = v => /^(#|rgb|hsl)/i.test(String(v || ''));
      const renderVarItem = (variable, showUnits) => {
        const isVariableChanged = changedValues.has(`variable.${variable.name}`);
        const changedCls = isVariableChanged ? 'guide-changed' : '';
        const canConvert = showUnits && isRemValue(variable.value);
        const isColorVar = variable.name.startsWith('--hg-color-') && isColorValue(variable.value);
        // Para variables con conversión (spacing / font-size) mostramos rem + px
        // (sin duplicar el rem en una columna aparte). Para el resto, solo el valor.
        // Para variables de color añadimos un swatch a la derecha del valor.
        const swatchHTML = isColorVar
          ? `<span class="guide-variable-swatch" style="background:${variable.value}" title="${variable.value}"></span>`
          : '';
        const valueHTML = canConvert
          ? `<span class="guide-value-center-blue guide-copyable ${changedCls}" data-copy-value="${variable.value}" title="Click para copiar ${variable.value}">${variable.value}</span>
             <span class="guide-value-center-orange guide-copyable ${changedCls}" data-copy-value="${remToPx(variable.value, baseFontSize)}" title="Click para copiar ${remToPx(variable.value, baseFontSize)}">${remToPx(variable.value, baseFontSize)}</span>`
          : `<span class="guide-variable-value guide-copyable ${changedCls}" data-copy-value="${variable.value}" title="Click para copiar ${variable.value}">${variable.value}</span>`;
        return `
          <div class="guide-variable-item">
            <span class="guide-variable-name guide-copyable ${changedCls}" data-copy-value="${variable.name}" title="Click para copiar ${variable.name}">${variable.name}</span>
            <span class="guide-variable-values">${valueHTML}${swatchHTML}</span>
          </div>`;
      };
      const groupsHTML = VAR_GROUPS.map(group => {
        const items = allVariables.filter(v => v.name && v.name.startsWith(group.prefix));
        if (!items.length) return '';
        const itemsHTML = items.map(v => renderVarItem(v, group.showUnits)).join('');
        return `
        <div class="guide-variables-group">
          <h4 class="guide-variables-group-title">${group.label} <span class="guide-variables-group-count">(${items.length})</span></h4>
          <div class="guide-variables-group-list">
            ${itemsHTML}
          </div>
        </div>`;
      }).filter(Boolean).join('');
  const variablesTableHTML = `
    <div class="guide-variables-grid">
      ${groupsHTML}
    </div>`;
  // Tabla de tipografía: reutilizamos el mismo generator que usa el bloque
  // HG_TYPO_TABLE en las demos de tema para que el origen de verdad sea uno solo.
  const typoTableHTML = generateTypographyHTML(configData);
  // Valores para las filas de resumen (Legacy y moderna)
  const spacingNumericKeysLegacy = configData.spacingMap ? Object.keys(configData.spacingMap).filter(k => !k.endsWith('-percent')).join(', ') : '';
  const spacingPercentKeysLegacy = configData.spacingMap ? Object.keys(configData.spacingMap).filter(k => k.endsWith('-percent')).map(k => k.replace(/-percent$/, '')).join(', ') : '';
  // Tabla horizontal compacta: Valor | rem | px (poco espacio vertical, scroll horizontal si hace falta)
  const numericEntries = configData.spacingMap ? Object.entries(configData.spacingMap).filter(([k]) => !k.endsWith('-percent')) : [];
  const spacingValuesCompactTableHTML = numericEntries.length ? `
    <div class="guide-spacing-compact-wrap">
      <table class="guide-table guide-spacing-compact">
        <thead><tr><th></th>${numericEntries.map(([k]) => `<th>${k}</th>`).join('')}</tr></thead>
        <tbody>
          <tr><td class="guide-spacing-compact-label">Valor</td>${numericEntries.map(([k]) => `<td>${k}</td>`).join('')}</tr>
          <tr><td class="guide-spacing-compact-label">rem</td>${numericEntries.map(([k, v]) => `<td class="guide-value-center-blue">${v.endsWith('%') ? v : pxToRem(v, baseFontSize)}</td>`).join('')}</tr>
          <tr><td class="guide-spacing-compact-label">px</td>${numericEntries.map(([k, v]) => `<td class="guide-value-center-orange">${v.endsWith('%') ? v : v}</td>`).join('')}</tr>
        </tbody>
      </table>
    </div>
    <p class="text-m guide-spacing-compact-note">Variable CSS <code>--${prefix}-spacing-&lt;valor&gt;</code>.</p>` : '';
  // Tabla horizontal compacta para Valores para <n>-percent
  const percentEntries = configData.spacingMap ? Object.entries(configData.spacingMap).filter(([k]) => k.endsWith('-percent')) : [];
  const spacingPercentCompactTableHTML = percentEntries.length ? `
    <div class="guide-spacing-compact-wrap">
      <table class="guide-table guide-spacing-compact">
        <thead><tr><th></th>${percentEntries.map(([k]) => `<th>${k.replace(/-percent$/, '')}</th>`).join('')}</tr></thead>
        <tbody>
          <tr><td class="guide-spacing-compact-label">%</td>${percentEntries.map(([, v]) => `<td class="guide-value-center-orange">${v}</td>`).join('')}</tr>
        </tbody>
      </table>
    </div>
    <p class="text-m guide-spacing-compact-note">Variable CSS <code>--${prefix}-spacing-&lt;n&gt;-percent</code>. Sustituye &lt;n&gt; por el número (20, 25, 33, etc.).</p>` : '';
  // Bloque "Valores para <variable>" y "Valores para <n>-percent" para colocar después de la explicación y antes de las tablas
  const spacingValuesBlockHTML = configData.spacingMap && (numericEntries.length || percentEntries.length) ? `
    <div class="guide-spacing-values-block mt-32 mb-32">
      ${numericEntries.length ? `<h3 class="title-m mb-16">Valores para &lt;variable&gt;</h3>
      ${spacingValuesCompactTableHTML}` : ''}
      ${percentEntries.length ? `<h3 class="title-m mb-16 mt-48">Valores para &lt;n&gt;-percent</h3>
      ${spacingPercentCompactTableHTML}` : ''}
    </div>` : '';
  // Tabla Legacy por patrones: Lados | Clase | Explicación | Valor (rem) | Valor (px) — como en la guía deseada
  const legacyPatternRows = [
    { sides: 'sides-all', clase: '.p-&lt;variable&gt;', explicacion: 'Padding en los cuatro lados.' },
    { sides: 'sides-top', clase: '.pt-&lt;variable&gt;', explicacion: 'Padding en el lado superior.' },
    { sides: 'sides-right', clase: '.pr-&lt;variable&gt;', explicacion: 'Padding en el lado derecho.' },
    { sides: 'sides-bottom', clase: '.pb-&lt;variable&gt;', explicacion: 'Padding en el lado inferior.' },
    { sides: 'sides-left', clase: '.pl-&lt;variable&gt;', explicacion: 'Padding en el lado izquierdo.' },
    { sides: 'sides-all', clase: '.m-&lt;variable&gt;', explicacion: 'Margin en los cuatro lados.' },
    { sides: 'sides-top', clase: '.mt-&lt;variable&gt;', explicacion: 'Margin en el lado superior.' },
    { sides: 'sides-right', clase: '.mr-&lt;variable&gt;', explicacion: 'Margin en el lado derecho.' },
    { sides: 'sides-bottom', clase: '.mb-&lt;variable&gt;', explicacion: 'Margin en el lado inferior.' },
    { sides: 'sides-left', clase: '.ml-&lt;variable&gt;', explicacion: 'Margin en el lado izquierdo.' },
    { sides: 'sides-all', clase: '.p-&lt;n&gt;-percent', explicacion: 'Padding en los cuatro lados (porcentaje).' },
    { sides: 'sides-top', clase: '.pt-&lt;n&gt;-percent', explicacion: 'Padding superior en porcentaje.' },
    { sides: 'sides-right', clase: '.pr-&lt;n&gt;-percent', explicacion: 'Padding derecho en porcentaje.' },
    { sides: 'sides-bottom', clase: '.pb-&lt;n&gt;-percent', explicacion: 'Padding inferior en porcentaje.' },
    { sides: 'sides-left', clase: '.pl-&lt;n&gt;-percent', explicacion: 'Padding izquierdo en porcentaje.' },
    { sides: 'sides-all', clase: '.m-&lt;n&gt;-percent', explicacion: 'Margin en los cuatro lados (porcentaje).' },
    { sides: 'sides-top', clase: '.mt-&lt;n&gt;-percent', explicacion: 'Margin superior en porcentaje.' },
    { sides: 'sides-right', clase: '.mr-&lt;n&gt;-percent', explicacion: 'Margin derecho en porcentaje.' },
    { sides: 'sides-bottom', clase: '.mb-&lt;n&gt;-percent', explicacion: 'Margin inferior en porcentaje.' },
    { sides: 'sides-left', clase: '.ml-&lt;n&gt;-percent', explicacion: 'Margin izquierdo en porcentaje.' }
  ];
  const spacingHelpersTableHTML = configData.spacingMap ? `
    <div class="guide-table-wrapper">
      <table class="guide-table">
        <thead>
          <tr>
            <th>Lados</th>
            <th>Clase</th>
            <th>Explicación</th>
            <th>Valor (rem)</th>
            <th>Valor (px)</th>
          </tr>
        </thead>
        <tbody>
          ${legacyPatternRows.map(r => `
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box ${r.sides}" title="Lado(s) afectado(s)"></div></td>
            <td class="guide-table-name"><code>${r.clase}</code></td>
            <td class="guide-table-value">${r.explicacion}</td>
            <td class="guide-value-center-blue">según valor</td>
            <td class="guide-value-center-orange">según valor</td>
          </tr>`).join('')}
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Izquierda y derecha (auto)"></div></td>
            <td class="guide-table-name"><code>.mx-auto</code></td>
            <td class="guide-table-value">Centrado horizontal (margin-inline: auto).</td>
            <td class="guide-value-center-blue">auto</td>
            <td class="guide-value-center-orange">auto</td>
          </tr>
          <tr class="guide-table-synthesis-note">
            <td class="guide-spacing-sides-cell"></td>
            <td class="guide-table-name"><strong>Valores para &lt;n&gt;-percent</strong></td>
            <td colspan="3" class="guide-table-value">${spacingPercentKeysLegacy}.</td>
          </tr>
        </tbody>
      </table>
    </div>` : '';
  
  // Tabla por patrones: Clase | Explicación | Ejemplo (según esquema de documentación)
  const spacingNumericKeys = configData.spacingMap ? Object.keys(configData.spacingMap).filter(k => !k.endsWith('-percent')).join(', ') : '';
  const spacingPercentKeys = configData.spacingMap ? Object.keys(configData.spacingMap).filter(k => k.endsWith('-percent')).map(k => k.replace(/-percent$/, '')).join(', ') : '';
  const spacingInlineHelpersTableHTML = configData.spacingMap ? `
    <div class="guide-table-wrapper mt-32">
      <h3 class="title-l mb-16">Clases modernas (Inline/Block · RTL-aware)</h3>
      <table class="guide-table">
        <thead>
          <tr>
            <th>Lados</th>
            <th>Clase</th>
            <th>Explicación</th>
            <th>Ejemplo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Izquierda y derecha"></div></td>
            <td class="guide-table-name"><code>.${prefix}-px-&lt;valor&gt;</code></td>
            <td class="guide-table-value">Padding horizontal (izquierda y derecha). Usa <code>padding-inline</code>.</td>
            <td class="guide-table-value"><code>.${prefix}-px-16</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-block" title="Arriba y abajo"></div></td>
            <td class="guide-table-name"><code>.${prefix}-py-&lt;valor&gt;</code></td>
            <td class="guide-table-value">Padding vertical (arriba y abajo). Usa <code>padding-block</code>.</td>
            <td class="guide-table-value"><code>.${prefix}-py-8</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Izquierda y derecha"></div></td>
            <td class="guide-table-name"><code>.${prefix}-mx-&lt;valor&gt;</code></td>
            <td class="guide-table-value">Margin horizontal (izquierda y derecha). Usa <code>margin-inline</code>.</td>
            <td class="guide-table-value"><code>.${prefix}-mx-24</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-block" title="Arriba y abajo"></div></td>
            <td class="guide-table-name"><code>.${prefix}-my-&lt;valor&gt;</code></td>
            <td class="guide-table-value">Margin vertical (arriba y abajo). Usa <code>margin-block</code>.</td>
            <td class="guide-table-value"><code>.${prefix}-my-16</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Izquierda y derecha"></div></td>
            <td class="guide-table-name"><code>.${prefix}-px-&lt;n&gt;-percent</code></td>
            <td class="guide-table-value">Padding horizontal en porcentaje del contenedor.</td>
            <td class="guide-table-value"><code>.${prefix}-px-50-percent</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-block" title="Arriba y abajo"></div></td>
            <td class="guide-table-name"><code>.${prefix}-py-&lt;n&gt;-percent</code></td>
            <td class="guide-table-value">Padding vertical en porcentaje del contenedor.</td>
            <td class="guide-table-value"><code>.${prefix}-py-25-percent</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Izquierda y derecha"></div></td>
            <td class="guide-table-name"><code>.${prefix}-mx-&lt;n&gt;-percent</code></td>
            <td class="guide-table-value">Margin horizontal en porcentaje.</td>
            <td class="guide-table-value"><code>.${prefix}-mx-33-percent</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-block" title="Arriba y abajo"></div></td>
            <td class="guide-table-name"><code>.${prefix}-my-&lt;n&gt;-percent</code></td>
            <td class="guide-table-value">Margin vertical en porcentaje.</td>
            <td class="guide-table-value"><code>.${prefix}-my-50-percent</code></td>
          </tr>
          <tr>
            <td class="guide-spacing-sides-cell"><div class="guide-spacing-sides-box sides-inline" title="Margin izquierda y derecha (auto)"></div></td>
            <td class="guide-table-name"><code>.${prefix}-mx-auto</code></td>
            <td class="guide-table-value">Centra el bloque horizontalmente (<code>margin-inline: auto</code>).</td>
            <td class="guide-table-value"><code>.${prefix}-mx-auto</code></td>
          </tr>
          <tr class="guide-table-synthesis-note">
            <td class="guide-spacing-sides-cell"></td>
            <td class="guide-table-name"><strong>Valores para &lt;valor&gt;</strong></td>
            <td colspan="2" class="guide-table-value">${spacingNumericKeys}. Ver tabla Legacy arriba para rem/px.</td>
          </tr>
          <tr class="guide-table-synthesis-note">
            <td class="guide-spacing-sides-cell"></td>
            <td class="guide-table-name"><strong>Valores para &lt;n&gt;-percent</strong></td>
            <td colspan="2" class="guide-table-value">${spacingPercentKeys}. Ver tabla Legacy arriba para equivalencias.</td>
          </tr>
        </tbody>
      </table>
    </div>` : '';
  // Estilos dinámicos basados en config
  const allStyles = `
    body {
      font-family: var(--${prefix}-${category}-font-family-primary);
    }`;
  // Generar tabla de layout helpers
  const layoutHelpersHTML = configData.helpers ? Object.entries(configData.helpers).flatMap(([helperName, config]) => {
    const { property, class: className, responsive, values, useSpacing, description, explanation } = config;
    const helperDescription = description || explanation || '';
    const prefix = configData.prefix || 'hg';
    const baseFontSize = configData.baseFontSize || 16;
    const rows = [];
    if (useSpacing && configData.spacingMap) {
      Object.entries(configData.spacingMap).forEach(([key, value]) => {
        const baseClass = `.${prefix}-${className}-${key}`;
        const responsiveClass = responsive ? `.md:${prefix}-${className}-${key}` : '';
        const remValue = value.endsWith('%') ? value : pxToRem(value, baseFontSize);
        rows.push(`
      <tr>
        <td class="guide-layout-class-name guide-copyable" data-copy-value="${baseClass}" title="Click para copiar ${baseClass}">${baseClass}</td>
        <td class="guide-layout-class-name ${responsiveClass ? 'guide-copyable' : ''}" ${responsiveClass ? `data-copy-value="${responsiveClass}" title="Click para copiar ${responsiveClass}"` : ''}>${responsiveClass || '-'}</td>
        <td class="guide-layout-property">${property}: ${remValue}</td>
        <td class="guide-layout-property">${helperDescription || '-'}</td>
      </tr>`);
      });
    } else if (values) {
      if (Array.isArray(values)) {
        values.forEach(value => {
          const baseClass = `.${prefix}-${className}-${value}`;
          const responsiveClass = responsive ? `.md:${prefix}-${className}-${value}` : '';
          rows.push(`
      <tr>
        <td class="guide-layout-class-name guide-copyable" data-copy-value="${baseClass}" title="Click para copiar ${baseClass}">${baseClass}</td>
        <td class="guide-layout-class-name ${responsiveClass ? 'guide-copyable' : ''}" ${responsiveClass ? `data-copy-value="${responsiveClass}" title="Click para copiar ${responsiveClass}"` : ''}>${responsiveClass || '-'}</td>
        <td class="guide-layout-property">${property}: ${value}</td>
        <td class="guide-layout-property">${helperDescription || '-'}</td>
      </tr>`);
        });
      } else {
        Object.entries(values).forEach(([key, value]) => {
          const baseClass = `.${prefix}-${className}-${key}`;
          const responsiveClass = responsive ? `.md:${prefix}-${className}-${key}` : '';
          rows.push(`
      <tr>
        <td class="guide-layout-class-name guide-copyable" data-copy-value="${baseClass}" title="Click para copiar ${baseClass}">${baseClass}</td>
        <td class="guide-layout-class-name ${responsiveClass ? 'guide-copyable' : ''}" ${responsiveClass ? `data-copy-value="${responsiveClass}" title="Click para copiar ${responsiveClass}"` : ''}>${responsiveClass || '-'}</td>
        <td class="guide-layout-property">${property}: ${value}</td>
        <td class="guide-layout-property">${helperDescription || '-'}</td>
      </tr>`);
        });
      }
    }
    return rows;
  }).join('') : '';
  const layoutHelpersTableHTML = configData.helpers ? `
    <div class="guide-table-wrapper">
      <table class="guide-table">
        <thead>
          <tr>
            <th>Clases Helper</th>
            <th>Clases Helper (md:)</th>
            <th>Propiedad CSS</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          ${layoutHelpersHTML}
        </tbody>
      </table>
    </div>` : '';
      // Sección "Colores" → extraída a ./sections/colors-section.js.
      // Usa `changedValues` (Set compartido con el resto del generador)
      // para marcar diffs, y `prefix` para construir los nombres de
      // variables CSS. Devuelve string vacío si no hay colores, lo que
      // hace que la lógica de menú más abajo omita la entrada.
      const colorsGridHTML = generateColorsGridHTML(configData, prefix, changedValues);
      // Construir menú lateral
      const menuItems = [];
      if (colorsGridHTML) {
        menuItems.push({ id: 'colors', label: 'Colores' });
      }
      if (fontFamiliesTableHTML) {
        menuItems.push({ id: 'font-families', label: 'Font Families' });
      }
      menuItems.push(
        { id: 'tipografia', label: 'Tipografía' },
        { id: 'variables', label: 'Variables CSS' }
      );
      if (spacingHelpersTableHTML) {
        menuItems.push({ id: 'spacing', label: 'Spacing' });
      }
      if (layoutHelpersTableHTML) {
        menuItems.push({ id: 'layout', label: 'Helpers de Layout' });
      }
      if (configData.grid && configData.grid.enabled) {
        menuItems.push({ id: 'grid', label: 'Grid System' });
      }
      if (configData.aspectRatios) {
        menuItems.push({ id: 'ratios', label: 'Ratios de Aspecto' });
      }
      menuItems.push({ id: 'breakpoints', label: 'Breakpoints' });
      // Lista canónica de temas activos (soporta tanto `themes[]` como
      // el antiguo `theme` singular). Toda la lógica de nav se deriva
      // de aquí para evitar referencias hardcodeadas a black-yellow/limited.
      const activeThemes = resolveActiveThemes(configData);
      if (activeThemes.length > 0) {
        menuItems.push({ id: 'containers', label: 'Containers' });
      }
      const menuHTML = menuItems.map(item => `
        <a href="#${item.id}" class="guide-menu-item" data-section="${item.id}">${item.label}</a>
      `).join('');
      // Añadir un enlace al demo por cada tema activo. Si no hay
      // ningún tema habilitado, la sección queda vacía y no se inyecta
      // el separador, para no dejar un <hr> suelto al final.
      const themeDemoLink = activeThemes.length > 0
        ? `
      <hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
${activeThemes.map(t => `        <a href="themes/${t.name}-demo.html" class="guide-menu-item" style="color: #000000; font-weight: 600;"> ${t.label}</a>`).join('\n')}
      `
        : '';
      return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>holygrailcss - Guía de Tipografía</title>
  <!-- Google Fonts - Solo para la guía -->
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Instrument+Sans:regular,100,500,600,700" media="all">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap" rel="stylesheet">

  <!-- Lenis Smooth Scroll - Solo para la guía -->
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>
  <link rel="stylesheet" href="output.css?v=${Date.now()}">
  <link rel="stylesheet" href="guide-styles.css?v=${Date.now()}">
  <style>
    ${allStyles}
    /* Lenis Smooth Scroll Styles - Solo para la guía */
    html.lenis {
      height: auto;
    }
    .lenis.lenis-smooth {
      scroll-behavior: auto;
    }
    .lenis.lenis-smooth[data-lenis-prevent] {
      overscroll-behavior: contain;
    }
    .lenis.lenis-stopped {
      overflow: hidden;
    }
    /* Google Fonts - Solo para la guía (sobrescribe la fuente del body) */
    body {
      font-family: 'Instrument Sans', sans-serif !important;
    }
  </style>
</head>
<body>
  <div class="guide-sidebar-overlay" onclick="toggleSidebar()"></div>
  <aside class="guide-sidebar">
    <nav class="guide-sidebar-nav">
      ${menuHTML}
    </nav>
    <div class="guide-sidebar-footer">
      <div class="guide-sidebar-badges">
        <a href="https://www.npmjs.com/package/holygrailcss" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/npm/v/holygrailcss.svg" alt="npm version" />
        </a>
      </div>
               <p class="text-m guide-sidebar-meta">
          last update: ${new Date().toLocaleString('es-ES')}
        </p>
      ${packageVersion ? `
        <p class="text-m guide-sidebar-meta-small">
          Version: ${packageVersion}
        </p>
      ` : ''}
      ${lastCommitAuthor ? `
        <p class="text-s guide-sidebar-meta-small">
          Last user: ${lastCommitAuthor}
        </p>
      ` : ''}
    </div>
  </aside>
      <div class="guide-header">
    <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
      <div class="guide-search-container" style="flex: 1; max-width: 360px;">
        <input
          type="text"
          id="search-input"
          class="guide-search-input"
          placeholder="Buscar clases, variables, helpers..."
          autocomplete="off"
        />
        <svg
          class="guide-search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <button
          id="clear-search"
          class="guide-clear-search-btn"
          title="Limpiar búsqueda"
        >×</button>
      </div>
      <div id="search-results" class="guide-search-results"></div>
    </div>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <nav class="guide-nav">
        <a href="index.html" class="active">Guía</a>
        <a href="componentes.html">Componentes</a>
${activeThemes.map(t => `        <a href="themes/${t.name}-demo.html">${t.label}</a>`).join('\n')}
        <a href="skills.html">Skills</a>
      </nav>
      <button class="guide-header-button" onclick="toggleSidebar()">☰</button>
    </div>
    </div>
  <main class="guide-main-content">
<div class="guide-container">
    <div class="guide-section guide-section--highlighted" id="inicio">
      <div class="guide-section-title">
    <div class="col-xs-12 col-md-6">

            <h2 >
          holygrailcss, la nueva evolución del Design System de Black&Yellow.
        </h2>

    </div>

      </div>
      <div class="guide-section-content">

      </div>
    </div>
<div class="case-study-img-holygrail h-100vh" id="black-yellow-theme">
      <span class="case-study-holygrail-title">holygrailcss</span>
    </div>
    ${colorsGridHTML ? `
    <div class="guide-section guide-section--highlighted" id="colors">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Colores</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class="">
        Paleta de colores disponibles con sus variables CSS.
      </p> </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-content">
        ${colorsGridHTML}
      </div>
    </div>
    ` : ''}
    ${fontFamiliesTableHTML ? `
    <div class="guide-section" id="font-families">
    <div class="row mb-120">

    <div class="col-xs-12 col-md-6"> <h2>Typography</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">      
      <p class=" ">
        Font families disponibles para la tipografía.
        </p> </div>

        <div class="col-xs-12 col-md-12">
        <hr>
        </div>
    </div>
      <div class="guide-section-content">
        <div class="guide-typeface-specimen">
          <div class="guide-typeface-left">
            <div class="guide-typeface-large-aa" style="font-family: var(--${prefix}-${category}-font-family-primary);">Aa</div>
            <div class="guide-typeface-info">
              <div class="guide-typeface-info-item">
                <div class="guide-typeface-label">FAMILY</div>
                <div class="guide-typeface-value">Neutrif</div>
              </div>
              <div class="guide-typeface-info-item">
                <div class="guide-typeface-label">WEIGHT</div>
                <div class="guide-typeface-value">Light, Regular, Medium, Semibold</div>
              </div>
            </div>
          </div>
          <div class="guide-typeface-right" style="font-family: var(--${prefix}-${category}-font-family-primary);">
            <div class="guide-typeface-chars">${'a b c d e f g h i j k l m'.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
            <div class="guide-typeface-chars">${'n o p q r s t u v w x y z'.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
            <div class="guide-typeface-chars">${'A B C D E F G H I J K L M'.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
            <div class="guide-typeface-chars">${'N O P Q R S T U V W X Y Z'.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
            <div class="guide-typeface-chars">${'0 1 2 3 4 5 6 7 8 9 ! " #'.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
            <div class="guide-typeface-chars">${'$ % & \' ( ) * + . - , / ='.split(' ').map(char => `<div class="guide-typeface-char">${char}</div>`).join('')}</div>
          </div>
        </div>
        ${fontFamiliesTableHTML}
      </div>
    </div>
    ` : ''}
    <div class="guide-section" id="tipografia">
      <div class="guide-section-content">
        ${typoTableHTML}
      </div>
    </div>

    ${spacingHelpersTableHTML ? `
    <div class="guide-section" id="spacing">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Spacing</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class=" ">
        Clases helper para padding y margin basadas en el spacingMap.
        Usa las variables CSS definidas en :root.
      </p>
      <img src="assets/margen.webp" alt="Spacing Diagram" class="guide-spacing-diagram-img">
    </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-content">
        <div id="variables">
          <h3 class="title-m mb-16">Variables CSS</h3>
          <p class="guide-section-description mb-24">Variables compartidas usadas por el spacing y el sistema.</p>
          ${variablesTableHTML}
        </div>
        <div class="guide-info-box guide-info-box-warning mb-32">
          <strong class="mb-16" style="display: block;">¿Cómo se generan los helpers de espaciado?</strong>
          <div class="row">
            <div class="col-xs-12 col-md-6 guide-spacing-explanation-col">
              <p class="text-m guide-info-box-text">
                <strong>Primera letra:</strong> Tipo de spacing → <code class="guide-info-box-code-info">p</code> (padding) o <code class="guide-info-box-code-info">m</code> (margin).
              </p>
              <p class="text-m guide-info-box-text">
                <strong>Segunda letra:</strong> Dirección → <code class="guide-info-box-code-info">t</code> (top), <code class="guide-info-box-code-info">r</code> (right/end), <code class="guide-info-box-code-info">b</code> (bottom), <code class="guide-info-box-code-info">l</code> (left/start). Si no hay segunda letra, se aplica a todos los lados.
              </p>
              <p class="text-m guide-info-box-text">
                <strong>Guion + valor:</strong> El valor del spacing → <code class="guide-info-box-code-info">-4</code>, <code class="guide-info-box-code-info">-16</code>, <code class="guide-info-box-code-info">-50-percent</code>
              </p>
              <p class="text-m guide-info-box-text">
                <strong>Ejemplos Legacy:</strong> <code class="guide-info-box-code-info">p-16</code> (padding todos lados), <code class="guide-info-box-code-info">pt-8</code> (padding-top), <code class="guide-info-box-code-info">pr-4</code> (padding-right), <code class="guide-info-box-code-info">mb-24</code> (margin-bottom), <code class="guide-info-box-code-info">ml-12</code> (margin-left).
              </p>
              <p class="text-m guide-info-box-text">
                <strong>Clases Modernas (RTL-aware):</strong> A estas clases legacy se añaden versiones inline con prefijo <code class="guide-info-box-code-info">hg-</code>: <code class="guide-info-box-code-info">.${prefix}-px-{valor}</code> (padding-inline/horizontal), <code class="guide-info-box-code-info">.${prefix}-py-{valor}</code> (padding-block/vertical), <code class="guide-info-box-code-info">.${prefix}-mx-{valor}</code> (margin-inline/horizontal), <code class="guide-info-box-code-info">.${prefix}-my-{valor}</code> (margin-block/vertical).
              </p>
              <p class="text-m guide-info-box-text-small">
                <strong>Nota:</strong> Los helpers con prefijo <code class="guide-info-box-code-info">md:</code> funcionan como en Tailwind CSS y solo se aplican en el breakpoint desktop (≥${configData.breakpoints.desktop}). Puedes combinar clases base y con prefijo <code class="guide-info-box-code-info">md:</code> para crear diseños responsive. Las clases con <code class="guide-info-box-code-info">!</code> aplican !important y tienen prioridad sobre otras reglas CSS.
              </p>
            </div>
            <div class="col-xs-12 col-md-6 guide-spacing-explanation-col">
              <p class="text-m guide-info-box-text"><strong>Ejemplos de uso:</strong></p>
              <ul class="guide-info-box-list">
                <li class="text-m guide-info-box-list-item"><code class="guide-info-box-code-info">.p-4</code> — Aplica padding de 4px en todos los tamaños de pantalla</li>
                <li class="text-m guide-info-box-list-item"><code class="guide-info-box-code-info">.md:p-4</code> — Aplica padding de 4px solo en desktop (≥${configData.breakpoints.desktop})</li>
                <li class="text-m guide-info-box-list-item"><code class="guide-info-box-code-info">.md:pr-8</code> — Aplica padding-right de 8px solo en desktop</li>
                <li class="text-m guide-info-box-list-item"><code class="guide-info-box-code-info">.md:mt-16</code> — Aplica margin-top de 16px solo en desktop</li>
                <li class="text-m guide-info-box-list-item"><code class="guide-info-box-code-info">.p-0!</code> — Aplica padding de 0 con !important (útil para sobrescribir otros estilos)</li>
              </ul>
            </div>
          </div>
        </div>
        ${spacingValuesBlockHTML}
        ${spacingHelpersTableHTML}
        ${spacingInlineHelpersTableHTML}
      </div>
    </div>
    ` : ''}
    ${layoutHelpersTableHTML ? `
    <div class="guide-section" id="layout">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Layout</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class="text-m ">
        Clases helper para display, flexbox, alignment y gap.
        Todos los helpers marcados como responsive tienen variantes con prefijo .md: para desktop (≥${configData.breakpoints.desktop}).
      </p> </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-content">
        ${layoutHelpersTableHTML}
        <div class="guide-section-title">
          <div> </div>
          <div class="demo-section-2">
            <div>
              <strong>Ejemplos de uso:</strong>
              <ul class="guide-info-box-list">
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.d-flex</code> - Display flex
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.flex-column</code> - Flex direction column
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.justify-center</code> - Justify content center
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.items-center</code> - Align items center
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.gap-16</code> - Gap de 16px (1rem)
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.md:flex-row</code> - Flex direction row solo en desktop
                </li>
              </ul>
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    ${configData.grid && configData.grid.enabled ? `
    <div class="guide-section" id="grid">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Grid</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class="">
        Sistema de grid responsive estilo Bootstrap con 12 columnas (xs, sm, md, lg) y 24 columnas (xl).
      </p> </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-title">
      <div> </div>
  
        <div class="demo-section-2">
        <div>

  <p>El grid system utiliza flexbox y un sistema de 12 columnas para breakpoints xs, sm, md, lg, y 24 columnas para xl.</p>
              <p class="text-m guide-info-box-text">
        
          </p>
         
          </div>
          <div> <strong>¿Cómo funciona el Grid?</strong> 
          <br>
           <ul class="guide-info-box-list">
            <li class="text-m guide-info-box-list-item">
              <strong>.row</strong> - Contenedor flex con márgenes negativos para compensar el gutter
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.col-xs-*</strong> - Columnas para pantallas desde ${configData.grid.breakpoints.xs} (12 columnas)
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.col-sm-*</strong> - Columnas para pantallas desde ${configData.grid.breakpoints.sm} (12 columnas)
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.col-md-*</strong> - Columnas para pantallas desde ${configData.grid.breakpoints.md} (12 columnas)
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.col-lg-*</strong> - Columnas para pantallas desde ${configData.grid.breakpoints.lg} (12 columnas)
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.col-xl-*</strong> - Columnas para pantallas desde ${configData.grid.breakpoints.xl} (24 columnas)
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.bleed</strong> - Permite que las columnas vayan a sangre (full bleed), eliminando los márgenes laterales del gutter
            </li>
            <li class="text-m guide-info-box-list-item">
              <strong>.bleed-0</strong> - Elimina completamente el padding y márgenes, útil para contenido que debe ocupar todo el ancho sin espacios
            </li>

            <li class="text-m guide-info-box-list-item">
              <strong>Gutter:</strong> ${configData.grid.gutter} (padding horizontal en cada columna)
            </li>
          </ul>

          
          </div>
        
        </div>
      </div>
      <div >
        <div class="guide-table-wrapper">
          <table class="guide-table">
            <thead>
              <tr>
                <th>Breakpoint</th>
                <th>Min-width</th>
                <th>Min-width (rem)</th>
                <th>Columnas</th>
                <th>Gutter (px)</th>
                <th>Gutter (rem)</th>
                <th>Margen lateral (px)</th>
                <th>Margen lateral (rem)</th>
                <th>Clases</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(configData.grid.breakpoints).map(([name, config]) => {
                const minWidth = config.minWidth || config;
                const columns = config.columns || 12;
                const minWidthRem = minWidth.endsWith('px') ? pxToRem(minWidth, baseFontSize) : '-';
                const gutter = configData.grid.gutter || '-';
                const gutterRem = gutter !== '-' && String(gutter).endsWith('px') ? pxToRem(gutter, baseFontSize) : gutter !== '-' ? gutter : '-';
                const gutterPx = gutter;
                const marginLateral = configData.grid.containerMargin || '-';
                const marginLateralRem = marginLateral !== '-' && String(marginLateral).endsWith('px') ? pxToRem(marginLateral, baseFontSize) : marginLateral !== '-' ? marginLateral : '-';
                const marginLateralPx = marginLateral;
                return `<tr>
                <td class="guide-table-name">${name}</td>
                <td class="guide-table-value">${minWidth}</td>
                <td class="guide-table-value">${minWidthRem}</td>
                <td class="guide-table-value">${columns}</td>
                <td class="guide-value-center-orange">${gutterPx}</td>
                <td class="guide-value-center-blue">${gutterRem}</td>
                <td class="guide-value-center-orange">${marginLateralPx}</td>
                <td class="guide-value-center-blue">${marginLateralRem}</td>
                <td class="guide-table-value">.col-${name}-1 a .col-${name}-${columns}</td>
              </tr>`;
              }).join('\n              ')}
            </tbody>
          </table>
        </div>


        
        <div class="guide-section-title">
          <div> </div>
          <div class="demo-section-2">
            <div>
              <p class="guide-info-box-text mb-64">
                <strong>Columnas normales:</strong>
              </p>
              <pre class="guide-code-example"><code>&lt;div class="row"&gt;
  &lt;div class="col-xs-12 col-md-6 col-lg-4"&gt;
    Columna 1
  &lt;/div&gt;
  &lt;div class="col-xs-12 col-md-6 col-lg-4"&gt;
    Columna 2
  &lt;/div&gt;
  &lt;div class="col-xs-12 col-md-12 col-lg-4"&gt;
    Columna 3
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
              <p class="text-m guide-info-box-text">
                Este ejemplo muestra 3 columnas que:
              </p>
              <ul class="guide-info-box-list">
                <li class="text-m guide-info-box-list-item">
                  En <strong>xs</strong>: Ocupan 12 columnas cada una (100% de ancho, apiladas)
                </li>
                <li class="text-m guide-info-box-list-item">
                  En <strong>md</strong> (≥${configData.grid.breakpoints.md}): Las dos primeras ocupan 6 columnas (50% cada una), la tercera 12 (100%)
                </li>
                <li class="text-m guide-info-box-list-item">
                  En <strong>lg</strong> (≥${configData.grid.breakpoints.lg}): Cada una ocupa 4 columnas (33.33% cada una, 3 columnas por fila)
                </li>
              </ul>
            </div>
            <div>
              <strong>Columnas a sangre (Bleed)</strong>
              <br>
              <p class="text-m guide-info-box-text">
                Cuando necesitas que las columnas vayan a sangre (full bleed), eliminando los márgenes laterales del gutter, usa la clase <code class="guide-info-box-code-info">.bleed</code>:
              </p>
              <pre class="guide-code-example"><code>&lt;div class="row"&gt;
  &lt;div class="col-xs-12 bleed"&gt;
    Contenido que va a sangre (sin márgenes laterales)
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
              <p class="text-m guide-info-box-text">
                Para eliminar completamente el padding y márgenes, usa <code class="guide-info-box-code-info">.bleed-0</code>:
              </p>
              <pre class="guide-code-example"><code>&lt;div class="bleed-0"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-xs-12"&gt;
      Contenido sin padding ni márgenes
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
              <p class="text-m guide-info-box-text-small">
                <strong>Nota:</strong> <code class="guide-info-box-code-info">.bleed</code> aplica márgenes negativos iguales al gutter (${configData.grid.gutter}) para que el contenido llegue hasta los bordes. <code class="guide-info-box-code-info">.bleed-0</code> elimina todo el padding y márgenes, útil para imágenes o contenido que debe ocupar todo el ancho disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    ${configData.aspectRatios ? `
    <div class="guide-section" id="ratios">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Ratios</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class="">
        Clases para controlar el ratio de aspecto de los elementos. Útil para imágenes, videos y contenedores.
      </p> </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-content">
        <div class="guide-table-wrapper">
          <table class="guide-table">
            <thead>
              <tr>
                <th>Clase</th>
                <th>Ratio</th>
                <th>Descripción</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="guide-table-name">.${prefix}-aspect</td>
                <td class="guide-table-value">2:3</td>
                <td class="guide-table-description">Ratio por defecto (2:3)</td>
                <td class="guide-preview-cell">
                  <div class="${prefix}-aspect" style="background: var(--${prefix}-color-primary); max-width: 100px;">
                    <div class="${prefix}-aspect-content">
                      <img class="${prefix}-aspect-image" src="assets/introm.jpg" alt="Ejemplo 2:3" />
                    </div>
                  </div>
                </td>
              </tr>
              ${configData.aspectRatios.map(ratio => {
                const { class: className, width, height, description } = ratio;
                const ratioValue = `${width}:${height}`;
                return `<tr>
                <td class="guide-table-name">.${prefix}-${className}</td>
                <td class="guide-table-value">${ratioValue}</td>
                <td class="guide-table-description">${description}</td>
                <td class="guide-preview-cell">
                  <div class="${prefix}-${className}" style="background: var(--${prefix}-color-primary); max-width: 100px;">
                    <div class="${prefix}-aspect-content">
                      <img class="${prefix}-aspect-image" src="assets/introm.jpg" alt="Ejemplo ${ratioValue}" />
                    </div>
                  </div>
                </td>
              </tr>`;
              }).join('\n              ')}
            </tbody>
          </table>
        </div>
        
        <div class="guide-section-title">
          <div> </div>
          <div class="demo-section-2">
            <div>
              <p class="guide-info-box-text mb-64">
                <strong>Ejemplo de uso básico:</strong>
              </p>
              <pre class="guide-code-example"><code>&lt;!-- Para imágenes y videos --&gt;
&lt;div class="${prefix}-aspect-16-9"&gt;
  &lt;div class="${prefix}-aspect-content"&gt;
    &lt;img class="${prefix}-aspect-image" src="imagen.jpg" alt="Imagen" /&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;!-- Para contenido personalizado --&gt;
&lt;div class="${prefix}-aspect-16-9"&gt;
  &lt;div class="${prefix}-aspect-content"&gt;
    &lt;!-- Tu contenido aquí --&gt;
  &lt;/div&gt;
&lt;/div&gt;</code></pre>
              <p class="text-m guide-info-box-text">
                Usa <code>.${prefix}-aspect-content</code> como contenedor principal (position: absolute; inset: 0).
                Usa <code>.${prefix}-aspect-image</code> para imágenes y videos (display: block, object-fit: cover).
              </p>
            </div>
            <div>
              <strong>Ratios comunes:</strong>
              <br>
              <ul class="guide-info-box-list">
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.${prefix}-aspect</code> - Ratio por defecto (2:3)
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.${prefix}-aspect-1-1</code> - Cuadrado perfecto (1:1)
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.${prefix}-aspect-16-9</code> - Widescreen estándar (16:9)
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.${prefix}-aspect-4-3</code> - Formato tradicional (4:3)
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.${prefix}-aspect-9-20</code> - Vertical móvil (9:20)
                </li>
              </ul>
              <p class="text-m guide-info-box-text-small mt-64">
                <strong>Nota:</strong> Los ratios usan la propiedad <code>aspect-ratio</code> nativa de CSS con fallback para navegadores antiguos. 
                Usa <code>.${prefix}-aspect-image</code> para imágenes/videos con <code>object-fit: cover</code> o <code>.${prefix}-aspect-content</code> para contenido personalizado con <code>position: absolute; inset: 0;</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    <div class="guide-section" id="breakpoints">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Breakpoints</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p class="">
        Las clases de tipografía se adaptan automáticamente a cada breakpoint.
        Resize la ventana del navegador para ver los cambios.
      </p> </div>
    <div class="col-xs-12 col-md-12">
    <hr>
    </div>
    </div>
      <div class="guide-section-content">
        <div class="guide-table-wrapper">
          <table class="guide-table">
            <thead>
              <tr>
                <th>Breakpoint</th>
                <th>Min-width</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="guide-table-name">Mobile</td>
                <td class="guide-table-value ${changedValues.has('breakpoints.mobile') ? 'guide-changed' : ''}">
                  ${configData.breakpoints.mobile} 
                  ${configData.breakpoints.mobile.endsWith('px') ? `(${pxToRem(configData.breakpoints.mobile, baseFontSize)})` : ''}
                </td>
              </tr>
              <tr>
                <td class="guide-table-name">Desktop</td>
                <td class="guide-table-value ${changedValues.has('breakpoints.desktop') ? 'guide-changed' : ''}">
                  ${configData.breakpoints.desktop} 
                  ${configData.breakpoints.desktop.endsWith('px') ? `(${pxToRem(configData.breakpoints.desktop, baseFontSize)})` : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ${activeThemes.length > 0 ? `
    <div class="guide-section" id="containers">
    <div class="row mb-120">
    <div class="col-xs-12 col-md-6"> <h2>Containers</h2> </div>
    <div class="col-xs-12 col-md-6 guide-section-description">
      <p>
        Contenedores responsivos ${activeThemes.length === 1 ? 'del tema ' + activeThemes[0].label.replace(/^Tema\s+/, '') : 'de los temas activos'}. Cada container define un <code>max-width</code> y padding adaptativo según breakpoint.
      </p>
    </div>
    <div class="col-xs-12 col-md-12"><hr></div>
    </div>
      <div class="guide-section-content">
        <div class="guide-table-wrapper">
          <table class="guide-table">
            <thead>
              <tr>
                <th>Clase</th>
                <th>Max-width</th>
                <th>Responsive</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="guide-table-name">.container</td>
                <td class="guide-table-value">800px (50rem)</td>
                <td class="guide-table-description">sm: 768px (48rem) / md: 992px (62rem) / lg: 1280px (80rem) / xl: 1440px (90rem)</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 100%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-2</td>
                <td class="guide-table-value">700px (43.75rem)</td>
                <td class="guide-table-description">width: 90%</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 87%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-3</td>
                <td class="guide-table-value">900px (56.25rem)</td>
                <td class="guide-table-description">padding: 60px (3.75rem) → 20px (1.25rem) en sm+</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 95%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-4</td>
                <td class="guide-table-value">360px (22.5rem)</td>
                <td class="guide-table-description">padding: 40px (2.5rem)</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 25%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-5</td>
                <td class="guide-table-value">800px (50rem)</td>
                <td class="guide-table-description">lg+: 1000px (62.5rem), padding: 0</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 70%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-6</td>
                <td class="guide-table-value">442px (27.625rem)</td>
                <td class="guide-table-description">—</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 31%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-7</td>
                <td class="guide-table-value">295px (18.44rem) → 595px (37.19rem)</td>
                <td class="guide-table-description">sm: 460px (28.75rem) / md: 460px (28.75rem) / lg: 595px (37.19rem)</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 42%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-8</td>
                <td class="guide-table-value">395px (24.69rem)</td>
                <td class="guide-table-description">—</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 28%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-9</td>
                <td class="guide-table-value">798px (49.88rem)</td>
                <td class="guide-table-description">padding: 20px (1.25rem)</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 55%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-10</td>
                <td class="guide-table-value">200px (12.5rem)</td>
                <td class="guide-table-description">sin padding, sin margin auto</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 14%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-11</td>
                <td class="guide-table-value">1080px (67.5rem)</td>
                <td class="guide-table-description">padding: 20px (1.25rem)</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 75%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-12</td>
                <td class="guide-table-value">1080px (67.5rem)</td>
                <td class="guide-table-description">padding: 20px (1.25rem), sin margin auto</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 75%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-360</td>
                <td class="guide-table-value">360px (22.5rem)</td>
                <td class="guide-table-description">solo max-width</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 25%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-496</td>
                <td class="guide-table-value">496px (31rem)</td>
                <td class="guide-table-description">solo max-width</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 35%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-512</td>
                <td class="guide-table-value">512px (32rem)</td>
                <td class="guide-table-description">solo max-width</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 36%; border-radius: 4px;"></div></td>
              </tr>
              <tr>
                <td class="guide-table-name">.container-640</td>
                <td class="guide-table-value">640px (40rem)</td>
                <td class="guide-table-description">solo max-width</td>
                <td class="guide-preview-cell"><div style="background: var(--${prefix}-color-primary); height: 8px; width: 45%; border-radius: 4px;"></div></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="guide-section-title">
          <div> </div>
          <div class="demo-section-2">
            <div>
              <p class="guide-info-box-text mb-64">
                <strong>Ejemplo de uso:</strong>
              </p>
              <pre class="guide-code-example"><code>&lt;div class="container"&gt;
  &lt;!-- Contenido centrado, max 800px, responsive --&gt;
&lt;/div&gt;

&lt;div class="container-5"&gt;
  &lt;!-- 800px → 1000px en lg+, sin padding --&gt;
&lt;/div&gt;

&lt;div class="container-11"&gt;
  &lt;!-- 1080px, padding adaptativo mobile/desktop --&gt;
&lt;/div&gt;</code></pre>
              <p class="text-m guide-info-box-text">
                Los containers son parte del tema Black&Yellow. Requieren importar <code>black-yellow.css</code> además de <code>output.css</code>.
              </p>
            </div>
            <div>
              <strong>Tipos de container:</strong>
              <br>
              <ul class="guide-info-box-list">
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.container</code> - Principal, responsive en todos los breakpoints
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.container-7</code> - Progresivo: 295px → 460px → 595px
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.container-9, -11, -12</code> - Padding mobile/desktop adaptativo
                </li>
                <li class="text-m guide-info-box-list-item">
                  <code class="guide-info-box-code-info">.container-360, -496, -512, -640</code> - Solo max-width, sin padding
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
        </div>
  </main>
  <script>
    // Scroll suave y resaltado de sección activa
    const menuItems = document.querySelectorAll('.guide-menu-item');
    const sections = document.querySelectorAll('.guide-section');
    // Funciones para abrir/cerrar sidebar
    function toggleSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
    function closeSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
    // Hacer funciones globales
    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
    // Manejar clic en menú
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const targetId = item.getAttribute('data-section');
        // Si no tiene data-section, es un enlace externo, permitir navegación normal
        if (!targetId) {
          return;
        }
        e.preventDefault();
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          const offset = 80; // Offset para compensar header
          const targetPosition = targetSection.offsetTop - offset;
          // Usar Lenis si está disponible, sino usar scroll nativo
          if (window.lenis) {
            window.lenis.scrollTo(targetSection, { offset: -offset });
          } else {
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
          // Cerrar sidebar después de hacer clic
          closeSidebar();
        }
      });
    });
    // Funcionalidad de búsqueda
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;
    // Función para resaltar texto
    function highlightText(text, searchTerm) {
      if (!searchTerm) return text;
      const escapedTerm = searchTerm.replace(/[.*+?^$()|[\]\\]/g, '\\\\$&');
      const escapedTerm2 = escapedTerm.replace(/{/g, '\\\\{').replace(/}/g, '\\\\}');
      const regex = new RegExp('(' + escapedTerm2 + ')', 'gi');
      return text.replace(regex, '<mark class="guide-search-highlight">$1</mark>');
    }
    // Función para buscar en tablas y grids
    function searchInTables(searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
        // Mostrar todo
        document.querySelectorAll('.guide-section, .guide-table tbody tr, .spacing-helpers-table tbody tr, [style*="grid-template-columns"] > div').forEach(el => {
          el.style.display = '';
        });
        document.querySelectorAll('mark').forEach(mark => {
          const parent = mark.parentNode;
          parent.replaceChild(document.createTextNode(mark.textContent), mark);
          parent.normalize();
        });
        searchResults.style.display = 'none';
        clearSearchBtn.style.display = 'none';
        return;
      }
      const term = searchTerm.toLowerCase().trim();
      let matchCount = 0;
      const matchedSections = new Set();
      // Buscar en todas las tablas
      document.querySelectorAll('.guide-table tbody tr, .spacing-helpers-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        const cells = row.querySelectorAll('td');
        if (text.includes(term)) {
          row.style.display = '';
          matchCount++;
          // Resaltar texto en las celdas
          cells.forEach(cell => {
            const originalText = cell.textContent;
            cell.innerHTML = highlightText(originalText, term);
          });
          // Encontrar la sección padre
          let section = row.closest('.guide-section');
          if (section) {
            matchedSections.add(section.id);
          }
        } else {
          row.style.display = 'none';
        }
      });
      // Buscar en grid de colores
      document.querySelectorAll('[style*="grid-template-columns"] > div').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(term)) {
          card.style.display = '';
          matchCount++;
          // Resaltar texto en la tarjeta
          const textElements = card.querySelectorAll('div');
          textElements.forEach(el => {
            if (el.textContent && !el.style.background) {
              const originalText = el.textContent;
              el.innerHTML = highlightText(originalText, term);
            }
          });
          // Encontrar la sección padre
          let section = card.closest('.guide-section');
          if (section) {
            matchedSections.add(section.id);
          }
        } else {
          card.style.display = 'none';
        }
      });
      // Mostrar/ocultar secciones según si tienen resultados
      document.querySelectorAll('.guide-section').forEach(section => {
        const hasVisibleRows = section.querySelector('tbody tr[style=""]') || 
                              section.querySelector('tbody tr:not([style*="display: none"])') ||
                              section.querySelector('[style*="grid-template-columns"] > div[style=""]') ||
                              section.querySelector('[style*="grid-template-columns"] > div:not([style*="display: none"])');
        if (matchedSections.has(section.id) || hasVisibleRows) {
          section.style.display = '';
        } else {
          section.style.display = 'none';
        }
      });
      // Mostrar contador de resultados
      if (matchCount > 0) {
        searchResults.textContent = 'Se encontraron ' + matchCount + ' resultado' + (matchCount !== 1 ? 's' : '');
        searchResults.style.display = 'block';
      } else {
        searchResults.textContent = 'No se encontraron resultados';
        searchResults.style.display = 'block';
      }
      clearSearchBtn.style.display = 'block';
    }
    // Event listeners para búsqueda
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchInTables(e.target.value);
      }, 200);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInTables('');
      }
    });
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInTables('');
      searchInput.focus();
    });
    // El estilo de focus ya está en CSS (.search-input:focus)
    // Resaltar sección activa al hacer scroll
    function updateActiveSection() {
      const scrollPosition = window.scrollY + 200;
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
              item.classList.add('active');
            }
          });
        }
      });
    }
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('load', updateActiveSection);
    // Cerrar menú al hacer clic fuera en mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.querySelector('.guide-sidebar');
      const menuToggle = document.querySelector('.guide-menu-toggle');
      if (window.innerWidth <= 768 && 
          sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
    // Funcionalidad para copiar al portapapeles
    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true);
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return Promise.resolve(true);
        } catch (err) {
          document.body.removeChild(textArea);
          return Promise.resolve(false);
        }
      }
    }
    function showCopyFeedback(element) {
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = '#d4edda';
      element.style.transition = 'background-color 0.3s';
      setTimeout(() => {
        element.style.backgroundColor = originalBg || '';
        setTimeout(() => {
          element.style.transition = '';
        }, 300);
      }, 500);
    }
    // Funcionalidad para copiar al portapapeles - se ejecuta cuando el DOM está listo
    function setupCopyToClipboard() {
      // Manejar clics en colores
      document.querySelectorAll('.guide-color-card, .guide-color-var-name, .guide-color-value').forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          const copyValue = element.getAttribute('data-copy-value');
          if (copyValue) {
            copyToClipboard(copyValue).then(success => {
              if (success) {
                showCopyFeedback(element);
                // Si es la tarjeta completa, buscar el elemento más visible para el feedback
                if (element.classList.contains('guide-color-card')) {
                  const varNameEl = element.querySelector('.guide-color-var-name');
                  if (varNameEl) showCopyFeedback(varNameEl);
                }
              }
            });
          }
        });
      });
      // Manejar clics en variables
      document.querySelectorAll('.guide-copyable').forEach(element => {
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          const copyValue = element.getAttribute('data-copy-value');
          if (copyValue && copyValue !== '-') {
            copyToClipboard(copyValue).then(success => {
              if (success) {
                showCopyFeedback(element);
              }
            });
          }
        });
      });
    }
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupCopyToClipboard);
    } else {
      setupCopyToClipboard();
    }
  </script>
  <script>
    // Inicializar Lenis Smooth Scroll - Solo para la guía
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // Integrar con el scroll del navegador
    lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      // Puedes agregar callbacks aquí si es necesario
    });
    // Hacer lenis disponible globalmente para el scroll del menú
    window.lenis = lenis;
  </script>
</body>
</html>`;
}
module.exports = {
  generateHTML
};

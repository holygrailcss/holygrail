// Generador de la cabecera de meta y de las tablas de variables del tema.
// Lee el theme.json (cargado por theme-config-loader) y produce HTML para
// inyectar en la demo del tema. Si no hay theme.json o el bloque está vacío,
// devuelve string vacío para mantener la demo limpia.

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Estilos comunes para las tablas del tema. Se inyectan una sola vez.
 */
const SHARED_STYLES = `
        <style>
          .hg-theme-meta {
            margin-bottom: 32px;
            padding: 20px 24px;
            border-left: 4px solid var(--hg-color-primary, #000);
            background: var(--hg-color-bg-light, #f0f0f0);
          }
          .hg-theme-meta h3 { margin: 0 0 4px; font-size: 22px; font-family: arial, sans-serif; }
          .hg-theme-meta .hg-theme-meta-line {
            font-size: 12px; color: var(--hg-color-dark-grey, #737373);
            text-transform: uppercase; letter-spacing: 0.06em;
          }
          .hg-theme-meta p { margin: 12px 0 0; font-size: 14px; line-height: 1.6; }
          .hg-vars-group { margin: 0; }
          .hg-vars-group h4 {
            margin: 0 0 8px; font-family: arial, sans-serif; font-size: 14px;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--hg-color-dark-grey, #737373);
          }
          /* 3 columnas verticales manuales (grid), balanceadas por item count */
          .hg-vars-columns {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 32px;
            font-family: arial, sans-serif;
            font-size: 11px;
            align-items: start;
          }
          @media (max-width: 960px) {
            .hg-vars-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (max-width: 600px) {
            .hg-vars-columns { grid-template-columns: 1fr; }
          }
          .hg-vars-col {
            display: flex;
            flex-direction: column;
            gap: 24px;
            min-width: 0;
          }
          /* Lista de variables dentro del grupo: nombre izquierda, valor derecha */
          .hg-vars-list {
            display: flex;
            flex-direction: column;
          }
          .hg-vars-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 5px 0;
            border-bottom: 1px solid var(--hg-color-middle-grey, #a9a9a9);
            min-width: 0;
          }
          .hg-vars-item .hg-vars-name,
          .hg-vars-item .hg-vars-value {
            display: flex;
            align-items: center;
            min-width: 0;
          }
          .hg-vars-item .hg-vars-name { flex: 1 1 auto; }
          .hg-vars-item .hg-vars-value { flex: 0 0 auto; justify-content: flex-end; text-align: right; }
          .hg-vars-item code {
            background: var(--hg-color-bg-light, #f0f0f0);
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 10.5px;
            line-height: 1.35;
            word-break: break-all;
            white-space: normal;
          }
          .hg-vars-item .hg-vars-name code { color: #000; font-weight: 600; }
          .hg-vars-item .hg-vars-value code { color: #333; }
          .hg-vars-item.is-overridden .hg-vars-name code { color: var(--hg-color-feel-dark, #c94c07); }
          .hg-vars-item .hg-vars-badge {
            display: inline-block;
            margin-left: 6px;
            padding: 1px 5px;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            background: var(--hg-color-feel, #fb9962);
            color: #fff;
            border-radius: 2px;
          }
          .hg-vars-swatch {
            display: inline-block; width: 12px; height: 12px;
            border-radius: 3px; vertical-align: middle;
            margin-left: 6px;
            border: 1px solid var(--hg-color-middle-grey, #a9a9a9);
            flex-shrink: 0;
            order: 2;
          }
          /* Sección de colores semánticos: swatch al final de la fila, 18x18 */
          .hg-vars-group-semantic .hg-vars-swatch {
            width: 18px; height: 18px;
            margin-right: 0;
            margin-left: 8px;
            order: 2;
          }
          .hg-vars-group-semantic .hg-vars-item { padding: 7px 0; }
          .hg-vars-group-semantic .hg-vars-value { gap: 0; }
          .hg-vars-empty { color: var(--hg-color-middle-grey, #a9a9a9); font-style: italic; padding: 12px; }
        </style>`;

/**
 * Cabecera con la meta del tema (nombre, descripción, versión, autor).
 */
function generateThemeMetaHTML(themeData) {
  if (!themeData || !themeData.meta) return '';
  const m = themeData.meta;
  if (!m.displayName && !m.name && !m.description) return '';

  const displayName = m.displayName || m.name || 'Tema';
  const lineParts = [];
  if (m.name) lineParts.push(escapeHtml(m.name));
  if (m.version) lineParts.push(`v${escapeHtml(m.version)}`);
  if (m.author) lineParts.push(escapeHtml(m.author));
  const line = lineParts.join(' · ');

  return `      <div class="hg-theme-meta">
        <div class="hg-theme-meta-line">${line || 'Tema'}</div>
        <h3>${escapeHtml(displayName)}</h3>
        ${m.description ? `<p>${escapeHtml(m.description)}</p>` : ''}
      </div>`;
}

/**
 * Resuelve un valor que puede ser un literal de color (#…, rgb…, hsl…)
 * o una referencia a una variable CSS `var(--hg-color-xxx)`. Devuelve el
 * color final aplicable o null si no se puede resolver.
 */
function resolveColor(value, config, themeData, depth = 0) {
  if (!value || depth > 5) return null;
  if (/^(#|rgb|hsl)/i.test(value)) return value;
  const m = String(value).match(/var\(\s*--hg-color-([\w-]+)\s*\)/);
  if (!m) return null;
  const key = m[1];
  const overrides = (themeData && themeData.tokenOverrides && themeData.tokenOverrides.color) || {};
  const baseColors = (config && config.colors) || {};
  const resolved = Object.prototype.hasOwnProperty.call(overrides, key)
    ? overrides[key]
    : baseColors[key];
  if (!resolved) return null;
  return resolveColor(resolved, config, themeData, depth + 1);
}

function renderRow(name, value, prefix, opts = {}) {
  const fullVar = prefix ? `--${prefix}-${name}` : `--${name}`;
  // Swatch: si el valor es un color literal o un var(--hg-color-*) resoluble, lo mostramos
  const resolvedColor = resolveColor(value, opts.config, opts.themeData);
  const swatch = resolvedColor
    ? `<span class="hg-vars-swatch" style="background:${escapeHtml(resolvedColor)}" title="${escapeHtml(resolvedColor)}"></span>`
    : '';
  const cls = opts.overridden ? ' is-overridden' : '';
  const badge = opts.overridden ? '<span class="hg-vars-badge" title="Sobrescrito por el tema">tema</span>' : '';
  // En la sección de colores semánticos el swatch va AL FINAL de la fila (después del valor).
  // En el resto (componentes…) sigue yendo delante del valor.
  const swatchAtEnd = !!opts.swatchAtEnd;
  const valueHTML = swatchAtEnd
    ? `<code>${escapeHtml(value)}</code>${swatch}`
    : `${swatch}<code>${escapeHtml(value)}</code>`;
  return `              <div class="hg-vars-item${cls}">
                <div class="hg-vars-name"><code>${escapeHtml(fullVar)}</code>${badge}</div>
                <div class="hg-vars-value">${valueHTML}</div>
              </div>`;
}

/**
 * Construye un grupo (título + lista de variables) y devuelve
 * { html, count } para que la distribución en columnas pueda balancear.
 */
function buildGroup(title, entries, prefix, overriddenKeys = new Set(), ctx = {}, extraClass = '', rowOpts = {}) {
  if (!entries || entries.length === 0) return null;
  const rows = entries.map(([name, value]) => {
    return renderRow(name, value, prefix, {
      overridden: overriddenKeys.has(name),
      config: ctx.config,
      themeData: ctx.themeData,
      swatchAtEnd: !!rowOpts.swatchAtEnd
    });
  }).join('\n');
  const cls = extraClass ? ` ${extraClass}` : '';
  const html = `        <div class="hg-vars-group${cls}">
          <h4>${escapeHtml(title)} <span style="color:var(--hg-color-middle-grey, #a9a9a9);font-weight:400;">(${entries.length})</span></h4>
          <div class="hg-vars-list">
${rows}
          </div>
        </div>`;
  return { html, count: entries.length + 1 /* +1 por el header */ };
}

/**
 * Distribuye los grupos en N columnas balanceando el total de items (+header).
 * Algoritmo greedy: cada grupo va a la columna con menor altura acumulada.
 * Preserva el orden original dentro de cada columna.
 * Los grupos con `pinLast: true` se anclan al final de la última columna,
 * independientemente del balance.
 */
function distributeIntoColumns(groups, numCols = 3) {
  const cols = Array.from({ length: numCols }, () => ({ items: [], count: 0 }));
  const pinned = [];
  groups.forEach(g => {
    if (g.pinLast) {
      pinned.push(g);
      return;
    }
    // Encontrar columna con menor count (en caso de empate, la primera)
    let target = cols[0];
    for (let i = 1; i < cols.length; i++) {
      if (cols[i].count < target.count) target = cols[i];
    }
    target.items.push(g.html);
    target.count += g.count;
  });
  // Los grupos "pinLast" van siempre al final de la última columna
  if (pinned.length) {
    const last = cols[cols.length - 1];
    pinned.forEach(g => {
      last.items.push(g.html);
      last.count += g.count;
    });
  }
  return cols.map(c => `      <div class="hg-vars-col">\n${c.items.join('\n')}\n      </div>`).join('\n');
}

/**
 * Sección con todas las variables del tema, agrupadas:
 *   - Colores semánticos (del base, con overrides del tema si hay)
 *   - Spacing overrides → si hay
 *   - Component vars (btn, input, label…)
 *   - Design tokens (border-radius, transition…)
 */
function generateThemeVarsHTML(themeData, config = null) {
  if (!themeData) return '';

  const groups = [];

  const tokenOverrides = themeData.tokenOverrides || {};
  const colorOverrides = tokenOverrides.color || {};
  const tokenSpacing = tokenOverrides.spacing || {};

  // 1) Colores semánticos — base + overrides del tema (si los hay)
  // Se excluyen neutrales/utilitarios (blanco, negro, greys, backgrounds).
  const NON_SEMANTIC_COLORS = new Set([
    'white', 'black',
    'dark-grey', 'middle-grey', 'light-grey', 'grey-ultra',
    'bg-light', 'bg-cream'
  ]);
  const baseColors = (config && config.colors) || {};
  const allColorKeys = new Set([
    ...Object.keys(baseColors),
    ...Object.keys(colorOverrides)
  ]);
  // Filtrar neutrales
  const semanticKeys = Array.from(allColorKeys).filter(k => !NON_SEMANTIC_COLORS.has(k));
  const ctx = { config, themeData };

  // 1) Colores semánticos (al principio). Swatch al final de la fila, 18x18.
  if (semanticKeys.length > 0) {
    const overriddenKeys = new Set(Object.keys(colorOverrides));
    const entries = semanticKeys.map(name => {
      const value = overriddenKeys.has(name) ? colorOverrides[name] : baseColors[name];
      return [name, value];
    });
    const g = buildGroup('Colores semánticos', entries, 'hg-color', overriddenKeys, ctx, 'hg-vars-group-semantic', { swatchAtEnd: true });
    if (g) groups.push(g);
  }

  // 2) Spacing overrides (si hay)
  if (Object.keys(tokenSpacing).length) {
    const g = buildGroup('Spacing overrides', Object.entries(tokenSpacing), 'hg-spacing', new Set(), ctx, '', { swatchAtEnd: true });
    if (g) groups.push(g);
  }

  // 3) Component vars (btn, input, label…)
  const componentVars = themeData.componentVars || {};
  Object.entries(componentVars).forEach(([component, vars]) => {
    const g = buildGroup(`Componente: ${component}`, Object.entries(vars), component, new Set(), ctx, '', { swatchAtEnd: true });
    if (g) groups.push(g);
  });

  // 4) Design tokens (sin prefijo)
  const design = themeData.design || {};
  if (Object.keys(design).length) {
    const g = buildGroup('Design tokens', Object.entries(design), '', new Set(), ctx, '', { swatchAtEnd: true });
    if (g) groups.push(g);
  }

  if (groups.length === 0) {
    return `      <section class="demo-section" id="theme-vars">
        <h2 class="demo-title">Variables del tema</h2>
        <p class="hg-vars-empty">El theme.json no define variables. Añade <code>componentVars</code>, <code>tokenOverrides</code> o <code>design</code> para verlos aquí.</p>
      </section>`;
  }

  const columnsHTML = distributeIntoColumns(groups, 3);

  return `      <section class="demo-section" id="theme-vars">
        <h2 class="demo-title">Variables del tema</h2>
        <p class="mb-24">
          Definidas en <code>themes/${escapeHtml(themeData.meta?.name || 'black-yellow')}/theme.json</code>. La fuente del CSS sigue siendo
          <code>themes/${escapeHtml(themeData.meta?.name || 'black-yellow')}/_variables.css</code>; este JSON sirve como manifiesto del tema y para que
          la demo muestre tablas siempre coherentes con sus tokens.
        </p>
        <div class="hg-vars-columns">
${columnsHTML}
        </div>
      </section>`;
}

/**
 * Bloque combinado: meta + sección variables. Devuelve string vacío si no hay datos.
 * Incluye los estilos compartidos en la primera invocación.
 */
function generateThemeBlockHTML(themeData, config = null) {
  if (!themeData) return '';
  const meta = generateThemeMetaHTML(themeData);
  const vars = generateThemeVarsHTML(themeData, config);
  if (!meta && !vars) return '';
  return `${SHARED_STYLES}
${meta}
${vars}`;
}

module.exports = {
  generateThemeMetaHTML,
  generateThemeVarsHTML,
  generateThemeBlockHTML
};

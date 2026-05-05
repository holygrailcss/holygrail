/**
 * Skills Page Generator
 * Lee los SKILL.md de skills/ y genera dist/skills.html
 */

const fs = require('fs');
const path = require('path');
const { resolveActiveThemes } = require('../generators/utils');

// Fallback usado cuando el llamador NO inyecta un config (p. ej. CLI
// standalone `node src/build/skills-generator.js`). Permite seguir
// generando skills.html con los temas históricos aunque falte el config
// activo. Si el BuildOrchestrator llama a `generateSkillsPage(root, config)`,
// este fallback queda ignorado y se usa la lista real de temas activos.
const FALLBACK_THEMES_IN_NAV = [
  { name: 'black-yellow', label: 'Tema Black&Yellow' },
  { name: 'limited', label: 'Tema Limited' }
];

/**
 * Parsea Markdown básico a HTML
 */
function mdToHtml(md) {
  let html = '';
  const lines = md.split('\n');
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer = [];
  let inList = false;
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length > 0) {
      html += '<ul class="sk-md-list">\n' + listBuffer.join('\n') + '\n</ul>\n';
      listBuffer = [];
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const escaped = codeBuffer.join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html += `<div class="sk-code-block"><code>${escaped}</code></div>\n`;
        inCodeBlock = false;
        codeBuffer = [];
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Skip h1 (already used as title)
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;

    // h2
    if (line.startsWith('## ')) {
      flushList();
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      html += `<h3 class="sk-md-h2" id="${id}">${text}</h3>\n`;
      continue;
    }

    // h3
    if (line.startsWith('### ')) {
      flushList();
      const text = line.slice(4).trim();
      html += `<h4 class="sk-md-h3">${text}</h4>\n`;
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList();
      // Collect all table lines
      const tableLines = [line];
      while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].trim().startsWith('|')) {
        i++;
        tableLines.push(lines[i]);
      }
      html += parseTable(tableLines);
      continue;
    }

    // Unordered list
    if (/^(\s*)[-*]\s/.test(line)) {
      const text = line.replace(/^\s*[-*]\s+/, '');
      listBuffer.push(`  <li>${inlineFormat(text)}</li>`);
      inList = true;
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s/.test(line)) {
      const text = line.replace(/^\s*\d+\.\s+/, '');
      if (!inList) {
        flushList(); // flush any ul
      }
      listBuffer.push(`  <li>${inlineFormat(text)}</li>`);
      inList = true;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    html += `<p class="sk-md-p">${inlineFormat(line)}</p>\n`;
  }

  flushList();
  return html;
}

/**
 * Inline formatting: bold, italic, code, links
 */
function inlineFormat(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="sk-inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/**
 * Parse markdown table to HTML
 */
function parseTable(lines) {
  // Filter out separator line (|---|---|)
  const dataLines = lines.filter(l => !/^\|[\s-:|]+\|$/.test(l.trim()));
  if (dataLines.length === 0) return '';

  let html = '<div class="sk-table-wrap"><table class="sk-md-table">\n';

  dataLines.forEach((line, idx) => {
    const cells = line.split('|').filter(c => c.trim() !== '');
    const tag = idx === 0 ? 'th' : 'td';
    const rowTag = idx === 0 ? 'thead' : (idx === 1 ? 'tbody' : '');

    if (idx === 0) html += '<thead>\n';
    if (idx === 1) html += '<tbody>\n';

    html += '<tr>';
    cells.forEach(cell => {
      html += `<${tag}>${inlineFormat(cell.trim())}</${tag}>`;
    });
    html += '</tr>\n';

    if (idx === 0) html += '</thead>\n';
  });

  html += '</tbody>\n</table></div>\n';
  return html;
}

/**
 * Extract first line after # as title, and first paragraph as description
 */
function extractMeta(md) {
  const lines = md.split('\n');
  let title = '';
  let description = '';

  for (const line of lines) {
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      title = line.slice(2).trim();
      // Remove "holygrailcss — " prefix if present
      title = title.replace(/^holygrailcss\s*[—–-]\s*/i, '');
      continue;
    }
    if (title && line.trim() && !line.startsWith('#') && !line.startsWith('```') && !description) {
      description = line.trim();
      break;
    }
  }

  return { title, description };
}

/**
 * Extract h2 sections for TOC
 */
function extractSections(md) {
  const sections = [];
  for (const line of md.split('\n')) {
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      sections.push({ text, id });
    }
  }
  return sections;
}

/**
 * Main generator
 *
 * @param {string} projectRoot - Raíz del proyecto (donde vive skills/).
 * @param {Object} [configData] - config.json ya cargado. Si se pasa,
 *   los enlaces a demos en la nav de skills.html se construyen a partir
 *   de los temas realmente activos (`config.themes[]` o `config.theme`),
 *   evitando enlazar a ficheros `black-yellow-demo.html` / `limited-demo.html`
 *   que quizá no existan en dist/. Si se omite, se usa el fallback
 *   histórico con Black&Yellow + Limited para no romper ejecuciones standalone.
 */
function generateSkillsPage(projectRoot, configData = null) {
  const skillsDir = path.join(projectRoot, 'skills');

  if (!fs.existsSync(skillsDir)) {
    console.warn('⚠️  No se encontró carpeta skills/');
    return null;
  }

  // Only load developer-guide skill
  const devGuidePath = path.join(skillsDir, 'developer-guide', 'SKILL.md');
  if (!fs.existsSync(devGuidePath)) {
    console.warn('⚠️  No se encontró skills/developer-guide/SKILL.md');
    return null;
  }

  const md = fs.readFileSync(devGuidePath, 'utf-8');
  const { title, description } = extractMeta(md);
  const sections = extractSections(md);
  const htmlContent = mdToHtml(md);

  const devGuide = {
    id: 'developer-guide',
    num: '01',
    title,
    description,
    sections,
    htmlContent,
    raw: md
  };

  // Resolver temas activos para la nav. Si el llamador no pasó un
  // config, usamos el fallback estático.
  const activeThemes = configData
    ? resolveActiveThemes(configData)
    : FALLBACK_THEMES_IN_NAV;

  // Generate HTML
  const html = buildPage(devGuide, activeThemes);
  return html;
}

function buildPage(skill, activeThemes = FALLBACK_THEMES_IN_NAV) {
  // Nav de temas construida dinámicamente a partir de la lista activa.
  // Se respeta el orden definido en config.themes[].
  const themeNavLinks = (activeThemes && activeThemes.length > 0
    ? activeThemes
    : FALLBACK_THEMES_IN_NAV
  )
    .map(t => `      <a href="themes/${t.name}-demo.html">${t.label}</a>`)
    .join('\n');
  const toc = skill.sections.map(sec =>
    `<a href="#${sec.id}" class="sk-toc-link">${sec.text}</a>`
  ).join('\n          ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>holygrailcss — Developer Guide</title>
  <link href="https://fonts.googleapis.com" rel="preconnect">
  <link href="https://fonts.gstatic.com" rel="preconnect" crossorigin="anonymous">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Instrument+Sans:regular,100,500,600,700" media="all">
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>
  <link rel="stylesheet" href="output.css">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Instrument Sans', sans-serif !important;
      background: #fff;
      color: #111;
      -webkit-font-smoothing: antialiased;
    }

    /* ── HEADER (unified nav) ── */
    .guide-header {
      position: sticky; top: 0; z-index: 50;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      padding: 0 2rem; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .guide-logo {
      font-size: 14px; font-weight: 300; text-transform: uppercase;
      line-height: 1; border: 1px solid #000;
      padding: 4px 8px; border-radius: 8px;
      text-decoration: none; color: #000; width: max-content;
    }
    .guide-nav { display: flex; gap: 1.5rem; align-items: center; }
    .guide-nav a {
      font-family: var(--hg-typo-font-family-primary-regular);
      font-size: 13px; color: #666; text-decoration: none;
      transition: color 0.2s; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .guide-nav a:hover { color: #000; }
    .guide-nav a.active { color: #000; font-weight: 600; }

    /* ── HERO ── */
    .sk-hero { padding: 6rem 2rem 4rem; max-width: 960px; margin: 0 auto; }
    .sk-hero-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #999; margin-bottom: 1rem; }
    .sk-hero h1 { font-size: clamp(36px, 6vw, 64px); font-weight: 500; line-height: 1.1; color: #000; margin-bottom: 1.5rem; }
    .sk-hero-desc { font-size: 18px; line-height: 1.6; color: #666; max-width: 640px; }
    .sk-download-btn {
      display: inline-flex; align-items: center; gap: 8px;
      margin-top: 1.5rem; padding: 10px 20px;
      font-size: 13px; font-weight: 600; color: #000;
      background: #fff; border: 1px solid #000; border-radius: 8px;
      text-decoration: none; transition: background 0.2s, color 0.2s;
    }
    .sk-download-btn:hover { background: #000; color: #fff; }
    .sk-download-btn svg { flex-shrink: 0; }

    /* ── PAGE TOC ── */
    .sk-page-toc {
      max-width: 960px; margin: 0 auto; padding: 0 2rem 2rem;
    }
    .sk-page-toc-inner {
      display: flex; flex-wrap: wrap; gap: 8px;
      padding: 1.25rem 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    .sk-toc-link {
      font-size: 12px; padding: 4px 12px; background: #f5f5f5;
      border-radius: 100px; color: #555; text-decoration: none;
      transition: background 0.2s;
    }
    .sk-toc-link:hover { background: #eee; color: #111; }

    /* ── SKILL SECTIONS ── */
    .sk-skills-list { max-width: 960px; margin: 0 auto; padding: 0 2rem 4rem; }
    .sk-skill { padding: 2rem 0; }

    /* ── MARKDOWN RENDERED ── */
    .sk-skill-body { max-width: 720px; }
    .sk-md-h2 {
      font-size: 20px; font-weight: 600; color: #111;
      margin: 2.5rem 0 0.75rem; padding-top: 1.5rem;
      border-top: 1px solid #f0f0f0;
    }
    .sk-md-h2:first-child { border-top: none; margin-top: 0; padding-top: 0; }
    .sk-md-h3 { font-size: 16px; font-weight: 600; color: #333; margin: 1.5rem 0 0.5rem; }
    .sk-md-p { font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 0.75rem; }
    .sk-md-list {
      list-style: none; padding: 0; margin: 0 0 1rem 0;
    }
    .sk-md-list li {
      font-size: 14px; color: #444; padding: 0.4rem 0;
      border-bottom: 1px solid #f8f8f8;
      display: flex; gap: 0.5rem; align-items: baseline;
    }
    .sk-md-list li::before { content: '→'; color: #ccc; flex-shrink: 0; }
    .sk-inline-code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
      font-size: 0.88em; background: #f3f3f3; padding: 2px 6px;
      border-radius: 4px; color: #333;
    }

    .sk-code-block {
      background: #1a1a1a; border-radius: 10px;
      padding: 1.25rem 1.5rem; overflow-x: auto;
      margin: 0.75rem 0 1.25rem;
    }
    .sk-code-block code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
      font-size: 13px; line-height: 1.7; color: #d4d4d4;
      white-space: pre;
    }

    .sk-table-wrap { overflow-x: auto; margin: 0.75rem 0 1.25rem; }
    .sk-md-table {
      width: 100%; border-collapse: collapse; font-size: 13px;
    }
    .sk-md-table th {
      text-align: left; padding: 8px 12px; background: #f5f5f5;
      font-weight: 600; color: #333; border-bottom: 2px solid #e0e0e0;
    }
    .sk-md-table td {
      padding: 6px 12px; border-bottom: 1px solid #f0f0f0; color: #444;
    }
    .sk-md-table tr:hover td { background: #fafafa; }

    /* ── FOOTER ── */
    .sk-footer { border-top: 1px solid #eee; padding: 2rem; text-align: center; }
    .sk-footer p { font-size: 12px; color: #999; }
    .sk-footer a { color: #666; text-decoration: none; }
    .sk-footer a:hover { color: #000; }

    .sk-separator { max-width: 960px; margin: 0 auto; padding: 0 2rem; }
    .sk-separator hr { border: none; border-top: 1px solid #eee; }
  </style>
</head>
<body>

  <div class="guide-header">
    <a href="index.html" class="guide-logo" style="text-decoration:none;">holygrailcss</a>
    <nav class="guide-nav">
      <a href="index.html">Guía</a>
      <a href="componentes.html">Componentes</a>
${themeNavLinks}
      <a href="skills.html" class="active">Skills</a>
    </nav>
  </div>

  <section class="sk-hero">
    <p class="sk-hero-label">Developer Guide</p>
    <h1>${skill.title}</h1>
    <p class="sk-hero-desc">${skill.description}</p>
    <a href="developer-guide.md" download class="sk-download-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Descargar holygrailcss Skill
    </a>
  </section>

  <nav class="sk-page-toc">
    <div class="sk-page-toc-inner">
      ${toc}
    </div>
  </nav>

  <section class="sk-skills-list">
    <article class="sk-skill" id="skill-${skill.id}">
      <div class="sk-skill-body">
        ${skill.htmlContent}
      </div>
    </article>
  </section>

  <footer class="sk-footer">
    <p>
      holygrailcss —
      <a href="https://github.com/holygrailcss/holygrail" target="_blank">GitHub</a> ·
      <a href="https://www.npmjs.com/package/holygrailcss" target="_blank">npm</a> ·
      <a href="index.html">Guía</a>
    </p>
  </footer>

  <script>
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  </script>

</body>
</html>`;
}

// CLI usage
if (require.main === module) {
  const projectRoot = path.join(__dirname, '..', '..');
  const html = generateSkillsPage(projectRoot);
  if (html) {
    const outputPath = path.join(projectRoot, 'dist', 'skills.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    // Copiar SKILL.md a dist para descarga
    const mdSrc = path.join(projectRoot, 'skills', 'developer-guide', 'SKILL.md');
    const mdDest = path.join(projectRoot, 'dist', 'developer-guide.md');
    if (fs.existsSync(mdSrc)) {
      fs.copyFileSync(mdSrc, mdDest);
    }
    console.log('✅ skills.html generado en dist/');
  }
}

module.exports = { generateSkillsPage };

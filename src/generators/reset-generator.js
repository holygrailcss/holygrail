// Generador de Reset CSS
// Genera el reset CSS mínimo necesario para que todo funcione correctamente

/**
 * Genera el reset CSS mínimo necesario
 * Establece el tamaño de fuente base del HTML para que los rem funcionen
 * @param {number} baseFontSize - Tamaño base de fuente en pixels
 * @returns {string} CSS del reset
 */
function generateResetCSS(baseFontSize = 16) {
  return `/* Reset CSS Mínimo */
html {
  box-sizing: border-box;
  font-size: ${baseFontSize}px;
}

@media (prefers-reduced-motion: no-preference) {
  html {
    interpolate-size: allow-keywords;
  }
}

*,
*:before,
*:after {
  box-sizing: inherit;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
}

* {
  margin: 0;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  line-height: calc(1em + 0.5rem);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

ol,
ul,
dl {
  list-style: none;
  padding-inline-start: unset;
}

img, picture, video, canvas, svg {
  display: inline-block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
`;
}

module.exports = {
  generateResetCSS
};


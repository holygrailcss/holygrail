// Tests para generador de guía HTML

const { generateHTML } = require('../src/docs-generator/html-generator');
const { loadConfig } = require('../src/config-loader');

console.log('🧪 Ejecutando tests de generador de guía...\n');

try {
  const config = loadConfig();
  
  // Test generateHTML
  console.log('Test generateHTML:');
  const html = generateHTML(config);
  
  const hasDoctype = html.includes('<!DOCTYPE html>');
  const hasTitle = html.includes('holygrailcss');
  const hasTable = html.includes('<table');
  const hasFontFamilies = html.includes('Font Families');
  const hasTypographyClasses = html.includes('Clases de Tipografía');
  const hasVariables = html.includes('Variables CSS Compartidas');
  const hasBreakpoints = html.includes('Breakpoints');
  const hasCSSLink = html.includes('output.css');
  
  console.log('  - Incluye DOCTYPE:', hasDoctype ? '✅' : '❌');
  console.log('  - Incluye título:', hasTitle ? '✅' : '❌');
  console.log('  - Incluye tablas:', hasTable ? '✅' : '❌');
  console.log('  - Incluye Font Families:', hasFontFamilies ? '✅' : '❌');
  console.log('  - Incluye Clases de Tipografía:', hasTypographyClasses ? '✅' : '❌');
  console.log('  - Incluye Variables CSS:', hasVariables ? '✅' : '❌');
  console.log('  - Incluye Breakpoints:', hasBreakpoints ? '✅' : '❌');
  console.log('  - Incluye link a CSS:', hasCSSLink ? '✅' : '❌');
  console.log('  - Longitud HTML:', html.length, 'caracteres');
  
} catch (error) {
  console.log('❌ Error en tests de guía:', error.message);
}

console.log('\n✅ Tests de guía completados!\n');


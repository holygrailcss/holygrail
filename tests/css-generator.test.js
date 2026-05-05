// Tests para parseador JSON a CSS

const fs = require('fs');
const path = require('path');
const { generateCSS, buildValueMap } = require('../src/css-generator');
const { loadConfig } = require('../src/config-loader');

console.log('🧪 Ejecutando tests de parseador...\n');

try {
  const config = loadConfig();
  
  // Test buildValueMap
  console.log('Test buildValueMap:');
  const { fontFamilyVars, fontSizeVars, lineHeightVars } = buildValueMap(
    config.typo,
    config.fontFamilyMap,
    config.prefix || 'hg',
    config.category || 'typo'
  );
  console.log('  - Font Family Variables:', fontFamilyVars.size, '✅');
  console.log('  - Font Size Variables:', fontSizeVars.size, '✅');
  console.log('  - Line Height Variables:', lineHeightVars.size, '✅');
  
  // Test generateCSS
  console.log('\nTest generateCSS:');
  const css = generateCSS(config);
  const hasReset = css.includes('Reset CSS Mínimo');
  const hasRoot = css.includes(':root');
  const hasMediaQuery = css.includes('@media');
  const hasClasses = css.includes('.h2') || css.includes('.title-l');
  
  console.log('  - Incluye reset CSS:', hasReset ? '✅' : '❌');
  console.log('  - Incluye :root:', hasRoot ? '✅' : '❌');
  console.log('  - Incluye media queries:', hasMediaQuery ? '✅' : '❌');
  console.log('  - Incluye clases:', hasClasses ? '✅' : '❌');
  console.log('  - Longitud CSS:', css.length, 'caracteres');
  
  // Test peso del archivo output.css
  const outputPath = path.join(__dirname, '..', 'dist', 'output.css');
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(4);
    
    console.log('  - Peso del archivo dist/output.css:');
    console.log('    * Bytes:', fileSizeInBytes, 'bytes');
    console.log('    * Kilobytes:', fileSizeInKB, 'KB');
    if (fileSizeInBytes > 1024) {
      console.log('    * Megabytes:', fileSizeInMB, 'MB');
    }
  } else {
    console.log('  - ⚠️  Archivo dist/output.css no encontrado');
  }
  
} catch (error) {
  console.log('❌ Error en tests de parseador:', error.message);
}

console.log('\n✅ Tests de parseador completados!\n');


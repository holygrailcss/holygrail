// Tests para el generador de aspect ratios

const { generateAspectRatios } = require('../src/generators/ratio-generator');

console.log('\n🧪 Tests de Generador de Aspect Ratios\n');

// Test 1: Genera CSS para ratios básicos
const testRatios = [
  {
    class: 'aspect-1-1',
    width: 1,
    height: 1,
    description: 'Ratio 1:1 (cuadrado)'
  },
  {
    class: 'aspect-16-9',
    width: 16,
    height: 9,
    description: 'Ratio 16:9 (widescreen)'
  }
];

const css = generateAspectRatios(testRatios, 'hg');

// Test 2: Verifica que se incluya la clase hg-aspect-content
const test2 = css.includes('.hg-aspect-content {') && 
              css.includes('position: absolute;') &&
              css.includes('inset: 0;');
console.log(`✅ Test 1: Clase hg-aspect-content generada: ${test2 ? '✅' : '❌'}`);

// Test 2.5: Verifica que se incluya la clase hg-aspect-image
const test2b = css.includes('.hg-aspect-image {') && 
               css.includes('display: block;') &&
               css.includes('height: 100%;') &&
               css.includes('width: 100%;') &&
               css.includes('object-fit: cover;') &&
               css.includes('color: transparent;');
console.log(`✅ Test 1.5: Clase hg-aspect-image generada: ${test2b ? '✅' : '❌'}`);

// Test 3: Verifica que se incluya la clase genérica hg-aspect (ratio 2:3)
const test3 = css.includes('.hg-aspect {') && 
              css.includes('aspect-ratio: 2 / 3;');
console.log(`✅ Test 2: Clase genérica hg-aspect (2:3) generada: ${test3 ? '✅' : '❌'}`);

// Test 4: Verifica que se incluyan las clases de ratio
const test4 = css.includes('.hg-aspect-1-1 {') && 
              css.includes('aspect-ratio: 1 / 1;');
console.log(`✅ Test 3: Clase aspect-1-1 generada: ${test4 ? '✅' : '❌'}`);

const test5 = css.includes('.hg-aspect-16-9 {') && 
              css.includes('aspect-ratio: 16 / 9;');
console.log(`✅ Test 4: Clase aspect-16-9 generada: ${test5 ? '✅' : '❌'}`);

// Test 5: Verifica que se incluya el fallback
const test6 = css.includes('@supports not (aspect-ratio:') && 
              css.includes('padding-top:');
console.log(`✅ Test 5: Fallback para navegadores antiguos generado: ${test6 ? '✅' : '❌'}`);

// Test 6: Verifica que se incluyan los comentarios descriptivos
const test7 = css.includes('/* Ratio 1:1 (cuadrado) */') && 
              css.includes('/* Ratio 16:9 (widescreen) */');
console.log(`✅ Test 6: Comentarios descriptivos incluidos: ${test7 ? '✅' : '❌'}`);

// Test 7: Retorna string vacío con entrada inválida
const emptyCSS1 = generateAspectRatios(null, 'hg');
const emptyCSS2 = generateAspectRatios(undefined, 'hg');
const emptyCSS3 = generateAspectRatios({}, 'hg');
const test8 = emptyCSS1 === '' && emptyCSS2 === '' && emptyCSS3 === '';
console.log(`✅ Test 7: Retorna string vacío con entrada inválida: ${test8 ? '✅' : '❌'}`);

// Test 8: Calcula correctamente el padding-top para fallback (ratio genérico 2:3)
const test9 = css.includes('padding-top: 150.0000%;'); // 2:3 = 150%
console.log(`✅ Test 8: Calcula padding-top correctamente (2:3 = 150%): ${test9 ? '✅' : '❌'}`);

// Test 9: Calcula correctamente el padding-top para fallback (1:1)
const test10 = css.includes('padding-top: 100.0000%;'); // 1:1 = 100%
console.log(`✅ Test 9: Calcula padding-top correctamente (1:1 = 100%): ${test10 ? '✅' : '❌'}`);

const test11 = css.includes('padding-top: 56.2500%;'); // 16:9 = 56.25%
console.log(`✅ Test 10: Calcula padding-top correctamente (16:9 = 56.25%): ${test11 ? '✅' : '❌'}`);

// Resumen
const allTests = [test2, test2b, test3, test4, test5, test6, test7, test8, test9, test10, test11];
const passed = allTests.filter(t => t).length;
const failed = allTests.length - passed;

console.log(`\n📊 Resumen Ratio Generator: ${passed} pasados, ${failed} fallidos\n`);

if (failed > 0) {
  console.log('❌ Algunos tests fallaron\n');
  process.exit(1);
}

console.log('✅ Tests de generador de aspect ratios completados!\n');

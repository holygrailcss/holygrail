// Tests para utilidades

const { toKebabCase, pxToRem, remToPx, getFontFamilyName } = require('../src/generators/utils');

// Tests básicos
console.log('🧪 Ejecutando tests de utilidades...\n');

// Test toKebabCase
console.log('Test toKebabCase:');
console.log('  "fontSize" ->', toKebabCase('fontSize'), toKebabCase('fontSize') === 'font-size' ? '✅' : '❌');
console.log('  "lineHeight" ->', toKebabCase('lineHeight'), toKebabCase('lineHeight') === 'line-height' ? '✅' : '❌');

// Test pxToRem
console.log('\nTest pxToRem:');
console.log('  "16px" ->', pxToRem('16px', 16), pxToRem('16px', 16) === '1rem' ? '✅' : '❌');
console.log('  "24px" ->', pxToRem('24px', 16), pxToRem('24px', 16) === '1.5rem' ? '✅' : '❌');
console.log('  "18px" ->', pxToRem('18px', 16), pxToRem('18px', 16) === '1.125rem' ? '✅' : '❌');

// Test remToPx
console.log('\nTest remToPx:');
console.log('  "1rem" ->', remToPx('1rem', 16), remToPx('1rem', 16) === '16px' ? '✅' : '❌');
console.log('  "1.5rem" ->', remToPx('1.5rem', 16), remToPx('1.5rem', 16) === '24px' ? '✅' : '❌');

// Test getFontFamilyName
console.log('\nTest getFontFamilyName:');
const fontFamilyMap = {
  primary: 'arial, sans-serif',
  secondary: '"ms-serif", serif'
};
console.log('  "arial, sans-serif" ->', getFontFamilyName('arial, sans-serif', fontFamilyMap), getFontFamilyName('arial, sans-serif', fontFamilyMap) === 'primary' ? '✅' : '❌');
console.log('  "Helvetica" ->', getFontFamilyName('Helvetica', fontFamilyMap), getFontFamilyName('Helvetica', fontFamilyMap) === 'helvetica' ? '✅' : '❌');

console.log('\n✅ Tests de utilidades completados!\n');


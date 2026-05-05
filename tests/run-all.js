#!/usr/bin/env node

// Ejecutar todos los tests

console.log('🚀 Ejecutando todos los tests...\n');
console.log('='.repeat(50) + '\n');

// Tests originales
require('./helpers.test');
require('./config-loader.test');
require('./css-generator.test');
require('./html-generator.test');
require('./ratio-generator.test');

// Tests de módulos de build
const { testAssetManager } = require('./asset-manager.test');
const { testThemeTransformer } = require('./theme-transformer.test');
const { testBuildOrchestrator } = require('./build-orchestrator.test');

// Ejecutar tests de build
const assetManagerResults = testAssetManager();
const themeTransformerResults = testThemeTransformer();
const buildOrchestratorResults = testBuildOrchestrator();

// Calcular totales
const totalPassed = assetManagerResults.passed + themeTransformerResults.passed + buildOrchestratorResults.passed;
const totalFailed = assetManagerResults.failed + themeTransformerResults.failed + buildOrchestratorResults.failed;

console.log('='.repeat(50));
console.log(`\n📊 Resumen Total de Tests de Build:`);
console.log(`   ✅ Pasados: ${totalPassed}`);
console.log(`   ❌ Fallidos: ${totalFailed}`);
console.log(`   📈 Total: ${totalPassed + totalFailed}\n`);

if (totalFailed === 0) {
  console.log('✅ Todos los tests completados exitosamente!\n');
} else {
  console.log(`⚠️  ${totalFailed} test(s) fallaron. Revisa los errores arriba.\n`);
  process.exit(1);
}


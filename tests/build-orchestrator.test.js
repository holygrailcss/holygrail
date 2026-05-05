// Tests para BuildOrchestrator

const { BuildOrchestrator } = require('../src/build/build-orchestrator');
const path = require('path');
const fs = require('fs');

function testBuildOrchestrator() {
  console.log('\n🧪 Tests de BuildOrchestrator\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Instanciar BuildOrchestrator
  try {
    const orchestrator = new BuildOrchestrator({
      projectRoot: path.join(__dirname, '..'),
      silent: true,
      watchMode: false
    });
    
    if (orchestrator && orchestrator.projectRoot && orchestrator.assetManager && orchestrator.themeTransformer) {
      console.log('✅ Test 1: Instanciar BuildOrchestrator');
      passedTests++;
    } else {
      throw new Error('Propiedades faltantes en BuildOrchestrator');
    }
  } catch (error) {
    console.log('❌ Test 1: Error al instanciar BuildOrchestrator:', error.message);
    failedTests++;
  }

  // Test 2: Verificar rutas por defecto
  try {
    const orchestrator = new BuildOrchestrator();
    const projectRoot = path.join(__dirname, '..', '..');
    
    if (orchestrator.configPath.includes('config.json') &&
        orchestrator.outputPath.includes('output.css') &&
        orchestrator.htmlPath.includes('index.html')) {
      console.log('✅ Test 2: Rutas por defecto correctas');
      passedTests++;
    } else {
      throw new Error('Rutas por defecto incorrectas');
    }
  } catch (error) {
    console.log('❌ Test 2: Error en rutas por defecto:', error.message);
    failedTests++;
  }

  // Test 3: Método adjustHTMLPaths sin timestamp
  try {
    const orchestrator = new BuildOrchestrator({
      projectRoot: path.join(__dirname, '..'),
      outputPath: path.join(__dirname, '..', 'dist', 'output.css'),
      htmlPath: path.join(__dirname, '..', 'dist', 'index.html'),
      silent: true
    });
    
    const htmlContent = '<link rel="stylesheet" href="output.css">';
    const adjusted = orchestrator.adjustHTMLPaths(htmlContent, false);
    
    if (adjusted.includes('output.css') && !adjusted.includes('?v=')) {
      console.log('✅ Test 3: adjustHTMLPaths sin timestamp');
      passedTests++;
    } else {
      throw new Error('adjustHTMLPaths no funcionó correctamente');
    }
  } catch (error) {
    console.log('❌ Test 3: Error en adjustHTMLPaths:', error.message);
    failedTests++;
  }

  // Test 4: Método adjustHTMLPaths con timestamp
  try {
    const orchestrator = new BuildOrchestrator({
      projectRoot: path.join(__dirname, '..'),
      outputPath: path.join(__dirname, '..', 'dist', 'output.css'),
      htmlPath: path.join(__dirname, '..', 'dist', 'index.html'),
      silent: true
    });
    
    const htmlContent = '<link rel="stylesheet" href="output.css">';
    const adjusted = orchestrator.adjustHTMLPaths(htmlContent, true);
    
    if (adjusted.includes('output.css?v=')) {
      console.log('✅ Test 4: adjustHTMLPaths con timestamp');
      passedTests++;
    } else {
      throw new Error('Timestamp no agregado correctamente');
    }
  } catch (error) {
    console.log('❌ Test 4: Error en adjustHTMLPaths con timestamp:', error.message);
    failedTests++;
  }

  // Test 5: Ejecutar build completo (solo si config.json existe)
  try {
    const projectRoot = path.join(__dirname, '..');
    const configPath = path.join(projectRoot, 'config.json');
    
    if (fs.existsSync(configPath)) {
      const orchestrator = new BuildOrchestrator({
        projectRoot,
        configPath,
        outputPath: path.join(projectRoot, 'dist', 'output.css'),
        htmlPath: path.join(projectRoot, 'dist', 'index.html'),
        silent: true,
        watchMode: false
      });
      
      const result = orchestrator.build();
      
      if (result.success && result.css && result.html) {
        console.log('✅ Test 5: Ejecutar build completo');
        passedTests++;
      } else {
        throw new Error('Build no completado exitosamente');
      }
    } else {
      console.log('⚠️  Test 5: Saltado (config.json no encontrado)');
    }
  } catch (error) {
    console.log('❌ Test 5: Error al ejecutar build:', error.message);
    failedTests++;
  }

  // Resumen
  console.log(`\n📊 Resumen BuildOrchestrator: ${passedTests} pasados, ${failedTests} fallidos\n`);
  
  return { passed: passedTests, failed: failedTests };
}

// Exportar para run-all.js
module.exports = { testBuildOrchestrator };

// Ejecutar si se llama directamente
if (require.main === module) {
  testBuildOrchestrator();
}


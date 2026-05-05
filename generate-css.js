#!/usr/bin/env node

// Orquestador principal - Genera CSS y HTML desde JSON
// Refactorizado para usar BuildOrchestrator

const path = require('path');
const { BuildOrchestrator } = require('./src/build/build-orchestrator');

// Ejecución principal
if (require.main === module) {
  try {
    // Parsear argumentos de línea de comandos
    const args = process.argv.slice(2);
    const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1] || path.join(__dirname, 'config.json');
    const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || path.join(__dirname, 'dist', 'output.css');
    const htmlPath = args.find(arg => arg.startsWith('--html='))?.split('=')[1] || path.join(__dirname, 'dist', 'index.html');
    
    // Crear orquestador y ejecutar build
    const orchestrator = new BuildOrchestrator({
      projectRoot: __dirname,
      configPath,
      outputPath,
      htmlPath,
      silent: false
    });
    
    orchestrator.build();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Exportar funciones para compatibilidad
const { generateCSS } = require('./src/css-generator');
module.exports = { generateCSS };

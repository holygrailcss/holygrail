#!/usr/bin/env node

// CLI para gestionar variables CSS
// Permite listar variables no usadas y eliminar variables del historial

const { 
  listUnusedVariables, 
  showVariablesReport, 
  getAllHistoricalVariables,
  removeVariableFromHistory,
  removeVariablesFromHistory,
  loadHistoricalVariables
} = require('./variables-tracker');

const path = require('path');

// Función para mostrar ayuda
function showHelp() {
  console.log(`
📦 Gestor de Variables CSS

Uso:
  node src/variables-cli.js <comando> [opciones]

Comandos:
  list                    Lista todas las variables no usadas
  report                  Muestra un reporte completo de variables
  remove <variable>       Elimina una variable específica del historial
  remove-all-unused       Elimina todas las variables no usadas del historial
  show-all                Muestra todas las variables históricas almacenadas

Opciones:
  --css=<ruta>            Ruta al archivo CSS (por defecto: dist/output.css)
  --history=<ruta>         Ruta al archivo de variables históricas (por defecto: .data/.historical-variables.json)

Ejemplos:
  node src/variables-cli.js list
  node src/variables-cli.js report
  node src/variables-cli.js remove --hg-typo-font-size-18
  node src/variables-cli.js remove-all-unused
  node src/variables-cli.js show-all
`);
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const command = args[0];
  const cssPath = args.find(arg => arg.startsWith('--css='))?.split('=')[1] || null;
  const historyPath = args.find(arg => arg.startsWith('--history='))?.split('=')[1] || null;
  
  try {
    switch (command) {
      case 'list':
        {
          const unused = listUnusedVariables(cssPath, historyPath);
          if (unused.length === 0) {
            console.log('\n✅ No hay variables no usadas. Todas las variables están en uso.\n');
          } else {
            console.log(`\n⚠️  Variables no usadas (${unused.length}):\n`);
            unused.forEach((varName, index) => {
              console.log(`   ${index + 1}. ${varName}`);
            });
            console.log('\n💡 Usa "remove-all-unused" para eliminarlas del historial\n');
          }
        }
        break;
        
      case 'report':
        showVariablesReport(cssPath, historyPath);
        break;
        
      case 'remove':
        {
          const varName = args[1];
          if (!varName) {
            console.error('❌ Error: Debes especificar el nombre de la variable a eliminar');
            console.log('   Ejemplo: node src/variables-cli.js remove --hg-typo-font-size-18');
            process.exit(1);
          }
          
          const removed = removeVariableFromHistory(varName, historyPath);
          if (removed) {
            console.log(`\n✅ Variable "${varName}" eliminada del historial\n`);
          } else {
            console.log(`\n⚠️  Variable "${varName}" no encontrada en el historial\n`);
          }
        }
        break;
        
      case 'remove-all-unused':
        {
          const unused = listUnusedVariables(cssPath, historyPath);
          if (unused.length === 0) {
            console.log('\n✅ No hay variables no usadas para eliminar\n');
          } else {
            console.log(`\n⚠️  Eliminando ${unused.length} variables no usadas del historial...\n`);
            const removedCount = removeVariablesFromHistory(unused, historyPath);
            console.log(`✅ ${removedCount} variables eliminadas del historial\n`);
            console.log('💡 Ejecuta "npm run build" para regenerar el CSS sin estas variables\n');
          }
        }
        break;
        
      case 'show-all':
        {
          const historicalVars = loadHistoricalVariables(historyPath);
          const allVars = getAllHistoricalVariables(historicalVars);
          
          if (allVars.length === 0) {
            console.log('\n📚 No hay variables históricas almacenadas\n');
          } else {
            console.log(`\n📚 Variables históricas (${allVars.length}):\n`);
            allVars.forEach((varData, index) => {
              console.log(`   ${index + 1}. ${varData.varName}`);
              console.log(`      Categoría: ${varData.category}`);
              console.log(`      Valor: ${varData.value}`);
              console.log('');
            });
          }
        }
        break;
        
      default:
        console.error(`❌ Comando desconocido: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  main();
}

module.exports = { main };


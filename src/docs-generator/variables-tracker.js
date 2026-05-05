// Gestor de variables CSS
// Permite detectar variables no usadas y eliminar variables del historial

const fs = require('fs');
const path = require('path');

// Carga las variables históricas desde el archivo
function loadHistoricalVariables(historicalVarsPath = null) {
  const defaultPath = historicalVarsPath || path.join(__dirname, '..', '.data', '.historical-variables.json');
  try {
    if (fs.existsSync(defaultPath)) {
      const content = fs.readFileSync(defaultPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('❌ Error al cargar variables históricas:', error.message);
  }
  return {
    fontFamilyVars: {},
    lineHeightVars: {},
    fontWeightVars: {},
    letterSpacingVars: {},
    textTransformVars: {},
    fontSizeVars: {}
  };
}

// Guarda las variables históricas en el archivo
function saveHistoricalVariables(variables, historicalVarsPath = null) {
  const defaultPath = historicalVarsPath || path.join(__dirname, '..', '.data', '.historical-variables.json');
  try {
    const dir = path.dirname(defaultPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(defaultPath, JSON.stringify(variables, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar variables históricas:', error.message);
    return false;
  }
}

// Extrae todas las variables CSS definidas en :root del CSS generado
function extractDefinedVariables(cssContent) {
  const variables = new Set();
  // Buscar todas las variables en :root { ... }
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/s);
  if (rootMatch) {
    const rootContent = rootMatch[1];
    // Buscar todas las líneas que contienen --variable-name: value;
    const varRegex = /--[\w-]+/g;
    let match;
    while ((match = varRegex.exec(rootContent)) !== null) {
      variables.add(match[0]);
    }
  }
  return variables;
}

// Extrae todas las variables CSS usadas en el CSS generado
function extractUsedVariables(cssContent) {
  const variables = new Set();
  // Buscar todos los usos de var(--variable-name)
  const varRegex = /var\((--[\w-]+)\)/g;
  let match;
  while ((match = varRegex.exec(cssContent)) !== null) {
    variables.add(match[1]);
  }
  return variables;
}

// Encuentra variables no usadas comparando las definidas con las usadas
// También incluye variables históricas que no están siendo generadas en el CSS
function findUnusedVariables(cssContent, historicalVarsPath = null) {
  const defined = extractDefinedVariables(cssContent);
  const used = extractUsedVariables(cssContent);
  const unused = [];
  
  // Variables definidas en CSS pero no usadas
  defined.forEach(varName => {
    if (!used.has(varName)) {
      unused.push(varName);
    }
  });
  
  // Variables históricas que no están siendo generadas en el CSS
  const historicalVars = loadHistoricalVariables(historicalVarsPath);
  const allHistorical = getAllHistoricalVariables(historicalVars);
  
  allHistorical.forEach(varData => {
    const varName = varData.varName;
    // Si la variable histórica no está definida en el CSS y no se usa, es no usada
    if (!defined.has(varName) && !used.has(varName)) {
      // Solo agregar si no está ya en la lista (evitar duplicados)
      if (!unused.includes(varName)) {
        unused.push(varName);
      }
    }
  });
  
  return unused.sort();
}

// Obtiene todas las variables históricas como un array de objetos con información
function getAllHistoricalVariables(historicalVars) {
  const allVars = [];
  
  Object.entries(historicalVars).forEach(([category, vars]) => {
    Object.entries(vars).forEach(([key, varData]) => {
      allVars.push({
        varName: varData.varName,
        value: varData.value,
        category: category.replace('Vars', ''),
        key: key
      });
    });
  });
  
  return allVars.sort((a, b) => a.varName.localeCompare(b.varName));
}

// Elimina una variable específica del historial
function removeVariableFromHistory(varName, historicalVarsPath = null) {
  const historicalVars = loadHistoricalVariables(historicalVarsPath);
  let removed = false;
  
  // Buscar y eliminar la variable en todas las categorías
  Object.keys(historicalVars).forEach(category => {
    if (historicalVars[category]) {
      Object.keys(historicalVars[category]).forEach(key => {
        if (historicalVars[category][key] && historicalVars[category][key].varName === varName) {
          delete historicalVars[category][key];
          removed = true;
        }
      });
    }
  });
  
  if (removed) {
    saveHistoricalVariables(historicalVars, historicalVarsPath);
  }
  
  return removed;
}

// Elimina múltiples variables del historial
function removeVariablesFromHistory(varNames, historicalVarsPath = null) {
  const historicalVars = loadHistoricalVariables(historicalVarsPath);
  let removedCount = 0;
  
  varNames.forEach(varName => {
    Object.keys(historicalVars).forEach(category => {
      if (historicalVars[category]) {
        Object.keys(historicalVars[category]).forEach(key => {
          if (historicalVars[category][key] && historicalVars[category][key].varName === varName) {
            delete historicalVars[category][key];
            removedCount++;
          }
        });
      }
    });
  });
  
  if (removedCount > 0) {
    saveHistoricalVariables(historicalVars, historicalVarsPath);
  }
  
  return removedCount;
}

// Función principal para listar variables no usadas
function listUnusedVariables(cssPath = null, historicalVarsPath = null) {
  const defaultPath = cssPath || path.join(__dirname, '..', 'dist', 'output.css');
  const historicalVarsPathDefault = historicalVarsPath || path.join(__dirname, '..', '.historical-variables.json');
  
  if (!fs.existsSync(defaultPath)) {
    console.error(`❌ No se encontró el archivo CSS en: ${defaultPath}`);
    console.log('💡 Ejecuta primero: npm run build');
    return [];
  }
  
  const cssContent = fs.readFileSync(defaultPath, 'utf8');
  const unused = findUnusedVariables(cssContent, historicalVarsPathDefault);
  
  return unused;
}

// Función principal para mostrar un reporte de variables
function showVariablesReport(cssPath = null, historicalVarsPath = null) {
  const cssDefaultPath = cssPath || path.join(__dirname, '..', 'dist', 'output.css');
  const historicalVarsPathDefault = historicalVarsPath || path.join(__dirname, '..', '.historical-variables.json');
  const historicalVars = loadHistoricalVariables(historicalVarsPathDefault);
  
  console.log('\n📊 Reporte de Variables CSS\n');
  console.log('═'.repeat(60));
  
  // Mostrar variables definidas vs usadas
  if (fs.existsSync(cssDefaultPath)) {
    const cssContent = fs.readFileSync(cssDefaultPath, 'utf8');
    const defined = extractDefinedVariables(cssContent);
    const used = extractUsedVariables(cssContent);
    const unused = findUnusedVariables(cssContent, historicalVarsPathDefault);
    
    console.log(`\n📈 Estadísticas:`);
    console.log(`   Variables definidas en CSS: ${defined.size}`);
    console.log(`   Variables usadas: ${used.size}`);
    console.log(`   Variables no usadas: ${unused.length}`);
    
    if (unused.length > 0) {
      console.log(`\n⚠️  Variables no usadas (${unused.length}):`);
      unused.forEach((varName, index) => {
        console.log(`   ${index + 1}. ${varName}`);
      });
    } else {
      console.log(`\n✅ Todas las variables están en uso`);
    }
  } else {
    console.log(`\n⚠️  No se encontró el archivo CSS. Ejecuta primero: npm run build`);
  }
  
  // Mostrar variables históricas
  const allHistorical = getAllHistoricalVariables(historicalVars);
  console.log(`\n📚 Variables históricas almacenadas: ${allHistorical.length}`);
  
  if (allHistorical.length > 0) {
    console.log(`\n📋 Lista de variables históricas:`);
    allHistorical.forEach((varData, index) => {
      console.log(`   ${index + 1}. ${varData.varName} (${varData.category})`);
    });
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
}

module.exports = {
  loadHistoricalVariables,
  saveHistoricalVariables,
  findUnusedVariables,
  getAllHistoricalVariables,
  removeVariableFromHistory,
  removeVariablesFromHistory,
  listUnusedVariables,
  showVariablesReport,
  extractDefinedVariables,
  extractUsedVariables
};


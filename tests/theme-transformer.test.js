// Tests para ThemeTransformer

const { ThemeTransformer } = require('../src/build/theme-transformer');
const path = require('path');
const fs = require('fs');

function testThemeTransformer() {
  console.log('\n🧪 Tests de ThemeTransformer\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Instanciar ThemeTransformer
  try {
    const transformer = new ThemeTransformer(path.join(__dirname, '..'));
    
    if (transformer && transformer.projectRoot) {
      console.log('✅ Test 1: Instanciar ThemeTransformer');
      passedTests++;
    } else {
      throw new Error('ThemeTransformer no instanciado correctamente');
    }
  } catch (error) {
    console.log('❌ Test 1: Error al instanciar ThemeTransformer:', error.message);
    failedTests++;
  }

  // Test 2: Método transform con archivo inexistente
  try {
    const transformer = new ThemeTransformer(path.join(__dirname, '..'));
    const result = transformer.transform(
      'archivo-inexistente.html',
      'destino.html',
      'test-theme',
      true
    );
    
    if (result === false) {
      console.log('✅ Test 2: transform retorna false con archivo inexistente');
      passedTests++;
    } else {
      throw new Error('transform debería retornar false');
    }
  } catch (error) {
    console.log('❌ Test 2: Error en transform con archivo inexistente:', error.message);
    failedTests++;
  }

  // Test 3: Verificar que transform agrega sidebar
  try {
    const projectRoot = path.join(__dirname, '..');
    const demoPath = path.join(projectRoot, 'themes', 'black-and-white', 'demo.html');
    
    if (fs.existsSync(demoPath)) {
      const transformer = new ThemeTransformer(projectRoot);
      
      // Crear directorio temporal para test
      const testOutputDir = path.join(projectRoot, 'dist', 'themes');
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }
      
      const testOutputPath = path.join(testOutputDir, 'test-demo.html');
      const result = transformer.transform(
        demoPath,
        testOutputPath,
        'black-and-white',
        true
      );
      
      if (result && fs.existsSync(testOutputPath)) {
        const content = fs.readFileSync(testOutputPath, 'utf8');
        
        if (content.includes('guide-sidebar') && 
            content.includes('guide-header') &&
            content.includes('toggleSidebar')) {
          console.log('✅ Test 3: transform agrega sidebar y header');
          passedTests++;
        } else {
          throw new Error('Sidebar o header no agregados correctamente');
        }
        
        // Limpiar archivo de test
        fs.unlinkSync(testOutputPath);
      } else {
        throw new Error('transform no creó el archivo de salida');
      }
    } else {
      console.log('⚠️  Test 3: Saltado (themes/black-and-white/demo.html no encontrado)');
    }
  } catch (error) {
    console.log('❌ Test 3: Error al verificar sidebar:', error.message);
    failedTests++;
  }

  // Test 4: Verificar que transform agrega Lenis
  try {
    const projectRoot = path.join(__dirname, '..');
    const demoPath = path.join(projectRoot, 'themes', 'black-and-white', 'demo.html');
    
    if (fs.existsSync(demoPath)) {
      const transformer = new ThemeTransformer(projectRoot);
      
      const testOutputDir = path.join(projectRoot, 'dist', 'themes');
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }
      
      const testOutputPath = path.join(testOutputDir, 'test-lenis-demo.html');
      const result = transformer.transform(
        demoPath,
        testOutputPath,
        'black-and-white',
        true
      );
      
      if (result && fs.existsSync(testOutputPath)) {
        const content = fs.readFileSync(testOutputPath, 'utf8');
        
        if (content.includes('lenis.min.js') && 
            content.includes('new Lenis') &&
            content.includes('lenis.raf')) {
          console.log('✅ Test 4: transform agrega scripts de Lenis');
          passedTests++;
        } else {
          throw new Error('Scripts de Lenis no agregados correctamente');
        }
        
        // Limpiar archivo de test
        fs.unlinkSync(testOutputPath);
      } else {
        throw new Error('transform no creó el archivo de salida');
      }
    } else {
      console.log('⚠️  Test 4: Saltado (themes/black-and-white/demo.html no encontrado)');
    }
  } catch (error) {
    console.log('❌ Test 4: Error al verificar Lenis:', error.message);
    failedTests++;
  }

  // Test 5: Verificar que transform ajusta rutas CSS
  try {
    const projectRoot = path.join(__dirname, '..');
    const demoPath = path.join(projectRoot, 'themes', 'black-and-white', 'demo.html');
    
    if (fs.existsSync(demoPath)) {
      const transformer = new ThemeTransformer(projectRoot);
      
      const testOutputDir = path.join(projectRoot, 'dist', 'themes');
      if (!fs.existsSync(testOutputDir)) {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }
      
      const testOutputPath = path.join(testOutputDir, 'test-css-demo.html');
      const result = transformer.transform(
        demoPath,
        testOutputPath,
        'black-and-white',
        true
      );
      
      if (result && fs.existsSync(testOutputPath)) {
        const content = fs.readFileSync(testOutputPath, 'utf8');
        
        if (content.includes('href="black-and-white.css"') && 
            content.includes('href="../guide-styles.css"') &&
            content.includes('href="../output.css"')) {
          console.log('✅ Test 5: transform ajusta rutas CSS correctamente');
          passedTests++;
        } else {
          throw new Error('Rutas CSS no ajustadas correctamente');
        }
        
        // Limpiar archivo de test
        fs.unlinkSync(testOutputPath);
      } else {
        throw new Error('transform no creó el archivo de salida');
      }
    } else {
      console.log('⚠️  Test 5: Saltado (themes/black-and-white/demo.html no encontrado)');
    }
  } catch (error) {
    console.log('❌ Test 5: Error al verificar rutas CSS:', error.message);
    failedTests++;
  }

  // Test 6: El placeholder HG_TYPO_TABLE se reemplaza por una tabla real
  // cuando se pasa `config` con typo. Esto protege contra regresiones
  // al refactorizar typo-table-generator o la llamada en theme-transformer.
  try {
    const projectRoot = path.join(__dirname, '..');
    const tmpDir = path.join(projectRoot, 'dist', 'themes');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const srcPath = path.join(tmpDir, '__test-typo-source.html');
    const outPath = path.join(tmpDir, '__test-typo-out.html');
    const html = `<!DOCTYPE html><html><head><link rel="stylesheet" href="../../dist/output.css"></head><body>
<main>
  <!-- HG_TYPO_TABLE -->
</main>
</body></html>`;
    fs.writeFileSync(srcPath, html, 'utf8');

    const config = {
      fontFamilyMap: {
        'primary-light': '"neutrif-light", sans-serif'
      },
      typo: {
        'title-l': {
          fontFamily: '"neutrif-light", sans-serif',
          fontWeight: '100',
          mobile:  { fontSize: '12px', lineHeight: '1.4' },
          desktop: { fontSize: '13px', lineHeight: '1.4' }
        }
      }
    };

    const transformer = new ThemeTransformer(projectRoot);
    const ok = transformer.transform(srcPath, outPath, 'black-and-white', true, config, null, null);

    if (!ok) throw new Error('transform() devolvió false');
    const out = fs.readFileSync(outPath, 'utf8');

    const placeholderRemoved = !out.includes('HG_TYPO_TABLE');
    const hasTable = out.includes('hg-typo-table');
    const hasRowClass = out.includes('.title-l');
    const hasSampleText = out.includes('Aa Bb Cc 123');

    if (placeholderRemoved && hasTable && hasRowClass && hasSampleText) {
      console.log('✅ Test 6: HG_TYPO_TABLE se reemplaza por tabla generada');
      passedTests++;
    } else {
      throw new Error(
        `Reemplazo incorrecto (placeholderRemoved=${placeholderRemoved}, hasTable=${hasTable}, hasRowClass=${hasRowClass}, hasSampleText=${hasSampleText})`
      );
    }

    // Limpieza
    try { fs.unlinkSync(srcPath); } catch (_) {}
    try { fs.unlinkSync(outPath); } catch (_) {}
  } catch (error) {
    console.log('❌ Test 6: Error en HG_TYPO_TABLE:', error.message);
    failedTests++;
  }

  // Test 7: Sin config, el placeholder se elimina (no debe dejar
  // comentarios huérfanos visibles al usuario).
  try {
    const projectRoot = path.join(__dirname, '..');
    const tmpDir = path.join(projectRoot, 'dist', 'themes');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const srcPath = path.join(tmpDir, '__test-typo-empty-source.html');
    const outPath = path.join(tmpDir, '__test-typo-empty-out.html');
    fs.writeFileSync(srcPath, '<html><body><!-- HG_TYPO_TABLE --></body></html>', 'utf8');

    const transformer = new ThemeTransformer(projectRoot);
    const ok = transformer.transform(srcPath, outPath, 'black-and-white', true, null, null, null);

    if (!ok) throw new Error('transform() devolvió false');
    const out = fs.readFileSync(outPath, 'utf8');

    if (!out.includes('HG_TYPO_TABLE') && !out.includes('hg-typo-table')) {
      console.log('✅ Test 7: HG_TYPO_TABLE se elimina cuando no hay config');
      passedTests++;
    } else {
      throw new Error('Placeholder no eliminado o tabla inyectada sin config');
    }

    try { fs.unlinkSync(srcPath); } catch (_) {}
    try { fs.unlinkSync(outPath); } catch (_) {}
  } catch (error) {
    console.log('❌ Test 7: Error en HG_TYPO_TABLE sin config:', error.message);
    failedTests++;
  }

  // Resumen
  console.log(`\n📊 Resumen ThemeTransformer: ${passedTests} pasados, ${failedTests} fallidos\n`);

  return { passed: passedTests, failed: failedTests };
}

// Exportar para run-all.js
module.exports = { testThemeTransformer };

// Ejecutar si se llama directamente
if (require.main === module) {
  testThemeTransformer();
}


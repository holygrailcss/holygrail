// Tests para AssetManager

const { AssetManager, ASSETS_CONFIG } = require('../src/build/asset-manager');
const path = require('path');
const fs = require('fs');

function testAssetManager() {
  console.log('\n🧪 Tests de AssetManager\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Instanciar AssetManager
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    
    if (manager && manager.projectRoot) {
      console.log('✅ Test 1: Instanciar AssetManager');
      passedTests++;
    } else {
      throw new Error('AssetManager no instanciado correctamente');
    }
  } catch (error) {
    console.log('❌ Test 1: Error al instanciar AssetManager:', error.message);
    failedTests++;
  }

  // Test 2: Verificar ASSETS_CONFIG
  try {
    if (ASSETS_CONFIG && 
        ASSETS_CONFIG.css && 
        Array.isArray(ASSETS_CONFIG.css) &&
        ASSETS_CONFIG.images &&
        Array.isArray(ASSETS_CONFIG.images)) {
      console.log('✅ Test 2: ASSETS_CONFIG estructurado correctamente');
      passedTests++;
    } else {
      throw new Error('ASSETS_CONFIG mal estructurado');
    }
  } catch (error) {
    console.log('❌ Test 2: Error en ASSETS_CONFIG:', error.message);
    failedTests++;
  }

  // Test 3: Método copyFile con archivo inexistente
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyFile('archivo-inexistente.css', 'destino.css', true);
    
    if (result === false) {
      console.log('✅ Test 3: copyFile retorna false con archivo inexistente');
      passedTests++;
    } else {
      throw new Error('copyFile debería retornar false');
    }
  } catch (error) {
    console.log('❌ Test 3: Error en copyFile:', error.message);
    failedTests++;
  }

  // Test 4: Método copyCSS (sin verificar copia real)
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyCSS(true); // Silent mode
    
    if (typeof result === 'number' && result >= 0) {
      console.log('✅ Test 4: copyCSS retorna número de archivos copiados');
      passedTests++;
    } else {
      throw new Error('copyCSS no retornó un número');
    }
  } catch (error) {
    console.log('❌ Test 4: Error en copyCSS:', error.message);
    failedTests++;
  }

  // Test 5: Método copyImages (sin verificar copia real)
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyImages(true); // Silent mode
    
    if (typeof result === 'number' && result >= 0) {
      console.log('✅ Test 5: copyImages retorna número de archivos copiados');
      passedTests++;
    } else {
      throw new Error('copyImages no retornó un número');
    }
  } catch (error) {
    console.log('❌ Test 5: Error en copyImages:', error.message);
    failedTests++;
  }

  // Test 6: Método copyAssets (all)
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyAssets('all', true);
    
    if (result && 
        typeof result.css === 'number' && 
        typeof result.images === 'number') {
      console.log('✅ Test 6: copyAssets retorna objeto con conteos');
      passedTests++;
    } else {
      throw new Error('copyAssets no retornó objeto correcto');
    }
  } catch (error) {
    console.log('❌ Test 6: Error en copyAssets:', error.message);
    failedTests++;
  }

  // Test 7: Método copyAssets (solo css)
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyAssets('css', true);
    
    if (result && 
        typeof result.css === 'number' && 
        result.images === 0) {
      console.log('✅ Test 7: copyAssets solo CSS funciona');
      passedTests++;
    } else {
      throw new Error('copyAssets solo CSS no funcionó');
    }
  } catch (error) {
    console.log('❌ Test 7: Error en copyAssets solo CSS:', error.message);
    failedTests++;
  }

  // Test 8: Método copyAssets (solo images)
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyAssets('images', true);
    
    if (result && 
        result.css === 0 &&
        typeof result.images === 'number') {
      console.log('✅ Test 8: copyAssets solo images funciona');
      passedTests++;
    } else {
      throw new Error('copyAssets solo images no funcionó');
    }
  } catch (error) {
    console.log('❌ Test 8: Error en copyAssets solo images:', error.message);
    failedTests++;
  }

  // Test 9: Agregar asset CSS dinámicamente
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const initialLength = ASSETS_CONFIG.css.length;
    manager.addCSSAsset('test.css', 'dist/test.css');
    
    if (ASSETS_CONFIG.css.length === initialLength + 1) {
      console.log('✅ Test 9: addCSSAsset funciona');
      // Limpiar
      ASSETS_CONFIG.css.pop();
      passedTests++;
    } else {
      throw new Error('addCSSAsset no agregó el asset');
    }
  } catch (error) {
    console.log('❌ Test 9: Error en addCSSAsset:', error.message);
    failedTests++;
  }

  // Test 10: Agregar asset Image dinámicamente
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const initialLength = ASSETS_CONFIG.images.length;
    manager.addImageAsset('test.jpg', 'dist/test.jpg');

    if (ASSETS_CONFIG.images.length === initialLength + 1) {
      console.log('✅ Test 10: addImageAsset funciona');
      // Limpiar
      ASSETS_CONFIG.images.pop();
      passedTests++;
    } else {
      throw new Error('addImageAsset no agregó el asset');
    }
  } catch (error) {
    console.log('❌ Test 10: Error en addImageAsset:', error.message);
    failedTests++;
  }

  // Test 11: copyFonts retorna un número (cuenta de ficheros copiados).
  // Las fuentes se añadieron después de CSS/images, así que este test
  // protege contra regresiones en la copia silenciosa de los .woff/.woff2.
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyFonts(true);

    if (typeof result === 'number' && result >= 0) {
      console.log('✅ Test 11: copyFonts retorna número de archivos copiados');
      passedTests++;
    } else {
      throw new Error('copyFonts no retornó un número');
    }
  } catch (error) {
    console.log('❌ Test 11: Error en copyFonts:', error.message);
    failedTests++;
  }

  // Test 12: copyAssets('fonts') aísla solo la rama de fuentes.
  try {
    const manager = new AssetManager(path.join(__dirname, '..'));
    const result = manager.copyAssets('fonts', true);

    if (result &&
        result.css === 0 &&
        result.images === 0 &&
        typeof result.fonts === 'number') {
      console.log('✅ Test 12: copyAssets solo fonts funciona');
      passedTests++;
    } else {
      throw new Error('copyAssets solo fonts no funcionó');
    }
  } catch (error) {
    console.log('❌ Test 12: Error en copyAssets solo fonts:', error.message);
    failedTests++;
  }

  // Test 13: addFontAsset añade entrada al array de fonts.
  // Importante: si assetsConfig.fonts fuera undefined, el método debe
  // crearlo. Forzamos ese caso con un assetsConfig custom para
  // garantizar la rama de fallback.
  try {
    const customConfig = { css: [], images: [] }; // sin `fonts`
    const manager = new AssetManager(path.join(__dirname, '..'), customConfig);
    manager.addFontAsset('test.woff2', 'dist/test.woff2');

    if (Array.isArray(customConfig.fonts) && customConfig.fonts.length === 1) {
      console.log('✅ Test 13: addFontAsset crea fonts[] si no existe');
      passedTests++;
    } else {
      throw new Error('addFontAsset no inicializó fonts[]');
    }
  } catch (error) {
    console.log('❌ Test 13: Error en addFontAsset:', error.message);
    failedTests++;
  }

  // Test 14: El constructor respeta assetsConfig custom (fuente de
  // verdad viene de config.json vía watch/BuildOrchestrator, no del
  // ASSETS_CONFIG hardcodeado).
  try {
    const customConfig = {
      css: [{ source: 'a.css', dest: 'dist/a.css' }],
      images: [],
      fonts: [
        { source: 'b.woff2', dest: 'dist/b.woff2' },
        { source: 'c.woff',  dest: 'dist/c.woff'  }
      ]
    };
    const manager = new AssetManager(path.join(__dirname, '..'), customConfig);

    if (manager.assetsConfig === customConfig &&
        manager.assetsConfig.fonts.length === 2) {
      console.log('✅ Test 14: Constructor acepta assetsConfig custom');
      passedTests++;
    } else {
      throw new Error('El constructor no usó el assetsConfig pasado');
    }
  } catch (error) {
    console.log('❌ Test 14: Error en assetsConfig custom:', error.message);
    failedTests++;
  }

  // Resumen
  console.log(`\n📊 Resumen AssetManager: ${passedTests} pasados, ${failedTests} fallidos\n`);

  return { passed: passedTests, failed: failedTests };
}

// Exportar para run-all.js
module.exports = { testAssetManager };

// Ejecutar si se llama directamente
if (require.main === module) {
  testAssetManager();
}


// Carga y validación de configuración

const fs = require('fs');
const path = require('path');

const BREAKPOINTS = ['mobile', 'desktop'];

function loadConfig(configPath = path.join(__dirname, '..', 'config.json')) {
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Archivo de configuración no encontrado: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Validar estructura básica
    if (!config.typo || typeof config.typo !== 'object') {
      throw new Error('La configuración debe tener un objeto "typo"');
    }
    
    if (!config.breakpoints || typeof config.breakpoints !== 'object') {
      throw new Error('La configuración debe tener un objeto "breakpoints"');
    }
    
    if (!config.breakpoints.mobile || !config.breakpoints.desktop) {
      throw new Error('Los breakpoints deben tener propiedades "mobile" y "desktop"');
    }
    
    // Validar clases
    Object.entries(config.typo).forEach(([className, cls]) => {
      if (!cls || typeof cls !== 'object') {
        throw new Error(`La clase "${className}" debe ser un objeto`);
      }
      
      // Validar que tenga al menos un breakpoint
      if (!cls.mobile && !cls.desktop) {
        throw new Error(`La clase "${className}" debe tener al menos un breakpoint (mobile o desktop)`);
      }
      
      // Validar propiedades de breakpoints
      BREAKPOINTS.forEach(bp => {
        if (cls[bp] && (!cls[bp].fontSize && !cls[bp].lineHeight)) {
          console.warn(`Advertencia: La clase "${className}" tiene breakpoint "${bp}" sin fontSize ni lineHeight`);
        }
      });
    });
    
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Error al parsear JSON: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  loadConfig,
  BREAKPOINTS
};


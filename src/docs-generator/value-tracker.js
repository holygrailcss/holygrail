// value-tracker.js
// Persistencia y diff de valores del design system entre builds.
//
// Antes vivía dentro de html-generator.js como ~160 líneas de lógica
// mezclada con la generación de HTML. Se extrae aquí porque:
//   - No depende del HTML en absoluto: es I/O + comparación.
//   - Se puede testear de forma aislada sin construir toda la guía.
//   - Mantiene html-generator.js enfocado en... generar HTML.
//
// Contrato:
//   - `loadPreviousValues(path)` devuelve el JSON previo o null.
//   - `saveCurrentValues(values, path)` persiste el estado actual.
//   - `getChangedValues(current, previous)` devuelve un Set con las
//     claves cambiadas, usando el mismo formato que esperaba el
//     callsite original ("className.prop", "className.bp.prop",
//     "colors.key", "spacingMap.key", "fontFamilyMap.key",
//     "breakpoints.mobile|desktop", "variable.<name>").

const fs = require('fs');
const path = require('path');

function loadPreviousValues(previousValuesPath) {
  try {
    if (fs.existsSync(previousValuesPath)) {
      const content = fs.readFileSync(previousValuesPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (_) {
    // Si no existe o hay error, devuelve null
  }
  return null;
}

function saveCurrentValues(currentValues, previousValuesPath) {
  try {
    const dir = path.dirname(previousValuesPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(previousValuesPath, JSON.stringify(currentValues, null, 2), 'utf8');
  } catch (error) {
    console.warn('⚠️  No se pudo guardar los valores anteriores:', error.message);
  }
}

function diffMap(current, previous, prefix, changes) {
  const cur = current || {};
  const prev = previous || {};
  Object.keys(cur).forEach(key => {
    if (cur[key] !== prev[key]) {
      changes.add(`${prefix}.${key}`);
    }
  });
  // Claves eliminadas: el callsite histórico las marca también.
  Object.keys(prev).forEach(key => {
    if (!(key in cur)) {
      changes.add(`${prefix}.${key}`);
    }
  });
}

function getChangedValues(currentValues, previousValues) {
  const changes = new Set();

  // Primera ejecución: sin diff (nada se marca cambiado).
  if (!previousValues) {
    return changes;
  }

  // Breakpoints
  if (currentValues.breakpoints) {
    const curBp = currentValues.breakpoints;
    const prevBp = previousValues.breakpoints;
    if (!prevBp) {
      changes.add('breakpoints.mobile');
      changes.add('breakpoints.desktop');
    } else {
      if (curBp.mobile !== prevBp.mobile) changes.add('breakpoints.mobile');
      if (curBp.desktop !== prevBp.desktop) changes.add('breakpoints.desktop');
    }
  }

  // Mapas planos (fontFamilyMap, spacingMap, colors) comparten el mismo
  // patrón de diff: misma clave con valor distinto → marca.
  if (currentValues.fontFamilyMap) {
    diffMap(currentValues.fontFamilyMap, previousValues.fontFamilyMap, 'fontFamilyMap', changes);
  }
  if (currentValues.spacingMap) {
    diffMap(currentValues.spacingMap, previousValues.spacingMap, 'spacingMap', changes);
  }
  if (currentValues.colors) {
    diffMap(currentValues.colors, previousValues.colors, 'colors', changes);
  }

  // Clases de tipografía (typo): tienen propiedades base + breakpoints
  // anidados (mobile/desktop.fontSize|lineHeight). Mantenemos el
  // comportamiento histórico: aceptar tanto `currentValues.typo` como
  // `currentValues` al raíz, por compatibilidad con callsites antiguos.
  const currentClasses = currentValues.typo || currentValues;
  const previousClasses = previousValues.typo || previousValues;
  Object.keys(currentClasses).forEach(className => {
    const current = currentClasses[className];
    const previous = previousClasses[className];
    if (!current || typeof current !== 'object') return;
    if (!previous) {
      // Clase nueva: marcar todas sus props base (no mobile/desktop).
      Object.keys(current).forEach(prop => {
        if (prop !== 'mobile' && prop !== 'desktop') {
          changes.add(`${className}.${prop}`);
        }
      });
      return;
    }
    ['fontFamily', 'fontWeight', 'letterSpacing', 'textTransform'].forEach(prop => {
      if (current[prop] !== previous[prop]) {
        changes.add(`${className}.${prop}`);
      }
    });
    ['mobile', 'desktop'].forEach(bp => {
      if (!current[bp]) return;
      if (!previous[bp]) {
        if (current[bp].fontSize) changes.add(`${className}.${bp}.fontSize`);
        if (current[bp].lineHeight) changes.add(`${className}.${bp}.lineHeight`);
      } else {
        if (current[bp].fontSize !== previous[bp].fontSize) {
          changes.add(`${className}.${bp}.fontSize`);
        }
        if (current[bp].lineHeight !== previous[bp].lineHeight) {
          changes.add(`${className}.${bp}.lineHeight`);
        }
      }
    });
  });

  // Variables CSS compartidas: solo marca nuevas o cambiadas
  // (no detecta eliminadas, manteniendo el comportamiento histórico).
  if (currentValues.variables) {
    const curVars = currentValues.variables;
    const prevVars = previousValues.variables || {};
    Object.keys(curVars).forEach(varName => {
      if (prevVars[varName] === undefined || curVars[varName] !== prevVars[varName]) {
        changes.add(`variable.${varName}`);
      }
    });
  }

  return changes;
}

module.exports = {
  loadPreviousValues,
  saveCurrentValues,
  getChangedValues
};

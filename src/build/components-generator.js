/**
 * Components Page Generator
 *
 * Genera dist/componentes.html: una página que muestra todos los
 * componentes base (themes/_base/) con preview vivo + el nombre de
 * clase junto a cada variante.
 *
 * Se renderiza con el tema DUTTI como base genérica (tema neutro del
 * framework). Sobre él se pueden aplicar otros temas en el futuro si
 * añadimos un theme switcher. Por tanto la página enlaza:
 *   - dist/output.css          → tokens --hg-* del framework
 *   - dist/themes/black-and-white.css    → mapeo de variables + reglas de componente
 */

const fs = require('fs');
const path = require('path');
const { resolveActiveThemes } = require('../generators/utils');

/**
 * Nombre del tema que se usa como "base genérica" para renderizar la
 * página. Si en algún momento se quiere cambiar, basta con modificar
 * esta constante (o exponerla en config.json).
 */
const BASE_THEME = 'black-and-white';

/**
 * Lista canónica de componentes mostrados en la página.
 */
const COMPONENT_SECTIONS = [
  {
    id: 'buttons',
    title: 'Botones',
    description:
      'Variantes estándar del framework: <code>primary</code>, <code>secondary</code>, <code>tertiary</code>, <code>label-m</code>, <code>link</code> y <code>badge</code>. Clases en <code>themes/_base/_buttons.css</code>. Cada tema puede sobreescribirlas con su propia identidad visual.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<button class="btn btn-primary">Primary</button>', cls: '.btn .btn-primary' },
          { html: '<button class="btn btn-secondary">Secondary</button>', cls: '.btn .btn-secondary' },
          { html: '<button class="btn btn-tertiary">Tertiary</button>', cls: '.btn .btn-tertiary' },
          {
            html: '<button class="btn btn-tertiary hg-text-underline">Tertiary underline</button>',
            cls: '.btn .btn-tertiary .hg-text-underline'
          },
          { html: '<button class="btn btn-label-m">Label M</button>', cls: '.btn .btn-label-m' },
          { html: '<button class="btn btn-link">Link</button>', cls: '.btn .btn-link' },
          { html: '<button class="btn btn-badge">Badge</button>', cls: '.btn .btn-badge' },
          { html: '<button class="btn btn-primary" disabled>Disabled</button>', cls: '.btn[disabled]' }
        ]
      },
      {
        subtitle: 'Tamaños',
        items: [
          { html: '<button class="btn btn-primary btn-sm">Small</button>', cls: '.btn .btn-sm' },
          { html: '<button class="btn btn-primary btn-md">Medium</button>', cls: '.btn .btn-md' },
          { html: '<button class="btn btn-primary btn-lg">Large</button>', cls: '.btn .btn-lg' }
        ]
      },
      {
        subtitle: 'Ancho completo',
        items: [
          {
            html: '<button class="btn btn-primary btn-md btn-full">Botón ancho completo</button>',
            cls: '.btn .btn-full'
          }
        ]
      }
    ]
  },
  {
    id: 'inputs',
    title: 'Inputs',
    description:
      'Campos de formulario base con <strong>floating label</strong>: texto, email, password, textarea y select. Cada input vive dentro de <code>.form-input-label-2</code> para que el label se anime al enfocar o al contener valor. Clases en <code>themes/_base/_inputs.css</code>.',
    examples: [
      {
        subtitle: 'Tipos',
        items: [
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-text" class="input" placeholder=" " /><label for="cmp-input-text">Texto</label></div>',
            cls: '.form-input-label-2 > .input'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="email" id="cmp-input-email" class="input" placeholder=" " /><label for="cmp-input-email">Email</label></div>',
            cls: '.input (type=email)'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="password" id="cmp-input-password" class="input" placeholder=" " /><label for="cmp-input-password">Contraseña</label></div>',
            cls: '.input (type=password)'
          },
          {
            html:
              '<div class="form-input-label-2"><textarea id="cmp-input-textarea" class="input" placeholder=" " rows="3"></textarea><label for="cmp-input-textarea">Comentario</label></div>',
            cls: '.input (textarea)'
          },
          {
            html:
              '<div class="form-input-label-2"><select id="cmp-input-select" class="input"><option>Opción A</option><option>Opción B</option></select><label for="cmp-input-select">Selecciona</label></div>',
            cls: '.input (select)'
          }
        ]
      },
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-error" class="input input-error" value="Valor inválido" placeholder=" " /><label for="cmp-input-error">Error</label></div><span class="helper-text helper-text-error">Este campo tiene un error</span>',
            cls: '.input-error + .helper-text-error'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-success" class="input input-success" value="Valor válido" placeholder=" " /><label for="cmp-input-success">Success</label></div><span class="helper-text helper-text-success">Campo válido</span>',
            cls: '.input-success + .helper-text-success'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-warning" class="input input-warning" value="Atención" placeholder=" " /><label for="cmp-input-warning">Warning</label></div><span class="helper-text helper-text-warning">Revisa este campo</span>',
            cls: '.input-warning + .helper-text-warning'
          },
          {
            html:
              '<div class="form-input-label-2"><input type="text" id="cmp-input-disabled" class="input" value="No editable" placeholder=" " disabled /><label for="cmp-input-disabled">Disabled</label></div>',
            cls: '.input[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'labels',
    title: 'Labels',
    description:
      'Etiquetas de formulario: base, obligatoria e inline. Clases en <code>themes/_base/_labels.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<label class="label">Nombre</label>', cls: '.label' },
          { html: '<label class="label label-required">Email</label>', cls: '.label .label-required' },
          {
            html:
              '<label class="label label-inline"><input type="checkbox" /> Acepto los términos</label>',
            cls: '.label .label-inline'
          }
        ]
      }
    ]
  },
  {
    id: 'checkboxes',
    title: 'Checkboxes',
    description:
      'Checkbox con input nativo oculto y marca SVG inline dentro de <code>.checkbox-indicator</code>. El estado visible se controla 100% con CSS (sin JS). Clases en <code>themes/_base/_checkboxes.css</code>.',
    examples: [
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<label class="checkbox"><input type="checkbox" /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Sin marcar</span></label>',
            cls: '.checkbox'
          },
          {
            html:
              '<label class="checkbox"><input type="checkbox" checked /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Marcado</span></label>',
            cls: '.checkbox (checked)'
          },
          {
            html:
              '<label class="checkbox"><input type="checkbox" disabled /><span class="checkbox-indicator"><svg class="cbox__icon" viewBox="0 0 10 8" width="10" height="8" aria-hidden="true" focusable="false"><path d="M9.05823.198273 9.69185.801721 3.5417 7.25937.308228 3.86422.941848 3.26077 3.5417 5.99062 9.05823.198273Z" fill="currentColor"/></svg></span><span class="checkbox-label">Disabled</span></label>',
            cls: '.checkbox[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'radios',
    title: 'Radios',
    description:
      'Radio buttons con el patrón <code>.checkbox-radio</code>: el input nativo se oculta visualmente y el círculo se pinta con <code>label::before</code>. Clases en <code>themes/_base/_radios.css</code>.',
    examples: [
      {
        subtitle: 'Grupo',
        items: [
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-1" name="cmp-radio" type="radio" value="A" /><label for="cmp-radio-1"><i class="ico-radio"></i><span class="title-m">Opción A</span></label></div>',
            cls: '.checkbox-radio'
          },
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-2" name="cmp-radio" type="radio" value="B" checked /><label for="cmp-radio-2"><i class="ico-radio"></i><span class="title-m">Opción B (activa)</span></label></div>',
            cls: '.checkbox-radio (checked)'
          },
          {
            html:
              '<div class="checkbox-radio"><input id="cmp-radio-3" name="cmp-radio-2" type="radio" value="C" disabled /><label for="cmp-radio-3"><i class="ico-radio"></i><span class="title-m">Disabled</span></label></div>',
            cls: '.checkbox-radio[disabled]'
          }
        ]
      }
    ]
  },
  {
    id: 'switches',
    title: 'Switches',
    description:
      'Interruptores on/off con el patrón <code>.checkbox-item-2</code>: pista rectangular y un <code>.checkbox-circle</code> que se desplaza al marcar. Clases en <code>themes/_base/_switches.css</code>.',
    examples: [
      {
        subtitle: 'Estados',
        items: [
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-1" name="cmp-switch-1" type="checkbox" /><label for="cmp-switch-1"><div class="checkbox-circle"></div><span class="theta">Inactivo</span></label></div>',
            cls: '.checkbox-item-2'
          },
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-2" name="cmp-switch-2" type="checkbox" checked /><label for="cmp-switch-2"><div class="checkbox-circle"></div><span class="theta">Activado</span></label></div>',
            cls: '.checkbox-item-2 (checked)'
          },
          {
            html:
              '<div class="checkbox-item-2"><input id="cmp-switch-3" name="cmp-switch-3" type="checkbox" disabled /><label for="cmp-switch-3"><div class="checkbox-circle"></div><span class="theta">Disabled</span></label></div>',
            cls: '.checkbox-item-2[disabled]'
          },
          {
            html:
              '<div class="checkbox-item-2 is-error"><input id="cmp-switch-4" name="cmp-switch-4" type="checkbox" /><label for="cmp-switch-4"><div class="checkbox-circle"></div><span class="theta">Error</span></label></div>',
            cls: '.checkbox-item-2.is-error'
          }
        ]
      }
    ]
  },
  {
    id: 'forms',
    title: 'Formularios',
    description:
      'Composición de campos con label flotante + estado. <code>.form-group</code> apila verticalmente los campos; cada uno usa <code>.form-input-label-2</code> para el floating label y (opcionalmente) <code>.helper-text</code> para el mensaje de estado. Clases en <code>themes/_base/_forms.css</code>.',
    examples: [
      {
        subtitle: 'Grupo de formulario',
        items: [
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><input type="email" id="cmp-form-email" class="input" placeholder=" " /><label for="cmp-form-email">Email</label></div></div>',
            cls: '.form-group > .form-input-label-2'
          },
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><textarea id="cmp-form-msg" class="input" rows="3" placeholder=" "></textarea><label for="cmp-form-msg">Mensaje</label></div></div>',
            cls: '.form-group (con textarea)'
          },
          {
            html:
              '<div class="form-group"><div class="form-input-label-2"><input type="text" id="cmp-form-err" class="input input-error" value="" placeholder=" " /><label for="cmp-form-err">Nombre</label></div><span class="helper-text helper-text-error">Este campo es obligatorio</span></div>',
            cls: '.form-group (con helper-text)'
          }
        ]
      }
    ]
  },
  {
    id: 'containers',
    title: 'Containers',
    description:
      'Contenedores centrados con <code>max-width</code> responsivo y/o fijo. <code>.container</code> escala con los breakpoints; <code>.container-2</code> es más estrecho; las variantes <code>.container-640</code>, <code>.container-512</code> y <code>.container-360</code> fijan un ancho concreto. Clases en <code>themes/_base/_containers.css</code>.',
    examples: [
      {
        subtitle: 'Responsivos',
        items: [
          {
            html:
              '<div class="container" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container</div>',
            cls: '.container'
          },
          {
            html:
              '<div class="container-2" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-2</div>',
            cls: '.container-2'
          }
        ]
      },
      {
        subtitle: 'Anchos fijos',
        items: [
          {
            html:
              '<div class="container-640" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-640</div>',
            cls: '.container-640'
          },
          {
            html:
              '<div class="container-512" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-512</div>',
            cls: '.container-512'
          },
          {
            html:
              '<div class="container-360" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">.container-360</div>',
            cls: '.container-360'
          }
        ]
      }
    ]
  },
  {
    id: 'grid',
    title: 'Grid',
    description:
      'Utilidades de CSS Grid inspiradas en Tailwind. El contenedor debe tener <code>display:grid</code> y usar <code>.hg-grid-cols-N</code> para definir N columnas; los hijos usan <code>.hg-col-span-N</code> para ocupar varias. Con el prefijo <code>md:</code> se activan a partir de 768&nbsp;px. Clases en <code>themes/_base/objects/_grid.css</code>.',
    examples: [
      {
        subtitle: 'Columnas iguales',
        items: [
          {
            html:
              '<div class="hg-grid-cols-3" style="display:grid; gap:var(--hg-spacing-8);"><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">1</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">2</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">3</div></div>',
            cls: '.hg-grid-cols-3'
          },
          {
            html:
              '<div class="hg-grid-cols-4" style="display:grid; gap:var(--hg-spacing-8);"><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">1</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">2</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">3</div><div style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">4</div></div>',
            cls: '.hg-grid-cols-4'
          }
        ]
      },
      {
        subtitle: 'Col-span',
        items: [
          {
            html:
              '<div class="hg-grid-cols-12" style="display:grid; gap:var(--hg-spacing-8);"><div class="hg-col-span-8" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 8</div><div class="hg-col-span-4" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 4</div></div>',
            cls: '.hg-grid-cols-12 > .hg-col-span-{8,4}'
          },
          {
            html:
              '<div class="hg-grid-cols-12" style="display:grid; gap:var(--hg-spacing-8);"><div class="hg-col-span-6" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 6</div><div class="hg-col-span-6" style="background:var(--hg-color-light-grey); padding:var(--hg-spacing-16);">span 6</div></div>',
            cls: '.hg-grid-cols-12 > .hg-col-span-6'
          }
        ]
      }
    ]
  },

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  {
    id: 'typography',
    title: 'Typography',
    description:
      'Clases utilitarias para texto: encabezados <code>.h1</code>–<code>.h6</code>, <code>.lead</code>, <code>.muted</code>, <code>.large</code>, <code>.small</code>, <code>.blockquote</code>, <code>.code</code>, <code>.kbd</code>. Clases en <code>themes/_base/_typography.css</code>.',
    examples: [
      {
        subtitle: 'Encabezados',
        items: [
          { html: '<h1 class="h1">Heading 1</h1>', cls: '.h1' },
          { html: '<h2 class="h2">Heading 2</h2>', cls: '.h2' },
          { html: '<h3 class="h3">Heading 3</h3>', cls: '.h3' },
          { html: '<h4 class="h4">Heading 4</h4>', cls: '.h4' },
          { html: '<h5 class="h5">Heading 5</h5>', cls: '.h5' },
          { html: '<h6 class="h6">Heading 6</h6>', cls: '.h6' }
        ]
      },
      {
        subtitle: 'Cuerpo',
        items: [
          { html: '<p class="lead">Texto de entradilla, ligero y grande.</p>', cls: '.lead' },
          { html: '<p class="large">Texto grande y semibold.</p>', cls: '.large' },
          { html: '<p class="small">Texto pequeño 12px.</p>', cls: '.small' },
          { html: '<p class="muted">Texto en gris para detalles secundarios.</p>', cls: '.muted' },
          { html: '<blockquote class="blockquote">Cita destacada con borde lateral.</blockquote>', cls: '.blockquote' }
        ]
      },
      {
        subtitle: 'Inline',
        items: [
          { html: '<code class="code">npm install holygrailcss</code>', cls: '.code' },
          { html: '<span class="kbd">⌘</span> <span class="kbd">K</span>', cls: '.kbd' }
        ]
      }
    ]
  },

  /* ============================================
     CARD
     ============================================ */
  {
    id: 'card',
    title: 'Card',
    description:
      'Contenedor genérico con <code>card-header</code>, <code>card-body</code> y <code>card-footer</code>. Usa <code>.card-flat</code> para fondo gris sin borde. Clases en <code>themes/_base/_card.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          {
            html:
              '<div class="card" style="max-width:320px;"><div class="card-header"><h3 class="card-title">Plan Pro</h3><p class="card-description">Para equipos en crecimiento.</p></div><div class="card-body">29 €/mes con todas las funcionalidades incluidas.</div><div class="card-footer"><button class="btn btn-primary btn-sm">Comprar</button></div></div>',
            cls: '.card (con header/body/footer)'
          },
          {
            html:
              '<div class="card card-flat" style="max-width:320px; padding:var(--hg-spacing-16);">Card flat: sin borde, fondo gris.</div>',
            cls: '.card.card-flat'
          }
        ]
      }
    ]
  },

  /* ============================================
     BADGE
     ============================================ */
  {
    id: 'badge',
    title: 'Badge',
    description:
      'Etiquetas pequeñas para estado / categoría. Variantes semánticas: default, secondary, outline, destructive, success, warning, info. Clases en <code>themes/_base/_badge.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<span class="badge">Default</span>', cls: '.badge' },
          { html: '<span class="badge badge-secondary">Secondary</span>', cls: '.badge-secondary' },
          { html: '<span class="badge badge-outline">Outline</span>', cls: '.badge-outline' },
          { html: '<span class="badge badge-destructive">Destructive</span>', cls: '.badge-destructive' },
          { html: '<span class="badge badge-success">Success</span>', cls: '.badge-success' },
          { html: '<span class="badge badge-warning">Warning</span>', cls: '.badge-warning' },
          { html: '<span class="badge badge-info">Info</span>', cls: '.badge-info' }
        ]
      }
    ]
  },

  /* ============================================
     ALERT
     ============================================ */
  {
    id: 'alert',
    title: 'Alert',
    description:
      'Banner inline para info / warning / error / success. Usa <code>alert-icon</code>, <code>alert-content</code> con <code>alert-title</code> y <code>alert-description</code>. Clases en <code>themes/_base/_alert.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          {
            html:
              '<div class="alert alert-info" style="max-width:480px;"><div class="alert-content"><h5 class="alert-title">Heads up</h5><p class="alert-description">Tu trial expira en 3 días.</p></div></div>',
            cls: '.alert.alert-info'
          },
          {
            html:
              '<div class="alert alert-success" style="max-width:480px;"><div class="alert-content"><h5 class="alert-title">Guardado</h5><p class="alert-description">Tus cambios están publicados.</p></div></div>',
            cls: '.alert.alert-success'
          },
          {
            html:
              '<div class="alert alert-warning" style="max-width:480px;"><div class="alert-content"><h5 class="alert-title">Atención</h5><p class="alert-description">El stock es limitado.</p></div></div>',
            cls: '.alert.alert-warning'
          },
          {
            html:
              '<div class="alert alert-destructive" style="max-width:480px;"><div class="alert-content"><h5 class="alert-title">Error</h5><p class="alert-description">No se pudo guardar.</p></div></div>',
            cls: '.alert.alert-destructive'
          }
        ]
      }
    ]
  },

  /* ============================================
     AVATAR
     ============================================ */
  {
    id: 'avatar',
    title: 'Avatar',
    description:
      'Círculo con imagen + fallback de iniciales. Tamaños <code>-sm</code> 24, default 40, <code>-lg</code> 56, <code>-xl</code> 80. Variante <code>.avatar-square</code>. Clases en <code>themes/_base/_avatar.css</code>.',
    examples: [
      {
        subtitle: 'Tamaños',
        items: [
          { html: '<span class="avatar avatar-sm"><span class="avatar-fallback">MR</span></span>', cls: '.avatar.avatar-sm' },
          { html: '<span class="avatar"><span class="avatar-fallback">MR</span></span>', cls: '.avatar' },
          { html: '<span class="avatar avatar-lg"><span class="avatar-fallback">MR</span></span>', cls: '.avatar.avatar-lg' },
          { html: '<span class="avatar avatar-xl"><span class="avatar-fallback">MR</span></span>', cls: '.avatar.avatar-xl' }
        ]
      },
      {
        subtitle: 'Variantes',
        items: [
          { html: '<span class="avatar avatar-square"><span class="avatar-fallback">SQ</span></span>', cls: '.avatar.avatar-square' },
          {
            html:
              '<div class="avatar-group"><span class="avatar"><span class="avatar-fallback">A</span></span><span class="avatar"><span class="avatar-fallback">B</span></span><span class="avatar"><span class="avatar-fallback">C</span></span></div>',
            cls: '.avatar-group'
          }
        ]
      }
    ]
  },

  /* ============================================
     SEPARATOR
     ============================================ */
  {
    id: 'separator',
    title: 'Separator',
    description:
      'Divisor horizontal o vertical. Variante con texto en el centro. Clases en <code>themes/_base/_separator.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<div style="width:240px;"><hr class="separator"></div>', cls: '.separator' },
          {
            html:
              '<div style="display:flex; height:24px; align-items:center; gap:8px;">Izq<div class="separator separator-vertical"></div>Der</div>',
            cls: '.separator.separator-vertical'
          },
          {
            html:
              '<div class="separator separator-with-label" style="width:240px;">o continúa con</div>',
            cls: '.separator-with-label'
          }
        ]
      }
    ]
  },

  /* ============================================
     PROGRESS
     ============================================ */
  {
    id: 'progress',
    title: 'Progress',
    description:
      'Barra de progreso con tamaños <code>-sm</code>, default y <code>-lg</code>. Variante indeterminada. Clases en <code>themes/_base/_progress.css</code>.',
    examples: [
      {
        subtitle: 'Determinado',
        items: [
          {
            html: '<div class="progress" style="width:240px;"><div class="progress-bar" style="width:30%"></div></div>',
            cls: '.progress (30%)'
          },
          {
            html: '<div class="progress" style="width:240px;"><div class="progress-bar" style="width:65%"></div></div>',
            cls: '.progress (65%)'
          },
          {
            html: '<div class="progress progress-success" style="width:240px;"><div class="progress-bar" style="width:100%"></div></div>',
            cls: '.progress.progress-success'
          }
        ]
      },
      {
        subtitle: 'Tamaños',
        items: [
          { html: '<div class="progress progress-sm" style="width:240px;"><div class="progress-bar" style="width:50%"></div></div>', cls: '.progress.progress-sm' },
          { html: '<div class="progress progress-lg" style="width:240px;"><div class="progress-bar" style="width:50%"></div></div>', cls: '.progress.progress-lg' }
        ]
      },
      {
        subtitle: 'Indeterminado',
        items: [
          {
            html: '<div class="progress progress-indeterminate" style="width:240px;"><div class="progress-bar"></div></div>',
            cls: '.progress.progress-indeterminate'
          }
        ]
      }
    ]
  },

  /* ============================================
     SKELETON
     ============================================ */
  {
    id: 'skeleton',
    title: 'Skeleton',
    description:
      'Placeholders animados durante la carga. Modificadores <code>-text</code>, <code>-title</code>, <code>-avatar</code>, <code>-button</code>, <code>-card</code>. Clases en <code>themes/_base/_skeleton.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          {
            html:
              '<div style="width:240px;"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text" style="width:80%;"></div></div>',
            cls: '.skeleton-title + .skeleton-text'
          },
          { html: '<div class="skeleton skeleton-avatar"></div>', cls: '.skeleton-avatar' },
          { html: '<div class="skeleton skeleton-button"></div>', cls: '.skeleton-button' },
          { html: '<div class="skeleton skeleton-card" style="width:240px;"></div>', cls: '.skeleton-card' }
        ]
      }
    ]
  },

  /* ============================================
     TEXTAREA
     ============================================ */
  {
    id: 'textarea',
    title: 'Textarea',
    description:
      'Multilinea con misma estética del Input. Estados error / success / warning. Variante <code>-fixed</code> sin redimensionar. Clases en <code>themes/_base/_textarea.css</code>.',
    examples: [
      {
        subtitle: 'Estados',
        items: [
          { html: '<textarea class="textarea" placeholder="Escribe aquí…"></textarea>', cls: '.textarea' },
          { html: '<textarea class="textarea textarea-error" value="">No puede estar vacío</textarea>', cls: '.textarea-error' },
          { html: '<textarea class="textarea" disabled>Deshabilitado</textarea>', cls: '.textarea[disabled]' },
          { html: '<textarea class="textarea textarea-fixed" placeholder="Sin resize"></textarea>', cls: '.textarea-fixed' }
        ]
      }
    ]
  },

  /* ============================================
     SELECT
     ============================================ */
  {
    id: 'select',
    title: 'Select',
    description:
      'Select nativo con caret SVG personalizado, más una maqueta de dropdown custom. Clases en <code>themes/_base/_select.css</code>.',
    examples: [
      {
        subtitle: 'Nativo',
        items: [
          {
            html:
              '<select class="select"><option>Selecciona una opción</option><option>Opción A</option><option>Opción B</option></select>',
            cls: '.select'
          },
          {
            html:
              '<select class="select" disabled><option>Deshabilitado</option></select>',
            cls: '.select[disabled]'
          }
        ]
      },
      {
        subtitle: 'Custom (mock)',
        items: [
          {
            html:
              '<div class="select-custom" style="width:220px; position:relative;"><button class="select-trigger" type="button">Opción A <span class="select-caret">▾</span></button><ul class="select-menu" style="position:relative; display:block; margin-top:4px;"><li class="select-item is-selected">Opción A</li><li class="select-item">Opción B</li><li class="select-item">Opción C</li></ul></div>',
            cls: '.select-custom (open)'
          }
        ]
      }
    ]
  },

  /* ============================================
     SLIDER
     ============================================ */
  {
    id: 'slider',
    title: 'Slider',
    description:
      'Range input estilizado en WebKit + Firefox. Clases en <code>themes/_base/_slider.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          { html: '<input type="range" class="slider" value="50" style="width:240px;">', cls: '.slider' },
          { html: '<input type="range" class="slider" value="50" disabled style="width:240px;">', cls: '.slider[disabled]' }
        ]
      }
    ]
  },

  /* ============================================
     TOGGLE GROUP
     ============================================ */
  {
    id: 'toggle-group',
    title: 'Toggle Group',
    description:
      'Botones tipo pill agrupados con estado activo. Clases en <code>themes/_base/_toggle-group.css</code>.',
    examples: [
      {
        subtitle: 'Single',
        items: [
          { html: '<button class="toggle">Inactivo</button>', cls: '.toggle' },
          { html: '<button class="toggle is-active">Activo</button>', cls: '.toggle.is-active' }
        ]
      },
      {
        subtitle: 'Group',
        items: [
          {
            html:
              '<div class="toggle-group"><button class="toggle is-active">Bold</button><button class="toggle">Italic</button><button class="toggle">Underline</button></div>',
            cls: '.toggle-group'
          }
        ]
      }
    ]
  },

  /* ============================================
     INPUT OTP
     ============================================ */
  {
    id: 'otp',
    title: 'Input OTP',
    description:
      'Celdas individuales para códigos OTP / 2FA. Tamaños <code>-sm</code>, default y <code>-lg</code>. Clases en <code>themes/_base/_input-otp.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<div class="otp"><input class="otp-slot" maxlength="1" inputmode="numeric" value="1"><input class="otp-slot" maxlength="1" inputmode="numeric" value="2"><input class="otp-slot" maxlength="1" inputmode="numeric" value="3"><span class="otp-separator">-</span><input class="otp-slot" maxlength="1" inputmode="numeric"><input class="otp-slot" maxlength="1" inputmode="numeric"><input class="otp-slot" maxlength="1" inputmode="numeric"></div>',
            cls: '.otp'
          }
        ]
      }
    ]
  },

  /* ============================================
     TABLE
     ============================================ */
  {
    id: 'table',
    title: 'Table',
    description:
      'Tabla con divisores horizontales, header sutil y hover de fila. Variantes <code>-bordered</code>, <code>-striped</code>, <code>-compact</code>. Clases en <code>themes/_base/_table.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<div class="table-wrapper" style="max-width:480px;"><table class="table"><thead><tr><th>Cliente</th><th>Estado</th><th>Importe</th></tr></thead><tbody><tr><td>Acme Inc.</td><td><span class="badge badge-success">Pagado</span></td><td>250,00 €</td></tr><tr><td>Globex</td><td><span class="badge badge-warning">Pendiente</span></td><td>1.500,00 €</td></tr><tr><td>Initech</td><td><span class="badge badge-destructive">Vencido</span></td><td>820,00 €</td></tr></tbody></table></div>',
            cls: '.table'
          }
        ]
      }
    ]
  },

  /* ============================================
     TABS
     ============================================ */
  {
    id: 'tabs',
    title: 'Tabs',
    description:
      'CSS-only con <code>:has()</code> + radio inputs ocultos. Variante <code>tabs-pills</code>. Clases en <code>themes/_base/_tabs.css</code>.',
    examples: [
      {
        subtitle: 'Underline (default)',
        items: [
          {
            html:
              '<div class="tabs" style="max-width:480px;"><div class="tabs-list"><input type="radio" name="cmp-tabs-1" id="t1-a" class="tabs-input" checked><label for="t1-a" class="tabs-trigger">General</label><input type="radio" name="cmp-tabs-1" id="t1-b" class="tabs-input"><label for="t1-b" class="tabs-trigger">Notificaciones</label><input type="radio" name="cmp-tabs-1" id="t1-c" class="tabs-input"><label for="t1-c" class="tabs-trigger">Facturación</label></div><div class="tabs-panel" data-for="t1-a">Panel General</div><div class="tabs-panel" data-for="t1-b">Panel Notificaciones</div><div class="tabs-panel" data-for="t1-c">Panel Facturación</div></div>',
            cls: '.tabs'
          }
        ]
      }
    ]
  },

  /* ============================================
     ACCORDION
     ============================================ */
  {
    id: 'accordion',
    title: 'Accordion',
    description:
      'Construido con <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> nativo, sin JS. Variante <code>-bordered</code>. Clases en <code>themes/_base/_accordion.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<div class="accordion" style="max-width:480px;"><details class="accordion-item" open><summary class="accordion-trigger">¿Qué incluye el plan?</summary><div class="accordion-content">Acceso completo a todas las funciones, soporte por email y actualizaciones gratuitas.</div></details><details class="accordion-item"><summary class="accordion-trigger">¿Puedo cancelar en cualquier momento?</summary><div class="accordion-content">Sí, sin permanencia. Cancela desde tu panel cuando quieras.</div></details></div>',
            cls: '.accordion'
          }
        ]
      }
    ]
  },

  /* ============================================
     BREADCRUMB
     ============================================ */
  {
    id: 'breadcrumb',
    title: 'Breadcrumb',
    description:
      'Cadena de navegación con separadores. Clases en <code>themes/_base/_breadcrumb.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<nav class="breadcrumb"><ol class="breadcrumb-list"><li class="breadcrumb-item"><a href="#">Home</a></li><li class="breadcrumb-separator">/</li><li class="breadcrumb-item"><a href="#">Productos</a></li><li class="breadcrumb-separator">/</li><li class="breadcrumb-item is-active" aria-current="page">Camiseta</li></ol></nav>',
            cls: '.breadcrumb'
          }
        ]
      }
    ]
  },

  /* ============================================
     PAGINATION
     ============================================ */
  {
    id: 'pagination',
    title: 'Pagination',
    description:
      'Lista de páginas con prev/next y elipsis. Clases en <code>themes/_base/_pagination.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<nav><ul class="pagination"><li class="pagination-item"><a class="pagination-link pagination-prev" href="#">‹ Prev</a></li><li class="pagination-item"><a class="pagination-link" href="#">1</a></li><li class="pagination-item" aria-current="page"><a class="pagination-link is-active" href="#">2</a></li><li class="pagination-item"><a class="pagination-link" href="#">3</a></li><li class="pagination-item"><span class="pagination-ellipsis">…</span></li><li class="pagination-item"><a class="pagination-link" href="#">9</a></li><li class="pagination-item"><a class="pagination-link pagination-next" href="#">Next ›</a></li></ul></nav>',
            cls: '.pagination'
          }
        ]
      }
    ]
  },

  /* ============================================
     SIDEBAR
     ============================================ */
  {
    id: 'sidebar',
    title: 'Sidebar',
    description:
      'Barra lateral con secciones, items y estado activo. Variante <code>sidebar-collapsed</code> (icon only). Clases en <code>themes/_base/_sidebar.css</code>.',
    examples: [
      {
        subtitle: 'Default',
        items: [
          {
            html:
              '<aside class="sidebar" style="height:auto; min-height:280px;"><div class="sidebar-header"><span class="sidebar-brand">holygrailcss</span></div><div class="sidebar-section"><div class="sidebar-label">Workspace</div><ul class="sidebar-list"><li><a class="sidebar-link is-active" href="#"><span>Dashboard</span></a></li><li><a class="sidebar-link" href="#"><span>Projects</span></a></li><li><a class="sidebar-link" href="#"><span>Settings</span></a></li></ul></div></aside>',
            cls: '.sidebar'
          }
        ]
      }
    ]
  },

  /* ============================================
     DIALOG
     ============================================ */
  {
    id: 'dialog',
    title: 'Dialog',
    description:
      'Modal sobre <code>&lt;dialog&gt;</code> nativo. Tamaños <code>-sm</code>, default, <code>-lg</code>, <code>-xl</code>. En el demo se muestra inline (con atributo <code>open</code>) para visualizar los estilos. Clases en <code>themes/_base/_dialog.css</code>.',
    examples: [
      {
        subtitle: 'Estructura',
        items: [
          {
            html:
              '<dialog class="dialog" open style="position:relative; inset:auto; margin:0;"><div class="dialog-header"><h3 class="dialog-title">¿Estás seguro?</h3><p class="dialog-description">Esta acción no se puede deshacer.</p></div><div class="dialog-body">Se eliminarán permanentemente todos los datos asociados a tu cuenta.</div><div class="dialog-footer"><button class="btn btn-tertiary btn-sm">Cancelar</button><button class="btn btn-primary btn-sm">Confirmar</button></div></dialog>',
            cls: '.dialog'
          }
        ]
      }
    ]
  },

  /* ============================================
     DRAWER
     ============================================ */
  {
    id: 'drawer',
    title: 'Drawer',
    description:
      'Panel lateral. Lados: <code>-left</code>, <code>-right</code>, <code>-top</code>, <code>-bottom</code>. En el demo se muestra inline con override de posición. Clases en <code>themes/_base/_drawer.css</code>.',
    examples: [
      {
        subtitle: 'Estructura',
        items: [
          {
            html:
              '<aside class="drawer drawer-right is-open" style="position:relative; inset:auto; height:280px; max-width:320px; transform:none;"><div class="drawer-header"><h3 class="drawer-title">Filtros</h3></div><div class="drawer-body"><p class="muted small">Categoría, precio, color…</p></div><div class="drawer-footer"><button class="btn btn-tertiary btn-sm">Limpiar</button><button class="btn btn-primary btn-sm">Aplicar</button></div></aside>',
            cls: '.drawer.drawer-right.is-open'
          }
        ]
      }
    ]
  },

  /* ============================================
     DROPDOWN
     ============================================ */
  {
    id: 'dropdown',
    title: 'Dropdown menu',
    description:
      'Menú flotante anclado a un trigger. <code>.is-open</code> activa la visibilidad. Clases en <code>themes/_base/_dropdown.css</code>.',
    examples: [
      {
        subtitle: 'Estructura',
        items: [
          {
            html:
              '<div class="dropdown is-open" style="height:240px;"><button class="btn btn-tertiary btn-sm dropdown-trigger" type="button">Acciones ▾</button><div class="dropdown-menu" role="menu"><div class="dropdown-label">Cuenta</div><button class="dropdown-item">Perfil <span class="dropdown-shortcut">⌘P</span></button><button class="dropdown-item">Ajustes <span class="dropdown-shortcut">⌘,</span></button><div class="dropdown-separator"></div><button class="dropdown-item dropdown-item-destructive">Cerrar sesión</button></div></div>',
            cls: '.dropdown.is-open'
          }
        ]
      }
    ]
  },

  /* ============================================
     TOOLTIP
     ============================================ */
  {
    id: 'tooltip',
    title: 'Tooltip',
    description:
      'CSS-only con <code>:hover</code> / <code>:focus-within</code>. Posiciones <code>-top</code> (default), <code>-bottom</code>, <code>-left</code>, <code>-right</code>. Pasa el cursor sobre el botón. Clases en <code>themes/_base/_tooltip.css</code>.',
    examples: [
      {
        subtitle: 'Posiciones',
        items: [
          {
            html:
              '<span class="tooltip tooltip-top" style="margin:24px;"><button class="btn btn-tertiary btn-sm">Hover top</button><span class="tooltip-content">Tooltip arriba</span></span>',
            cls: '.tooltip-top'
          },
          {
            html:
              '<span class="tooltip tooltip-bottom" style="margin:24px;"><button class="btn btn-tertiary btn-sm">Hover bottom</button><span class="tooltip-content">Tooltip debajo</span></span>',
            cls: '.tooltip-bottom'
          },
          {
            html:
              '<span class="tooltip tooltip-right" style="margin:24px;"><button class="btn btn-tertiary btn-sm">Hover right</button><span class="tooltip-content">Tooltip derecha</span></span>',
            cls: '.tooltip-right'
          }
        ]
      }
    ]
  },

  /* ============================================
     TOAST
     ============================================ */
  {
    id: 'toast',
    title: 'Toast',
    description:
      'Notificación efímera. En producción vive dentro de <code>.toaster</code> (fixed). En el demo se muestra inline. Clases en <code>themes/_base/_toast.css</code>.',
    examples: [
      {
        subtitle: 'Variantes',
        items: [
          {
            html:
              '<div class="toast"><div class="toast-content"><h5 class="toast-title">Guardado</h5><p class="toast-description">Tus cambios están publicados.</p></div><button class="toast-close" aria-label="Cerrar">×</button></div>',
            cls: '.toast'
          },
          {
            html:
              '<div class="toast toast-success"><div class="toast-content"><h5 class="toast-title">Compra confirmada</h5><p class="toast-description">Recibirás el pedido en 24 h.</p></div></div>',
            cls: '.toast.toast-success'
          },
          {
            html:
              '<div class="toast toast-destructive"><div class="toast-content"><h5 class="toast-title">Error</h5><p class="toast-description">No se pudo conectar.</p></div></div>',
            cls: '.toast.toast-destructive'
          }
        ]
      }
    ]
  }
];

// Escape HTML para mostrar el nombre de clase dentro de <code>.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderSection(section) {
  const blocks = section.examples
    .map((group) => {
      const items = group.items
        .map(
          (it) => `
          <div class="demo-item">
            <div class="cmp-preview">${it.html}</div>
            <div class="demo-code">${escapeHtml(it.cls)}</div>
          </div>`
        )
        .join('');
      return `
        <h3 class="demo-subtitle">${group.subtitle}</h3>
        <div class="demo-grid">${items}
        </div>`;
    })
    .join('');

  return `
      <section class="demo-section" id="${section.id}">
        <h2 class="demo-title">${section.title}</h2>
        <p class="cmp-desc">${section.description}</p>
        ${blocks}
      </section>`;
}

/**
 * Construye el header + sidebar de la página Componentes, usando la
 * misma estructura que las demos de tema (`buildHeaderAndSidebar` en
 * theme-transformer.js). Enlaces relativos al mismo nivel que los
 * theme demos para mantener coherencia.
 */
function buildHeaderAndSidebar(activeThemes) {
  const themeLinks = (activeThemes || [])
    .map((t) => `        <a href="themes/${t.name}-demo.html">${t.label}</a>`)
    .join('\n');

  const sidebarLinks = COMPONENT_SECTIONS.map(
    (s) => `      <a href="#${s.id}" class="guide-menu-item">${s.title}</a>`
  ).join('\n');

  return `
  <div class="guide-header">
    <a href="index.html" class="guide-logo" style="text-decoration:none;">holygrailcss</a>
    <div style="display: flex; align-items: center; gap: 1rem;">
      <nav class="guide-nav">
        <a href="index.html">Guía</a>
        <a href="componentes.html" class="active">Componentes</a>
${themeLinks}
        <a href="skills.html">Skills</a>
      </nav>
      <button class="guide-header-button" onclick="toggleSidebar()">☰</button>
    </div>
  </div>

  <div class="guide-sidebar-overlay" onclick="toggleSidebar()"></div>

  <aside class="guide-sidebar">
    <div class="guide-sidebar-header">
      <div>holygrailcss</div>
      <p class="guide-sidebar-subtitle">Componentes base</p>
    </div>

    <nav class="guide-sidebar-nav">
      <p class="guide-sidebar-title">Componentes</p>

${sidebarLinks}
    </nav>
  </aside>

  <script>
    function toggleSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }

    function closeSidebar() {
      const sidebar = document.querySelector('.guide-sidebar');
      const overlay = document.querySelector('.guide-sidebar-overlay');
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    window.toggleSidebar = toggleSidebar;
    window.closeSidebar = closeSidebar;
  </script>`;
}

/**
 * Genera el HTML completo de dist/componentes.html.
 *
 * La página adopta la misma estructura que las demos de tema
 * (`guide-header` + `guide-sidebar` + `demo-container.guide-main-content`)
 * y reutiliza `guide-styles.css` para mantener un flow consistente
 * con el resto del sitio.
 *
 * @param {string} projectRoot
 * @param {Object} [configData] - Config ya cargado (para nav dinámica).
 * @returns {string|null}
 */
function generateComponentsPage(projectRoot, configData = null) {
  const baseDir = path.join(projectRoot, 'themes', '_base');
  if (!fs.existsSync(baseDir)) {
    console.warn('⚠️  No se encontró themes/_base/, omitiendo componentes.html');
    return null;
  }

  const activeThemes = configData ? resolveActiveThemes(configData) : [];
  const sectionsHtml = COMPONENT_SECTIONS.map(renderSection).join('\n');
  const headerAndSidebar = buildHeaderAndSidebar(activeThemes);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>holygrailcss — Componentes base</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Instrument+Sans:regular,100,500,600,700">
  <!-- Framework base -->
  <link rel="stylesheet" href="output.css">
  <!-- Tema base genérico: ${BASE_THEME} (variables + componentes) -->
  <link rel="stylesheet" href="themes/${BASE_THEME}.css">
  <!-- Estilos compartidos de guía (header, sidebar, demo-*) -->
  <link rel="stylesheet" href="guide-styles.css">
  <style>
    body {
      font-family: 'Instrument Sans', sans-serif !important;
    }

    /* Descripción de cada sección (debajo del título) */
    .cmp-desc {
      font-size: 14px;
      line-height: 1.6;
      color: #555;
      margin: 0 0 1.5rem;
      max-width: 720px;
    }
    .cmp-desc code {
      background: #f3f3f3;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.88em;
    }

    /* Preview de cada componente dentro de .demo-item */
    .cmp-preview {
      min-height: 48px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: var(--hg-spacing-12);
    }

    /* Los inputs con floating label necesitan respirar: el label flota
       encima, el helper-text se apila debajo. */
    #inputs .cmp-preview,
    #forms .cmp-preview {
      display: block;
    }
    #inputs .cmp-preview > .form-input-label-2,
    #forms .cmp-preview > .form-group {
      width: 100%;
    }

    /* Containers y Grid son estructuras de layout: interesan como
       bloques a 100% del item, no como chips alineados horizontalmente. */
    #containers .demo-grid,
    #grid .demo-grid {
      grid-template-columns: 1fr;
    }
    #containers .cmp-preview,
    #grid .cmp-preview {
      display: block;
    }
    #containers .cmp-preview > [class^="container"],
    #grid .cmp-preview > [class^="hg-grid-"] {
      width: 100%;
      max-width: 100%;
    }
  </style>
</head>
<body>
${headerAndSidebar}

  <main class="demo-container guide-main-content">
    <h2 class="demo-title">Componentes base</h2>

    <div class="demo-section-2">
      <h3>¿Qué es esta página?</h3>
      <p class="mb-16">
        Librería de componentes compartidos que viven en
        <code>themes/_base/</code>. Se renderizan con el tema
        <strong>${BASE_THEME[0].toUpperCase() + BASE_THEME.slice(1)}</strong>
        como base genérica del framework; cualquier otro tema puede
        aplicarse encima para redefinir la identidad visual sin tocar
        el HTML.
      </p>
    </div>

${sectionsHtml}
  </main>
</body>
</html>`;
}

// CLI
if (require.main === module) {
  const projectRoot = path.join(__dirname, '..', '..');
  const html = generateComponentsPage(projectRoot);
  if (html) {
    const outputPath = path.join(projectRoot, 'dist', 'componentes.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log('✅ componentes.html generado en dist/');
  }
}

module.exports = { generateComponentsPage };

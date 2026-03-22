// Objeto para guardar los datos del AFD
const afd = {
  estados: [],
  alfabeto: [],
  estadoInicial: '',
  estadosFinales: [],
  transiciones: {}
};

/** Instancia de Cytoscape para el diagrama de transición */
let cy = null;

const ESTILO_CYTOSCAPE = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#ffffff',
      'border-width': 2,
      'border-color': '#212529',
      width: 46,
      height: 46,
      'font-size': '13px',
      color: '#212529'
    }
  },
  {
    selector: 'node[isInitial]',
    style: {
      'border-width': 4,
      'border-color': '#0d6efd'
    }
  },
  {
    selector: 'node[isFinal]',
    style: {
      'background-color': '#d1e7dd',
      'border-width': 4,
      'border-color': '#198754'
    }
  },
  {
    selector: 'node[isInitial][isFinal]',
    style: {
      'border-color': '#6f42c1',
      'background-color': '#e7d5ff'
    }
  },
  {
    selector: 'node.path',
    style: {
      'background-color': '#fff3cd',
      'border-color': '#fd7e14',
      'border-width': 4
    }
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': '#495057',
      'target-arrow-color': '#495057',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1,
      label: 'data(label)',
      'font-size': '11px',
      color: '#212529',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.9,
      'text-background-padding': '3px'
    }
  },
  {
    selector: 'edge.path',
    style: {
      width: 4,
      'line-color': '#fd7e14',
      'target-arrow-color': '#fd7e14',
      'z-index': 999
    }
  }
];

function transicionesYaGeneradas() {
  return Boolean(document.getElementById('transicionesContainer').querySelector('select[id^="trans-"]'));
}

function iniciar() {
  document.getElementById('generarTransicionesBtn').addEventListener('click', generarTransiciones);
  document.getElementById('probarAFDBtn').addEventListener('click', probarCadena);
  document.getElementById('transicionesContainer').addEventListener('change', (e) => {
    if (e.target.matches('select[id^="trans-"]')) {
      sincronizarAFDDesdeDOM();
      actualizarDiagrama();
    }
  });
  document.getElementById('estadoInicial').addEventListener('change', () => {
    if (transicionesYaGeneradas()) {
      sincronizarAFDDesdeDOM();
      actualizarDiagrama();
    }
  });
  document.getElementById('estadosFinales').addEventListener('input', () => {
    if (transicionesYaGeneradas()) {
      sincronizarAFDDesdeDOM();
      actualizarDiagrama();
    }
  });
}

function obtenerCytoscape() {
  if (typeof cytoscape === 'undefined') {
    return null;
  }
  if (!cy) {
    cy = cytoscape({
      container: document.getElementById('cy'),
      style: ESTILO_CYTOSCAPE,
      minZoom: 0.25,
      maxZoom: 2.5,
      wheelSensitivity: 0.35
    });
    cy.on('tap', () => cy.elements().removeClass('path'));
    window.addEventListener('resize', () => {
      if (cy) cy.resize();
    });
  }
  return cy;
}

/** Lee estado inicial, finales y tabla de transiciones desde el DOM */
function sincronizarAFDDesdeDOM() {
  const inicialEl = document.getElementById('estadoInicial');
  afd.estadoInicial = inicialEl ? inicialEl.value : '';
  const finalesRaw = document.getElementById('estadosFinales').value;
  afd.estadosFinales = finalesRaw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  afd.transiciones = {};
  afd.estados.forEach((estado) => {
    afd.transiciones[estado] = {};
    afd.alfabeto.forEach((simbolo) => {
      const select = document.getElementById(`trans-${estado}-${simbolo}`);
      if (select) {
        afd.transiciones[estado][simbolo] = select.value;
      }
    });
  });
}

function construirElementosGrafo() {
  const nodes = afd.estados.map((id) => {
    const data = { id, label: id };
    if (id === afd.estadoInicial) data.isInitial = true;
    if (afd.estadosFinales.includes(id)) data.isFinal = true;
    return { data };
  });

  const edges = [];
  afd.estados.forEach((origen) => {
    afd.alfabeto.forEach((simbolo) => {
      const destino = afd.transiciones[origen]?.[simbolo];
      if (!destino) return;
      edges.push({
        data: {
          id: `e-${origen}-${destino}-${simbolo}`,
          source: origen,
          target: destino,
          label: simbolo
        }
      });
    });
  });

  return { nodes, edges };
}

function mostrarContenedorDiagrama(visible) {
  const placeholder = document.getElementById('diagramaPlaceholder');
  const container = document.getElementById('cy');
  if (visible) {
    placeholder.classList.add('d-none');
    container.classList.remove('d-none');
  } else {
    placeholder.classList.remove('d-none');
    container.classList.add('d-none');
  }
}

/**
 * Dibuja el AFD. Opcionalmente resalta el camino seguido al probar una cadena.
 * @param {{ camino?: string[], cadena?: string } | undefined} resaltar
 */
function actualizarDiagrama(resaltar) {
  if (!afd.estados.length || !afd.alfabeto.length) {
    mostrarContenedorDiagrama(false);
    return;
  }

  const instancia = obtenerCytoscape();
  if (!instancia) {
    mostrarContenedorDiagrama(false);
    return;
  }

  sincronizarAFDDesdeDOM();
  const { nodes, edges } = construirElementosGrafo();
  instancia.elements().remove();
  instancia.add([...nodes, ...edges]);

  instancia.elements().removeClass('path');

  if (resaltar?.camino?.length && resaltar.cadena !== undefined) {
    const camino = resaltar.camino;
    const cadena = resaltar.cadena;
    for (let i = 0; i < camino.length; i++) {
      const n = instancia.getElementById(camino[i]);
      if (n.length) n.addClass('path');
    }
    for (let i = 0; i < cadena.length; i++) {
      const desde = camino[i];
      const simbolo = cadena[i];
      const edgeId = `e-${desde}-${afd.transiciones[desde][simbolo]}-${simbolo}`;
      const e = instancia.getElementById(edgeId);
      if (e.length) e.addClass('path');
    }
  }

  instancia.layout({
    name: 'circle',
    fit: true,
    padding: 48,
    animate: true,
    animationDuration: 350
  }).run();

  mostrarContenedorDiagrama(true);
}

// Genera los campos para las transiciones
function generarTransiciones() {
  afd.estados = document.getElementById('estados').value.split(',').map((e) => e.trim()).filter(Boolean);
  afd.alfabeto = document.getElementById('alfabeto').value.split(',').map((a) => a.trim()).filter(Boolean);

  if (afd.estados.length === 0 || afd.alfabeto.length === 0) {
    alert('Por favor ingresa estados y alfabeto primero');
    return;
  }

  const selectInicial = document.getElementById('estadoInicial');
  selectInicial.innerHTML = '';
  afd.estados.forEach((estado) => {
    const option = document.createElement('option');
    option.value = estado;
    option.textContent = estado;
    selectInicial.appendChild(option);
  });

  const container = document.getElementById('transicionesContainer');
  container.innerHTML = '';

  afd.estados.forEach((estado) => {
    const div = document.createElement('div');
    div.className = 'mb-3 p-2 border';
    div.innerHTML = `<h5 class="fw-bold">Desde ${estado}:</h5>`;

    afd.alfabeto.forEach((simbolo) => {
      div.innerHTML += `
        <div class="input-group mb-2">
          <span class="input-group-text">${simbolo} →</span>
          <select id="trans-${estado}-${simbolo}" class="form-select">
            ${afd.estados.map((e) => `<option value="${e}">${e}</option>`).join('')}
          </select>
        </div>
      `;
    });

    container.appendChild(div);
  });

  sincronizarAFDDesdeDOM();
  actualizarDiagrama();
}

// Prueba una cadena con el AFD configurado
function probarCadena() {
  afd.estadoInicial = document.getElementById('estadoInicial').value;
  afd.estadosFinales = document.getElementById('estadosFinales').value.split(',').map((e) => e.trim()).filter(Boolean);
  const cadena = document.getElementById('cadenaPrueba').value;

  if (!afd.estadoInicial || afd.estadosFinales.length === 0) {
    alert('Configura el AFD completamente primero');
    return;
  }

  afd.transiciones = {};
  afd.estados.forEach((estado) => {
    afd.transiciones[estado] = {};
    afd.alfabeto.forEach((simbolo) => {
      const select = document.getElementById(`trans-${estado}-${simbolo}`);
      if (select) {
        afd.transiciones[estado][simbolo] = select.value;
      }
    });
  });

  let estadoActual = afd.estadoInicial;
  const camino = [estadoActual];

  for (let i = 0; i < cadena.length; i++) {
    const simbolo = cadena[i];
    if (!afd.alfabeto.includes(simbolo)) {
      mostrarResultado(false, `El símbolo '${simbolo}' no es válido`, camino);
      actualizarDiagrama({ camino, cadena: cadena.slice(0, i) });
      return;
    }

    const siguienteEstado = afd.transiciones[estadoActual][simbolo];

    if (!siguienteEstado) {
      mostrarResultado(false, `No hay transición para '${simbolo}' desde '${estadoActual}'`, camino);
      actualizarDiagrama({ camino, cadena: cadena.slice(0, i) });
      return;
    }

    estadoActual = siguienteEstado;
    camino.push(estadoActual);
  }

  const aceptada = afd.estadosFinales.includes(estadoActual);
  mostrarResultado(
    aceptada,
    `La cadena "${cadena}" fue ${aceptada ? 'ACEPTADA' : 'RECHAZADA'}`,
    camino
  );
  actualizarDiagrama({ camino, cadena });
}

// Muestra el resultado en pantalla
function mostrarResultado(aceptada, mensaje, camino) {
  const resultadoDiv = document.getElementById('resultado');
  const resultadoTexto = document.getElementById('resultadoTexto');
  const caminoTexto = document.getElementById('caminoTexto');

  resultadoDiv.className = aceptada ? 'alert alert-success' : 'alert alert-danger';
  resultadoDiv.classList.remove('d-none');

  resultadoTexto.textContent = mensaje;
  caminoTexto.textContent = `Camino: ${camino.join(' → ')}`;
}

document.addEventListener('DOMContentLoaded', iniciar);

const ACCENT_COLOR = '#5a10c1';
const EPSILON = 'ε';

const { createApp, nextTick } = Vue;

createApp({
  data() {
    return {
      theme: 'light',
      generado: false,
      estadosInput: 'q0,q1,qf',
      alfabetoInput: '(,)',
      pilaAlfabetoInput: 'Z,(',
      estadoInicialInput: 'q0',
      simboloInicialPila: 'Z',
      estadosFinalesInput: 'qf',
      cadenaPrueba: '(()())',
      modoAceptacion: 'final',
      transicionesEditor: [
        { origen: 'q0', entrada: '(', tope: 'Z', destino: 'q0', reemplazo: '(Z' },
        { origen: 'q0', entrada: '(', tope: '(', destino: 'q0', reemplazo: '((' },
        { origen: 'q0', entrada: ')', tope: '(', destino: 'q0', reemplazo: EPSILON },
        { origen: 'q0', entrada: EPSILON, tope: 'Z', destino: 'qf', reemplazo: 'Z' }
      ],
      apd: {
        estados: [],
        alfabeto: [],
        pilaAlfabeto: [],
        estadoInicial: '',
        simboloInicialPila: 'Z',
        estadosFinales: [],
        transiciones: []
      },
      resultado: {
        visible: false,
        aceptada: false,
        mensaje: '',
        traza: [],
        transicionAplicada: ''
      },
      cy: null
    };
  },
  computed: {
    estadosOpciones() {
      const estados = this.parseLista(this.estadosInput);
      return estados.length ? estados : ['q0'];
    },
    entradaOpciones() {
      return this.armarOpciones([EPSILON, ...this.parseLista(this.alfabetoInput)]);
    },
    pilaOpciones() {
      return this.armarOpciones([EPSILON, ...this.parseLista(this.pilaAlfabetoInput)]);
    },
    reemplazoOpciones() {
      const simbolos = this.parseLista(this.pilaAlfabetoInput);
      const opciones = [EPSILON, ...simbolos];

      for (const a of simbolos) {
        for (const b of simbolos) {
          opciones.push(`${a}${b}`);
        }
      }

      return this.armarOpciones(opciones);
    }
  },
  methods: {
    alternarThemeEnDOM() {
      document.body.setAttribute('data-theme', this.theme);
      document.documentElement.setAttribute('data-bs-theme', this.theme);
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.alternarThemeEnDOM();
      if (this.generado) this.actualizarDiagramaPda();
    },
    obtenerEstiloCytoscapePda() {
      const isDark = this.theme === 'dark';
      const textColor = isDark ? '#f1f3f5' : '#212529';
      const cardBg = isDark ? '#1f2432' : '#ffffff';
      const edgeColor = isDark ? '#c2c8d0' : '#495057';

      return [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': cardBg,
            color: textColor,
            'border-width': 2,
            'border-color': textColor,
            width: 48,
            height: 48
          }
        },
        {
          selector: 'node[isInitial]',
          style: {
            'border-width': 4,
            'border-color': ACCENT_COLOR
          }
        },
        {
          selector: 'node[isFinal]',
          style: {
            'border-width': 4,
            'border-color': '#20a66a'
          }
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': edgeColor,
            'target-arrow-color': edgeColor,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            color: textColor,
            'text-background-color': cardBg,
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'font-size': '10px'
          }
        }
      ];
    },
    obtenerCyPda() {
      if (typeof cytoscape === 'undefined') return null;
      if (!this.cy) {
        this.cy = cytoscape({
          container: document.getElementById('cy-pda'),
          minZoom: 0.25,
          maxZoom: 2.5,
          wheelSensitivity: 0.35
        });
        window.addEventListener('resize', () => {
          if (this.cy) this.cy.resize();
        });
      }
      return this.cy;
    },
    construirGrafoPda() {
      const nodes = this.apd.estados.map((id) => {
        const data = { id, label: id };
        if (id === this.apd.estadoInicial) data.isInitial = true;
        if (this.apd.estadosFinales.includes(id)) data.isFinal = true;
        return { data };
      });

      const edges = [];
      const etiquetas = new Map();

      for (const transicion of this.apd.transiciones) {
        const key = `${transicion.origen}->${transicion.destino}`;
        const etiqueta = `${transicion.entrada},${transicion.tope}/${transicion.reemplazo}`;
        if (!etiquetas.has(key)) etiquetas.set(key, []);
        etiquetas.get(key).push(etiqueta);
      }

      for (const [key, labels] of etiquetas.entries()) {
        const separador = key.indexOf('->');
        const origen = key.slice(0, separador);
        const destino = key.slice(separador + 2);
        edges.push({
          data: {
            id: `e-${origen}-${destino}`,
            source: origen,
            target: destino,
            label: labels.join(' | ')
          }
        });
      }

      return { nodes, edges };
    },
    actualizarDiagramaPda() {
      if (!this.generado) return;
      const instancia = this.obtenerCyPda();
      if (!instancia) return;

      const { nodes, edges } = this.construirGrafoPda();
      instancia.style(this.obtenerEstiloCytoscapePda());
      instancia.elements().remove();
      instancia.add([...nodes, ...edges]);

      instancia.layout({
        name: 'circle',
        fit: true,
        padding: 48,
        animate: true,
        animationDuration: 300
      }).run();
    },
    parseLista(valor) {
      return valor.split(',').map((x) => x.trim()).filter(Boolean);
    },
    armarOpciones(opciones) {
      return [...new Set(opciones.filter(Boolean))];
    },
    crearTransicionVacia() {
      const origen = this.estadosOpciones[0] || 'q0';
      const entrada = this.entradaOpciones[0] || EPSILON;
      const tope = this.pilaOpciones[0] || EPSILON;
      const destino = this.estadosOpciones[0] || 'q0';
      const reemplazo = this.reemplazoOpciones[0] || EPSILON;
      return { origen, entrada, tope, destino, reemplazo };
    },
    agregarTransicion() {
      this.transicionesEditor.push(this.crearTransicionVacia());
      this.generado = false;
    },
    eliminarTransicion() {
      if (this.transicionesEditor.length <= 1) return;
      this.transicionesEditor.pop();
      this.generado = false;
    },
    normalizarSimbolo(valor) {
      const simbolo = valor.trim();
      if (!simbolo || ['ε', 'lambda', 'Λ', 'eps', 'epsilon'].includes(simbolo.toLowerCase())) {
        return EPSILON;
      }
      return simbolo;
    },
    parsearTransiciones() {
      if (!this.transicionesEditor.length) {
        throw new Error('Debes agregar al menos una transición');
      }

      return this.transicionesEditor.map((row, index) => {
        const origen = (row.origen || '').trim();
        const entrada = this.normalizarSimbolo(row.entrada || EPSILON);
        const tope = this.normalizarSimbolo(row.tope || EPSILON);
        const destino = (row.destino || '').trim();
        const reemplazo = this.normalizarSimbolo(row.reemplazo || EPSILON);

        if (!origen || !destino) {
          throw new Error(`Completa estado y nuevo estado en la transición ${index + 1}`);
        }

        return { origen, entrada, tope, destino, reemplazo };
      });
    },
    generarProblema() {
      const estados = this.parseLista(this.estadosInput);
      const alfabeto = this.parseLista(this.alfabetoInput);
      const pilaAlfabeto = this.parseLista(this.pilaAlfabetoInput);
      const finales = this.parseLista(this.estadosFinalesInput);

      if (!estados.length || !alfabeto.length || !pilaAlfabeto.length) {
        window.alert('Completa estados, alfabeto de entrada y alfabeto de pila primero');
        return;
      }

      if (!this.estadoInicialInput.trim() || !this.simboloInicialPila.trim()) {
        window.alert('Define el estado inicial y el símbolo inicial de pila');
        return;
      }

      this.apd.estados = estados;
      this.apd.alfabeto = alfabeto;
      this.apd.pilaAlfabeto = pilaAlfabeto;
      this.apd.estadoInicial = this.estadoInicialInput.trim();
      this.apd.simboloInicialPila = this.simboloInicialPila.trim();
      this.apd.estadosFinales = finales.filter((estado) => estados.includes(estado));

      try {
        this.apd.transiciones = this.parsearTransiciones();
      } catch (error) {
        window.alert(error.message);
        return;
      }

      const destinosValidos = new Set(this.apd.estados);
      const simbolosValidos = new Set([...this.apd.alfabeto, ...this.apd.pilaAlfabeto, EPSILON]);

      for (const transicion of this.apd.transiciones) {
        if (!destinosValidos.has(transicion.origen) || !destinosValidos.has(transicion.destino)) {
          window.alert(`La transición usa estados no declarados: ${transicion.origen} -> ${transicion.destino}`);
          return;
        }

        if (!simbolosValidos.has(transicion.entrada) || !simbolosValidos.has(transicion.tope)) {
          window.alert(`La transición usa símbolos no declarados: ${transicion.origen}, ${transicion.entrada}, ${transicion.tope}`);
          return;
        }
      }

      this.generado = true;
      this.resultado.visible = false;
      this.resultado.traza = [];
      this.resultado.transicionAplicada = '';

      nextTick(() => this.actualizarDiagramaPda());
    },
    cargarEjemplo() {
      this.estadosInput = 'q0,qf';
      this.alfabetoInput = '(,)';
      this.pilaAlfabetoInput = 'Z,(';
      this.estadoInicialInput = 'q0';
      this.simboloInicialPila = 'Z';
      this.estadosFinalesInput = 'qf';
      this.modoAceptacion = 'final';
      this.cadenaPrueba = '(()())';
      this.transicionesEditor = [
        { origen: 'q0', entrada: '(', tope: 'Z', destino: 'q0', reemplazo: '(Z' },
        { origen: 'q0', entrada: '(', tope: '(', destino: 'q0', reemplazo: '((' },
        { origen: 'q0', entrada: ')', tope: '(', destino: 'q0', reemplazo: EPSILON },
        { origen: 'q0', entrada: EPSILON, tope: 'Z', destino: 'qf', reemplazo: 'Z' }
      ];
      this.generado = false;
      this.resultado.visible = false;
    },
    cargarEjemploAB() {
      this.estadosInput = 'q0,q1,q2';
      this.alfabetoInput = 'a,b';
      this.pilaAlfabetoInput = 'Z,1';
      this.estadoInicialInput = 'q0';
      this.simboloInicialPila = 'Z';
      this.estadosFinalesInput = 'q2';
      this.modoAceptacion = 'final';
      this.cadenaPrueba = 'aabb';
      this.transicionesEditor = [
        { origen: 'q0', entrada: 'a', tope: 'Z', destino: 'q0', reemplazo: '1Z' },
        { origen: 'q0', entrada: 'a', tope: '1', destino: 'q0', reemplazo: '11' },
        { origen: 'q0', entrada: 'b', tope: '1', destino: 'q1', reemplazo: EPSILON },
        { origen: 'q1', entrada: 'b', tope: '1', destino: 'q1', reemplazo: EPSILON },
        { origen: 'q1', entrada: EPSILON, tope: 'Z', destino: 'q2', reemplazo: 'Z' }
      ];
      this.generado = false;
      this.resultado.visible = false;
    },
    formatearPila(pila) {
      return pila.length ? pila.join('') : 'ε';
    },
    encontrarTransicion(estadoActual, simboloEntrada, tope) {
      return this.apd.transiciones.find((transicion) => (
        transicion.origen === estadoActual
        && transicion.tope === tope
        && (transicion.entrada === simboloEntrada || transicion.entrada === EPSILON)
      ));
    },
    aplicarReemplazo(pila, reemplazo) {
      if (pila.length) {
        pila.pop();
      }

      if (reemplazo === EPSILON) {
        return pila;
      }

      for (let i = reemplazo.length - 1; i >= 0; i--) {
        pila.push(reemplazo[i]);
      }

      return pila;
    },
    construirDescripcionTransicion(transicion) {
      return `${transicion.origen}, ${transicion.entrada}, ${transicion.tope} -> ${transicion.destino}, ${transicion.reemplazo}`;
    },
    resolverCadena() {
      if (!this.generado) {
        this.generarProblema();
        if (!this.generado) return;
      }

      if (!this.apd.estadoInicial || !this.apd.simboloInicialPila) {
        window.alert('Configura primero el autómata');
        return;
      }

      const pila = [this.apd.simboloInicialPila];
      let estadoActual = this.apd.estadoInicial;
      let entradaRestante = this.cadenaPrueba;
      const traza = [{
        estado: estadoActual,
        entradaRestante: entradaRestante || 'ε',
        pila: this.formatearPila(pila)
      }];

      const transicionesUsadas = [];
      const maxPasos = (entradaRestante.length + this.apd.transiciones.length + 5) * 4;
      const vistos = new Set();

      for (let paso = 0; paso < maxPasos; paso++) {
        const tope = pila.at(-1);
        if (!tope) break;

        const simboloEntrada = entradaRestante[0] || EPSILON;
        const clave = `${estadoActual}|${entradaRestante}|${pila.join('')}`;
        if (vistos.has(clave)) {
          transicionesUsadas.push('Se detectó un ciclo de ε-transiciones y la simulación se detuvo.');
          break;
        }
        vistos.add(clave);

        const transicion = this.encontrarTransicion(estadoActual, simboloEntrada, tope);
        if (!transicion) {
          break;
        }

        transicionesUsadas.push(this.construirDescripcionTransicion(transicion));

        if (transicion.entrada !== EPSILON) {
          entradaRestante = entradaRestante.slice(1);
        }

        estadoActual = transicion.destino;
        this.aplicarReemplazo(pila, transicion.reemplazo);

        traza.push({
          estado: estadoActual,
          entradaRestante: entradaRestante || 'ε',
          pila: this.formatearPila(pila)
        });

        if (!entradaRestante && transicion.entrada !== EPSILON) {
          continue;
        }
      }

      const entradaConsumida = !entradaRestante;
      let aceptada = false;

      if (this.modoAceptacion === 'final') {
        aceptada = entradaConsumida && this.apd.estadosFinales.includes(estadoActual);
      } else {
        aceptada = entradaConsumida && pila.length === 0;
      }

      this.resultado = {
        visible: true,
        aceptada,
        mensaje: aceptada
          ? 'La cadena fue ACEPTADA'
          : 'La cadena fue RECHAZADA',
        traza,
        transicionAplicada: transicionesUsadas.length ? transicionesUsadas.join('\n') : 'No se aplicaron transiciones'
      };
    }
  },
  mounted() {
    this.alternarThemeEnDOM();
    this.generarProblema();
  }
}).mount('#app');
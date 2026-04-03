const ACCENT_COLOR = '#5a10c1';
const EPSILON = 'ε';

const { createApp } = Vue;

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
      transicionesInput: 'q0, (, Z -> q0, (Z\nq0, (, ( -> q0, ((\nq0, ), ( -> q0, ε\nq0, ε, Z -> qf, Z',
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
      }
    };
  },
  methods: {
    alternarThemeEnDOM() {
      document.body.setAttribute('data-theme', this.theme);
      document.documentElement.setAttribute('data-bs-theme', this.theme);
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.alternarThemeEnDOM();
    },
    parseLista(valor) {
      return valor.split(',').map((x) => x.trim()).filter(Boolean);
    },
    normalizarSimbolo(valor) {
      const simbolo = valor.trim();
      if (!simbolo || ['ε', 'lambda', 'Λ', 'eps', 'epsilon'].includes(simbolo.toLowerCase())) {
        return EPSILON;
      }
      return simbolo;
    },
    parsearTransiciones() {
      const transiciones = [];
      const lineas = this.transicionesInput.split('\n');

      for (const lineaOriginal of lineas) {
        const linea = lineaOriginal.trim();
        if (!linea) continue;

        const partes = linea.split('->');
        if (partes.length !== 2) {
          throw new Error(`Formato inválido: "${lineaOriginal}"`);
        }

        const izquierda = partes[0].split(',').map((x) => x.trim());
        const derecha = partes[1].split(',').map((x) => x.trim());

        if (izquierda.length !== 3 || derecha.length !== 2) {
          throw new Error(`Formato inválido: "${lineaOriginal}"`);
        }

        transiciones.push({
          origen: izquierda[0],
          entrada: this.normalizarSimbolo(izquierda[1]),
          tope: this.normalizarSimbolo(izquierda[2]),
          destino: derecha[0],
          reemplazo: this.normalizarSimbolo(derecha[1])
        });
      }

      return transiciones;
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
      this.transicionesInput = [
        'q0, (, Z -> q0, (Z',
        'q0, (, ( -> q0, ((',
        'q0, ), ( -> q0, ε',
        'q0, ε, Z -> qf, Z'
      ].join('\n');
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
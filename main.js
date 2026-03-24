const ACCENT_COLOR = '#5a10c1';

const { createApp, nextTick } = Vue;

createApp({
  data() {
    return {
      theme: 'light',
      generado: false,
      estadosInput: '',
      alfabetoInput: '',
      estadosFinalesInput: '',
      cadenaPrueba: '',
      resultado: {
        visible: false,
        aceptada: false,
        mensaje: '',
        camino: []
      },
      afd: {
        estados: [],
        alfabeto: [],
        estadoInicial: '',
        estadosFinales: [],
        transiciones: {}
      },
      cy: null
    };
  },
  watch: {
    'afd.estadoInicial'() {
      if (this.generado) this.actualizarDiagrama();
    },
    estadosFinalesInput() {
      if (!this.generado) return;
      this.sincronizarFinales();
      this.actualizarDiagrama();
    },
    'afd.transiciones': {
      deep: true,
      handler() {
        if (this.generado) this.actualizarDiagrama();
      }
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
      if (this.generado) this.actualizarDiagrama();
    },
    parseLista(valor) {
      return valor.split(',').map((x) => x.trim()).filter(Boolean);
    },
    sincronizarFinales() {
      const finales = this.parseLista(this.estadosFinalesInput);
      this.afd.estadosFinales = finales.filter((e) => this.afd.estados.includes(e));
    },
    generarTransiciones() {
      const estados = this.parseLista(this.estadosInput);
      const alfabeto = this.parseLista(this.alfabetoInput);

      if (!estados.length || !alfabeto.length) {
        window.alert('Por favor ingresa estados y alfabeto primero');
        return;
      }

      this.afd.estados = estados;
      this.afd.alfabeto = alfabeto;
      this.afd.estadoInicial = estados[0];
      this.sincronizarFinales();

      const transiciones = {};
      estados.forEach((estado) => {
        transiciones[estado] = {};
        alfabeto.forEach((simbolo) => {
          transiciones[estado][simbolo] = estados[0];
        });
      });
      this.afd.transiciones = transiciones;

      this.resultado.visible = false;
      this.generado = true;

      nextTick(() => this.actualizarDiagrama());
    },
    obtenerEstiloCytoscape() {
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
          selector: 'node.path',
          style: {
            'background-color': '#ffd8a8',
            'border-color': '#fd7e14'
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
            'text-background-padding': '3px'
          }
        },
        {
          selector: 'edge.path',
          style: {
            width: 4,
            'line-color': '#fd7e14',
            'target-arrow-color': '#fd7e14'
          }
        }
      ];
    },
    obtenerCy() {
      if (typeof cytoscape === 'undefined') return null;
      if (!this.cy) {
        this.cy = cytoscape({
          container: document.getElementById('cy'),
          minZoom: 0.25,
          maxZoom: 2.5,
          wheelSensitivity: 0.35
        });
        this.cy.on('tap', () => this.cy.elements().removeClass('path'));
        window.addEventListener('resize', () => {
          if (this.cy) this.cy.resize();
        });
      }
      return this.cy;
    },
    construirGrafo() {
      const nodes = this.afd.estados.map((id) => {
        const data = { id, label: id };
        if (id === this.afd.estadoInicial) data.isInitial = true;
        if (this.afd.estadosFinales.includes(id)) data.isFinal = true;
        return { data };
      });

      const edges = [];
      this.afd.estados.forEach((origen) => {
        this.afd.alfabeto.forEach((simbolo) => {
          const destino = this.afd.transiciones[origen][simbolo];
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
    },
    actualizarDiagrama(resaltar) {
      if (!this.generado) return;
      const instancia = this.obtenerCy();
      if (!instancia) return;

      const { nodes, edges } = this.construirGrafo();
      instancia.style(this.obtenerEstiloCytoscape());
      instancia.elements().remove();
      instancia.add([...nodes, ...edges]);
      instancia.elements().removeClass('path');

      if (resaltar?.camino?.length && typeof resaltar.cadena === 'string') {
        for (let i = 0; i < resaltar.camino.length; i++) {
          const nodo = instancia.getElementById(resaltar.camino[i]);
          if (nodo.length) nodo.addClass('path');
        }
        for (let i = 0; i < resaltar.cadena.length; i++) {
          const desde = resaltar.camino[i];
          const simbolo = resaltar.cadena[i];
          const hasta = this.afd.transiciones[desde][simbolo];
          const edge = instancia.getElementById(`e-${desde}-${hasta}-${simbolo}`);
          if (edge.length) edge.addClass('path');
        }
      }

      instancia.layout({
        name: 'circle',
        fit: true,
        padding: 48,
        animate: true,
        animationDuration: 300
      }).run();
    },
    probarCadena() {
      if (!this.generado) return;
      if (!this.afd.estadoInicial || !this.afd.estadosFinales.length) {
        window.alert('Configura el AFD completamente primero');
        return;
      }

      let estadoActual = this.afd.estadoInicial;
      const camino = [estadoActual];
      const cadena = this.cadenaPrueba;

      for (let i = 0; i < cadena.length; i++) {
        const simbolo = cadena[i];

        if (!this.afd.alfabeto.includes(simbolo)) {
          this.resultado = {
            visible: true,
            aceptada: false,
            mensaje: `El símbolo '${simbolo}' no es válido`,
            camino
          };
          this.actualizarDiagrama({ camino, cadena: cadena.slice(0, i) });
          return;
        }

        const siguiente = this.afd.transiciones[estadoActual][simbolo];
        estadoActual = siguiente;
        camino.push(estadoActual);
      }

      const aceptada = this.afd.estadosFinales.includes(estadoActual);
      this.resultado = {
        visible: true,
        aceptada,
        mensaje: `La cadena "${cadena}" fue ${aceptada ? 'ACEPTADA' : 'RECHAZADA'}`,
        camino
      };
      this.actualizarDiagrama({ camino, cadena });
    }
  },
  mounted() {
    this.alternarThemeEnDOM();
  }
}).mount('#app');

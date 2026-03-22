# ** Simulador de Autómatas Finitos Deterministas (AFD)**
## ** Descripción**  
Herramienta web interactiva para diseñar, configurar y probar Autómatas Finitos Deterministas (AFD). Permite definir estados, alfabetos, transiciones y evaluar cadenas para verificar su aceptación.
---
### **Sitio Web**
https://automatafinito.netlify.app/
---

## ** Características**  
   **Configuración visual del AFD**:  
   - Define estados, símbolos del alfabeto, estado inicial y finales.  
   - Genera tablas de transiciones dinámicamente.  

    **Simulación paso a paso**:  
   - Prueba cadenas y observa el camino recorrido.  
   - Resultados claros (aceptación/rechazo + ruta de estados).  

    **Interfaz intuitiva**:  
   - Diseño responsive (funciona en móviles y desktop).  
   - Feedback visual con Bootstrap.  

    **Sin dependencias externas**:  
   - Solo requiere un navegador moderno.  
---
# ** Cómo Usar el Simulador de AFD**  

### ** 1 Configuración del Autómata**  
1. **Estados**:  
   - Ingresa los nombres de los estados **separados por comas** (ej: `q0,q1,q2` o `A,B,C`).  
2. **Alfabeto**:  
   - Define los símbolos válidos **separados por comas** (ej: `0,1`, `a,b,c`, `x,y,z`).  
3. **Genera transiciones**:  
   - Haz clic en **"Generar Transiciones"** para crear la tabla de transiciones.  
4. **Estado inicial**:  
   - Selecciona el estado inicial desde el menú desplegable.  
5. **Estados finales**:  
   - Ingresa los estados de aceptación **separados por comas** (ej: `q0` o `A,C`).  

### ** Define las Transiciones**  
- Completa la tabla generada:  
  - Para cada estado (`q0`, `q1`, etc.) y cada símbolo (`0`, `a`, `x`, etc.), selecciona el **estado destino**.  
  - Ejemplo para un AFD que cuenta "a"s pares:  
    - Desde `q0`: `a → q1`, `b → q0`, `c → q0`.  
    - Desde `q1`: `a → q0`, `b → q1`, `c → q1`.  

### ** Prueba Cadenas**  
1. Escribe una cadena en el campo **"Cadena a evaluar"** (ej: `aab`, `101`, `xyz`).  
2. Haz clic en **"Probar Cadena"**.  
3. **Resultado**:  
   -  **Aceptada**: Si termina en un estado final.  
   -  **Rechazada**: Si termina en un estado no final.  
   -  **Camino**: Se muestra la secuencia de estados recorridos.  

---

### ** Ejemplos Prácticos**  
#### **Ejemplo 1: AFD que acepta cadenas con número par de "1"s**  
- **Estados**: `q0, q1`  
- **Alfabeto**: `0,1`  
- **Estado inicial**: `q0`  
- **Estados finales**: `q0`  
- **Transiciones**:  
  - `q0`: `0 → q0`, `1 → q1`  
  - `q1`: `0 → q1`, `1 → q0`  

**Prueba**:  
- Acepta: `""`, `00`, `110`, `0101`  
- Rechaza: `1`, `01`, `111`  

#### **Ejemplo 2: AFD que acepta cadenas con número par de "a"s (ignorando otros símbolos)**  
- **Alfabeto**: `a,b,c`  
- **Transiciones**:  
  - `q0`: `a → q1`, `b/c → q0`  
  - `q1`: `a → q0`, `b/c → q1`  

**Prueba**:  
- Acepta: `bb`, `abcba`, `ccc`  
- Rechaza: `a`, `baab`, `cac`  

---

### ** Consejos**  
- Usa **símbolos únicos** (ej: `a, b` en lugar de `ab, bc`).  
- Los estados pueden llamarse como quieras (`q0`, `A`, `S1`, etc.).  
- Si el autómata no funciona, verifica:  
  - Que **todas las transiciones** estén definidas.  
  - Que los estados finales estén bien escritos.  

---

## ** Tecnologías**  
- **Frontend**:  
  ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)  
  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)  
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)  
  ![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat&logo=bootstrap&logoColor=white)  

- **Herramientas**:  
  ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)  
  ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)  

---

## ** Estructura del Proyecto**  
```
simulador-afd/
├── index.html          # Página principal
├── styles.css          # Estilos personalizados
├── main.js             # Lógica del simulador AFD
└── README.md           # Este archivo
```
Capturas de Pantalla
![image](https://github.com/user-attachments/assets/32d65b51-e0e2-4755-a8fa-f5c6eb5e8cf0)

---

## ** Instalación**  
1. Clona el repositorio:  
   ```bash
     https://github.com/MarkoEv/Simulador-de-Automatas-Finitos-Deterministas-AFD.git
   ```
2. Abre `index.html` en tu navegador.  
   *(No requiere servidor ni instalación de paquetes)*  

---

## ** Ejemplo de AFD Preconfigurado**  
### **AFD que acepta cadenas con número par de "1"s**  
- **Estados**: `q0, q1`  
- **Alfabeto**: `0, 1`  
- **Estado inicial**: `q0`  
- **Estados finales**: `q0`  
- **Transiciones**:  
  - Desde `q0`: `0 → q0`, `1 → q1`  
  - Desde `q1`: `0 → q1`, `1 → q0`  

**Prueba**:  
- Acepta: `""` (vacía), `00`, `11`, `0101`  
- Rechaza: `1`, `01`, `0001`  

---

## ** Licencia**  
Sin licencia  

--- 

## ** Contribuciones**  
¡Las contribuciones son bienvenidas! Si deseas mejorar el código o reportar un problema, abre un **Issue** o envía un **Pull Request**.  

---

## ** Notas**  
- Ideal para estudiantes de ING.EN SISTEMAS COMPUTACIONALES.    

---

## **Despliegue en AWS Amplify**

Se incluyen archivos de configuración para desplegar este sitio estático en **AWS Amplify Console**.

- Archivo de build: [amplify.yml](amplify.yml)
- Metadatos npm: [package.json](package.json)

Opciones para publicar:

- **Opción A — Amplify Console (recomendado)**
   - Entra a https://console.aws.amazon.com/amplify/ y conecta tu repositorio Git.
   - Amplify detectará el `amplify.yml` y publicará el sitio estático directamente.

- **Opción B — Amplify CLI (local)**
   - Instala Amplify CLI y configura tus credenciales AWS:
      ```bash
      npm install -g @aws-amplify/cli
      amplify configure
      ```
   - Inicializa el proyecto Amplify en este repositorio (sigue las preguntas interactivas):
      ```bash
      amplify init
      ```
   - Agrega hosting y publica:
      ```bash
      amplify add hosting
      amplify publish
      ```

Notas:
- Este proyecto es un sitio estático (HTML/CSS/JS) y no requiere pasos de build; `amplify.yml` contiene comandos mínimos para Amplify Console.
- Si usas una rama diferente a `main`/`master`, selecciona la rama correcta cuando conectes el repositorio en Amplify Console.

¿Quieres que también cree un flujo de GitHub Actions para desplegar vía CI/CD a Amplify? (puedo añadirlo si lo deseas)


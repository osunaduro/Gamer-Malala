# Plan de implementación: portal WordPress y juegos modulares

Este plan convierte las decisiones del [plan maestro](PLAN_MAESTRO.md) en una secuencia de trabajo para el repositorio `osunaduro/Gamer-Malala`.

## Situación inicial

- El repositorio contiene el juego independiente actual: `index.html`, `css/`, `js/`, `images/` y una API PHP con persistencia en `record.json`.
- La rama `main` conserva esa versión y su historial.
- La nueva plataforma se trabajará en la rama `codex/portal-modular`.
- El WordPress completo se instalará en el hosting; este repositorio será el código propio del portal/juegos (principalmente el plugin de integración), no una copia del núcleo de WordPress.

## Arquitectura propuesta

```text
WordPress instalado en Hostinger
├── contenido del portal (artículos, descargas, enlaces y páginas)
└── plugin propio de juegos
    ├── catálogo y descubrimiento de juegos
    ├── servicios comunes de la plataforma
    └── games/
        ├── escribir-palabras/
        │   ├── game.json
        │   ├── index.html
        │   ├── js/
        │   ├── css/
        │   └── assets/
        └── proximo-juego/
            └── ...
```

Un juego nuevo se incorpora agregando una carpeta válida bajo `games/`. Su archivo `game.json` describe los datos que necesita el catálogo, por ejemplo: identificador, nombre, descripción, materia, rangos de edad recomendados, dificultad, versión y archivo de inicio. El plugin descubre los paquetes al instalar/actualizar o al ejecutar una acción de sincronización desde administración; valida los manifiestos y conserva el catálogo en caché.

El código del juego y sus datos editables se separan. Por ejemplo, el motor para formar palabras vive en el paquete `escribir-palabras`, mientras que el catálogo de palabras, imágenes y dificultad se administra en WordPress. Así se agregan contenidos sin tocar el código y se agrega otro juego sin modificar los ya existentes.

## Fases y entregables

### 0. Preparar la rama y confirmar el entorno

- Mantener `main` sin cambios mientras se desarrolla la nueva plataforma.
- Confirmar en Hostinger: plan, PHP disponible (preferentemente 8.3 para la instalación actual de WordPress), versión de MySQL, HTTPS, espacio, límites de memoria y método de carga/actualización.
- Definir cómo desarrollar el plugin sin instalar el núcleo de WordPress en el repositorio; evaluar un WordPress local de desarrollo antes del despliegue.
- Guardar las imágenes y el juego actuales como referencia; decidir qué recursos se reutilizan después de revisarlos.

**Entregable:** entorno y forma de despliegue documentados, sin modificar la versión estable de `main`.

### 1. Definir el contrato de los paquetes de juego

- La primera versión del contrato está documentada en [CONTRATO_PAQUETES_JUEGO.md](CONTRATO_PAQUETES_JUEGO.md).
- Antes de codificar el plugin, revisar el esquema y confirmar que describe el paquete actual de escritura sin forzar cambios innecesarios.
- La propuesta de aislamiento y canal de mensajes está en [DISENO_INTEGRACION_JUEGOS.md](DISENO_INTEGRACION_JUEGOS.md); validarla contra el juego actual y el hosting.
- Mantener el contrato pequeño y versionado para que cada juego pueda desarrollarse por separado.

**Entregable:** especificación revisable, manifiesto de ejemplo y criterios de validación.

### 2. Crear el plugin base y el catálogo

- La estructura inicial está en `wordpress-plugin/malala-juegos/`.
- Incluye lectura y validación de `games/*/game.json`, manejo administrativo de paquetes inválidos y sincronización manual; las carpetas no se recorren en visitas públicas.
- Incluye el shortcode `[malala_games]`, tarjetas de catálogo y una vista de lanzamiento en `iframe sandbox` con puente inicial `MessageChannel`.
- La carpeta `demo-integracion` se usó como fixture temporal para validar `platform:init` / `game:ready`; se retiró del catálogo público al incorporar el primer juego curricular.
- La sincronización está restringida a administradores con nonce. En WordPress local el plugin quedó activo, el catálogo sincroniza sin errores y la página **Juegos** usa `[malala_games]`.
- La apertura del paquete y el flujo de respuesta se verificaron dentro del iframe. La revisión en otros navegadores y tamaños de pantalla sigue pendiente.

**Entregable:** plugin base activo en WordPress local y catálogo con el primer juego curricular.

### 3. Migrar el juego de escritura

- **Primera versión implementada:** `games/escribir-palabras/` presenta una imagen y permite formar la palabra con letras.
- Incluye 15 palabras e imágenes locales seleccionadas, pronunciación del dispositivo, pista solicitada o automática tras varios errores y ajuste de dificultad.
- Usa un temporizador de cinco minutos en la partida libre y muestra un resumen de sesión sin pedir nombres ni enviar registros al servidor.
- Los eventos de respuestas y adaptación pasan por el puente del portal.
- Quedan pendientes el editor de contenidos en WordPress, control visible de audio, pieles, insignias, persistencia local de logros y validación de vocabulario/dificultad con docentes y chicos.

**Entregable:** primera versión funcional del juego de escritura dentro del catálogo de WordPress; lista para revisión de uso y contenido.

### 4. Revisar con los primeros jugadores

- Probar el recorrido con los hijos del creador del proyecto.
- Observar si entienden cómo empezar, si continúan después de equivocarse, si las pistas ayudan y si quieren volver a jugar.
- Corregir fricciones del recorrido, legibilidad, audio y dificultad.
- Registrar preguntas de contenido que necesiten revisión docente; la clasificación por grado se hará más adelante.

**Entregable:** lista priorizada de ajustes y una versión del juego apta para revisión.

### 5. Preparar la integración a `main`

- Revisar el plugin, el paquete de juego, la documentación y las capacidades de instalación/actualización.
- Conservar la versión original en el historial de Git.
- Integrar la rama `codex/portal-modular` a `main` cuando el portal/catálogo y el juego estén suficientemente funcionales y revisados.
- Dejar cuentas docentes, aulas, códigos grupales e informes para una etapa posterior, manteniendo la separación de módulos para incorporarlos sin reescribir los juegos.

**Entregable:** nueva base modular en `main`, con el juego de escritura como primer módulo.

## Decisiones técnicas que no se cierran todavía

- Ruta exacta donde quedarán instalados los paquetes dentro del plugin.
- Formato final de `game.json` y estrategia de compatibilidad entre versiones.
- Si el lanzamiento del juego usará una página propia, un iframe aislado u otro mecanismo de integración.
- Cómo se versionarán los contenidos editables de cada juego y cómo se resuelven colisiones entre archivos y contenido en la base de datos.
- Disponibilidad real de PHP 8.3, Composer, SSH, memoria y límites de MySQL en Hostinger.
- Proceso de despliegue del plugin desde GitHub a Hostinger.

Estas decisiones se resolverán en la fase correspondiente, con el repositorio y el entorno de desarrollo a la vista.

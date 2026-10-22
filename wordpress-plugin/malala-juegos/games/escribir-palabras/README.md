# Formá la palabra

Primer paquete de juego del portal Malala. Es una actividad de escritura para los primeros grados: se observa una imagen y se seleccionan letras para formar su nombre.

## Contenido inicial

Las 15 palabras incluidas son una selección de prueba, con imágenes copiadas del juego anterior. El conjunto es intencionalmente pequeño para poder revisar claridad, vocabulario y dificultad con chicos y docentes antes de ampliarlo.

## Integración

- Recibe configuración con `platform:init` y responde `game:ready` mediante el canal de mensajes del portal.
- Emite `answer_submitted`, `hint_used`, `difficulty_changed`, `activity_completed` y `session_completed`.
- No solicita nombres ni apodos, no usa cuentas y no hace llamadas de red.
- El resultado se mantiene en memoria durante esta sesión; no se crea historial individual persistente.
- La adaptación agrega distractores al avanzar y los quita cuando se acumulan errores. La pista señala la siguiente letra luego de tres errores o cuando se solicita.

## Agregar palabras

Editar la lista `WORDS` en `game.js` y colocar una imagen optimizada dentro de `assets/images/`. Usar palabras concretas, conocidas y apropiadas para el grupo de edad; comprobar que la imagen represente una sola respuesta clara. La edición de contenidos desde WordPress queda para una etapa posterior.

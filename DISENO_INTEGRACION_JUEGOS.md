# Diseño de integración entre WordPress y los juegos

**Estado:** propuesta técnica para el primer plugin. Se debe revisar contra el hosting y el primer juego antes de implementarla.

## Objetivo

Cada juego debe poder funcionar dentro del portal sin acceder al DOM, cookies, sesión de WordPress ni endpoints internos. El portal mantiene navegación y controles comunes; el juego presenta la actividad y reporta eventos con un protocolo pequeño que pueda reutilizarse.

## Vista de juego

Propuesta inicial: alojar cada juego como archivos estáticos dentro de su paquete y abrir su `entry` en un `iframe` con el atributo `sandbox="allow-scripts"`. No habilitar `allow-same-origin`, formularios, ventanas emergentes, descargas ni navegación superior en la primera versión.

Esto separa el contexto del juego del documento del portal. Como el origen del `iframe` queda opaco, el juego no debe usar `localStorage` directamente. Cuando haga falta guardar logros anónimos del juego libre, lo solicitará mediante el puente y el portal los guardará en el navegador con una clave propia del juego. La futura sesión docente tendrá un canal de servidor distinto, autorizado por WordPress.

La envoltura de WordPress debe dar al `iframe` un título accesible, altura adaptable, modo de pantalla completa solo si luego se necesita y una salida visible al portal. Si el `iframe` no carga o el protocolo falla, mostrar un error recuperable sin romper la página.

## Canal de comunicación

1. El portal crea el `iframe` y conserva su referencia.
2. Cuando el documento termina de cargar, el portal envía un mensaje de inicio dirigido a `iframe.contentWindow`, incluye un `MessagePort` nuevo como dato transferible y lo entrega en la lista de transferencia de `postMessage`.
3. El juego acepta el inicio solo si el mensaje proviene de `window.parent`, valida la versión del protocolo y conserva `event.ports[0]`.
4. Desde entonces, los mensajes viajan por ese puerto. El portal rechaza mensajes de ventana sueltos, mensajes no reconocidos y datos que excedan límites de tamaño o frecuencia.
5. Al cerrar la sesión, el portal cierra el puerto y descarta el identificador de sesión.

El origen opaco del `iframe` implica usar `targetOrigin: "*"` únicamente para entregar el primer mensaje a la ventana exacta del `iframe` que el portal acaba de crear. La seguridad del intercambio se apoya en validar `event.source === iframe.contentWindow`, transferir un puerto dedicado y validar cada estructura recibida. El puerto no se comparte con otros juegos ni sesiones.

## Mensajes de la versión 1

Todos los mensajes son objetos JSON con `protocolVersion: 1` y `type`.

### Portal → juego: `platform:init`

```json
{
  "protocolVersion": 1,
  "type": "platform:init",
  "session": {
    "id": "identificador-aleatorio-de-sesion",
    "mode": "free",
    "durationSeconds": 300
  },
  "settings": {
    "difficulty": "adaptive",
    "audioEnabled": true,
    "theme": "default",
    "textScale": 1,
    "reducedMotion": false,
    "locale": "es-AR"
  }
}
```

El portal valida y limita todas las opciones antes de enviarlas. El mensaje no contiene nombre, correo u otros datos personales.

### Juego → portal: `game:ready`

Confirma que el juego recibió la configuración y está listo. El portal puede mostrar entonces el inicio de la actividad.

### Juego → portal: `game:event`

```json
{
  "protocolVersion": 1,
  "type": "game:event",
  "event": {
    "name": "answer_submitted",
    "data": {
      "correct": true,
      "attempts": 1
    }
  }
}
```

Nombres iniciales: `answer_submitted`, `hint_used`, `difficulty_changed`, `activity_completed` y `session_completed`. El portal agrega la marca de recepción; no confía en la hora informada por el juego. Los datos se validan por nombre de evento y se limitan en tamaño. No se acepta que el juego elija destino de red, escriba en la base de datos o envíe identificadores de personas.

### Juego ↔ portal: `storage:get` y `storage:set`

El juego podrá solicitar lectura o escritura de un objeto pequeño de progreso anónimo local. El portal restringirá la clave al identificador del juego, validará el esquema/tamaño y guardará solo en el almacenamiento del navegador. La API responderá con `storage:result` asociado a un `requestId`. Esta capacidad se usará solo en juego libre; no crea identidad ni historial entre dispositivos.

Los esquemas concretos de progreso quedan definidos por cada juego y deben ser versionados. La plataforma debe permitir borrar los datos locales desde opciones del portal.

## Privacidad y separación de modalidades

- En modo libre, eventos y guardado permanecen en el navegador. No se envían al servidor.
- En modo aula, el portal inicia una sesión autorizada con permisos docentes y contexto de participación. Solo entonces una capa del portal puede transmitir los eventos admitidos al servidor.
- El juego no recibe nombre o apellido del alumno; el vínculo entre código y lista se mantiene del lado del portal.
- El protocolo debe rechazar eventos si la sesión no los habilita.
- El contrato no considera apodos una identidad persistente.

## Reglas de validación

- Validar tipo, versión, campos permitidos, rangos y tamaño máximo de cada mensaje.
- Limitar frecuencia de eventos para evitar bloqueos accidentales.
- Tratar todos los mensajes del paquete como entrada no confiable, aunque el código sea propio.
- No interpolar texto recibido en HTML sin escape.
- No enviar tokens, nonces o credenciales que otorguen acceso general a WordPress.
- Al terminar, destruir el puerto y limpiar temporizadores asociados a la sesión.

## Pendientes antes de implementar

- Probar el soporte de `MessageChannel`, `sandbox` y carga estática en la versión de PHP/WordPress disponible en el hosting; PHP no debería afectar el protocolo del navegador.
- Decidir si se emplea una política CSP para los paquetes y cómo permitir los recursos locales de cada uno.
- Definir esquema y límite de tamaño del progreso local.
- Definir el puente para audio y pronunciación: el portal puede entregar la preferencia, mientras la voz del dispositivo normalmente se ejecutará dentro del juego.
- Validar el flujo con el juego actual, que hoy consulta `images/list.php` y `api/records.php`.


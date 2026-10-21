# Contrato de paquetes de juego — versión inicial

Este documento define la primera convención para agregar juegos al catálogo. Busca que cada módulo pueda desarrollarse y revisarse por separado, mientras WordPress conserva la navegación y los servicios comunes. Es una especificación inicial: puede evolucionar con versiones explícitas del contrato.

## 1. Ubicación y estructura

Cada juego vive en una carpeta propia dentro del directorio de juegos del plugin:

```text
games/
└── escribir-palabras/
    ├── game.json
    ├── index.html
    ├── assets/
    │   ├── images/
    │   └── audio/
    ├── css/
    ├── js/
    └── README.md
```

Reglas iniciales:

- El nombre de carpeta y `id` usan minúsculas, números y guiones; el `id` es estable y único (`escribir-palabras`).
- `game.json` está en la raíz del paquete y se codifica como UTF-8.
- `entry` debe apuntar a un archivo existente dentro de esa misma carpeta.
- El paquete contiene recursos estáticos (HTML, CSS, JavaScript, imágenes y audio). No se permite ejecutar PHP incluido por un paquete.
- Las rutas son relativas al paquete. No se admiten rutas absolutas, `..`, URLs `javascript:` ni recursos que escapen del directorio.
- Los datos editables de actividades (por ejemplo, palabras, consignas y niveles) se administran en WordPress y no se mezclan con la lógica del juego. Este primer contrato todavía no fija su formato de almacenamiento.
- `README.md` es opcional y sirve para explicar cómo mantener el módulo.

## 2. Manifiesto `game.json`

Ejemplo de manifiesto válido:

```json
{
  "contractVersion": 1,
  "id": "escribir-palabras",
  "name": "Formá la palabra",
  "description": "Mirá la imagen y ordená las letras para completar la palabra.",
  "subject": "lengua",
  "recommendedGrades": [1, 2, 3],
  "recommendedAges": {
    "min": 6,
    "max": 9
  },
  "difficultyLevels": ["facil", "intermedio", "desafiante"],
  "version": "0.1.0",
  "entry": "index.html",
  "thumbnail": "assets/portada.webp",
  "capabilities": ["audio", "themes", "session-events"]
}
```

Campos:

| Campo | Requerido | Regla |
|---|---:|---|
| `contractVersion` | Sí | Entero soportado por el plugin. La primera versión es `1`. |
| `id` | Sí | Identificador único y estable; debe coincidir con la carpeta. |
| `name` | Sí | Nombre visible, texto plano, entre 1 y 80 caracteres. |
| `description` | Sí | Descripción breve, texto plano, máximo 240 caracteres. |
| `subject` | Sí | Clave de materia conocida, inicialmente `lengua` o `matematica`. |
| `recommendedGrades` | Sí | Lista no vacía de grados enteros positivos; inicialmente se esperan 1, 2 o 3, sin impedir expansión posterior. |
| `recommendedAges` | Sí | `min` y `max` enteros positivos, con `min <= max`; recomendación, no bloqueo de acceso. |
| `difficultyLevels` | Sí | Una o más claves conocidas: `facil`, `intermedio`, `desafiante`. |
| `version` | Sí | Versión del paquete en formato `MAJOR.MINOR.PATCH`. |
| `entry` | Sí | Archivo de inicio relativo existente dentro del paquete. |
| `thumbnail` | No | Imagen representativa, ruta relativa validada como `entry`. Si falta, el catálogo usa una imagen genérica. |
| `capabilities` | No | Lista de integraciones comunes que el juego usa; no concede permisos. |

El plugin rechazará paquetes con JSON inválido, campos requeridos ausentes, identificadores duplicados o rutas inseguras. Un paquete inválido se omitirá del catálogo y se informará en administración con su carpeta y una causa legible; no debe interrumpir la carga del portal.

## 3. Presentación y lanzamiento

El catálogo lee los metadatos validados y muestra una tarjeta con nombre, descripción, materia, edades y grados recomendados, y dificultad disponible. No interpreta HTML del manifiesto.

Al elegir el juego, el portal presenta una pantalla breve de instrucciones y opciones comunes, y luego abre el archivo `entry` en una vista de juego adaptable. El mecanismo de aislamiento (página propia o `iframe` con permisos acotados) se decidirá al implementar el plugin. Hasta entonces, el paquete no debe depender de acceso al DOM de WordPress ni asumir que comparte el mismo origen de JavaScript.

## 4. Interfaz común y eventos

La plataforma ofrecerá una interfaz documentada y versionada para que el juego pueda:

- consultar las opciones habilitadas de audio, tamaño de texto, animaciones y piel visual;
- recibir configuración de sesión, como duración, dificultad y modo de práctica;
- informar eventos de desempeño con una estructura común.

Eventos iniciales previstos: `answer_submitted` (resultado correcto/incorrecto e intentos), `hint_used`, `difficulty_changed`, `activity_completed` y `session_completed`. Cada evento lleva `eventVersion`, `gameId`, `sessionId`, marca temporal y los campos propios del evento. No debe enviar nombre, apellido, apodo, correo ni otros identificadores del alumno.

Durante la primera entrega, el juego individual libre procesa y conserva sus resultados en el navegador. La futura modalidad docente podrá enviar eventos al servidor solo dentro de una sesión de aula autorizada y bajo los permisos definidos en el plan maestro. Los nombres concretos de los campos de evento y el transporte se especificarán antes de implementar esa integración; este contrato no autoriza al juego a hacer llamadas arbitrarias al servidor.

## 5. Sincronización y seguridad

- El catálogo se actualiza por una acción administrativa explícita (por ejemplo, «Sincronizar juegos») al instalar o actualizar paquetes. No se exploran carpetas en cada visita pública.
- Solo administradores autorizados pueden iniciar la sincronización.
- La lectura del manifiesto debe validar tamaño, tipos, campos y rutas; debe tratar el contenido como datos no confiables.
- La sincronización no ejecuta código del paquete ni evalúa contenido PHP.
- Las rutas publicadas deben impedir listado de directorios y descarga de archivos de configuración que no sean parte pública del juego.
- La eliminación o invalidez de un paquete debe reflejarse en el catálogo con un aviso administrativo, sin borrar resultados o registros de otras áreas.

## 6. Criterios de aceptación del primer paquete

Un paquete se considera listo para aparecer en el catálogo cuando:

1. Su carpeta cumple el esquema y `id` coincide con el nombre de carpeta.
2. El manifiesto valida con `contractVersion` soportada y sin rutas fuera del paquete.
3. El archivo de entrada y la miniatura (si existe) están presentes y pueden servirse.
4. La tarjeta muestra los metadatos esperados y el juego abre desde el flujo común.
5. Un error de ese paquete no impide mostrar los demás juegos ni el portal.

## 7. Pendientes para implementación

- Confirmar el directorio definitivo del plugin y la ruta `games/`.
- Precisar el esquema JSON mediante validación en código y ejemplos inválidos.
- Elegir el aislamiento y el canal de configuración/eventos entre WordPress y el juego.
- Decidir cómo administra WordPress los datos variables de las actividades.
- Verificar el hosting y el entorno de desarrollo antes de fijar requisitos de PHP y despliegue.

## 8. Compatibilidad con el juego actual

La revisión inicial del repositorio muestra que el juego actual mantiene `index.html`, `css/`, `js/` e `images/` en la raíz. `js/app.js` obtiene imágenes desde `images/list.php` y `js/storage.js` intenta guardar récords mediante `api/records.php`, con respaldo en `localStorage`.

Al migrarlo al paquete `escribir-palabras`:

- `index.html`, `css/`, `js/` e imágenes seleccionadas pasan a la carpeta del paquete, conservando rutas relativas que use el juego.
- La detección dinámica mediante `images/list.php` se reemplaza por una lista validada de contenidos; los paquetes no ejecutan PHP.
- Los récords generales del endpoint `api/records.php` no se trasladan al juego libre. El resultado inmediato y los logros opcionales permanecen locales, de acuerdo con el plan maestro.
- La colección existente de imágenes se revisa y limpia antes de incorporarla. No se asume que cada archivo actual deba publicarse.
- El cambio se hará sobre la rama de trabajo; la versión actual de `main` queda disponible en el historial.

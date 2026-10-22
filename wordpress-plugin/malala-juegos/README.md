# Malala Juegos — plugin para WordPress

Este directorio es el plugin propio del portal. No contiene el núcleo de WordPress.

## Instalación de desarrollo

1. Copiar `malala-juegos/` al directorio `wp-content/plugins/` de una instalación de WordPress compatible.
2. Activar **Malala Juegos** desde el panel de plugins.
3. Abrir **Malala Juegos → Sincronizar juegos**.
4. Crear una página y agregar el shortcode `[malala_games]`.

Al sincronizar, se valida cada subcarpeta de `games/`. Los manifiestos inválidos se muestran en el panel y no detienen el catálogo. La sincronización reemplaza la lista publicada por los paquetes válidos que encuentra; no borra resultados de alumnos.

## Paquetes

Cada carpeta contiene `game.json` y un archivo HTML de inicio. Los juegos son estáticos; no se admiten archivos PHP. Consultar el contrato y el diseño del puente en la raíz del repositorio:

- `CONTRATO_PAQUETES_JUEGO.md`
- `DISENO_INTEGRACION_JUEGOS.md`

`games/escribir-palabras/` es el primer juego curricular integrado. Sus palabras e imágenes todavía se editan en los archivos del paquete; el panel para administrarlas desde WordPress queda pendiente.

## Alcance actual

- Sincronización manual del catálogo para administradores.
- Catálogo mediante shortcode, con materia, edades y tarjeta por juego.
- Instrucciones breves y apertura en `iframe sandbox="allow-scripts"`.
- Puente `MessageChannel` versión 1 para configuración inicial y eventos locales.
- Los eventos de juego libre no se guardan en servidor.
- El juego inicial de escritura incluye 15 palabras con imágenes locales, pistas y ajuste automático de dificultad; su resumen vive solo en la sesión actual.

Todavía no están implementados el guardado local común, el panel de contenidos, las cuentas docentes ni las aulas.

# Plan maestro de desarrollo

**Nombre del proyecto:** pendiente. “Aprendo a escribir” queda como nombre de trabajo.  
**Estado:** aprobado como línea base inicial de visión, requisitos y etapas.  
**Última actualización:** 18 de octubre de 2026.

Este documento reúne lo definido hasta ahora para reconstruir el juego existente y convertirlo, por etapas, en una plataforma educativa modular. Las decisiones marcadas como pendientes deberán validarse antes de implementar la parte correspondiente.

## 1. Visión del producto

Crear una web educativa para chicos de primaria que combine juego, aprendizaje de contenidos y confianza para seguir intentando. La primera etapa se orienta a 1.º, 2.º y 3.º grado; la plataforma deberá permitir sumar edades, grados, materias y juegos posteriormente.

Los chicos y sus familias serán los usuarios principales. Los docentes podrán recomendar y usar la plataforma como apoyo al aprendizaje. La primera entrega reconstruirá el juego de escritura existente: observar una imagen y formar la palabra con letras. La base técnica y de producto se diseñará desde el comienzo para incorporar juegos adicionales, aulas docentes, partidas con códigos e informes, aunque esas capacidades no tienen que estar todas activas en el primer lanzamiento.

## 2. Objetivos

- Ayudar a aprender contenidos jugando y ganar confianza al practicar.
- Permitir que cada chico avance a su ritmo mediante dificultad adaptativa.
- Ofrecer una experiencia clara, accesible y disfrutable en celular, tablet y computadora.
- Dar a los docentes información que ayude a reconocer fortalezas y necesidades de apoyo, sin producir calificaciones.
- Permitir el juego libre sin registro de alumno y limitar el seguimiento identificable a las actividades organizadas por docentes autorizados.
- Facilitar que se agreguen juegos y contenidos sin rehacer la plataforma.

## 3. Usuarios y permisos previstos

### Chico o chica

- Puede jugar sin crear una cuenta.
- En juego libre puede elegir un apodo al ingresar a una partida grupal. El apodo no identifica de manera confiable a la persona entre dispositivos.
- En una actividad de aula, el maestro carga el nombre y apellido en su lista. El código individual de participación vincula al alumno con la partida y con esa entrada del aula. El docente ve el nombre de su lista; el apodo elegido por el alumno no se muestra en la vista docente.
- Puede ver su progreso inmediato y las insignias de la sesión. El sistema no debe etiquetarlo ni presentarle resultados como nota escolar.

### Familia u organizador de una partida libre

- Puede crear una partida grupal sin registrarse y distribuir códigos o enlaces individuales.
- Puede actuar como juez y ver la tabla de progreso de esa partida.
- No tiene acceso a informes profundos de aprendizaje ni a historiales identificados.
- Puede habilitar u ocultar una tabla pública de la partida. Si se habilita, usa apodos y logros amistosos; no muestra perfiles de aprendizaje ni destaca al último puesto.
- Las partidas libres grupales funcionan a ritmo propio dentro de un plazo definido por quien las crea.

### Docente

- Es el único tipo de usuario que se registra en la primera etapa de seguimiento.
- Solicita acceso por correo; el administrador revisa la solicitud y habilita manualmente la cuenta.
- En su primer ingreso crea un aula y carga una lista de alumnos con nombre y apellido. Puede tener varias aulas propias.
- Crea partidas de aula, elige juegos y contenidos disponibles, grado o rango de dificultad, duración/plazo, modo de juego y cantidad de intentos permitidos.
- Puede consultar el resumen del aula, entrar al perfil de cada alumno, ver tendencias entre partidas y descargar informes PDF.
- Solo accede a sus propias aulas y alumnos. Puede borrar los datos de una partida o de un alumno.
- Los resultados son referencias pedagógicas para comprender fortalezas y aspectos que necesitan práctica; no son calificaciones.

### Administrador del sitio

- Aprueba las cuentas docentes.
- Administra los contenidos desde un panel privado: agrega, edita y elimina palabras e imágenes y les asigna dificultad.
- Al inicio, el panel de contenido es solo para el administrador.

### Docencia compartida (etapa futura)

Un aula podrá invitar a otros docentes. Cada persona invitada deberá aceptar antes de acceder. Los docentes autorizados para un aula compartida podrán ver los datos de todas las materias de esa aula. La plataforma deberá quedar preparada para este modelo de permisos, aunque no es requisito del primer lanzamiento.

## 4. Alcance funcional por etapas

### Recorrido de entrada y selección de juegos

1. La portada presenta el portal educativo y destaca los juegos como su propuesta principal. Los recursos para adultos aparecen como una sección secundaria.
2. Al entrar a Juegos, la persona elige un rango de edad; no se pide fecha de nacimiento. Los rangos exactos quedan pendientes de definir y validar.
3. Se muestran los juegos disponibles para ese rango, agrupados por materia.
4. Cada juego se presenta en una tarjeta con nombre, descripción breve y edad recomendada.
5. Al elegir un juego, se abre una pantalla breve de instrucciones con el botón **Empezar**. Si el audio está activado, las instrucciones pueden leerse automáticamente; debe haber un control visible para apagarlo.
6. Durante el juego individual, el temporizador de cinco minutos permanece visible.
7. Al finalizar la sesión, se presenta un resultado sencillo con actividades completadas e insignias.

Los recursos del portal estarán disponibles para todas las personas, sin separar una sección para familias y otra para docentes. Se organizarán por tema y materia e incluirán artículos, actividades descargables y enlaces importantes. Colaboradores podrán proponer o preparar materiales; un administrador los revisará y publicará. El buscador de recursos podrá incorporarse cuando exista suficiente material.

### Etapa 1 — Base de plataforma y primer juego

- Reconstruir el juego actual con una estructura modular.
- Mantener como dinámica central la imagen y la formación de una palabra con letras.
- Revisar la colección existente de imágenes y palabras; corregir, reemplazar o retirar elementos inadecuados.
- Crear un panel de administración de contenidos para gestionar imágenes y palabras, con tres niveles iniciales: **fácil, intermedio y desafiante**.
- Incluir sesiones individuales de cinco minutos por defecto. Al terminar, mostrar un resultado sencillo con palabras completadas e insignias obtenidas.
- Dar pistas después de una cantidad de errores/intentos y bajar temporalmente la dificultad si las pistas no alcanzan. Los umbrales y reglas adaptativas quedan por definir.
- Incluir audio de instrucciones y pronunciación con la voz disponible en el dispositivo, con control para activar/desactivar.
- Ofrecer un menú sencillo de opciones: tamaño de texto, audio y reducción de animaciones. Cada usuario puede elegir una piel visual y conservar la preferencia en ese dispositivo.
- Usar una identidad visual seria, cálida e institucional, con color. La navegación y los juegos mantienen la misma estructura entre pieles.
- Diseñar primero para celular y adaptar también a tablet y computadora.
- La portada destaca los juegos y ofrece acceso secundario al portal de recursos.
- Guardar, en juego libre, solo logros opcionales en el navegador. No presentar ese almacenamiento como identidad ni como historial fiable entre dispositivos. El detalle local de partidas deberá vencer después de un plazo aún pendiente.

La primera versión se centra en formar palabras a partir de imágenes. El abecedario, vocales y consonantes, grupos consonánticos, familias silábicas simples y complejas, y actividades de lectura se incorporarán como juegos o módulos posteriores.

### Etapa 2 — Más juegos y contenidos

Agregar módulos de Lengua y Matemáticas sin cambiar el núcleo de navegación ni la gestión general de sesiones.

Contenidos de Lengua previstos:

- Abecedario con imágenes.
- Vocales y consonantes y grupos de consonantes.
- Sílabas y familias simples y complejas (por ejemplo, “ra”, “mi”, “pla”, “ble”).
- Lectura y escritura de letras, sonidos, sílabas y palabras.

Contenidos de Matemáticas previstos:

- Conteo y comparación de números; pares e impares; mayor y menor; anterior y posterior.
- Sumas, restas, tablas, formas y problemas sencillos resolubles mentalmente.

La secuencia curricular y la adecuación por grado se definirán más adelante con docentes. No se asumirá que la clasificación inicial fácil/intermedio/desafiante equivale automáticamente a un grado escolar.

### Etapa 3 — Aulas docentes, partidas e informes

- Cuentas docentes con aprobación del administrador.
- Aulas y listas docentes; códigos individuales por participante y por partida, con vencimiento al cerrar o vencer la partida.
- Partidas docentes en dos modalidades: jugar juntos cuando todos ingresaron, o completar a ritmo propio dentro de un plazo.
- Quien organiza puede decidir si el ingreso se cierra al comenzar la modalidad en vivo o permite entradas posteriores.
- En partidas docentes se podrá configurar duración/plazo, juegos, contenidos, grado/rango de dificultad, dificultad adaptativa o fija y cantidad de repeticiones de la actividad.
- Datos de desempeño del servidor ligados al aula docente para consultar perfiles e historial entre partidas.
- Informes de aula y alumno, tendencias y descarga en PDF.
- Retención de resultados hasta que el docente elimine una partida o los datos de un alumno.

La base de datos, los permisos y el diseño de módulos de la Etapa 1 deben evitar una reescritura para agregar esta etapa, sin implementar prematuramente todas sus pantallas.

### Etapa 4 — Funciones opcionales y crecimiento

- Grupos libres con tabla pública opcional y datos temporales solo durante la partida.
- Docencia compartida por invitación y aceptación.
- Más grados, edades, materias y actividades.
- Espacios reservados para anuncios pequeños en portada o navegación. La publicidad no estará activa durante el primer lanzamiento ni dentro del área de juego. La red publicitaria y su configuración quedan pendientes de evaluar.

## 5. Reglas de aprendizaje y evaluación

- El desempeño orienta la dificultad; la rapidez por sí sola no representa aprendizaje.
- Mostrar por separado respuestas correctas, actividades completadas y tiempo. No se definió una fórmula única de puntuación.
- Registrar para informes docentes: aciertos y errores, intentos, uso de pistas, cambios de dificultad, actividades completadas y tiempo empleado.
- Los intentos permitidos antes de mostrar una pista podrán adaptarse al desempeño. Si la pista no alcanza, se reduce temporalmente la dificultad.
- En una partida de aula, el docente decide cuántas veces puede repetirse una actividad. Puede fijar la dificultad para observar un contenido en condiciones parejas.
- Las estrellas e insignias reconocen práctica y mejora, no solo rapidez ni respuestas perfectas.
- La medida de éxito inicial será cualitativa: los chicos pueden iniciar con poca ayuda, siguen intentando después de equivocarse, mejoran al practicar y encuentran el juego claro y agradable.
- No se establecerán metas numéricas de aprendizaje hasta observar una prueba piloto y conversar con docentes.

## 6. Datos, privacidad y retención

- La plataforma requiere conexión a internet para partidas grupales y para los informes docentes. El modo sin conexión no forma parte del alcance inicial.
- Los alumnos no tienen cuentas personales. Las cuentas identificables corresponden a docentes aprobados.
- El juego libre individual no envía progreso identificable al servidor. Los logros opcionales se guardan localmente y no se sincronizan entre dispositivos.
- En aula, cada código de participante vincula a la partida con el registro docente del alumno. El docente consulta el nombre y apellido cargados por él; no ve el apodo que el alumno usa en el juego.
- El sistema guardará solo datos necesarios para sesiones, progreso e informes; evitará pedir datos personales innecesarios como dirección, contacto o fecha de nacimiento.
- El docente puede borrar datos de una partida o de un alumno. Las partidas y códigos vencen al cerrar la sesión o alcanzar su plazo.
- Está pendiente definir el período exacto de vencimiento para detalles de partidas almacenados localmente.
- Queda pendiente decidir dónde y cómo mostrar un aviso claro a docentes sobre los datos que se recopilan y el propósito del seguimiento.

## 7. Requisitos técnicos y de operación

- Sitio web en español argentino inicialmente.
- Servidor actual: hosting compartido de Hostinger; PHP 8.1 es una estimación; MySQL está disponible según lo informado.
- Composer, SSH, límites del plan y configuración concreta de PHP/MySQL quedan por verificar antes de seleccionar dependencias y proceso de despliegue.
- El dominio aún no está definido.
- WordPress es el candidato preferido para gestionar el portal de artículos, actividades descargables y enlaces. La decisión final queda sujeta a confirmar compatibilidad y capacidades del hosting.
- El portal de recursos será común para familias, docentes y demás visitantes; se organizará por tema y materia, con artículos, descargas y enlaces revisados antes de publicarse.
- Los juegos serán módulos propios integrados al portal; la lógica educativa no dependerá de plugins genéricos del CMS.
- Cada juego será un paquete en su propia carpeta dentro de un directorio controlado. Un plugin propio de WordPress descubrirá los paquetes y los incorporará al catálogo sin tener que registrar cada juego manualmente.
- Cada carpeta incluirá un manifiesto de metadatos (por ejemplo, título, descripción, materia, edades recomendadas, dificultad y archivo de entrada) y los archivos propios del juego. El plugin validará el manifiesto y solo listará paquetes válidos.
- El descubrimiento se realizará desde una acción de administración o al instalar/actualizar un paquete, no escaneando todas las carpetas en cada visita pública.
- Los juegos serán módulos web propios; la lógica del juego no ejecutará archivos PHP arbitrarios desde carpetas de contenido. El catálogo y la presentación estarán integrados con WordPress.
- Los datos editables de una actividad (por ejemplo, palabras, imágenes y dificultad) se mantendrán separados del código del juego para poder actualizar el contenido sin modificar el paquete.
- Verificar si el plan permite PHP 8.3 antes de instalar WordPress; también confirmar la versión y los límites de MySQL.
- Propuesta técnica inicial: CMS WordPress para el portal y un plugin propio que catalogue juegos instalados como carpetas; los juegos usarán HTML/CSS/JavaScript modular y, cuando corresponda, PHP/MySQL para funciones específicas. Confirmar la arquitectura de integración después de revisar el hosting.
- Separar módulos de juego, catálogo de contenidos, sesiones, usuarios/roles y persistencia para facilitar sumar actividades.
- Todas las consultas a MySQL deben usar consultas preparadas; controlar permisos por rol y por aula. No guardar secretos del servidor en archivos públicos.
- Mantener configuración, contenidos y credenciales fuera de las rutas públicas cuando el hosting lo permita.
- Soportar operación online y copias de seguridad del contenido y datos docentes antes de habilitar seguimiento real.

## 8. Prueba piloto y criterios de aceptación iniciales

La primera prueba será con los hijos del creador del proyecto, actualmente de 5 y 7 años (próximos a cumplir 6 y 8). Servirá para observar comprensión, motivación y uso; no para validar por sí sola el currículo de 1.º a 3.º.

El primer juego se considerará listo para una prueba inicial cuando:

- Se pueda comenzar y completar la actividad sin fallos que bloqueen el juego.
- Los chicos entiendan qué hacer con poca ayuda adulta.
- Las pistas y el ajuste de dificultad ayuden a seguir después de errores.
- Audio, controles y diseño funcionen en celular, tablet y computadora.
- El cierre de cinco minutos muestre el resultado y las insignias de forma clara y alentadora.
- La prueba dé indicios de que chicos y familias lo encuentran disfrutable y querrían volver.

Cuando haya más de un juego, se hará una revisión con docentes para validar el conjunto y orientar contenidos. La rapidez no será el indicador principal de éxito.

## 9. Decisiones pendientes

1. Nombre definitivo e identidad gráfica de base.
2. Dominio.
3. Plan exacto de Hostinger, posibilidad de PHP 8.3, límites MySQL, disponibilidad de SSH/Composer y método de despliegue.
4. Formato definitivo del manifiesto de cada juego, validaciones del escáner y método seguro para instalar o actualizar carpetas.
5. Umbrales concretos para intentos, pistas, descenso y aumento de dificultad.
6. Período de retención de datos locales y detalles de partidas libres.
7. Regla de identidad y reingreso de participantes si pierden su código o usan otro dispositivo.
8. Si se usa una tabla local de logros en un dispositivo compartido, su presentación por apodo y control de borrado.
9. Fórmula de puntuación de partidas competitivas; no se implementará un puntaje combinado hasta definirlo.
10. Duración y comportamiento exacto del temporizador configurable en partidas de aula.
11. Aviso de datos para docentes y revisión de la configuración de anuncios antes de activar publicidad.
12. Secuencia y validación docente de contenidos por grado.
13. Posibilidad de co-docencia: prevista para una etapa futura, con invitación y aceptación y acceso a todas las materias del aula.

## 10. Principios de desarrollo

- Entregar por etapas pequeñas, cada una útil y revisable.
- Priorizar claridad, accesibilidad y confianza del chico por encima de puntajes competitivos.
- No etiquetar ni clasificar a los alumnos como “buenos” o “malos”; los informes describen contenidos y apoyos que pueden ayudar.
- No mezclar el uso libre con el seguimiento docente.
- Mantener el contenido editable desde el panel de administración y la lógica de cada juego aislada.
- Validar con chicos y docentes antes de ampliar alcance o afirmar que un contenido corresponde a un grado.
- Confirmar las capacidades del hosting antes de instalar WordPress y fijar la integración de los juegos, el despliegue o las dependencias.

## 11. Flujo de trabajo con GitHub

- Mantener el repositorio actual como origen del proyecto y preservar su historial y recursos aprovechables.
- Cuando empiece la implementación de la nueva plataforma, crear una rama de trabajo separada. La rama `main` seguirá estable mientras se desarrolla y revisa la nueva base.
- Integrar el trabajo en `main` cuando la plataforma y el primer juego estén suficientemente funcionales para una revisión conjunta.
- No crear la rama de implementación durante la etapa de planificación; crearla al iniciar el trabajo técnico.

# Aprendo a escribir

Pequeña web para que niños practiquen escribir palabras a partir de imágenes.

Cómo funciona
- Coloca tus imágenes cuadradas en la carpeta `images/`.
- El nombre del archivo (sin extensión) será la palabra que se usará para practicar. Ej: `gato.png` => palabra `gato`.
- Mantén `images/list.json` con la lista de archivos (orden que quieras mostrar).

Archivos incluidos
- `index.html` — interfaz principal
- `css/style.css` — estilos
- `js/app.js` — lógica de la actividad
- `images/list.json` — (opcional) lista de imágenes a cargar; si existe, la app la ignorará a favor de `images/list.php` cuando se sirva con PHP
- `images/list.php` — (si se usa desde un servidor PHP) lista automáticamente los archivos de `images/`
- `images/*.svg` — ejemplos incluidos (`gato.svg`, `sol.svg`)

Uso
1. Abre `index.html` en el navegador.
	- Si vas a usar el endpoint PHP para detección automática de imágenes, debes servir el proyecto con un servidor PHP (ver abajo).
2. Usa los botones ◀ ▶ para navegar entre imágenes.
3. Haz click en las letras (mostradas mezcladas) en el orden correcto.

Cómo añadir más imágenes
1. Agrega una imagen cuadrada en `images/` (por ejemplo `manzana.png`).

Opciones para listar imágenes
- Manual (sin servidor PHP): Mantén `images/list.json` actualizado con los nombres de archivo en `images/`.
- Automático (requiere servidor PHP): Usa el endpoint `images/list.php` que genera la lista automáticamente. Para ello, sirve el directorio del proyecto con PHP.

Ejemplo: ejecutar un servidor PHP local desde la raíz del proyecto:

```bash
cd /workspaces/Gamer-Malala
php -S localhost:8000
# Abrir http://localhost:8000 en el navegador
```

Nota: si usas `python -m http.server` el endpoint PHP no funcionará; usa el servidor PHP para aprovechar la detección automática.

Notas
- Para evitar problemas con acentos, el script normaliza las letras al comparar. Sin embargo, el nombre de archivo puede contener tildes; se normaliza internamente.
- Si quieres que te añada soporte para arrastrar y soltar letras en las casillas o mejoras (sonidos, animaciones), dímelo y lo implemento.
# Gamer-Malala
Juego de escritura para primer grado

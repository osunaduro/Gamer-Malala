#!/bin/bash

# Script de limpieza y reorganización para el proyecto "Aprendo a escribir"

echo "Iniciando limpieza del proyecto..."
echo "Creando copia de seguridad..."

# Crear copia de seguridad
if [ ! -d "backup_proyecto" ]; then
    cp -r /workspace backup_proyecto
    echo "Copia de seguridad creada en backup_proyecto/"
fi

echo "1. Eliminando carpetas duplicadas..."
# Eliminar la carpeta duplicada
rm -rf /workspace/gamer-malala-1/
echo "  - Carpeta gamer-malala-1 eliminada"

echo "2. Identificando archivos duplicados en imágenes..."
# Buscar archivos duplicados en la carpeta de imágenes
cd /workspace/images
duplicates=$(find . -name "*(*" -type f)
if [ -n "$duplicates" ]; then
    echo "  Archivos duplicados encontrados:"
    echo "$duplicates"
else
    echo "  No se encontraron archivos duplicados con formato '(n)'"
fi

echo "3. Verificando archivos de imagen duplicados por contenido..."
# Buscar archivos duplicados por contenido (mismo hash)
cd /workspace
duplicate_files=$(find images/ -type f -exec md5sum {} \; | sort | uniq -w32 -d | awk '{print $2}')
if [ -n "$duplicate_files" ]; then
    echo "  Archivos duplicados por contenido:"
    echo "$duplicate_files"
else
    echo "  No se encontraron archivos duplicados por contenido"
fi

echo "4. Reorganizando archivos (estructura propuesta)..."
cd /workspace

# Crear estructura de directorios propuesta
mkdir -p src/css src/js src/data assets/images

# Mover archivos principales a src/
if [ -f "index.html" ]; then
    mv index.html src/
fi

# Mover archivos de estilo a src/css/
if [ -d "css" ]; then
    mv css/* src/css/
    rmdir css
fi

# Mover archivos JS a src/js/
if [ -d "js" ]; then
    mv js/* src/js/
    rmdir js
fi

# Mover archivos de datos a src/data/ (si existen)
if [ -f "gamer-malala/data/words.json" ]; then
    cp gamer-malala/data/words.json src/data/
fi

# Mover imágenes a assets/images/
mv images/* assets/images/

echo "5. Actualizando rutas en archivos (ejemplo)..."
# Este paso normalmente requeriría actualizaciones manuales en los archivos HTML y JS
# Aquí solo mostramos qué necesitaría actualizarse

echo "6. Moviendo archivos de API..."
mkdir -p api
if [ -f "gamer-malala/api/records.php" ]; then
    cp -r gamer-malala/api/* api/ 2>/dev/null || echo "No se encontraron archivos API en gamer-malala/api/"
fi

echo "7. Eliminando carpetas innecesarias..."
rm -rf gamer-malala/

echo ""
echo "Limpieza parcial completada."
echo ""
echo "Estructura actual:"
find /workspace -maxdepth 3 -type d | sort
echo ""
echo "NOTA: Debes actualizar manualmente las rutas en los archivos HTML y JS"
echo "para que apunten a las nuevas ubicaciones de los recursos."
echo ""
echo "Por ejemplo, en index.html debes cambiar:"
echo "  - href=\"css/style.css\"  por  href=\"src/css/style.css\""
echo "  - src=\"js/app.js\"      por  src=\"src/js/app.js\""
echo "  - src=\"images/...\"     por  src=\"assets/images/...\""
echo "  - fetch('images/list.php')  por  fetch('assets/images/list.php')"
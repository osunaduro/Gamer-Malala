# WordPress local para desarrollar el portal

El entorno usa las imágenes oficiales de WordPress con PHP 8.3 y MariaDB 10.11. Solo publica WordPress en `127.0.0.1`; la base de datos no tiene un puerto expuesto al equipo. Los datos se conservan en volúmenes Docker y el plugin del repo se monta directamente en WordPress.

## Iniciar por primera vez

1. Copiar `.env.example` a `.env` y cambiar las dos contraseñas de desarrollo.
2. Desde la raíz del repo, ejecutar `docker compose up -d`.
3. Abrir <http://localhost:8088> y completar el asistente inicial de WordPress.
4. En el escritorio, activar **Malala Juegos** y agregar `[malala_games]` a una página.
5. Abrir **Malala Juegos → Sincronizar juegos** para publicar el paquete de demostración.

El plugin se monta desde `wordpress-plugin/malala-juegos`, por eso los cambios del código aparecen en la instalación local sin armar un ZIP.

## Comandos útiles

- `docker compose ps` — estado de los contenedores.
- `docker compose logs -f wordpress` — registros de WordPress.
- `docker compose down` — detener y quitar contenedores; conserva los volúmenes.
- `docker compose down -v` — borrar también la base y archivos de WordPress. **Esto elimina la instalación local y sus datos.**

La instalación local usa contraseñas de desarrollo. No reutilizarlas en Hostinger ni en otro entorno público. El `.env` real está excluido de Git.

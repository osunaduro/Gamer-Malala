<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Malala_Games_Catalog
{
    const OPTION_NAME = 'malala_games_catalog_v1';
    const MANIFEST_LIMIT = 65536;

    public function all()
    {
        $catalog = get_option(self::OPTION_NAME, array());
        return is_array($catalog) ? $catalog : array();
    }

    public function find($game_id)
    {
        $catalog = $this->all();
        return isset($catalog[$game_id]) && is_array($catalog[$game_id]) ? $catalog[$game_id] : null;
    }

    public function sync()
    {
        $games_root = MALALA_JUEGOS_DIR . 'games';
        $valid = array();
        $errors = array();

        if (!is_dir($games_root)) {
            update_option(self::OPTION_NAME, array(), false);
            return array('valid' => 0, 'errors' => array('No se encontró el directorio games/.'));
        }

        $directories = glob($games_root . '/*', GLOB_ONLYDIR);
        if (!is_array($directories)) {
            $directories = array();
        }

        foreach ($directories as $directory) {
            $folder = basename($directory);
            if (is_link($directory)) {
                $errors[] = $folder . ': no se admiten enlaces simbólicos como paquetes.';
                continue;
            }
            $result = $this->read_package($directory, $folder);
            if (is_wp_error($result)) {
                $errors[] = $folder . ': ' . $result->get_error_message();
                continue;
            }
            $valid[$result['id']] = $result;
        }

        update_option(self::OPTION_NAME, $valid, false);
        return array('valid' => count($valid), 'errors' => $errors);
    }

    private function read_package($directory, $folder)
    {
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $folder)) {
            return new WP_Error('invalid_folder', 'el nombre de carpeta no cumple el formato permitido.');
        }

        $manifest_path = $directory . '/game.json';
        if (is_link($manifest_path) || !is_file($manifest_path) || !is_readable($manifest_path)) {
            return new WP_Error('missing_manifest', 'falta game.json o no se puede leer.');
        }

        $size = filesize($manifest_path);
        if ($size === false || $size < 2 || $size > self::MANIFEST_LIMIT) {
            return new WP_Error('manifest_size', 'game.json está vacío o supera el tamaño máximo de 64 KB.');
        }

        $raw = file_get_contents($manifest_path);
        if (!is_string($raw)) {
            return new WP_Error('manifest_read', 'no se pudo leer game.json.');
        }

        $manifest = json_decode($raw, true);
        if (!is_array($manifest) || json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('manifest_json', 'game.json no contiene JSON válido.');
        }

        $required = array(
            'contractVersion', 'id', 'name', 'description', 'subject', 'recommendedGrades',
            'recommendedAges', 'difficultyLevels', 'version', 'entry',
        );
        foreach ($required as $field) {
            if (!array_key_exists($field, $manifest)) {
                return new WP_Error('manifest_field', 'falta el campo obligatorio "' . $field . '".');
            }
        }

        if ($manifest['contractVersion'] !== 1) {
            return new WP_Error('contract_version', 'la versión del contrato no está soportada.');
        }
        if (!is_string($manifest['id']) || $manifest['id'] !== $folder) {
            return new WP_Error('package_id', 'id debe coincidir con el nombre de la carpeta.');
        }
        if (!$this->valid_text($manifest['name'], 1, 80) || !$this->valid_text($manifest['description'], 1, 240)) {
            return new WP_Error('package_text', 'name o description está vacío o supera el largo permitido.');
        }
        if (!is_string($manifest['subject']) || !in_array($manifest['subject'], array('lengua', 'matematica'), true)) {
            return new WP_Error('subject', 'subject debe ser lengua o matematica.');
        }
        if (!$this->valid_grades($manifest['recommendedGrades'])) {
            return new WP_Error('grades', 'recommendedGrades debe ser una lista de grados enteros positivos.');
        }
        if (!$this->valid_ages($manifest['recommendedAges'])) {
            return new WP_Error('ages', 'recommendedAges debe incluir min y max enteros positivos, con min <= max.');
        }
        if (!$this->valid_difficulties($manifest['difficultyLevels'])) {
            return new WP_Error('difficulty', 'difficultyLevels contiene valores no reconocidos.');
        }
        if (!is_string($manifest['version']) || !preg_match('/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/', $manifest['version'])) {
            return new WP_Error('version', 'version debe seguir el formato MAJOR.MINOR.PATCH.');
        }
        if (!$this->valid_package_file($directory, $manifest['entry'])) {
            return new WP_Error('entry', 'entry debe ser un archivo HTML existente dentro del paquete.');
        }

        $thumbnail = null;
        if (isset($manifest['thumbnail'])) {
            if (!$this->valid_package_file($directory, $manifest['thumbnail'], array('png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'))) {
                return new WP_Error('thumbnail', 'thumbnail no es una imagen válida dentro del paquete.');
            }
            $thumbnail = $manifest['thumbnail'];
        }

        if (!$this->package_has_no_php($directory)) {
            return new WP_Error('php_file', 'los paquetes de juego no pueden incluir archivos PHP.');
        }

        $capabilities = array();
        if (isset($manifest['capabilities']) && is_array($manifest['capabilities'])) {
            $allowed = array('audio', 'themes', 'session-events');
            foreach ($manifest['capabilities'] as $capability) {
                if (is_string($capability) && in_array($capability, $allowed, true)) {
                    $capabilities[] = $capability;
                }
            }
        }

        return array(
            'id' => $folder,
            'name' => sanitize_text_field($manifest['name']),
            'description' => sanitize_text_field($manifest['description']),
            'subject' => $manifest['subject'],
            'recommendedGrades' => array_values($manifest['recommendedGrades']),
            'recommendedAges' => array('min' => $manifest['recommendedAges']['min'], 'max' => $manifest['recommendedAges']['max']),
            'difficultyLevels' => array_values($manifest['difficultyLevels']),
            'version' => $manifest['version'],
            'entry' => $manifest['entry'],
            'thumbnail' => $thumbnail,
            'capabilities' => array_values(array_unique($capabilities)),
        );
    }

    private function valid_text($value, $minimum, $maximum)
    {
        return is_string($value) && trim($value) !== '' && strlen($value) <= ($maximum * 4) && strlen($value) >= $minimum;
    }

    private function valid_grades($grades)
    {
        if (!is_array($grades) || !array_is_list($grades) || count($grades) < 1 || count($grades) > 20) {
            return false;
        }
        foreach ($grades as $grade) {
            if (!is_int($grade) || $grade < 1 || $grade > 20) {
                return false;
            }
        }
        return count(array_unique($grades)) === count($grades);
    }

    private function valid_ages($ages)
    {
        return is_array($ages)
            && isset($ages['min'], $ages['max'])
            && is_int($ages['min'])
            && is_int($ages['max'])
            && $ages['min'] > 0
            && $ages['max'] >= $ages['min']
            && $ages['max'] <= 30;
    }

    private function valid_difficulties($difficulties)
    {
        if (!is_array($difficulties) || !array_is_list($difficulties) || count($difficulties) < 1) {
            return false;
        }
        $allowed = array('facil', 'intermedio', 'desafiante');
        foreach ($difficulties as $difficulty) {
            if (!is_string($difficulty) || !in_array($difficulty, $allowed, true)) {
                return false;
            }
        }
        return count(array_unique($difficulties)) === count($difficulties);
    }

    private function valid_package_file($directory, $relative_path, $extensions = array('html'))
    {
        if (!is_string($relative_path) || $relative_path === '' || strpos($relative_path, '\\') !== false || strpos($relative_path, "\0") !== false) {
            return false;
        }
        if ($relative_path[0] === '/' || preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:/', $relative_path)) {
            return false;
        }
        $segments = explode('/', $relative_path);
        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.' || $segment === '..') {
                return false;
            }
        }
        $extension = strtolower(pathinfo($relative_path, PATHINFO_EXTENSION));
        if (!in_array($extension, $extensions, true)) {
            return false;
        }
        $root = realpath($directory);
        $file = realpath($directory . '/' . $relative_path);
        return $root && $file && is_file($file) && strpos($file, $root . DIRECTORY_SEPARATOR) === 0;
    }

    private function package_has_no_php($directory)
    {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if ($file->isLink()) {
                return false;
            }
            if ($file->isFile() && strtolower($file->getExtension()) === 'php') {
                return false;
            }
        }
        return true;
    }
}

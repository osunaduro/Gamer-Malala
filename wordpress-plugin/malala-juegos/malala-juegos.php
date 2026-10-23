<?php
/**
 * Plugin Name: Malala Juegos
 * Description: Catálogo modular para integrar juegos educativos estáticos.
 * Version: 0.1.1
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Author: Proyecto Malala
 * Text Domain: malala-juegos
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MALALA_JUEGOS_VERSION', '0.1.1');
define('MALALA_JUEGOS_FILE', __FILE__);
define('MALALA_JUEGOS_DIR', plugin_dir_path(__FILE__));
define('MALALA_JUEGOS_URL', plugin_dir_url(__FILE__));

require_once MALALA_JUEGOS_DIR . 'includes/class-malala-games-catalog.php';
require_once MALALA_JUEGOS_DIR . 'includes/class-malala-games-plugin.php';

register_activation_hook(MALALA_JUEGOS_FILE, array('Malala_Games_Plugin', 'activate'));

Malala_Games_Plugin::instance();

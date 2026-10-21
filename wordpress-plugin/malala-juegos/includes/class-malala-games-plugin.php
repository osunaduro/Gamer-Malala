<?php

if (!defined('ABSPATH')) {
    exit;
}

final class Malala_Games_Plugin
{
    private static $instance;
    private $catalog;

    public static function instance()
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public static function activate()
    {
        if (get_option(Malala_Games_Catalog::OPTION_NAME, false) === false) {
            add_option(Malala_Games_Catalog::OPTION_NAME, array(), '', false);
        }
    }

    private function __construct()
    {
        $this->catalog = new Malala_Games_Catalog();
        add_action('admin_menu', array($this, 'register_admin_page'));
        add_action('admin_post_malala_games_sync', array($this, 'handle_sync'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_filter('query_vars', array($this, 'register_query_var'));
        add_shortcode('malala_games', array($this, 'render_shortcode'));
    }

    public function register_admin_page()
    {
        add_menu_page(
            'Malala Juegos',
            'Malala Juegos',
            'manage_options',
            'malala-juegos',
            array($this, 'render_admin_page'),
            'dashicons-games'
        );
    }

    public function render_admin_page()
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $catalog = $this->catalog->all();
        $synced = isset($_GET['synced']) && sanitize_text_field(wp_unslash($_GET['synced'])) === '1';
        $valid_count = isset($_GET['valid']) ? absint($_GET['valid']) : 0;
        $errors = get_option('malala_games_last_sync_errors', array());
        if (!is_array($errors)) {
            $errors = array();
        }
        ?>
        <div class="wrap">
            <h1>Catálogo de juegos</h1>
            <p>Los paquetes se leen desde <code>games/</code>. La sincronización valida sus manifiestos y no ejecuta código de los juegos.</p>
            <?php if ($synced) : ?>
                <div class="notice notice-success is-dismissible"><p>Catálogo actualizado: <?php echo esc_html((string) $valid_count); ?> juego(s) válido(s), <?php echo esc_html((string) count($errors)); ?> con observaciones.</p></div>
                <?php if ($errors) : ?>
                    <div class="notice notice-warning"><p><strong>Paquetes que requieren revisión:</strong></p><ul>
                        <?php foreach ($errors as $error) : ?><li><?php echo esc_html($error); ?></li><?php endforeach; ?>
                    </ul></div>
                <?php endif; ?>
            <?php endif; ?>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="malala_games_sync">
                <?php wp_nonce_field('malala_games_sync'); ?>
                <?php submit_button('Sincronizar juegos'); ?>
            </form>
            <h2>Juegos publicados en el catálogo</h2>
            <?php if (!$catalog) : ?>
                <p>Todavía no hay juegos sincronizados. Agregá un paquete válido en <code>games/</code> y sincronizá el catálogo.</p>
            <?php else : ?>
                <table class="widefat striped">
                    <thead><tr><th>Nombre</th><th>ID</th><th>Materia</th><th>Versión</th></tr></thead>
                    <tbody>
                        <?php foreach ($catalog as $game) : ?>
                            <tr>
                                <td><?php echo esc_html($game['name']); ?></td>
                                <td><code><?php echo esc_html($game['id']); ?></code></td>
                                <td><?php echo esc_html($game['subject']); ?></td>
                                <td><?php echo esc_html($game['version']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }

    public function handle_sync()
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('No tenés permiso para sincronizar el catálogo.', 'malala-juegos'));
        }
        check_admin_referer('malala_games_sync');
        $result = $this->catalog->sync();
        update_option('malala_games_last_sync_errors', $result['errors'], false);
        $url = add_query_arg(
            array(
                'page' => 'malala-juegos',
                'synced' => '1',
                'valid' => absint($result['valid']),
            ),
            admin_url('admin.php')
        );
        wp_safe_redirect($url);
        exit;
    }

    public function register_query_var($vars)
    {
        $vars[] = 'malala_game';
        return $vars;
    }

    public function register_assets()
    {
        wp_register_style('malala-games', MALALA_JUEGOS_URL . 'assets/css/catalog.css', array(), MALALA_JUEGOS_VERSION);
        wp_register_script('malala-games-host', MALALA_JUEGOS_URL . 'assets/js/game-host.js', array(), MALALA_JUEGOS_VERSION, true);
    }

    public function render_shortcode()
    {
        wp_enqueue_style('malala-games');
        $game_id = sanitize_key((string) get_query_var('malala_game'));
        if ($game_id !== '') {
            $game = $this->catalog->find($game_id);
            if ($game) {
                wp_enqueue_script('malala-games-host');
                return $this->render_game($game);
            }
        }
        return $this->render_catalog();
    }

    private function render_catalog()
    {
        $games = $this->catalog->all();
        ob_start();
        ?>
        <section class="malala-games" aria-labelledby="malala-games-title">
            <h1 id="malala-games-title">Juegos para aprender</h1>
            <p class="malala-games__intro">Elegí una actividad y aprendé jugando.</p>
            <?php if (!$games) : ?>
                <p>Pronto vas a encontrar juegos acá.</p>
            <?php else : ?>
                <div class="malala-games__grid">
                    <?php foreach ($games as $game) : ?>
                        <?php $url = add_query_arg('malala_game', rawurlencode($game['id']), get_permalink()); ?>
                        <article class="malala-game-card">
                            <?php if (!empty($game['thumbnail'])) : ?>
                                <img class="malala-game-card__image" src="<?php echo esc_url(MALALA_JUEGOS_URL . 'games/' . rawurlencode($game['id']) . '/' . implode('/', array_map('rawurlencode', explode('/', $game['thumbnail'])))); ?>" alt="" loading="lazy">
                            <?php endif; ?>
                            <div class="malala-game-card__body">
                                <p class="malala-game-card__subject"><?php echo esc_html(ucfirst($game['subject'])); ?></p>
                                <h2><?php echo esc_html($game['name']); ?></h2>
                                <p><?php echo esc_html($game['description']); ?></p>
                                <p class="malala-game-card__meta">Edades orientativas: <?php echo esc_html((string) $game['recommendedAges']['min']); ?> a <?php echo esc_html((string) $game['recommendedAges']['max']); ?> años</p>
                                <a class="malala-games__button" href="<?php echo esc_url($url); ?>">Ver juego</a>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>
        <?php
        return ob_get_clean();
    }

    private function render_game($game)
    {
        $entry_parts = array_map('rawurlencode', explode('/', $game['entry']));
        $entry_url = MALALA_JUEGOS_URL . 'games/' . rawurlencode($game['id']) . '/' . implode('/', $entry_parts);
        ob_start();
        ?>
        <section class="malala-game-launch" data-malala-game="<?php echo esc_attr($game['id']); ?>">
            <a class="malala-game-launch__back" href="<?php echo esc_url(remove_query_arg('malala_game')); ?>">← Volver a los juegos</a>
            <div class="malala-game-launch__intro" data-game-intro>
                <p class="malala-game-card__subject"><?php echo esc_html(ucfirst($game['subject'])); ?></p>
                <h1><?php echo esc_html($game['name']); ?></h1>
                <p><?php echo esc_html($game['description']); ?></p>
                <p>Jugá a tu ritmo. Al terminar, vas a ver un resumen de esta sesión.</p>
                <button class="malala-games__button" type="button" data-game-start>Empezar</button>
            </div>
            <p class="malala-game-launch__status" data-game-status role="status" aria-live="polite"></p>
            <div class="malala-game-launch__frame-wrap" data-game-frame-wrap hidden>
                <iframe
                    class="malala-game-launch__frame"
                    title="<?php echo esc_attr($game['name']); ?>"
                    data-entry-url="<?php echo esc_url($entry_url); ?>"
                    data-game-id="<?php echo esc_attr($game['id']); ?>"
                    sandbox="allow-scripts"
                    referrerpolicy="no-referrer"
                    loading="lazy"></iframe>
            </div>
        </section>
        <?php
        return ob_get_clean();
    }
}

#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Dispatcher semanal — encola un PicoPlacaScrapeJob por cada ciudad activa.
 * El trabajo real (buscar + extraer con IA + proponer) lo hace bin/worker.php,
 * este script solo encola (mismo patron que bin/cron-*.php de misfin).
 *
 * Crontab sugerido (domingo 06:00 UTC):
 *   0 6 * * 0 php /ruta/api/bin/cron-picoplaca-scrape.php >> /var/log/picoplaca-cron.log 2>&1
 *
 * Uso:
 *   php bin/cron-picoplaca-scrape.php              Encola todas las ciudades activas
 *   php bin/cron-picoplaca-scrape.php --once --dry-run   Corre 1 ciudad sincronicamente sin encolar (debug)
 *   php bin/cron-picoplaca-scrape.php --dry-run --city=medellin   Igual, pero para una ciudad especifica
 */

define('API_ROOT', dirname(__DIR__));
require_once API_ROOT . '/vendor/autoload.php';
require_once API_ROOT . '/config/app.php';

use PicoPlaca\App\Jobs\PicoPlacaScrapeJob;
use PicoPlaca\App\Repositories\CityRepository;
use PicoPlaca\Core\JobQueue;

$args      = array_slice($argv ?? [], 1);
$dryRun    = in_array('--dry-run', $args, true);
$onceMode  = in_array('--once', $args, true);
$citySlug  = null;
foreach ($args as $arg) {
    if (str_starts_with($arg, '--city=')) {
        $citySlug = substr($arg, strlen('--city='));
    }
}

$cities = (new CityRepository())->allActive();

if (empty($cities)) {
    echo "Sin ciudades activas para monitorear.\n";
    exit(0);
}

if ($dryRun) {
    $city = $citySlug !== null
        ? current(array_filter($cities, fn (array $c) => $c['slug'] === $citySlug)) ?: null
        : $cities[0];

    if ($city === null) {
        fwrite(STDERR, "[dry-run] Ciudad no encontrada o inactiva: {$citySlug}\n");
        exit(1);
    }

    echo "[dry-run] Ejecutando PicoPlacaScrapeJob sincronicamente para: {$city['city_name']} ({$city['slug']})\n";
    try {
        (new PicoPlacaScrapeJob())->handle(['city_id' => $city['id']]);
        echo "[dry-run] OK — revisa la tabla rule_change_proposals.\n";
    } catch (\Throwable $e) {
        fwrite(STDERR, "[dry-run] FALLO: " . $e->getMessage() . "\n");
        exit(1);
    }
    exit(0);
}

$queued = 0;
foreach ($cities as $city) {
    JobQueue::dispatch('PicoPlacaScrapeJob', ['city_id' => $city['id']]);
    $queued++;
    if ($onceMode) {
        break;
    }
}

echo "Encoladas {$queued} ciudades para revision semanal.\n";

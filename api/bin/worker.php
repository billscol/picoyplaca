#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Worker CLI para procesamiento asincrono de jobs.
 *
 * Uso:
 *   php bin/worker.php            Modo continuo (produccion, supervisord/systemd)
 *   php bin/worker.php --once     Un solo batch y sale (para cron)
 *   php bin/worker.php --status   Muestra conteo de jobs en cola
 *
 * Env: WORKER_SLEEP_MS (default 500), WORKER_MAX_JOBS (default 10)
 */

define('API_ROOT', dirname(__DIR__));
require_once API_ROOT . '/vendor/autoload.php';
require_once API_ROOT . '/config/app.php';

use PicoPlaca\App\Jobs\PicoPlacaScrapeJob;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\JobQueue;

Cache::connect();

$jobRegistry = [
    'PicoPlacaScrapeJob' => PicoPlacaScrapeJob::class,
];

$args     = array_slice($argv ?? [], 1);
$onceMode = in_array('--once', $args, true);
$status   = in_array('--status', $args, true);

if ($status) {
    $rows = Database::getInstance()->query(
        "SELECT status, COUNT(*) AS total FROM jobs GROUP BY status ORDER BY FIELD(status,'pending','processing','done','failed')"
    )->fetchAll();
    echo "Jobs en cola:\n";
    foreach ($rows as $row) {
        printf("  %-12s %d\n", $row['status'], $row['total']);
    }
    exit(0);
}

$sleepMs    = max(100, (int) (getenv('WORKER_SLEEP_MS') ?: 500));
$maxPerLoop = max(1, (int) (getenv('WORKER_MAX_JOBS') ?: 10));

$running = true;
if (function_exists('pcntl_signal')) {
    $handler = static function () use (&$running): void { $running = false; };
    pcntl_signal(SIGTERM, $handler);
    pcntl_signal(SIGINT, $handler);
    pcntl_async_signals(true);
}

$log = static fn (string $level, string $msg) => print('[' . date('Y-m-d H:i:s') . "] [{$level}] {$msg}" . PHP_EOL);

$log('INFO', 'Worker iniciado. PID=' . getmypid() . ' once=' . ($onceMode ? 'si' : 'no'));

while ($running) {
    $processed = 0;

    while ($processed < $maxPerLoop) {
        $job = JobQueue::claim();
        if ($job === null) {
            break;
        }

        $class = $jobRegistry[$job['type']] ?? null;
        if ($class === null) {
            JobQueue::fail($job['id'], (int) $job['attempts'], (int) $job['max_attempts'], "Job no registrado: {$job['type']}");
            $log('WARN', "SKIP [{$job['type']}] id={$job['id']}");
            $processed++;
            continue;
        }

        try {
            $log('RUN', "[{$job['type']}] id={$job['id']} attempt={$job['attempts']}");
            (new $class())->handle($job['payload']);
            JobQueue::ack($job['id']);
            $log('DONE', "[{$job['type']}] id={$job['id']}");
        } catch (\Throwable $e) {
            JobQueue::fail($job['id'], (int) $job['attempts'], (int) $job['max_attempts'], substr($e->getMessage(), 0, 500));
            $log('FAIL', "[{$job['type']}] id={$job['id']} error=" . $e->getMessage());
        }

        $processed++;
    }

    if ($onceMode) {
        break;
    }
    if ($processed === 0) {
        usleep($sleepMs * 1000);
    }
}

$log('INFO', 'Worker detenido.');

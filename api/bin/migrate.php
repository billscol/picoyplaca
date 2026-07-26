#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Runner de migraciones — ejecuta cada .sql de database/migrations/ una sola vez
 * (registra el nombre de archivo en la tabla `migrations`).
 *
 * Uso:
 *   php bin/migrate.php            Aplica migraciones pendientes
 *   php bin/migrate.php --seed     Aplica migraciones + datos de prueba (database/seeds/)
 */

define('API_ROOT', dirname(__DIR__));
require_once API_ROOT . '/vendor/autoload.php';
require_once API_ROOT . '/config/app.php';

use PicoPlaca\Core\Database;

$pdo = Database::getInstance();

$pdo->exec(
    "CREATE TABLE IF NOT EXISTS migrations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

function applyDir(PDO $pdo, string $dir): void
{
    $files = glob($dir . '/*.sql');
    sort($files);

    foreach ($files as $file) {
        $filename = basename($file);

        $stmt = $pdo->prepare("SELECT 1 FROM migrations WHERE filename = ?");
        $stmt->execute([$filename]);
        if ($stmt->fetchColumn()) {
            echo "SKIP  {$filename} (ya aplicada)\n";
            continue;
        }

        $sql = file_get_contents($file);
        try {
            $pdo->exec($sql);
            $pdo->prepare("INSERT INTO migrations (filename) VALUES (?)")->execute([$filename]);
            echo "OK    {$filename}\n";
        } catch (\Throwable $e) {
            fwrite(STDERR, "FAIL  {$filename}: " . $e->getMessage() . "\n");
            exit(1);
        }
    }
}

applyDir($pdo, API_ROOT . '/database/migrations');

if (in_array('--seed', $argv ?? [], true)) {
    echo "\nAplicando seeds...\n";
    applyDir($pdo, API_ROOT . '/database/seeds');
}

echo "\nListo.\n";

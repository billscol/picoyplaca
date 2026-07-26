<?php

declare(strict_types=1);

/**
 * Carga variables de entorno desde .env (si existe).
 * En produccion las vars se setean via el pool de PHP-FPM o el panel del VPS.
 */
$envFile = dirname(__DIR__) . '/.env';

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if (!getenv($key) && !isset($_ENV[$key])) {
                $_ENV[$key] = $value;
            }
        }
    }
}

return [
    'env'   => ($_ENV['APP_ENV']   ?? getenv('APP_ENV'))   ?: 'production',
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? getenv('APP_DEBUG') ?? false, FILTER_VALIDATE_BOOLEAN),
    'url'   => ($_ENV['APP_URL']   ?? getenv('APP_URL'))   ?: 'https://api.picoyplaca.com',
];

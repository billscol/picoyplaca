<?php

declare(strict_types=1);

namespace PicoPlaca\App\Middleware;

/** Security HTTP headers. Llamar antes de cualquier output en index.php. */
class SecurityHeadersMiddleware
{
    public static function handle(): void
    {
        $env = ($_ENV['APP_ENV'] ?? getenv('APP_ENV')) ?: 'production';

        if ($env === 'production') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }

        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()');
        header_remove('X-Powered-By');
        header('Cache-Control: no-store, no-cache, must-revalidate, private');
    }
}

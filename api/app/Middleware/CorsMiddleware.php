<?php

declare(strict_types=1);

namespace PicoPlaca\App\Middleware;

class CorsMiddleware
{
    public static function handle(): void
    {
        $origin         = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = self::getAllowedOrigins();

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Api-Key, X-Requested-With, Accept, X-Request-Id');
        header('Access-Control-Expose-Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-Id');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    /** Lista blanca de origenes. Fuente unica reutilizada por RefreshController (CSRF check). */
    public static function getAllowedOrigins(): array
    {
        $env = ($_ENV['CORS_ORIGINS'] ?? getenv('CORS_ORIGINS'))
            ?: 'https://picoyplaca.com,https://admin.picoyplaca.com';
        return array_map('trim', explode(',', $env));
    }
}

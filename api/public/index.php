<?php

declare(strict_types=1);

/**
 * Front Controller — entrypoint unico de la API.
 * Flujo: .env -> CORS -> SecurityHeaders -> Redis -> Router -> Controller
 */

define('API_ROOT', dirname(__DIR__));

require_once API_ROOT . '/vendor/autoload.php';

use PicoPlaca\App\Middleware\CorsMiddleware;
use PicoPlaca\App\Middleware\SecurityHeadersMiddleware;
use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Logger;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;
use PicoPlaca\Core\Router;

try {
    require_once API_ROOT . '/config/app.php';
} catch (\Throwable $e) {
    error_log('[picoyplaca-api] Config load error: ' . $e->getMessage());
    Response::serverError('Error del servidor', $e);
}

Logger::bindRequest();
header('X-Request-Id: ' . Logger::requestId());

CorsMiddleware::handle();
SecurityHeadersMiddleware::handle();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

Cache::connect();
if (!Cache::isAvailable()) {
    error_log('[picoyplaca-api] ADVERTENCIA: Redis no disponible — rate limiting cae a fallback en archivo.');
}

$router = new Router();

try {
    require_once API_ROOT . '/routes/api.php';
} catch (\Throwable $e) {
    error_log('[picoyplaca-api] Routes load error: ' . $e->getMessage());
    Response::serverError('Error del servidor', $e);
}

$request = new Request();

try {
    $router->dispatch($request);
} catch (\Throwable $e) {
    Logger::critical('Unhandled exception', [
        'exception' => $e,
        'method'    => $_SERVER['REQUEST_METHOD'] ?? 'GET',
        'path'      => $_SERVER['REQUEST_URI'] ?? '/',
    ]);
    Response::serverError('Error del servidor', $e);
}

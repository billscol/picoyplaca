<?php

declare(strict_types=1);

use PicoPlaca\App\Controllers\ApiKeys\ApiKeyController;

/** @var \PicoPlaca\Core\Router $router */

$router->get('/api-keys', [ApiKeyController::class, 'index']);
$router->post('/api-keys', [ApiKeyController::class, 'store']);
$router->delete('/api-keys/{id}', [ApiKeyController::class, 'destroy']);

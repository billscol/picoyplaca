<?php

declare(strict_types=1);

use PicoPlaca\App\Controllers\PicoPlaca\RulesController;

/** @var \PicoPlaca\Core\Router $router */

$router->get('/pico-placa/cities', [RulesController::class, 'cities']);
$router->get('/pico-placa/rules/{slug}', [RulesController::class, 'show']);
$router->get('/pico-placa/check', [RulesController::class, 'check']);

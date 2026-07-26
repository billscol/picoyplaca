<?php

declare(strict_types=1);

use PicoPlaca\App\Controllers\Auth\LoginController;
use PicoPlaca\App\Controllers\Auth\RefreshController;
use PicoPlaca\App\Controllers\Auth\RegisterController;

/** @var \PicoPlaca\Core\Router $router */

$router->post('/auth/register', [RegisterController::class, 'register']);
$router->post('/auth/login', [LoginController::class, 'login']);
$router->post('/auth/refresh', [RefreshController::class, 'refresh']);
$router->post('/auth/logout', [LoginController::class, 'logout']);

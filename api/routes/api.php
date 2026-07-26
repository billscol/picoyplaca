<?php

declare(strict_types=1);

/** @var \PicoPlaca\Core\Router $router */

$router->group('/v1', [], function ($router) {
    require_once __DIR__ . '/v1/auth.php';
    require_once __DIR__ . '/v1/picoplaca.php';
    require_once __DIR__ . '/v1/apikeys.php';
    require_once __DIR__ . '/v1/billing.php';
    require_once __DIR__ . '/v1/admin.php';
});

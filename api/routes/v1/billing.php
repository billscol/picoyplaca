<?php

declare(strict_types=1);

use PicoPlaca\App\Controllers\Billing\SubscriptionController;

/** @var \PicoPlaca\Core\Router $router */

$router->get('/billing/plans', [SubscriptionController::class, 'plans']);
$router->get('/billing/me', [SubscriptionController::class, 'me']);

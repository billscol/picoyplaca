<?php

declare(strict_types=1);

use PicoPlaca\App\Controllers\Admin\CityController;
use PicoPlaca\App\Controllers\Admin\RuleReviewController;
use PicoPlaca\App\Controllers\Admin\UserController;
use PicoPlaca\App\Controllers\Billing\SubscriptionController;

/** @var \PicoPlaca\Core\Router $router */

$router->get('/admin/users', [UserController::class, 'index']);
$router->get('/admin/users/{id}', [UserController::class, 'show']);
$router->post('/admin/subscriptions/{userId}', [SubscriptionController::class, 'assign']);

$router->get('/admin/cities', [CityController::class, 'index']);
$router->post('/admin/cities', [CityController::class, 'store']);
$router->patch('/admin/cities/{id}/active', [CityController::class, 'toggleActive']);
$router->post('/admin/cities/{id}/sources', [CityController::class, 'addSource']);

$router->get('/admin/rule-proposals', [RuleReviewController::class, 'pending']);
$router->post('/admin/rule-proposals/{id}/approve', [RuleReviewController::class, 'approve']);
$router->post('/admin/rule-proposals/{id}/reject', [RuleReviewController::class, 'reject']);

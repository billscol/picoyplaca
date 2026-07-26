<?php

declare(strict_types=1);

namespace PicoPlaca\App\Controllers\Billing;

use PicoPlaca\App\Controllers\BaseController;
use PicoPlaca\App\Services\Billing\BillingManager;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

class SubscriptionController extends BaseController
{
    /** GET /v1/billing/plans — catalogo publico de planes (para landing/precios). */
    public function plans(Request $request, array $params): void
    {
        $stmt = Database::getInstance()->query(
            "SELECT code, name, price_monthly_usd, price_yearly_usd, requests_month_quota, burst_per_minute, features_json
             FROM plans WHERE is_visible = 1 ORDER BY sort_order"
        );
        Response::success($stmt->fetchAll());
    }

    /** GET /v1/billing/me — plan y consumo del usuario autenticado (dashboard). */
    public function me(Request $request, array $params): void
    {
        $jwt = $this->requireAuth($request);
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare(
            "SELECT subscription_plan, subscription_status, subscription_ends_at, billing_cycle
             FROM users WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$jwt->sub]);
        Response::success($stmt->fetch());
    }

    /** POST /v1/admin/subscriptions/{userId} — asignacion manual (admin). */
    public function assign(Request $request, array $params): void
    {
        $jwt    = $this->requireAdmin($request);
        $userId = (int) ($params['userId'] ?? 0);
        $data   = $request->body();

        $errors = $this->validate($data, ['plan_code' => 'required|string|in:free,pro,business']);
        if ($errors) {
            Response::unprocessable($errors);
        }

        (new BillingManager())->setPlanManually(
            $userId,
            (string) $data['plan_code'],
            (int) $jwt->sub,
            isset($data['duration_days']) ? (int) $data['duration_days'] : null
        );

        Response::success(null, 'Plan actualizado');
    }
}

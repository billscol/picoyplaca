<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Billing;

use PicoPlaca\Core\Database;

/**
 * Unica fuente de verdad para cambios de plan. Nunca hacer UPDATE directo a
 * users.subscription_plan — siempre pasar por aqui para mantener subscription_logs
 * auditado (igual patron que misfin).
 */
class BillingManager
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /** Activacion real tras un pago confirmado (webhook de Stripe/Wompi). */
    public function activatePlan(int $userId, string $planCode, string $billingCycle = 'monthly'): void
    {
        $endsAt = $billingCycle === 'yearly' ? '+1 year' : '+1 month';

        $this->db->prepare(
            "UPDATE users SET subscription_plan = ?, subscription_status = 'active',
                    subscription_started_at = NOW(), subscription_ends_at = DATE_ADD(NOW(), INTERVAL 1 " .
                    ($billingCycle === 'yearly' ? 'YEAR' : 'MONTH') . "), billing_cycle = ?
             WHERE id = ?"
        )->execute([$planCode, $billingCycle, $userId]);

        $this->log($userId, 'activation', $planCode, 'active', ['billing_cycle' => $billingCycle]);
    }

    /** Asignacion manual desde el admin panel — no toca `payments` (no ensucia metricas de ingresos). */
    public function setPlanManually(int $userId, string $planCode, int $adminId, ?int $durationDays = null): void
    {
        $stmt = $this->db->prepare("SELECT subscription_plan FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $fromPlan = (string) $stmt->fetchColumn();

        if ($planCode === 'free') {
            $this->deactivatePlan($userId, $adminId);
            return;
        }

        $endsAtSql = $durationDays !== null
            ? "DATE_ADD(NOW(), INTERVAL {$durationDays} DAY)"
            : "DATE_ADD(NOW(), INTERVAL 1 MONTH)";

        $this->db->prepare(
            "UPDATE users SET subscription_plan = ?, subscription_status = 'active',
                    subscription_started_at = NOW(), subscription_ends_at = {$endsAtSql}
             WHERE id = ?"
        )->execute([$planCode, $userId]);

        $this->log($userId, 'admin_change', $planCode, 'active', ['admin_id' => $adminId, 'from_plan' => $fromPlan]);
    }

    public function deactivatePlan(int $userId, int $adminId = 0): void
    {
        $this->db->prepare(
            "UPDATE users SET subscription_plan = 'free', subscription_status = 'active', subscription_ends_at = NULL WHERE id = ?"
        )->execute([$userId]);

        $this->log($userId, $adminId > 0 ? 'admin_change' : 'downgrade', 'free', 'active', ['admin_id' => $adminId]);
    }

    private function log(int $userId, string $action, string $toPlan, string $status, array $data = []): void
    {
        $this->db->prepare(
            "INSERT INTO subscription_logs (user_id, action, to_plan, status, data_json) VALUES (?, ?, ?, ?, ?)"
        )->execute([$userId, $action, $toPlan, $status, json_encode($data, JSON_UNESCAPED_UNICODE)]);
    }
}

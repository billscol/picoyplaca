<?php

declare(strict_types=1);

namespace PicoPlaca\App\Middleware;

use PicoPlaca\Core\Cache;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Request;
use PicoPlaca\Core\Response;

/**
 * Autenticacion via API key — este es el mecanismo del producto (consumo externo),
 * distinto del JWT de sesion del dashboard (AuthMiddleware).
 *
 * Header aceptado: `Authorization: Bearer pyp_xxxxx` o `X-Api-Key: pyp_xxxxx`.
 *
 * Ademas de validar la key, hace cumplir la cuota mensual del plan del dueño
 * (consumo contado en Redis, periodo = mes calendario) — free/pro/business.
 */
class ApiKeyMiddleware
{
    /** Cuota de requests/mes por plan. -1 = ilimitado. */
    private const PLAN_QUOTAS = [
        'free'     => 500,
        'pro'      => 50000,
        'business' => -1,
    ];

    /** Rate limit de rafaga (requests/min) independiente de la cuota mensual. */
    private const PLAN_BURST = [
        'free'     => 10,
        'pro'      => 60,
        'business' => 300,
    ];

    /** @return array{api_key_id:int,user_id:int,plan:string} */
    public static function handle(Request $request): array
    {
        $raw = $request->header('X-Api-Key') ?? '';
        if (empty($raw)) {
            $bearer = $request->bearerToken() ?? '';
            if (str_starts_with($bearer, 'pyp_')) {
                $raw = $bearer;
            }
        }

        if (empty($raw) || !str_starts_with($raw, 'pyp_')) {
            Response::unauthorized('API key requerida (header X-Api-Key o Authorization: Bearer pyp_...)');
        }

        $hash = hash('sha256', $raw);

        try {
            $pdo  = Database::getInstance();
            $stmt = $pdo->prepare(
                "SELECT ak.id, ak.user_id, ak.expires_at, ak.revoked, u.subscription_plan
                 FROM   api_keys ak
                 JOIN   users u ON u.id = ak.user_id
                 WHERE  ak.key_hash = ?
                 LIMIT  1"
            );
            $stmt->execute([$hash]);
            $key = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$key || (int) $key['revoked'] === 1) {
                Response::unauthorized('API key invalida o revocada');
            }
            if ($key['expires_at'] && strtotime($key['expires_at']) < time()) {
                Response::unauthorized('API key expirada');
            }

            $pdo->prepare("UPDATE api_keys SET last_used_at = NOW() WHERE id = ?")->execute([$key['id']]);

            $plan   = $key['subscription_plan'] ?? 'free';
            $keyId  = (int) $key['id'];

            self::enforceBurstLimit($keyId, $plan);
            self::enforceMonthlyQuota($keyId, $plan);

            return ['api_key_id' => $keyId, 'user_id' => (int) $key['user_id'], 'plan' => $plan];
        } catch (\PDOException) {
            Response::serverError();
        }
    }

    private static function enforceBurstLimit(int $apiKeyId, string $plan): void
    {
        $limit  = self::PLAN_BURST[$plan] ?? self::PLAN_BURST['free'];
        $bucket = "rate:apikey:{$apiKeyId}";
        $count  = Cache::rateIncr($bucket, 60);
        $ttl    = Cache::ttl($bucket);
        $reset  = $ttl > 0 ? time() + $ttl : time() + 60;

        header('X-RateLimit-Limit: ' . $limit);
        header('X-RateLimit-Remaining: ' . max(0, $limit - $count));
        header('X-RateLimit-Reset: ' . $reset);

        if ($count > $limit) {
            header('Retry-After: ' . max(1, $reset - time()));
            Response::error('Demasiadas solicitudes. Reduce la frecuencia.', 429);
        }
    }

    private static function enforceMonthlyQuota(int $apiKeyId, string $plan): void
    {
        $quota = self::PLAN_QUOTAS[$plan] ?? self::PLAN_QUOTAS['free'];
        if ($quota < 0) {
            return; // ilimitado
        }

        $period = date('Y-m');
        $used   = Cache::apiUsageIncr($apiKeyId, $period);

        if ($used > $quota) {
            Response::quotaExceeded($quota, $period);
        }
    }
}

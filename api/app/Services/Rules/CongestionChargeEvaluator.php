<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Rules;

/**
 * Modelo de peaje de congestion: no restringe el paso, cobra una tarifa por
 * entrar a la zona en horario tarifado. Usado en NYC Congestion Pricing, etc.
 * "restricted" aqui significa "aplica el cobro", no una prohibicion de circular.
 */
class CongestionChargeEvaluator implements RuleEvaluatorInterface
{
    public function evaluate(array $payload, array $query): array
    {
        $date    = $query['date'] ?? date('Y-m-d');
        $dayName = strtolower(date('l', strtotime($date)));

        $exemptDays = array_map('strtolower', $payload['exempt_days'] ?? []);
        $applies    = !in_array($dayName, $exemptDays, true);

        return [
            'restricted' => $applies,
            'reason'     => $applies
                ? "Aplica tarifa de congestion en {$payload['zone_name']} (\${$payload['fee_usd']} USD)"
                : "Sin tarifa de congestion los {$dayName}",
            'details' => [
                'zone_name' => $payload['zone_name'] ?? null,
                'fee_usd'   => $payload['fee_usd'] ?? null,
                'hours'     => $payload['hours'] ?? null,
            ],
        ];
    }
}

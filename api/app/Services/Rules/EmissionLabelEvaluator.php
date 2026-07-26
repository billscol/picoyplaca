<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Rules;

/**
 * Modelo de zona de bajas emisiones (ZBE): restriccion por etiqueta ambiental,
 * no por placa. Usado en Madrid Central, Barcelona ZBE, etc.
 */
class EmissionLabelEvaluator implements RuleEvaluatorInterface
{
    public function evaluate(array $payload, array $query): array
    {
        $label = strtolower(trim((string) ($query['label'] ?? '')));
        $date  = $query['date'] ?? date('Y-m-d');
        $dayName = strtolower(date('l', strtotime($date)));

        if ($label === '') {
            return [
                'restricted' => false,
                'reason'     => 'Etiqueta ambiental no especificada — indica el parametro "label" (b, c, eco, 0, sin etiqueta)',
                'details'    => ['zone_name' => $payload['zone_name'] ?? null],
            ];
        }

        $exemptDays = array_map('strtolower', $payload['exempt_days'] ?? []);
        if (in_array($dayName, $exemptDays, true)) {
            return ['restricted' => false, 'reason' => "Zona sin restriccion los {$dayName}", 'details' => ['day' => $dayName]];
        }

        $restrictedLabels = array_map('strtolower', $payload['restricted_labels'] ?? []);
        $restricted = in_array($label, $restrictedLabels, true);

        return [
            'restricted' => $restricted,
            'reason'     => $restricted
                ? "Etiqueta '{$label}' no permitida en {$payload['zone_name']}"
                : "Etiqueta '{$label}' permitida en {$payload['zone_name']}",
            'details' => [
                'zone_name' => $payload['zone_name'] ?? null,
                'hours'     => $payload['hours'] ?? null,
            ],
        ];
    }
}

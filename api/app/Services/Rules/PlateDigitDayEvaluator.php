<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Rules;

/**
 * Modelo clasico "pico y placa": restriccion por ultimo digito de la placa segun el dia.
 * Usado en Bogota, Medellin, Quito, Lima, San Jose, CDMX, etc.
 */
class PlateDigitDayEvaluator implements RuleEvaluatorInterface
{
    public function evaluate(array $payload, array $query): array
    {
        $plate = strtoupper(trim((string) ($query['plate'] ?? '')));
        $date  = $query['date'] ?? date('Y-m-d');

        if ($plate === '' || !preg_match('/\d/', $plate)) {
            return ['restricted' => false, 'reason' => 'Placa invalida o sin digitos', 'details' => []];
        }

        $lastDigit = (int) substr(preg_replace('/\D/', '', $plate), -1);
        $dayName   = strtolower(date('l', strtotime($date)));

        $category = $this->resolveParticularesCategory($payload);

        $schedule = $category['schedule'] ?? [];
        $dayRule  = null;
        foreach ($schedule as $entry) {
            if (($entry['day'] ?? '') === $dayName) {
                $dayRule = $entry;
                break;
            }
        }

        if ($dayRule === null) {
            return ['restricted' => false, 'reason' => "Sin restriccion los {$dayName}", 'details' => ['day' => $dayName]];
        }

        $digits = $dayRule['digits'] ?? [];
        $restricted = in_array($lastDigit, $digits, true);

        return [
            'restricted' => $restricted,
            'reason'     => $restricted
                ? "Placa terminada en {$lastDigit} restringida los {$dayName}"
                : "Placa terminada en {$lastDigit} no restringida los {$dayName}",
            'details' => [
                'day'         => $dayName,
                'last_digit'  => $lastDigit,
                'hours'       => $dayRule['hours'] ?? null,
                'exceptions'  => $category['exceptions'] ?? [],
                'holidays_suspended' => $category['holidays_suspended'] ?? false,
            ],
        ];
    }

    /**
     * Payload nuevo (con categorias de vehiculo: particulares/motos/taxis/...) o payload
     * plano viejo (sin 'categories', tratado como si fuera directamente la categoria particulares).
     */
    private function resolveParticularesCategory(array $payload): array
    {
        if (!isset($payload['categories'])) {
            return $payload;
        }

        foreach ($payload['categories'] as $category) {
            if (($category['key'] ?? '') === 'particulares') {
                return $category;
            }
        }

        return $payload['categories'][0] ?? [];
    }
}

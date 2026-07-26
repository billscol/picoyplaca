<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Rules;

class RuleEvaluatorFactory
{
    public static function make(string $restrictionModel): RuleEvaluatorInterface
    {
        return match ($restrictionModel) {
            'plate_digit_day'     => new PlateDigitDayEvaluator(),
            'emission_label_zone' => new EmissionLabelEvaluator(),
            'congestion_charge'   => new CongestionChargeEvaluator(),
            default => throw new \InvalidArgumentException("Modelo de restriccion desconocido: {$restrictionModel}"),
        };
    }
}

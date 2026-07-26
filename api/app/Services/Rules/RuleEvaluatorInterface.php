<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Rules;

interface RuleEvaluatorInterface
{
    /**
     * Evalua si un vehiculo esta restringido segun la regla vigente de una ciudad.
     *
     * @param array $payload Contenido de `rules.payload_json` (forma segun restriction_model)
     * @param array $query   Parametros de la consulta: plate, date, label, etc. (varian por modelo)
     * @return array{restricted: bool, reason: string, details: array}
     */
    public function evaluate(array $payload, array $query): array;
}

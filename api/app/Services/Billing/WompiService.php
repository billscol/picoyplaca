<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Billing;

/**
 * Integracion con Wompi (LatAm — cobro en pesos colombianos y otras monedas
 * regionales). Placeholder minimo — implementar con las credenciales reales
 * de WOMPI_PRIVATE_KEY cuando se den de alta.
 */
class WompiService
{
    public function createPaymentLink(int $userId, string $planCode, string $billingCycle, int $amountCents, string $currency = 'COP'): string
    {
        $privateKey = ($_ENV['WOMPI_PRIVATE_KEY'] ?? getenv('WOMPI_PRIVATE_KEY')) ?: '';
        if ($privateKey === '') {
            throw new \RuntimeException('WOMPI_PRIVATE_KEY no configurado');
        }

        // TODO: POST https://production.wompi.co/v1/payment_links con reference=user:{$userId}:{$planCode}
        throw new \RuntimeException('WompiService::createPaymentLink pendiente de integrar API real');
    }

    public function verifyEventSignature(array $event, string $checksum): bool
    {
        $eventsSecret = ($_ENV['WOMPI_EVENTS_SECRET'] ?? getenv('WOMPI_EVENTS_SECRET')) ?: '';
        if ($eventsSecret === '') {
            return false;
        }

        // TODO: recalcular checksum SHA256 segun spec de eventos de Wompi y comparar con hash_equals.
        return false;
    }
}

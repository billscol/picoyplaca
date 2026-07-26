<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Billing;

/**
 * Integracion con Stripe (cobertura global). Placeholder minimo — conectar el
 * SDK oficial (stripe/stripe-php) cuando haya STRIPE_SECRET_KEY real en .env.
 */
class StripeService
{
    public function createCheckoutSession(int $userId, string $planCode, string $billingCycle, string $successUrl, string $cancelUrl): string
    {
        $secret = ($_ENV['STRIPE_SECRET_KEY'] ?? getenv('STRIPE_SECRET_KEY')) ?: '';
        if ($secret === '') {
            throw new \RuntimeException('STRIPE_SECRET_KEY no configurado');
        }

        // TODO: usar stripe/stripe-php -> \Stripe\Checkout\Session::create([...])
        // con price_id de $planCode/$billingCycle, metadata=['user_id'=>$userId], success_url, cancel_url.
        throw new \RuntimeException('StripeService::createCheckoutSession pendiente de integrar SDK real');
    }

    public function verifyWebhookSignature(string $payload, string $signature): array
    {
        $webhookSecret = ($_ENV['STRIPE_WEBHOOK_SECRET'] ?? getenv('STRIPE_WEBHOOK_SECRET')) ?: '';
        if ($webhookSecret === '') {
            throw new \RuntimeException('STRIPE_WEBHOOK_SECRET no configurado');
        }

        // TODO: \Stripe\Webhook::constructEvent($payload, $signature, $webhookSecret)
        throw new \RuntimeException('StripeService::verifyWebhookSignature pendiente de integrar SDK real');
    }
}

<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Scraping;

/**
 * Trae el HTML crudo de una URL via curl simple (mismo estilo que DataForSeoSearchProvider/
 * RuleExtractionService — sin dependencias nuevas de Composer). Nunca lanza excepcion: si la
 * fuente falla (403, timeout, DNS, etc.) devuelve null y quien llama sigue con las demas fuentes.
 */
class PageFetcher
{
    private const USER_AGENT = 'Mozilla/5.0 (compatible; PicoPlacaBot/1.0; +https://picoyplaca.example/bot)';

    public function fetch(string $url): ?string
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 5,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_USERAGENT      => self::USER_AGENT,
            CURLOPT_HTTPHEADER     => ['Accept-Language: es-CO,es;q=0.9'],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $body       = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($body === false || $statusCode >= 400) {
            return null;
        }

        return $body;
    }
}

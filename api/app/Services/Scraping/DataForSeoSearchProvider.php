<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Scraping;

/**
 * Trae resultados organicos de Google via DataForSEO SERP API (live/advanced).
 * Se eligio por ya tener cuenta activa, evitando dar de alta un proveedor nuevo —
 * intercambiable por Google CSE / SerpAPI implementando SearchProviderInterface.
 */
class DataForSeoSearchProvider implements SearchProviderInterface
{
    private const ENDPOINT = 'https://api.dataforseo.com/v3/serp/google/organic/live/advanced';

    public function search(string $query, int $limit = 5): array
    {
        $login    = ($_ENV['DATAFORSEO_LOGIN'] ?? getenv('DATAFORSEO_LOGIN')) ?: '';
        $password = ($_ENV['DATAFORSEO_PASSWORD'] ?? getenv('DATAFORSEO_PASSWORD')) ?: '';
        if ($login === '' || $password === '') {
            throw new \RuntimeException('DATAFORSEO_LOGIN/DATAFORSEO_PASSWORD no configurados');
        }

        $ch = curl_init(self::ENDPOINT);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Basic ' . base64_encode("{$login}:{$password}"),
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode([[
                'keyword'         => $query,
                'language_code'   => 'es',
                'location_name'   => 'Colombia',
                'depth'           => $limit,
            ]]),
            CURLOPT_TIMEOUT => 30,
        ]);

        $raw = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new \RuntimeException("DataForSEO request fallo: {$err}");
        }

        $data  = json_decode($raw, true);
        $items = $data['tasks'][0]['result'][0]['items'] ?? [];

        $results = [];
        foreach ($items as $item) {
            if (($item['type'] ?? '') !== 'organic') {
                continue;
            }
            $results[] = [
                'title'   => (string) ($item['title'] ?? ''),
                'url'     => (string) ($item['url'] ?? ''),
                'snippet' => (string) ($item['description'] ?? ''),
            ];
            if (count($results) >= $limit) {
                break;
            }
        }

        return $results;
    }
}

<?php

declare(strict_types=1);

namespace PicoPlaca\App\Jobs;

use PicoPlaca\App\Repositories\CityRepository;
use PicoPlaca\App\Repositories\RuleProposalRepository;
use PicoPlaca\App\Repositories\RuleRepository;
use PicoPlaca\App\Repositories\RuleSourceRepository;
use PicoPlaca\App\Services\Scraping\DataForSeoSearchProvider;
use PicoPlaca\App\Services\Scraping\HtmlTextExtractor;
use PicoPlaca\App\Services\Scraping\PageFetcher;
use PicoPlaca\App\Services\Scraping\RuleExtractionService;
use PicoPlaca\Core\Database;
use PicoPlaca\Core\Logger;

/**
 * Por ciudad: busca -> extrae con IA -> compara contra la regla vigente ->
 * guarda como propuesta. Nunca escribe directo en `rules` (ver plan: la
 * publicacion requiere aprobacion humana en el admin, salvo auto-aprobacion
 * de alta confianza cuando la propuesta simplemente re-confirma la regla actual).
 *
 * Umbral de auto-aprobacion: confidence >= 0.9 Y el payload es idéntico al vigente
 * (re-confirmacion, no cambio real) — cualquier cambio de contenido siempre queda pendiente.
 */
class PicoPlacaScrapeJob extends BaseJob
{
    private const AUTO_APPROVE_CONFIDENCE = 0.9;

    public function handle(array $payload): void
    {
        $cityId = (int) ($payload['city_id'] ?? 0);
        if ($cityId <= 0) {
            throw new \InvalidArgumentException('city_id requerido');
        }

        $city = (new CityRepository())->find($cityId);
        if (!$city || !$city['is_active']) {
            Logger::warning('PicoPlacaScrapeJob: ciudad inactiva o inexistente', ['city_id' => $cityId]);
            return;
        }

        $sources = (new RuleSourceRepository())->findByCity($cityId);

        // Cerrar la conexion a BD antes de las llamadas externas (fetch + LLM pueden tardar
        // varios segundos) — evita agotar max_connections con muchas ciudades en paralelo.
        Database::releaseConnection();

        $fullTexts = $this->fetchSources($sources);

        $searchResults = [];
        if (($_ENV['DATAFORSEO_LOGIN'] ?? getenv('DATAFORSEO_LOGIN')) && ($_ENV['DATAFORSEO_PASSWORD'] ?? getenv('DATAFORSEO_PASSWORD'))) {
            $query = "pico y placa restriccion vehicular {$city['city_name']} {$city['country_name']} " . date('Y') . " vigente";
            try {
                $searchResults = (new DataForSeoSearchProvider())->search($query, 5);
            } catch (\Throwable $e) {
                Logger::warning('PicoPlacaScrapeJob: DataForSEO fallo, se continua solo con rule_sources', [
                    'city_id' => $cityId, 'error' => $e->getMessage(),
                ]);
            }
        }

        $extraction = (new RuleExtractionService())->extract(
            $city['city_name'],
            $city['restriction_model'],
            $searchResults,
            $fullTexts
        );

        if (empty($extraction['payload'])) {
            Logger::warning('PicoPlacaScrapeJob: extraccion vacia', ['city_id' => $cityId, 'summary' => $extraction['summary']]);
            return;
        }

        $currentRule = (new RuleRepository())->findCurrentByCity($cityId);
        $isSamePayload = $currentRule && $this->normalize($currentRule['payload']) === $this->normalize($extraction['payload']);

        $status = ($isSamePayload && $extraction['confidence'] >= self::AUTO_APPROVE_CONFIDENCE)
            ? 'auto_approved'
            : 'pending';

        $diffSummary = $isSamePayload
            ? "Sin cambios — regla reconfirmada. {$extraction['summary']}"
            : "Posible cambio detectado. {$extraction['summary']}";

        $proposals = new RuleProposalRepository();
        $proposalId = $proposals->create(
            $cityId,
            $extraction['payload'],
            $diffSummary,
            $extraction['source_url'],
            $extraction['confidence'],
            $status
        );

        if ($status === 'auto_approved') {
            (new RuleRepository())->publish($cityId, $extraction['payload'], $extraction['source_url']);
        }

        Logger::info('PicoPlacaScrapeJob completado', [
            'city_id' => $cityId, 'proposal_id' => $proposalId, 'status' => $status, 'confidence' => $extraction['confidence'],
        ]);
    }

    private function normalize(array $payload): string
    {
        ksort($payload);
        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Trae el texto completo de cada fuente registrada (gov_official + aggregator) y
     * actualiza last_checked_at/last_status. Una fuente que falla no detiene a las demas.
     *
     * @param array $sources filas de rule_sources
     * @return array{0: array{url: string, text: string}} solo las que se pudieron leer
     */
    private function fetchSources(array $sources): array
    {
        if (empty($sources)) {
            return [];
        }

        $fetcher   = new PageFetcher();
        $extractor = new HtmlTextExtractor();
        $repo      = new RuleSourceRepository();
        $fullTexts = [];

        foreach ($sources as $source) {
            $html = $fetcher->fetch($source['url']);
            if ($html === null) {
                $repo->touch((int) $source['id'], 'unreachable');
                Logger::warning('PicoPlacaScrapeJob: fuente inalcanzable', ['url' => $source['url']]);
                continue;
            }

            $text = $extractor->extractText($html);
            if ($text === '') {
                $repo->touch((int) $source['id'], 'unreachable');
                continue;
            }

            $repo->touch((int) $source['id'], 'ok');
            $fullTexts[] = ['url' => $source['url'], 'text' => $text];
        }

        return $fullTexts;
    }
}

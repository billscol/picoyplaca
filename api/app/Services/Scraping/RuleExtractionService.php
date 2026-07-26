<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Scraping;

/**
 * Toma resultados de busqueda (titulo+snippet+url) y le pide a un LLM que los
 * estructure en el JSON de regla correspondiente al restriction_model de la
 * ciudad. Separado del SearchProvider a proposito (decision del usuario): el
 * LLM nunca navega por su cuenta, solo interpreta lo que el SearchProvider trajo.
 */
class RuleExtractionService
{
    private const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    /**
     * @param array $searchResults salida de SearchProviderInterface::search() — snippets cortos (~160 caracteres)
     * @param array $fullTexts     [{url, text}] texto completo (ya limpio de HTML) de fuentes fetcheadas
     *                             directamente (gov_official/aggregator ya registradas en rule_sources) —
     *                             mucho mas rico que un snippet, se prioriza sobre $searchResults cuando hay.
     * @return array{payload: array, confidence: float, summary: string, source_url: string}
     */
    public function extract(string $cityName, string $restrictionModel, array $searchResults, array $fullTexts = []): array
    {
        $apiKey = ($_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY')) ?: '';
        if ($apiKey === '') {
            throw new \RuntimeException('OPENAI_API_KEY no configurado');
        }
        if (empty($searchResults) && empty($fullTexts)) {
            return ['payload' => [], 'confidence' => 0.0, 'summary' => 'Sin fuentes disponibles', 'source_url' => ''];
        }

        $schema = $this->schemaFor($restrictionModel);

        $sections = [];
        if (!empty($fullTexts)) {
            $sections[] = "=== Contenido completo de fuentes registradas (prioriza esto) ===\n\n" . implode("\n\n---\n\n", array_map(
                fn (array $t) => "URL: {$t['url']}\nContenido:\n{$t['text']}",
                $fullTexts
            ));
        }
        if (!empty($searchResults)) {
            $sections[] = "=== Resultados de busqueda (contexto adicional) ===\n\n" . implode("\n\n", array_map(
                fn (array $r) => "URL: {$r['url']}\nTitulo: {$r['title']}\nExtracto: {$r['snippet']}",
                $searchResults
            ));
        }
        $context = implode("\n\n", $sections);

        $prompt = <<<PROMPT
Eres un extractor de datos normativos. A partir de esta informacion sobre la
restriccion vehicular vigente en {$cityName} (modelo: {$restrictionModel}),
devuelve UNICAMENTE un JSON con esta forma exacta:

{$schema}

Reglas:
- El JSON de arriba es solo la FORMA esperada — sus valores (dias, digitos, horas)
  son un ejemplo generico, NO los copies. Usa exclusivamente los valores reales
  que encuentres en el contenido provisto abajo.
- Si el modelo es "plate_digit_day" y encuentras un horario semanal (lunes a viernes
  o similar), incluye TODOS los dias que encuentres en "schedule", no solo uno.
- Si la informacion es ambigua, contradictoria entre fuentes, o no confirma una
  fecha de vigencia reciente, baja "confidence" (0.0 a 1.0) en vez de adivinar.
- Si el contenido completo de una fuente registrada contradice un snippet de
  busqueda, confia en el contenido completo (mas contexto, menos probable que
  sea un resumen truncado o desactualizado). Si dos fuentes de contenido completo
  se contradicen entre si (por ejemplo picoyplacaya vs pyphoy), baja "confidence"
  y dilo en "summary" en vez de elegir una al azar.
- "source_url" debe ser la URL mas oficial/confiable de las provistas (prioriza dominios .gov, .gob).
- "summary" es una frase corta en español resumiendo el cambio o confirmacion detectada.

{$context}
PROMPT;

        $ch = curl_init(self::ENDPOINT);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer {$apiKey}",
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'model'           => ($_ENV['OPENAI_MODEL_MINI'] ?? getenv('OPENAI_MODEL_MINI')) ?: 'gpt-4o-mini',
                'response_format' => ['type' => 'json_object'],
                'temperature'     => 0.1,
                'messages'        => [
                    ['role' => 'system', 'content' => 'Respondes unicamente con JSON valido, sin texto adicional.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]),
            CURLOPT_TIMEOUT => 60,
        ]);

        $raw = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            throw new \RuntimeException("OpenAI request fallo: {$err}");
        }

        $data    = json_decode($raw, true);
        $content = $data['choices'][0]['message']['content'] ?? '{}';
        $parsed  = json_decode($content, true) ?? [];

        return [
            'payload'    => $parsed['payload'] ?? [],
            'confidence' => (float) ($parsed['confidence'] ?? 0.0),
            'summary'    => (string) ($parsed['summary'] ?? ''),
            'source_url' => (string) ($parsed['source_url'] ?? ($fullTexts[0]['url'] ?? ($searchResults[0]['url'] ?? ''))),
        ];
    }

    private function schemaFor(string $restrictionModel): string
    {
        return match ($restrictionModel) {
            'plate_digit_day' => <<<JSON
{
  "payload": {
    "schedule": [
      {"day":"monday","digits":[<digitos reales del lunes>],"hours":{"start":"<hora inicio>","end":"<hora fin>"}},
      {"day":"tuesday","digits":[<digitos reales del martes>],"hours":{"start":"<hora inicio>","end":"<hora fin>"}}
      /* ...continua con cada dia que encuentres en el contenido, no solo lunes/martes... */
    ],
    "exceptions": ["electric","hybrid","motorcycle"],
    "holidays_suspended": true
  },
  "confidence": 0.0,
  "summary": "",
  "source_url": ""
}
JSON,
            'emission_label_zone' => <<<JSON
{
  "payload": {
    "zone_name": "",
    "restricted_labels": ["sin etiqueta"],
    "allowed_labels": ["B","C","ECO","0"],
    "hours": {"start":"00:00","end":"23:59"},
    "exempt_days": ["sunday"]
  },
  "confidence": 0.0,
  "summary": "",
  "source_url": ""
}
JSON,
            'congestion_charge' => <<<JSON
{
  "payload": {
    "zone_name": "",
    "fee_usd": 0,
    "hours": {"start":"05:00","end":"21:00"},
    "exempt_days": ["saturday","sunday"]
  },
  "confidence": 0.0,
  "summary": "",
  "source_url": ""
}
JSON,
            default => '{"payload": {}, "confidence": 0.0, "summary": "", "source_url": ""}',
        };
    }
}

<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Scraping;

/**
 * Convierte HTML crudo en texto visible plano para dárselo a la IA como contexto —
 * mucho mas rico que un snippet de busqueda de ~160 caracteres. Usa DOMDocument/DOMXPath
 * (ext-dom, viene con PHP core, sin dependencia de Composer).
 */
class HtmlTextExtractor
{
    private const MAX_CHARS = 6000;

    public function extractText(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $doc = new \DOMDocument();
        libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="utf-8"?>' . $html, LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_clear_errors();

        $xpath = new \DOMXPath($doc);
        foreach ($xpath->query('//script | //style | //nav | //footer | //noscript') as $node) {
            $node->parentNode?->removeChild($node);
        }

        $text = $doc->textContent ?? '';
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace('/\n\s*\n+/', "\n", $text) ?? $text;
        $text = trim($text);

        return mb_substr($text, 0, self::MAX_CHARS);
    }
}

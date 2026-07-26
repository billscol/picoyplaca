<?php

declare(strict_types=1);

namespace PicoPlaca\App\Services\Scraping;

interface SearchProviderInterface
{
    /**
     * @return array<int, array{title:string, url:string, snippet:string}>
     */
    public function search(string $query, int $limit = 5): array;
}

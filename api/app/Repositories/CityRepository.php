<?php

declare(strict_types=1);

namespace PicoPlaca\App\Repositories;

use PicoPlaca\Core\Database;

class CityRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    private const CATALOG_COLUMNS = "id, country_code, country_name, region, city_name, slug, timezone,
             restriction_model, contact_channels, legal_info";

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT " . self::CATALOG_COLUMNS . ", is_active
             FROM cities WHERE slug = ? LIMIT 1"
        );
        $stmt->execute([$slug]);
        return $this->decodeContactChannels($stmt->fetch() ?: null);
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT " . self::CATALOG_COLUMNS . ", is_active
             FROM cities WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$id]);
        return $this->decodeContactChannels($stmt->fetch() ?: null);
    }

    public function allActive(): array
    {
        $stmt = $this->db->query(
            "SELECT " . self::CATALOG_COLUMNS . "
             FROM cities WHERE is_active = 1 ORDER BY country_name, city_name"
        );
        return array_map(fn (array $row) => $this->decodeContactChannels($row), $stmt->fetchAll());
    }

    public function all(): array
    {
        $stmt = $this->db->query(
            "SELECT " . self::CATALOG_COLUMNS . ", is_active
             FROM cities ORDER BY country_name, city_name"
        );
        return array_map(fn (array $row) => $this->decodeContactChannels($row), $stmt->fetchAll());
    }

    private function decodeContactChannels(?array $row): ?array
    {
        if ($row === null) {
            return null;
        }
        $row['contact_channels'] = isset($row['contact_channels'])
            ? json_decode((string) $row['contact_channels'], true)
            : null;
        $row['legal_info'] = isset($row['legal_info'])
            ? json_decode((string) $row['legal_info'], true)
            : null;
        return $row;
    }

    public function create(array $data): int
    {
        $this->db->prepare(
            "INSERT INTO cities (country_code, country_name, city_name, slug, timezone, restriction_model, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)"
        )->execute([
            $data['country_code'], $data['country_name'], $data['city_name'],
            $data['slug'], $data['timezone'], $data['restriction_model'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function setActive(int $id, bool $active): void
    {
        $this->db->prepare("UPDATE cities SET is_active = ? WHERE id = ?")->execute([$active ? 1 : 0, $id]);
    }
}

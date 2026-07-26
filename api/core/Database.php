<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::$instance = self::connect();
        }
        return self::$instance;
    }

    /** Cierra la conexion activa. getInstance() reabre on-demand — util antes de
     *  llamadas externas largas (bin/cron-picoplaca-scrape.php) que no tocan la BD. */
    public static function releaseConnection(): void
    {
        self::$instance = null;
    }

    private static function connect(): PDO
    {
        $host = ($_ENV['DB_HOST'] ?? getenv('DB_HOST')) ?: '127.0.0.1';
        $port = ($_ENV['DB_PORT'] ?? getenv('DB_PORT')) ?: '3306';
        $name = ($_ENV['DB_NAME'] ?? getenv('DB_NAME')) ?: 'picoyplaca';
        $user = ($_ENV['DB_USER'] ?? getenv('DB_USER')) ?: '';
        $pass = ($_ENV['DB_PASS'] ?? getenv('DB_PASS')) ?: '';

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

        try {
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);

            $pdo->exec("SET time_zone = '+00:00'");
            return $pdo;
        } catch (PDOException $e) {
            error_log('[picoyplaca-api] DB connection failed: ' . $e->getMessage());
            Response::serverError();
        }
    }

    private function __construct() {}
    private function __clone() {}
}

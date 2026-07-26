<?php

declare(strict_types=1);

namespace PicoPlaca\Core;

/**
 * Cola de jobs asincronos sobre MySQL/MariaDB.
 *
 * Patron:
 *  1. El controller/cron llama JobQueue::dispatch() — inserta el job.
 *  2. bin/worker.php llama JobQueue::claim() en loop, procesa y llama ack() o fail().
 *
 * Requiere MariaDB 10.6+ (usa FOR UPDATE SKIP LOCKED).
 */
class JobQueue
{
    public static function dispatch(string $type, array $payload = [], int $delaySeconds = 0): void
    {
        try {
            $pdo         = Database::getInstance();
            $availableAt = date('Y-m-d H:i:s', time() + max(0, $delaySeconds));

            $pdo->prepare(
                "INSERT INTO jobs (type, payload, available_at) VALUES (?, ?, ?)"
            )->execute([$type, json_encode($payload, JSON_UNESCAPED_UNICODE), $availableAt]);
        } catch (\Throwable $e) {
            error_log('[api/JobQueue::dispatch] ' . $e->getMessage());
        }
    }

    public static function claim(): ?array
    {
        $pdo = null;

        try {
            $pdo = Database::getInstance();

            if ($pdo->inTransaction()) {
                try { $pdo->rollBack(); } catch (\Throwable) {}
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare(
                "SELECT id, type, payload, attempts, max_attempts
                 FROM   jobs
                 WHERE  status = 'pending' AND available_at <= NOW()
                 ORDER  BY id ASC
                 LIMIT  1
                 FOR UPDATE SKIP LOCKED"
            );
            $stmt->execute();
            $job = $stmt->fetch();

            if (!$job) {
                $pdo->commit();
                return null;
            }

            $pdo->prepare(
                "UPDATE jobs SET status = 'processing', started_at = NOW(), attempts = attempts + 1 WHERE id = ?"
            )->execute([$job['id']]);

            $pdo->commit();

            $job['payload'] = json_decode((string) $job['payload'], true) ?? [];
            return $job;
        } catch (\Throwable $e) {
            if ($pdo) {
                try { $pdo->rollBack(); } catch (\Throwable) {}
            }
            error_log('[api/JobQueue::claim] ' . $e->getMessage());
            return null;
        }
    }

    public static function ack(int $jobId): void
    {
        try {
            Database::getInstance()->prepare(
                "UPDATE jobs SET status = 'done', finished_at = NOW() WHERE id = ?"
            )->execute([$jobId]);
        } catch (\Throwable $e) {
            error_log('[api/JobQueue::ack] ' . $e->getMessage());
        }
    }

    /** Backoff exponencial: intento 1 -> 60s, 2 -> 240s, 3 -> 540s. */
    public static function fail(int $jobId, int $attempts, int $maxAttempts, string $error): void
    {
        try {
            $pdo = Database::getInstance();

            if ($attempts < $maxAttempts) {
                $delaySecs = ($attempts ** 2) * 60;
                $pdo->prepare(
                    "UPDATE jobs SET status = 'pending', available_at = DATE_ADD(NOW(), INTERVAL ? SECOND), error = ? WHERE id = ?"
                )->execute([$delaySecs, $error, $jobId]);
            } else {
                $pdo->prepare(
                    "UPDATE jobs SET status = 'failed', finished_at = NOW(), error = ? WHERE id = ?"
                )->execute([$error, $jobId]);
            }
        } catch (\Throwable $e) {
            error_log('[api/JobQueue::fail] ' . $e->getMessage());
        }
    }

    public static function prune(int $days = 7): int
    {
        try {
            $stmt = Database::getInstance()->prepare(
                "DELETE FROM jobs WHERE status IN ('done', 'failed') AND finished_at < DATE_SUB(NOW(), INTERVAL ? DAY)"
            );
            $stmt->execute([$days]);
            return $stmt->rowCount();
        } catch (\Throwable) {
            return 0;
        }
    }

    public static function recoverStuck(int $minutes = 10): int
    {
        try {
            $stmt = Database::getInstance()->prepare(
                "UPDATE jobs SET status = 'pending', available_at = NOW()
                 WHERE status = 'processing' AND started_at < DATE_SUB(NOW(), INTERVAL ? MINUTE) AND attempts < max_attempts"
            );
            $stmt->execute([$minutes]);
            return $stmt->rowCount();
        } catch (\Throwable) {
            return 0;
        }
    }
}

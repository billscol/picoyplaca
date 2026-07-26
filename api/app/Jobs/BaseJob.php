<?php

declare(strict_types=1);

namespace PicoPlaca\App\Jobs;

abstract class BaseJob
{
    /** Lanzar una excepcion aqui es como se señala fallo — el worker llama a JobQueue::fail(). */
    abstract public function handle(array $payload): void;
}

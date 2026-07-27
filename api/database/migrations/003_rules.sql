-- Ciudades monitoreadas. restriction_model determina la forma del JSON de `rules.payload`.
CREATE TABLE IF NOT EXISTS cities (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    country_code      CHAR(2) NOT NULL,
    country_name      VARCHAR(80) NOT NULL,
    city_name         VARCHAR(80) NOT NULL,
    slug              VARCHAR(100) NOT NULL UNIQUE,
    timezone          VARCHAR(60) NOT NULL,
    restriction_model ENUM('plate_digit_day','emission_label_zone','congestion_charge') NOT NULL,
    is_active         TINYINT(1) NOT NULL DEFAULT 1,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cities_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Regla vigente (y su historial) por ciudad.
-- payload cambia de forma segun restriction_model:
--   plate_digit_day:     {"schedule":[{"day":"monday","digits":[1,2],"hours":{"start":"06:00","end":"20:00"}}],"exceptions":["electric"],"holidays_suspended":true}
--   emission_label_zone: {"zone_name":"Madrid Central","restricted_labels":["B"],"hours":{"start":"00:00","end":"23:59"}}
--   congestion_charge:   {"zone_name":"...","fee":9,"currency":"USD","hours":{"start":"05:00","end":"21:00"},"exempt_days":["saturday","sunday"]}
CREATE TABLE IF NOT EXISTS rules (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id        INT UNSIGNED NOT NULL,
    payload_json   JSON NOT NULL,
    effective_from DATE NOT NULL,
    effective_to   DATE NULL,
    is_current     TINYINT(1) NOT NULL DEFAULT 1,
    source_url     VARCHAR(500) NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    UNIQUE KEY uq_rules_city_effective (city_id, effective_from),
    INDEX idx_rules_current (city_id, is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fuentes a monitorear semanalmente por ciudad (agente IA)
CREATE TABLE IF NOT EXISTS rule_sources (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id         INT UNSIGNED NOT NULL,
    url             VARCHAR(500) NOT NULL,
    source_type     ENUM('gov_official','news','aggregator') NOT NULL DEFAULT 'gov_official',
    last_checked_at DATETIME NULL,
    last_status     ENUM('ok','changed','unreachable','ambiguous') NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cola de revision: lo que produce el agente IA nunca se publica directo a `rules`.
CREATE TABLE IF NOT EXISTS rule_change_proposals (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    city_id           INT UNSIGNED NOT NULL,
    proposed_payload_json JSON NOT NULL,
    diff_summary      TEXT NULL,
    source_url        VARCHAR(500) NULL,
    confidence_score  DECIMAL(3,2) NOT NULL DEFAULT 0,
    status            ENUM('pending','approved','rejected','auto_approved') NOT NULL DEFAULT 'pending',
    reviewed_by       BIGINT UNSIGNED NULL,
    reviewed_at       DATETIME NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_proposals_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

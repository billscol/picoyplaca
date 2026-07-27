-- Resuelve 3 de las 5 ciudades que quedaron pendientes en el seed 008 por evidencia
-- insuficiente. Con busquedas mas especificas (2026-07-27) se encontro suficiente
-- evidencia para publicar "sin restriccion vigente" (mismo patron que Barranquilla,
-- ver seed 002_colombia_cities.sql) en estas 3 — cada una con su propia razon, que se
-- documenta en 'note' porque son situaciones distintas entre si:
--
--   Lima         MEDIA-ALTA — el Concejo Metropolitano de Lima aprobo la ordenanza de
--                pico y placa el 19-jul-2019, estuvo vigente jul-2019 a mar-2020, y fue
--                suspendida por la pandemia. No se encontro evidencia de que se haya
--                reactivado para particulares a 2026 (el esquema par/impar de atu.gob.pe
--                que se encontro en una busqueda anterior aplica a taxis/transporte
--                regular, un programa distinto — no se mezcla aqui).
--   Guayaquil    MEDIA — no se encontro un esquema permanente por digito de placa vigente;
--                lo unico documentado es una restriccion nocturna temporal ligada a
--                medidas de seguridad/pandemia (00:00-05:00, ya no vigente) y cierres
--                puntuales por eventos civicos. Menor confianza que Lima porque aqui no
--                hay una ordenanza especifica de "pico y placa" que se pueda citar como
--                derogada — es mas bien ausencia de evidencia de que exista una.
--   Tegucigalpa  MEDIA — la unica medida por digito de placa encontrada (2020, en
--                contexto de pandemia) fue anulada 24 horas despues de anunciada. No se
--                encontro evidencia de un esquema vigente en 2026.
--
-- Cuenca (Ecuador) y Ciudad de Panama siguen sin sembrar por evidencia genuinamente
-- insuficiente en ambas direcciones (ni para publicar un horario, ni para publicar "sin
-- restriccion" con una fuente citable como las 3 anteriores) — no se debe adivinar, ver
-- regla del seed 003_categories_and_metadata.sql.

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('PE', 'Peru',     'Lima',        'lima',        'Lima',         'America/Lima',        'plate_digit_day', 1),
    ('EC', 'Ecuador',  'Guayaquil',   'guayaquil',   'Guayas',       'America/Guayaquil',   'plate_digit_day', 1),
    ('HN', 'Honduras', 'Tegucigalpa', 'tegucigalpa', 'Francisco Morazan', 'America/Tegucigalpa', 'plate_digit_day', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(),
                'holidays_suspended', false,
                'note_short', 'Sin pico y placa vigente para particulares desde marzo de 2020.',
                'note', 'La ordenanza de pico y placa fue aprobada el 19 de julio de 2019 y estuvo vigente hasta marzo de 2020, cuando se suspendio por la pandemia. No hay evidencia de que se haya reactivado para vehiculos particulares. Existe un esquema distinto (par/impar) para taxis y transporte regular administrado por la ATU — no aplica a particulares.'
            )
        ),
        'metro_area', NULL
    ),
    '2020-03-01', 1, 'https://www.gob.pe/atu'
FROM cities WHERE slug = 'lima'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(),
                'holidays_suspended', false,
                'note_short', 'No se encontro un esquema permanente de pico y placa vigente en Guayaquil.',
                'note', 'A diferencia de Quito, Guayaquil no tiene un programa permanente de restriccion por ultimo digito de placa. Las unicas restricciones documentadas son medidas temporales (toque de queda nocturno durante la pandemia, ya no vigente) o cierres puntuales por eventos especificos (desfiles, ferias). Verifica en atm.gob.ec antes de un evento particular, ya que la ATM puede imponer restricciones puntuales no calendarizadas.'
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://atm.gob.ec/'
FROM cities WHERE slug = 'guayaquil'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(),
                'holidays_suspended', false,
                'note_short', 'Sin esquema vigente de restriccion por digito de placa en Tegucigalpa.',
                'note', 'En junio de 2020 se anuncio brevemente una restriccion por ultimo digito de placa (en contexto de pandemia), pero fue anulada aproximadamente 24 horas despues de su anuncio. No se encontro evidencia de que exista un esquema vigente en 2026.'
            )
        ),
        'metro_area', NULL
    ),
    '2020-06-29', 1, 'https://www.amdc.hn/'
FROM cities WHERE slug = 'tegucigalpa'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- rule_sources: aunque hoy no hay restriccion vigente en ninguna de las 3, el monitoreo
-- semanal existente (bin/cron-picoplaca-scrape.php) debe seguir vigilando por si se
-- reactiva o se introduce un esquema nuevo.
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.gob.pe/atu', 'gov_official' FROM cities WHERE slug = 'lima';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://atm.gob.ec/', 'gov_official' FROM cities WHERE slug = 'guayaquil';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.amdc.hn/', 'gov_official' FROM cities WHERE slug = 'tegucigalpa';

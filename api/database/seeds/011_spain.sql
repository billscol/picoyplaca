-- Fase 2 (ver plan): re-verificacion de Madrid (el dato original de 001_test_cities.sql
-- era de prueba, sin investigar) + primera ciudad nueva de Espana, Barcelona. Investigado
-- 2026-07-27.
--
--   Madrid    ALTA — multiples fuentes (RACE, madrid360.es citado indirectamente, prensa
--             especializada en motor) coinciden en que desde 2026 la ZBE de Madrid ya NO
--             es solo "Madrid Central" (el distrito Centro) sino TODO el termino
--             municipal, 24h/365 dias, y que la restriccion es solo para vehiculos "sin
--             etiqueta" (categoria A). Se corrige el zone_name del dato de prueba original.
--             MATIZ IMPORTANTE modelado en 'note' (no en campos estructurados, ver
--             lib/pico-placa.ts EmissionLabelZonePayload.note): los vehiculos sin etiqueta
--             EMPADRONADOS en Madrid (o de alta en el IVTM) tienen una excepcion vigente
--             al menos hasta el 31-dic-2026 — las fuentes no coinciden en si es un periodo
--             de aviso temporal o una modificacion permanente de la Ordenanza de Movilidad,
--             asi que no se afirma ninguna fecha de fin como definitiva.
--   Barcelona MEDIA-ALTA — ZBE Rondes, vigente desde 2020, zona de 95km2 delimitada por
--             las Rondas. Multiples fuentes coinciden en horario y multa; el matiz de la
--             etiqueta B (restringida solo en episodios de alta contaminacion desde
--             1-ene-2026) se documenta en 'note' porque no es la regla general sino una
--             restriccion condicional/extraordinaria, igual que la contingencia ambiental
--             de CDMX (ver seed 010_mexico.sql).

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('ES', 'Espana', 'Barcelona', 'barcelona', 'Catalunya', 'Europe/Madrid', 'emission_label_zone', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

UPDATE cities SET region = 'Comunidad de Madrid' WHERE slug = 'madrid' AND region IS NULL;

-- ===================== Madrid (correccion del dato de prueba) =====================
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
        'zone_name', 'Madrid (todo el termino municipal — Plan Madrid 360)',
        'restricted_labels', JSON_ARRAY('sin etiqueta'),
        'allowed_labels', JSON_ARRAY('B','C','ECO','0'),
        'hours', JSON_OBJECT('start','00:00','end','23:59'),
        'exempt_days', JSON_ARRAY(),
        'note', 'Los vehiculos sin etiqueta empadronados en Madrid (o de alta en el IVTM) tienen una excepcion vigente al menos hasta el 31 de diciembre de 2026 — las fuentes no coinciden en si es un periodo de aviso temporal o una modificacion permanente de la Ordenanza de Movilidad. Verifica tu caso especifico en madrid360.es antes de circular. Excepciones adicionales: vehiculos historicos y titulares de tarjeta de estacionamiento para personas con movilidad reducida.'
    ),
    r.source_url = 'https://www.madrid360.es/medio-ambiente/zonas-de-bajas-emisiones/'
WHERE c.slug = 'madrid' AND r.is_current = 1;

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '200 EUR (100 EUR con pago anticipado)',
    'citation', 'Ordenanza de Movilidad Sostenible de Madrid, Plan Madrid 360.'
) WHERE slug = 'madrid';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.madrid360.es/medio-ambiente/zonas-de-bajas-emisiones/', 'gov_official' FROM cities WHERE slug = 'madrid';

-- ===================== Barcelona =====================
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'zone_name', 'ZBE Rondes de Barcelona',
        'restricted_labels', JSON_ARRAY('sin etiqueta'),
        'allowed_labels', JSON_ARRAY('B','C','ECO','0'),
        'hours', JSON_OBJECT('start','07:00','end','20:00'),
        'exempt_days', JSON_ARRAY('saturday','sunday'),
        'note', 'Tambien sin restriccion los festivos (no solo fines de semana). Desde el 1 de enero de 2026, la etiqueta B tampoco puede circular durante los episodios de alta contaminacion declarados por la Generalitat de Catalunya (en condiciones normales si puede). Excepciones: vehiculos de personas con movilidad reducida, servicios de emergencia y servicios esenciales.'
    ),
    '2026-01-01', 1, 'https://ajuntament.barcelona.cat/qualitataire/es/zona-de-bajas-emisiones'
FROM cities WHERE slug = 'barcelona'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '200 EUR (260 EUR en episodio de alta contaminacion; -50% con pago anticipado)',
    'citation', 'Ordenanca de Circulacio, ZBE Rondes (Area Metropolitana de Barcelona).'
) WHERE slug = 'barcelona';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://ajuntament.barcelona.cat/qualitataire/es/zona-de-bajas-emisiones', 'gov_official' FROM cities WHERE slug = 'barcelona';

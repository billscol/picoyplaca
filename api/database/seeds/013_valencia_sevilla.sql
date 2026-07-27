-- Fase 2 (Espana), tercera y cuarta ciudad: Valencia y Sevilla. Investigado 2026-07-27.
--
--   Valencia MEDIA-ALTA en los hechos, pero con un matiz que cambia el alcance real de
--            la restriccion mas que en cualquier otra ciudad sembrada hasta ahora: la ZBE
--            de Valencia tiene un despliegue POR FASES. Hasta el 31-dic-2026 (fase
--            vigente ahora) la restriccion de la etiqueta "sin etiqueta" SOLO aplica a
--            vehiculos matriculados FUERA de la provincia de Valencia — un vehiculo sin
--            etiqueta matriculado en la provincia todavia puede circular libremente. Esto
--            se endurece en enero de 2027 (aplica a cualquier vehiculo sin etiqueta de
--            fuera del municipio) y en enero de 2028 (aplica a TODOS, incl. residentes).
--            Se publica 'restricted_labels' como la restriccion "de fondo" (que es real y
--            hacia donde va la norma), pero el alcance exacto vigente HOY esta en 'note'
--            para no sobre-representar a quien consulte antes de 2028 pensando que ya
--            aplica a todos — igual que el matiz de empadronados de Madrid (ver seed
--            011_spain.sql), pero aqui por origen de matriculacion en vez de residencia.
--   Sevilla  ALTA — caso simple, sin fases ni excepciones territoriales: L-V no festivos,
--            7:00-19:00, sin etiqueta prohibida, B y 0 emisiones sin restriccion. Multiples
--            fuentes coinciden.

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('ES', 'Espana', 'Valencia', 'valencia', 'Comunitat Valenciana', 'Europe/Madrid', 'emission_label_zone', 1),
    ('ES', 'Espana', 'Sevilla',  'sevilla',  'Andalucia',            'Europe/Madrid', 'emission_label_zone', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- ===================== Valencia =====================
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'zone_name', 'ZBE Valencia',
        'restricted_labels', JSON_ARRAY('sin etiqueta'),
        'allowed_labels', JSON_ARRAY('B','C','ECO','0'),
        'hours', JSON_OBJECT('start','00:00','end','23:59'),
        'exempt_days', JSON_ARRAY(),
        'note', 'IMPORTANTE — despliegue por fases: hasta el 31 de diciembre de 2026 la restriccion SOLO aplica a vehiculos sin etiqueta matriculados FUERA de la provincia de Valencia (si tu vehiculo sin etiqueta esta matriculado en la provincia, todavia puedes circular). Desde enero de 2027 aplicara a cualquier vehiculo sin etiqueta de fuera del municipio. Desde enero de 2028 aplicara a todos, incluidos los residentes. Verifica la fecha actual contra valencia.es antes de asumir el alcance. Excepciones: hasta 48 accesos autorizados al año, transporte de personas con movilidad reducida, embarazadas, familias numerosas, menores de 3 anios y servicios de emergencia.'
    ),
    '2025-12-01', 1, 'https://www.valencia.es/cas/actualidad/-/content/val%C3%A8ncia-aprueba-la-ordenanza-de-zona-de-bajas-emisiones'
FROM cities WHERE slug = 'valencia'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '200 EUR',
    'citation', 'Ordenanza de Zona de Bajas Emisiones de Valencia.'
) WHERE slug = 'valencia';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.valencia.es/cas/actualidad/-/content/val%C3%A8ncia-aprueba-la-ordenanza-de-zona-de-bajas-emisiones', 'gov_official' FROM cities WHERE slug = 'valencia';

-- ===================== Sevilla =====================
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'zone_name', 'ZBE Sevilla (Cartuja Norte y Sur)',
        'restricted_labels', JSON_ARRAY('sin etiqueta'),
        'allowed_labels', JSON_ARRAY('B','C','ECO','0'),
        'hours', JSON_OBJECT('start','07:00','end','19:00'),
        'exempt_days', JSON_ARRAY('saturday','sunday'),
        'note', 'Tambien sin restriccion los festivos (no solo fines de semana). Excepciones: autorizacion para residentes, transporte de personas con movilidad reducida, servicios de emergencia, transporte de mercancias, y 10 accesos mensuales para casos puntuales gestionables por la app oficial del Ayuntamiento.'
    ),
    '2026-01-01', 1, 'https://www.sevilla.org/'
FROM cities WHERE slug = 'sevilla'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '200 EUR',
    'citation', 'Ordenanza de Zona de Bajas Emisiones de Sevilla.'
) WHERE slug = 'sevilla';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.sevilla.org/', 'gov_official' FROM cities WHERE slug = 'sevilla';

-- Datos de prueba para validar el pipeline end-to-end (ver plan: verificacion paso 1).
-- Bogota = modelo plate_digit_day (pico y placa clasico).
-- Madrid = modelo emission_label_zone (ZBE / etiqueta DGT).

INSERT INTO cities (country_code, country_name, city_name, slug, timezone, restriction_model, is_active) VALUES
    ('CO', 'Colombia', 'Bogotá', 'bogota', 'America/Bogota', 'plate_digit_day', 1),
    ('ES', 'España',   'Madrid', 'madrid', 'Europe/Madrid',  'emission_label_zone', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(
            JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,2), 'hours', JSON_OBJECT('start','06:00','end','21:00')),
            JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(3,4), 'hours', JSON_OBJECT('start','06:00','end','21:00')),
            JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(5,6), 'hours', JSON_OBJECT('start','06:00','end','21:00')),
            JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(7,8), 'hours', JSON_OBJECT('start','06:00','end','21:00')),
            JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_OBJECT('start','06:00','end','21:00'))
        ),
        'exceptions', JSON_ARRAY('electric','hybrid','motorcycle'),
        'holidays_suspended', true
    ),
    '2026-01-01', 1, 'https://www.bogota.gov.co/pico-y-placa'
FROM cities WHERE slug = 'bogota'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'zone_name', 'Madrid Central',
        'restricted_labels', JSON_ARRAY('sin etiqueta'),
        'allowed_labels', JSON_ARRAY('B','C','ECO','0'),
        'hours', JSON_OBJECT('start','00:00','end','23:59'),
        'exempt_days', JSON_ARRAY('sunday')
    ),
    '2026-01-01', 1, 'https://www.madrid.es/madridcentral'
FROM cities WHERE slug = 'madrid'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

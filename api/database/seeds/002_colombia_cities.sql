-- Datos reales de pico y placa para 5 ciudades colombianas adicionales (investigado 2026-07-25).
-- Todas usan el modelo plate_digit_day. Fuentes y nivel de confianza por ciudad:
--
--   Medellin      ALTA (rotacion vigente Feb-Jul 2026, verificado en medellin.gov.co).
--                 holidays_suspended=1 es INFERIDO por practica casi universal en Colombia,
--                 no confirmado explicitamente en la fuente — revisar antes de publicar como definitivo.
--                 La rotacion que inicia el 3 de agosto de 2026 fue reportada por prensa pero
--                 NO confirmada en medellin.gov.co al momento de esta siembra — no se incluye aqui.
--   Cali          ALTA — verificado directo en cali.gov.co (Decreto 4112.010.20.0398 de 2025).
--   Barranquilla  ALTA — sin restriccion vigente para particulares desde Decreto Distrital 0450/2025
--                 (derogo el Decreto 0205/2009, que ademas solo aplicaba a taxis). schedule vacio a proposito.
--   Bucaramanga   MEDIA-ALTA — excepciones y suspension en festivos tomadas de transitobucaramanga.gov.co
--                 + corroboracion de prensa (Vanguardia.com); el PDF de la Resolucion 854/2025 no se
--                 pudo leer directamente. Bucaramanga TAMBIEN restringe los sabados (9am-1pm) con
--                 digitos que rotan semana a semana — no se modela aqui porque el esquema actual
--                 asumiria un par de digitos fijo que seria incorrecto la mayoria de semanas.
--   Cartagena     MEDIA-ALTA — cartagena.gov.co bloqueo el fetch directo (403); dato tomado de
--                 El Universal Cartagena y corroborado con un punto de dato verificable
--                 (viernes 3 jul 2026 = digitos 7,8). Tiene DOS franjas horarias por dia
--                 (7-9am y 6-8pm) — requiere que PlateDigitDayEvaluator soporte `hours` como array.

INSERT INTO cities (country_code, country_name, city_name, slug, timezone, restriction_model, is_active) VALUES
    ('CO', 'Colombia', 'Medellin',     'medellin',     'America/Bogota', 'plate_digit_day', 1),
    ('CO', 'Colombia', 'Cali',         'cali',         'America/Bogota', 'plate_digit_day', 1),
    ('CO', 'Colombia', 'Barranquilla', 'barranquilla', 'America/Bogota', 'plate_digit_day', 1),
    ('CO', 'Colombia', 'Bucaramanga',  'bucaramanga',  'America/Bogota', 'plate_digit_day', 1),
    ('CO', 'Colombia', 'Cartagena',    'cartagena',    'America/Bogota', 'plate_digit_day', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- Medellin — rotacion vigente Feb 2 - Jul 31 2026.
INSERT INTO rules (city_id, payload_json, effective_from, effective_to, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(
            JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,7), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
            JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(0,3), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
            JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(4,6), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
            JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(5,9), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
            JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(2,8), 'hours', JSON_OBJECT('start','05:00','end','20:00'))
        ),
        'exceptions', JSON_ARRAY('electric','hybrid','cng'),
        'holidays_suspended', true
    ),
    '2026-02-02', '2026-07-31', 1, 'https://www.medellin.gov.co/es/sala-de-prensa/noticias/el-lunes-2-de-febrero-inicia-la-nueva-rotacion-del-pico-y-placa-en-medellin/'
FROM cities WHERE slug = 'medellin'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- Cali — segundo semestre 2026 (Jul 1 - Dic 31).
INSERT INTO rules (city_id, payload_json, effective_from, effective_to, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(
            JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
            JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(1,2), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
            JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(3,4), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
            JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(5,6), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
            JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(7,8), 'hours', JSON_OBJECT('start','06:00','end','19:00'))
        ),
        'exceptions', JSON_ARRAY('electric','hybrid','motorcycle','disability'),
        'holidays_suspended', true
    ),
    '2026-07-01', '2026-12-31', 1, 'https://www.cali.gov.co/boletines/publicaciones/193096/pico-y-placa-rota-en-cali-para-el-segundo-semestre-de-2026-nueva-medida-rige-desde-el-1-de-julio/'
FROM cities WHERE slug = 'cali'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- Barranquilla — sin restriccion vigente para particulares (derogada por Decreto 0450/2025).
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(),
        'exceptions', JSON_ARRAY(),
        'holidays_suspended', false
    ),
    '2025-07-07', 1, 'https://www.ambq.gov.co/levantamos-el-pico-y-placa-en-barranquilla/'
FROM cities WHERE slug = 'barranquilla'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- Bucaramanga — rotacion trimestral vigente Jul 6 - Oct 5 2026 (restriccion de sabado NO incluida, ver nota arriba).
INSERT INTO rules (city_id, payload_json, effective_from, effective_to, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(
            JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(7,8), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
            JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(9,0), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
            JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(1,2), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
            JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(3,4), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
            JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(5,6), 'hours', JSON_OBJECT('start','06:00','end','20:00'))
        ),
        'exceptions', JSON_ARRAY('electric','hybrid','cng'),
        'holidays_suspended', true
    ),
    '2026-07-06', '2026-10-05', 1, 'https://transitobucaramanga.gov.co/dtb/atencion-y-servicios-a-la-ciudadania/pico-y-placa'
FROM cities WHERE slug = 'bucaramanga'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- Cartagena — "Rotacion 3" Decreto 0015/2026, vigente Jun 30 - Oct 2 2026. Dos franjas horarias por dia.
INSERT INTO rules (city_id, payload_json, effective_from, effective_to, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'schedule', JSON_ARRAY(
            JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','09:00'), JSON_OBJECT('start','18:00','end','20:00'))),
            JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(1,2), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','09:00'), JSON_OBJECT('start','18:00','end','20:00'))),
            JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(3,4), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','09:00'), JSON_OBJECT('start','18:00','end','20:00'))),
            JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(5,6), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','09:00'), JSON_OBJECT('start','18:00','end','20:00'))),
            JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(7,8), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','09:00'), JSON_OBJECT('start','18:00','end','20:00')))
        ),
        'exceptions', JSON_ARRAY('electric','hybrid','disability'),
        'holidays_suspended', true
    ),
    '2026-06-30', '2026-10-02', 1, 'https://www.eluniversal.com.co/cartagena/2026/07/02/pico-y-placa-en-cartagena-del-viernes-3-de-julio-de-2026/'
FROM cities WHERE slug = 'cartagena'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- Fuentes oficiales a monitorear semanalmente por el pipeline de scraping existente
-- (cron-picoplaca-scrape.php) — asi la rotacion de Medellin de agosto 2026 y futuras
-- actualizaciones se capturan automaticamente en vez de quedar desactualizadas.
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.medellin.gov.co/es/sala-de-prensa/noticias/', 'gov_official' FROM cities WHERE slug = 'medellin';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.cali.gov.co/movilidad/publicaciones/171911/pico-y-placa/', 'gov_official' FROM cities WHERE slug = 'cali';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.ambq.gov.co/', 'gov_official' FROM cities WHERE slug = 'barranquilla';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://transitobucaramanga.gov.co/dtb/atencion-y-servicios-a-la-ciudadania/pico-y-placa', 'gov_official' FROM cities WHERE slug = 'bucaramanga';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.cartagena.gov.co/noticias', 'gov_official' FROM cities WHERE slug = 'cartagena';

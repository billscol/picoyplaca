-- Fase 1 de expansion LATAM (ver plan) — primeras 2 ciudades fuera de Colombia con el
-- modelo plate_digit_day: Quito (Ecuador) y San Jose (Costa Rica). Ambas investigadas
-- 2026-07-27. Nivel de confianza y fuentes:
--
--   Quito    ALTA — el sitio oficial (secretariademovilidad.quito.gob.ec / amt.gob.ec)
--             rechazo la conexion directa (mismo problema que cartagena.gov.co, ver seed
--             002_colombia_cities.sql), pero la rotacion, horario y multas progresivas
--             estan corroboradas por decenas de notas de prensa de fechas especificas
--             distintas a lo largo de 2026 (El Comercio, Extra.ec, Primicias, El Oriente)
--             sin ninguna que reporte un cambio de esquema. La resolucion que rige la medida
--             es la RA-013-2023 (Resolucion de Alcaldia), confirmada por su presencia en el
--             archivo de ordenanzas de quito.gob.ec.
--   San Jose ALTA — mopt.go.cr (fuente oficial) confirma el esquema hora/placa vigente;
--             decreto base 36547-MOPT (reestablece la restriccion de 13 horas continuas,
--             6:00am-7:00pm, lo cual coincide exactamente con lo reportado por prensa) y
--             37370-MOPT. holidays_suspended=true esta INFERIDO de que el MOPT publica
--             anuncios puntuales de suspension para Semana Santa, vacaciones de medio año y
--             fin de año — no encontramos una regla general unica que cubra TODOS los
--             festivos, asi que si un feriado especifico no esta en uno de esos anuncios,
--             verifica en mopt.go.cr antes de asumir que no aplica.
--
-- Ciudades investigadas pero NO sembradas por evidencia insuficiente o contradictoria
-- (no se debe adivinar, ver regla del seed 003_categories_and_metadata.sql):
--   Guayaquil y Cuenca (Ecuador) — no se encontro fuente que confirme si tienen pico y
--     placa vigente en 2026 (solo referencias a Guayaquil durante la pandemia en 2020).
--   Ciudad de Panama — no se encontro evidencia de un esquema vigente por digito de placa.
--   Lima (Peru) — fuentes CONTRADICTORIAS: unas dicen que el pico y placa esta suspendido
--     desde la pandemia, otras (incl. atu.gob.pe) describen un esquema par/impar vigente
--     pero aplicado a taxis/transporte regular, no a particulares. No publicamos hasta
--     aclarar el alcance real.
--   Tegucigalpa (Honduras) — la unica medida por digito de placa encontrada (2020) fue
--     anulada a las 24 horas de anunciada; no hay evidencia de un esquema vigente en 2026,
--     pero tampoco una fuente que lo descarte explicitamente para este año.

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('EC', 'Ecuador',     'Quito',     'quito',     'Pichincha', 'America/Guayaquil',   'plate_digit_day', 1),
    ('CR', 'Costa Rica',  'San Jose',  'san-jose',  'San Jose',  'America/Costa_Rica',  'plate_digit_day', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- ===================== Quito =====================
-- Excepciones: electricos/cero emisiones, discapacidad, tercera edad, oficiales de la
-- Presidencia y cuerpo diplomatico, transporte publico, comercial rural, emergencia.
-- No se modela "comercial rural" (sin codigo de excepcion equivalente en el esquema actual).
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,2), 'hours', JSON_ARRAY(JSON_OBJECT('start','06:00','end','09:30'), JSON_OBJECT('start','16:00','end','20:00'))),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(3,4), 'hours', JSON_ARRAY(JSON_OBJECT('start','06:00','end','09:30'), JSON_OBJECT('start','16:00','end','20:00'))),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(5,6), 'hours', JSON_ARRAY(JSON_OBJECT('start','06:00','end','09:30'), JSON_OBJECT('start','16:00','end','20:00'))),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(7,8), 'hours', JSON_ARRAY(JSON_OBJECT('start','06:00','end','09:30'), JSON_OBJECT('start','16:00','end','20:00'))),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_ARRAY(JSON_OBJECT('start','06:00','end','09:30'), JSON_OBJECT('start','16:00','end','20:00')))
                ),
                'exceptions', JSON_ARRAY('electric','disability','elderly','diplomatic','public_transport','emergency'),
                'holidays_suspended', true
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://secretariademovilidad.quito.gob.ec/index.php/pico-y-placa'
FROM cities WHERE slug = 'quito'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- ===================== San Jose =====================
-- Zona: casco central de San Jose, dentro del anillo de Circunvalacion (no todo el canton).
-- Excepciones: policia/emergencia, transporte publico (regular, especial, turismo,
-- estudiantil), discapacidad, motocicletas, concreto fresco, vehiculos de alquiler.
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,2), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(3,4), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(5,6), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(7,8), 'hours', JSON_OBJECT('start','06:00','end','19:00')),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_OBJECT('start','06:00','end','19:00'))
                ),
                'exceptions', JSON_ARRAY('emergency','public_transport','disability','motorcycle','fresh_concrete','rental'),
                'holidays_suspended', true,
                'note', 'Aplica solo dentro del casco central de San Jose delimitado por el anillo de Circunvalacion, no en todo el canton.'
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://www.mopt.go.cr/destacados/transportes/restriccion-vehicular'
FROM cities WHERE slug = 'san-jose'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

-- ===================== legal_info =====================
UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '15%-50% del SBU (progresiva: 1a $72.30, 2a $120.50, 3a en adelante $241.00 sobre SBU 2026)',
    'citation', 'Resolucion de Alcaldia RA-013-2023 (Pico y Placa), Municipio del Distrito Metropolitano de Quito.'
) WHERE slug = 'quito';

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', 'CRC 26.000',
    'citation', 'Decreto Ejecutivo 36547-MOPT y 37370-MOPT, Esquema Hora/Placa, Centro de San Jose.'
) WHERE slug = 'san-jose';

-- ===================== rule_sources (monitoreo semanal) =====================
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://secretariademovilidad.quito.gob.ec/index.php/pico-y-placa', 'gov_official' FROM cities WHERE slug = 'quito';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'http://www.amt.gob.ec/index.php/quienes-somos/ordenanzas.html', 'gov_official' FROM cities WHERE slug = 'quito';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.mopt.go.cr/destacados/transportes/restriccion-vehicular', 'gov_official' FROM cities WHERE slug = 'san-jose';

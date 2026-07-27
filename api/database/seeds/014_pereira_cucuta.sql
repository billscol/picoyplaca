-- Dos ciudades colombianas mas que faltaban en el catalogo (la version en ingles de
-- Wikipedia sobre "Pico y placa" las menciona junto a Bogota/Medellin y no estaban
-- sembradas). Investigado 2026-07-27.
--
--   Pereira ALTA — rotacion, horario y decreto (0574 del 1-abr-2022, que modifica el
--           Acuerdo 035 de 2016) corroborados por multiples fuentes con fecha especifica
--           de julio 2026. Rotacion de digitos distinta a la de Bogota/Medellin/etc
--           (aqui es 0-1/2-3/4-5/6-7/8-9 en vez de 1-2/3-4/5-6/7-8/9-0) — confirmada
--           internamente por el ejemplo de un dia especifico (viernes 24-jul-2026 =
--           digitos 8,9, consistente con la tabla).
--   Cucuta  MEDIA-ALTA — la rotacion de digitos y el horario del caso general
--           (placa metropolitana) estan bien corroborados, pero el esquema real tiene
--           una complejidad no modelada del todo: las placas NACIONALES/EXTRANJERAS
--           (no matriculadas en el area metropolitana de Cucuta) tienen un horario
--           distinto — una sola franja continua 7:00am-8:00pm en vez de las 3 franjas
--           del caso metropolitano — documentado en 'note' en vez de en el schedule
--           porque depende del origen de matriculacion, no del dia. Tampoco se modelan
--           motos (rotacion propia) ni taxis (rotacion diaria por calendario, no por
--           dia de la semana, igual al caso de Bucaramanga en el seed 002_colombia_cities)
--           — solo particulares. No se incluyen 'exceptions' por no haber sido
--           verificadas especificamente para Cucuta (no se debe asumir que son las
--           mismas que en otras ciudades).

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('CO', 'Colombia', 'Pereira', 'pereira', 'Risaralda',      'America/Bogota', 'plate_digit_day', 1),
    ('CO', 'Colombia', 'Cucuta',  'cucuta',  'Norte de Santander', 'America/Bogota', 'plate_digit_day', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- ===================== Pereira =====================
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(0,1), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(2,3), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(4,5), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(6,7), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(8,9), 'hours', JSON_OBJECT('start','06:00','end','20:00'))
                ),
                'exceptions', JSON_ARRAY('electric','hybrid','emergency','diplomatic'),
                'holidays_suspended', true
            ),
            JSON_OBJECT(
                'key','motos',
                'digit_position','first',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(0,1), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(2,3), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(4,5), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(6,7), 'hours', JSON_OBJECT('start','06:00','end','20:00')),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(8,9), 'hours', JSON_OBJECT('start','06:00','end','20:00'))
                ),
                'exceptions', JSON_ARRAY('electric','hybrid'),
                'holidays_suspended', true,
                'note', 'Para motocicletas la restriccion se aplica segun el PRIMER digito de la placa, no el ultimo.'
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://www.pereira.gov.co/'
FROM cities WHERE slug = 'pereira'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '15 SMLDV (~$620.000 COP en 2026)',
    'citation', 'Decreto 0574 del 1 de abril de 2022 (Art. 4), Alcaldia de Pereira, que reglamenta el Acuerdo 035 de 2016.'
) WHERE slug = 'pereira';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pereira.gov.co/', 'gov_official' FROM cities WHERE slug = 'pereira';

-- ===================== Cucuta =====================
-- Zona: limitado al poligono central definido en el Decreto 0212 de 2024, no toda el
-- area urbana (a diferencia de Bogota o Bucaramanga).
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,2), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','08:30'), JSON_OBJECT('start','11:30','end','14:30'), JSON_OBJECT('start','17:30','end','19:30'))),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(3,4), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','08:30'), JSON_OBJECT('start','11:30','end','14:30'), JSON_OBJECT('start','17:30','end','19:30'))),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(5,6), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','08:30'), JSON_OBJECT('start','11:30','end','14:30'), JSON_OBJECT('start','17:30','end','19:30'))),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(7,8), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','08:30'), JSON_OBJECT('start','11:30','end','14:30'), JSON_OBJECT('start','17:30','end','19:30'))),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','08:30'), JSON_OBJECT('start','11:30','end','14:30'), JSON_OBJECT('start','17:30','end','19:30')))
                ),
                'holidays_suspended', true,
                'note', 'Horario mostrado: placas matriculadas en el area metropolitana de Cucuta (3 franjas). Las placas nacionales/extranjeras (no matriculadas localmente) tienen una sola franja continua de 7:00am a 8:00pm en vez de las 3 franjas. Aplica solo en el poligono central definido en el Decreto 0212 de 2024, no en toda el area urbana. No se modelan motos (rotacion propia) ni taxis (rotacion diaria por calendario oficial, no semanal por digito) — consulta cucuta.gov.co para esos casos.'
            )
        ),
        'metro_area', NULL
    ),
    '2024-01-01', 1, 'https://www.cucuta.gov.co/'
FROM cities WHERE slug = 'cucuta'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '15 SMLDV (~$620.000 COP en 2026)',
    'citation', 'Decreto 0212 de 2024, Alcaldia de Cucuta / Area Metropolitana de Cucuta.'
) WHERE slug = 'cucuta';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.cucuta.gov.co/', 'gov_official' FROM cities WHERE slug = 'cucuta';

-- Fase 1/3 (ver plan): primera ciudad brasilena (rodizio, mismo modelo plate_digit_day
-- que el resto de LatAm) y primera ciudad de USA (NYC, unica con congestion_charge
-- real y vigente hoy — ver plan, USA no tiene "pico y placa" como tal). Investigado
-- 2026-07-27.
--
--   Sao Paulo ALTA — el horario diurno (7h-10h y 17h-20h, lun-vie) y la rotacion por
--             digito estan confirmados tanto por la pagina de referencia de la
--             Secretaria Municipal de Mobilidade (prefeitura.sp.gov.br) como por multiples
--             agregadores con fecha de julio 2026. OJO: una busqueda inicial devolvio
--             titulares de prefeitura.sp.gov.br que mencionan un rodizio nocturno
--             (23h-5h) — son de la "Fase de Transicao do Plano Sao Paulo" (reapertura
--             pandemica, 2020-2021), NO la regla vigente en 2026. No se modela la zona
--             exacta (mini-anel viario / Centro Expandido) porque el esquema
--             plate_digit_day no tiene un campo de zona geografica — se documenta en
--             'note'. Tampoco se modelan las excepciones especificas de camiones (regla
--             de rodizio distinta a la de particulares).
--   NYC       MEDIA-ALTA — el sitio oficial de la MTA (congestionreliefzone.mta.info /
--             mta.info) devolvio 403 al fetch directo, pero la tarifa y el horario estan
--             corroborados por multiples fuentes (incl. citas directas al sitio de la MTA)
--             con fecha 2026 y confirman que el programa sigue vigente (un fallo judicial
--             del 3 de marzo de 2026 confirmo su legalidad). LIMITACION DE MODELO: el
--             esquema congestion_charge solo soporta UN horario y UNA tarifa por ciudad,
--             pero NYC cobra $9 entre 5am-9pm en dias de semana, $9 entre 9am-9pm los
--             fines de semana (horario mas corto, no modelado), y una tarifa reducida de
--             $2.25 fuera de esas horas (tampoco modelada — el evaluador actual de
--             congestion_charge no verifica hora, solo dia, asi que esta limitacion no
--             afecta el resultado de /check pero si el detalle mostrado). Se modela el
--             horario y tarifa pico de dia de semana, que es el caso mas buscado.

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('BR', 'Brasil', 'Sao Paulo', 'sao-paulo', 'Sao Paulo', 'America/Sao_Paulo', 'plate_digit_day',   1),
    ('US', 'Estados Unidos', 'New York', 'new-york', 'New York', 'America/New_York', 'congestion_charge', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- ===================== Sao Paulo =====================
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(
                    JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,2), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','10:00'), JSON_OBJECT('start','17:00','end','20:00'))),
                    JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(3,4), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','10:00'), JSON_OBJECT('start','17:00','end','20:00'))),
                    JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(5,6), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','10:00'), JSON_OBJECT('start','17:00','end','20:00'))),
                    JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(7,8), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','10:00'), JSON_OBJECT('start','17:00','end','20:00'))),
                    JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_ARRAY(JSON_OBJECT('start','07:00','end','10:00'), JSON_OBJECT('start','17:00','end','20:00')))
                ),
                'exceptions', JSON_ARRAY('emergency','public_transport','school_transport','disability'),
                'holidays_suspended', true,
                'note', 'Aplica solo dentro del Centro Expandido, en las vias que delimitan el llamado mini-anel viario (margenes Tiete/Pinheiros, Av. Bandeirantes, Complexo Maria Maluf, entre otras) — no en toda la ciudad.'
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://prefeitura.sp.gov.br/web/mobilidade/w/saiba_como_e_e_como_funciona/25379'
FROM cities WHERE slug = 'sao-paulo'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', 'R$ 130,16 + 4 puntos en la licencia',
    'consequence', 'Infraccion media (Art. 244, Codigo de Transito Brasileno)',
    'citation', 'Lei Municipal no. 12.490/1997 e Decreto Municipal 58.584/2018.'
) WHERE slug = 'sao-paulo';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://prefeitura.sp.gov.br/web/mobilidade/w/saiba_como_e_e_como_funciona/25379', 'gov_official' FROM cities WHERE slug = 'sao-paulo';

-- ===================== New York City =====================
-- exempt_days vacio: el peaje aplica los 7 dias, solo cambia el horario/tarifa
-- (ver nota de limitacion de modelo arriba) — no hay dias completamente exentos.
INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'zone_name', 'Congestion Relief Zone (Manhattan, al sur de la calle 60)',
        'fee', 9,
        'currency', 'USD',
        'hours', JSON_OBJECT('start','05:00','end','21:00'),
        'exempt_days', JSON_ARRAY(),
        'note', 'Horario mostrado: tarifa pico de dia de semana. Los fines de semana la tarifa pico aplica de 9:00am a 9:00pm (no 5:00am). Fuera de horario pico (cualquier dia) la tarifa se reduce a $2.25 USD en vez de $9.'
    ),
    '2025-01-05', 1, 'https://www.mta.info/fares-tolls/tolls/congestion-relief-zone/about'
FROM cities WHERE slug = 'new-york'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.mta.info/fares-tolls/tolls/congestion-relief-zone/about', 'gov_official' FROM cities WHERE slug = 'new-york';

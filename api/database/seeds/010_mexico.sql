-- Ciudad de Mexico ("Hoy No Circula") — investigado 2026-07-27. Confianza ALTA en los
-- hechos base (corroborados por SEDEMA, la autoridad ambiental oficial: sedema.cdmx.gob.mx),
-- pero el programa NO se modela como un 'schedule' plano de plate_digit_day a proposito:
-- a diferencia de Bogota/Quito/Sao Paulo, en CDMX la restriccion semanal por digito solo
-- aplica a vehiculos con holograma de verificacion 1 o 2 — los holograma 0/00/Exento
-- circulan TODOS los dias sin restriccion (salvo contingencia ambiental). Publicar un
-- 'schedule' unico habria implicado incorrectamente que TODOS los vehiculos particulares
-- tienen restriccion ese dia, lo cual es falso para una porcion significativa del parque
-- vehicular (los mas nuevos/menos contaminantes). Se usa 'sub_rules' (campo ya pensado en
-- el esquema para "categorias con varias reglas distintas", ver PlateCategory en
-- lib/pico-placa.ts) para documentar cada caso por separado en vez de forzar un solo
-- horario. Tampoco se modela la "contingencia ambiental" (restriccion extraordinaria
-- anunciada caso por caso, no calendarizable) mas alla de una nota de advertencia.
--
-- holidays_suspended=true esta INFERIDO por practica administrativa estandar (igual que
-- en Medellin, ver seed 002_colombia_cities.sql) — no se encontro una fuente que lo
-- confirme explicitamente para CDMX.

INSERT INTO cities (country_code, country_name, city_name, slug, region, timezone, restriction_model, is_active) VALUES
    ('MX', 'Mexico', 'Ciudad de Mexico', 'ciudad-de-mexico', 'Ciudad de Mexico', 'America/Mexico_City', 'plate_digit_day', 1)
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

INSERT INTO rules (city_id, payload_json, effective_from, is_current, source_url)
SELECT id,
    JSON_OBJECT(
        'categories', JSON_ARRAY(
            JSON_OBJECT(
                'key','particulares',
                'schedule', JSON_ARRAY(),
                'holidays_suspended', true,
                'note_short', 'Depende del holograma de verificacion de tu vehiculo — no hay un solo horario para todos los autos particulares.',
                'note', 'Aplica en las 16 alcaldias de la Ciudad de Mexico y en 18 municipios conurbados del Estado de Mexico (Zona Metropolitana del Valle de Mexico). En dias de contingencia ambiental la restriccion se amplia (incluye holograma 0/00/Exento y un digito adicional) — se anuncia caso por caso, consulta aire.cdmx.gob.mx antes de circular esos dias.',
                'sub_rules', JSON_ARRAY(
                    JSON_OBJECT('label','Holograma 0, 00 o Exento (incl. electricos e hibridos)', 'detail','Circulan todos los dias sin restriccion por digito de placa, salvo contingencia ambiental.'),
                    JSON_OBJECT('label','Holograma 1', 'detail','No circula un dia a la semana segun el color del engomado y el ultimo digito de placa: lunes (amarillo) 5 y 6, martes (rosa) 7 y 8, miercoles (rojo) 3 y 4, jueves (verde) 1 y 2, viernes (azul) 9 y 0, de 5:00 a 22:00h. Ademas, no circula 2 sabados al mes segun turno.'),
                    JSON_OBJECT('label','Holograma 2', 'detail','Misma restriccion semanal que holograma 1 (mismo color/digito, 5:00-22:00h), mas TODOS los sabados de 5:00 a 22:00h.'),
                    JSON_OBJECT('label','Placas foraneas (fuera de CDMX/Edomex)', 'detail','Ademas de su dia por digito, no circulan de lunes a viernes de 5:00 a 11:00h ni ningun sabado de 5:00 a 22:00h.')
                )
            )
        ),
        'metro_area', NULL
    ),
    '2026-01-01', 1, 'https://sedema.cdmx.gob.mx/programas/programa/hoy-no-circula'
FROM cities WHERE slug = 'ciudad-de-mexico'
ON DUPLICATE KEY UPDATE source_url = VALUES(source_url);

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '20 a 30 UMA (~$2,346.20 - $3,519.30 MXN en 2026)',
    'consequence', 'Multa y remision del vehiculo al corralon (arrastre + almacenaje)',
    'citation', 'Reglamento de Transito de la Ciudad de Mexico.'
) WHERE slug = 'ciudad-de-mexico';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://sedema.cdmx.gob.mx/programas/programa/hoy-no-circula', 'gov_official' FROM cities WHERE slug = 'ciudad-de-mexico';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.aire.cdmx.gob.mx/', 'gov_official' FROM cities WHERE slug = 'ciudad-de-mexico';

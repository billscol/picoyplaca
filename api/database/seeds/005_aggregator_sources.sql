-- Registra fuentes 'aggregator' (picoyplacaya.com.co y pyphoy.com) para las 6 ciudades
-- colombianas, mas las fuentes 'gov_official' que faltaban (Bogota y Madrid nunca tuvieron
-- ninguna registrada — 002_colombia_cities.sql solo cubrio las 5 ciudades nuevas de esa tanda).
-- Investigado 2026-07-26: ambos agregadores usan el mismo slug que ya tenemos (/bogota, /medellin,
-- etc.), confirmado via fetch directo. picoyplacaya.com.co cita numeros de decreto reales (mejor
-- confiabilidad); pyphoy.com tiene mayor cobertura pero le encontramos un bug de datos (campo de
-- horario vacio en su propia pagina de Bogota) — se registra igual como fuente secundaria de
-- contraste, PlateExtractionService prioriza el contenido completo sobre snippets pero la revision
-- humana en rule_change_proposals sigue siendo obligatoria para cualquier cambio real.

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.movilidadbogota.gov.co/pico-y-placa', 'gov_official' FROM cities WHERE slug = 'bogota';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.madrid.es/madridcentral', 'gov_official' FROM cities WHERE slug = 'madrid';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/bogota', 'aggregator' FROM cities WHERE slug = 'bogota';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/bogota', 'aggregator' FROM cities WHERE slug = 'bogota';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/medellin', 'aggregator' FROM cities WHERE slug = 'medellin';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/medellin', 'aggregator' FROM cities WHERE slug = 'medellin';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/cali', 'aggregator' FROM cities WHERE slug = 'cali';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/cali', 'aggregator' FROM cities WHERE slug = 'cali';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/barranquilla', 'aggregator' FROM cities WHERE slug = 'barranquilla';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/barranquilla', 'aggregator' FROM cities WHERE slug = 'barranquilla';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/bucaramanga', 'aggregator' FROM cities WHERE slug = 'bucaramanga';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/bucaramanga', 'aggregator' FROM cities WHERE slug = 'bucaramanga';

INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://picoyplacaya.com.co/cartagena', 'aggregator' FROM cities WHERE slug = 'cartagena';
INSERT INTO rule_sources (city_id, url, source_type)
SELECT id, 'https://www.pyphoy.com/cartagena', 'aggregator' FROM cities WHERE slug = 'cartagena';

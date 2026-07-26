-- Categorias adicionales para Bogota, investigado 2026-07-26 (movilidadbogota.gov.co / bogota.gov.co).
-- Reescribe el array `categories` completo (mas seguro que indexar posicionalmente con JSON_REPLACE)
-- preservando particulares/motos tal cual quedaron en 003_categories_and_metadata.sql y actualizando
-- la nota de transporte_carga (antes solo cubria camiones >20 anios, ahora consolida las 3 reglas
-- de carga vigentes) mas 3 categorias nuevas.
--
--   taxis               ALTA confianza en horario (L-S 5:30am-9pm) y mecanismo, pero la rotacion es
--                        un CICLO RODANTE de parejas (1-2/3-4/5-6/7-8/9-0) que avanza un dia habil a
--                        la vez (domingos y festivos no consumen turno) — el digito restringido en un
--                        dia de la semana especifico cambia mes a mes. No se modela como tabla semanal
--                        fija (quedaria desactualizada en semanas) — se documenta como nota.
--   transporte_especial ALTA confianza — confirmado identico a taxis (mismo ciclo, mismo horario),
--                        cruzando boletines oficiales de junio 2026 dia por dia.
--   transporte_carga     Tres reglas distintas consolidadas en una nota:
--                        (1) camiones >20 anios: ALTA confianza, ya modelada, confirmada vigente.
--                        (2) PBV >3.500kg: MEDIA-ALTA confianza — restriccion total 24h/dia todos los
--                            dias, pero SOLO en La Candelaria (no toda la ciudad, corrige supuesto previo).
--                        (3) PBV >8.500kg: MEDIA confianza — L-V, ~6-8am y 5-8pm (+/-30min de
--                            incertidumbre entre fuentes), zona centro ampliado.
--   regional              ALTA confianza, confirmado en 3 fuentes oficiales independientes. Corrige el
--                        orden par/impar asumido inicialmente (correcto: par=12m-4pm, impar=4-8pm).
--                        No es semanal — se activa el ultimo dia de puentes festivos u otras fechas
--                        declaradas; no se calcula "hoy" porque requeriria un calendario de festivos
--                        colombianos que este proyecto no implementa.
--   transporte_publico_colectivo — NO se agrega: la Secretaria de Movilidad no lo lista como categoria
--                        activa vigente y no se encontro boletin 2026 que lo confirme (Decreto 444/2014
--                        era una medida de transicion hacia el SITP, posiblemente ya superada).

UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_SET(r.payload_json, '$.categories', JSON_ARRAY(
    JSON_OBJECT(
        'key','particulares',
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
    JSON_OBJECT('key','motos', 'schedule', JSON_ARRAY(), 'note', 'Las motocicletas estan exentas del pico y placa en Bogota y pueden circular sin restriccion.'),
    JSON_OBJECT('key','transporte_carga', 'schedule', JSON_ARRAY(), 'note', 'Bogota tiene tres reglas distintas para vehiculos de carga: (1) camiones de mas de 20 anios de antiguedad: lunes a viernes 6:00-8:00am y 5:00-8:00pm, sabados por digito par/impar 5:00am-9:00pm, en toda la ciudad, sin importar el digito de la placa; (2) vehiculos con mas de 3.500kg de peso bruto vehicular: restriccion total las 24 horas, todos los dias, pero solo dentro de La Candelaria (entre Cra. 9 y Av. Circunvalar, de Av. Jimenez a Calle 7); (3) vehiculos con mas de 8.500kg: restriccion lunes a viernes, aproximadamente 6:00-8:00am y 5:00-8:00pm, en la zona del centro ampliado (entre los cerros orientales y Av. Boyaca, de Av. Primero de Mayo a Calle 170). Consulta la fuente oficial para el detalle exacto de excepciones.'),
    JSON_OBJECT('key','taxis', 'schedule', JSON_ARRAY(), 'note', 'El pico y placa para taxis en Bogota rige de lunes a sabado, de 5:30am a 9:00pm (no aplica domingos ni festivos). La restriccion rota por parejas de digitos (1-2, 3-4, 5-6, 7-8, 9-0) que avanzan un dia habil a la vez, por lo que el digito restringido en un dia especifico de la semana cambia mes a mes — consulta el calendario oficial vigente antes de una fecha importante.'),
    JSON_OBJECT('key','transporte_especial', 'schedule', JSON_ARRAY(), 'note', 'El Servicio de Transporte Especial en Bogota sigue exactamente la misma rotacion y horario que los taxis (lunes a sabado, 5:30am a 9:00pm, sin festivos) — consulta el calendario oficial vigente antes de una fecha importante.'),
    JSON_OBJECT('key','regional', 'schedule', JSON_ARRAY(), 'note', 'El pico y placa regional aplica solo el ultimo dia de puentes festivos (u otras fechas declaradas por la administracion), para vehiculos que ingresan a Bogota por 9 corredores viales (Autopista Norte, Autopista Sur, Av. Calle 13, Av. Calle 80, Av. Septima, Av. Boyaca/via al Llano, via Suba-Cota, via a La Calera, via a Choachi). De 12:00m a 4:00pm circulan placas pares; de 4:00pm a 8:00pm, placas impares. El pico y placa solidario no aplica a esta restriccion.')
))
WHERE c.slug = 'bogota' AND r.is_current = 1;

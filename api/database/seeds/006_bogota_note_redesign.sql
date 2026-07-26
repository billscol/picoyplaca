-- Rediseno de contenido (no de datos): las categorias de solo-nota de Bogota (taxis, transporte
-- especial, regional, transporte de carga) se veian como un parrafo enorme sin estructura visual.
-- Se agrega `note_short` (resumen de una linea, siempre visible) manteniendo `note` como el detalle
-- largo (se muestra colapsado/expandible en la UI). `transporte_carga` pasa de un solo `note` a
-- `sub_rules` (3 reglas distintas: por edad, por dos umbrales de peso) para mostrarse como 3 filas
-- compactas en vez de un parrafo. No cambia ningun dato investigado, solo como se presenta.

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
    JSON_OBJECT(
        'key','transporte_carga',
        'schedule', JSON_ARRAY(),
        'note_short', 'Tres reglas distintas segun edad y peso del vehiculo.',
        'sub_rules', JSON_ARRAY(
            JSON_OBJECT('label','Camiones de mas de 20 anios', 'detail','Lunes a viernes 6:00-8:00am y 5:00-8:00pm; sabados por digito par/impar 5:00am-9:00pm. Toda la ciudad, sin importar el digito de la placa.'),
            JSON_OBJECT('label','Peso bruto mayor a 3.500kg', 'detail','Restriccion total las 24 horas, todos los dias. Solo dentro de La Candelaria (entre Cra. 9 y Av. Circunvalar, de Av. Jimenez a Calle 7).'),
            JSON_OBJECT('label','Peso bruto mayor a 8.500kg', 'detail','Lunes a viernes, aproximadamente 6:00-8:00am y 5:00-8:00pm. Zona centro ampliado (entre los cerros orientales y Av. Boyaca, de Av. Primero de Mayo a Calle 170).')
        )
    ),
    JSON_OBJECT(
        'key','taxis',
        'schedule', JSON_ARRAY(),
        'note_short', 'Rotacion mensual por parejas de digitos, lunes a sabado 5:30am-9pm.',
        'note', 'El pico y placa para taxis en Bogota rige de lunes a sabado, de 5:30am a 9:00pm (no aplica domingos ni festivos). La restriccion rota por parejas de digitos (1-2, 3-4, 5-6, 7-8, 9-0) que avanzan un dia habil a la vez, por lo que el digito restringido en un dia especifico de la semana cambia mes a mes — consulta el calendario oficial vigente antes de una fecha importante.'
    ),
    JSON_OBJECT(
        'key','transporte_especial',
        'schedule', JSON_ARRAY(),
        'note_short', 'Misma rotacion y horario que los taxis (lunes a sabado, 5:30am-9pm).',
        'note', 'El Servicio de Transporte Especial en Bogota sigue exactamente la misma rotacion y horario que los taxis (lunes a sabado, 5:30am a 9:00pm, sin festivos) — consulta el calendario oficial vigente antes de una fecha importante.'
    ),
    JSON_OBJECT(
        'key','regional',
        'schedule', JSON_ARRAY(),
        'note_short', 'Solo el ultimo dia de puentes festivos, para vehiculos que ingresan a Bogota.',
        'note', 'El pico y placa regional aplica solo el ultimo dia de puentes festivos (u otras fechas declaradas por la administracion), para vehiculos que ingresan a Bogota por 9 corredores viales (Autopista Norte, Autopista Sur, Av. Calle 13, Av. Calle 80, Av. Septima, Av. Boyaca/via al Llano, via Suba-Cota, via a La Calera, via a Choachi). De 12:00m a 4:00pm circulan placas pares; de 4:00pm a 8:00pm, placas impares. El pico y placa solidario no aplica a esta restriccion.'
    )
))
WHERE c.slug = 'bogota' AND r.is_current = 1;

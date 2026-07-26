-- Reestructura el payload de las reglas ya sembradas (Bogota + 5 ciudades colombianas) de un solo
-- horario plano a una lista de "categories" (particulares/motos/taxis/etc.), y llena region +
-- contact_channels en `cities`. Ver plan de investigacion para el nivel de confianza de cada dato
-- (investigado 2026-07-26). Regla aplicada: si dos fuentes se contradicen sobre si una restriccion
-- EXISTE, o no hay tabla de digitos/horario verificable, la categoria se deja con schedule vacio y
-- un `note` de texto en vez de inventar un horario. Por eso la cobertura por ciudad es desigual.
--
-- No se tocan los payloads de Madrid (modelo distinto, emission_label_zone) ni la tabla de
-- `rule_sources`/`rule_change_proposals`. `metro_area` queda NULL en todas — el esquema ya lo
-- soporta para cuando se siembren los municipios del Valle de Aburra (Bello, Envigado, Itagui, etc.)
-- que comparten la rotacion de Medellin, pero eso queda para otra tarea.

-- ===================== region + contact_channels =====================

UPDATE cities SET region = 'Bogota, D.C.',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/SectorMovilidad','facebook_url','https://www.facebook.com/secretariamovilidadbogota','website_url','https://www.movilidadbogota.gov.co','email','contactociudadano@movilidadbogota.gov.co')
    WHERE slug = 'bogota';

UPDATE cities SET region = 'Antioquia',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/sttmed','facebook_url','https://www.facebook.com/sttmed','website_url','https://www.medellin.gov.co/es/secretaria-de-movilidad/','email','atencion.ciudadana@medellin.gov.co')
    WHERE slug = 'medellin';

UPDATE cities SET region = 'Valle del Cauca',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/movilidadcali','facebook_url','https://www.facebook.com/sttmcali','website_url','https://www.cali.gov.co/movilidad/','email','contactenos@cali.gov.co')
    WHERE slug = 'cali';

UPDATE cities SET region = 'Atlantico',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/TransitoBaq','facebook_url','https://www.facebook.com/p/Secretar%C3%ADa-Distrital-de-Tr%C3%A1nsito-y-Seguridad-Vial-de-Barranquilla-100065146477642/','website_url','https://www.barranquilla.gov.co/transito')
    WHERE slug = 'barranquilla';

UPDATE cities SET region = 'Santander',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/transito_bga','facebook_url','https://www.facebook.com/transitobga/','website_url','https://transitobucaramanga.gov.co/dtb/')
    WHERE slug = 'bucaramanga';

UPDATE cities SET region = 'Bolivar',
    contact_channels = JSON_OBJECT('twitter_url','https://x.com/DATT_Cgena','facebook_url','https://www.facebook.com/transitodecartagena/','website_url','https://www.transitocartagena.gov.co')
    WHERE slug = 'cartagena';

UPDATE cities SET region = 'Comunidad de Madrid' WHERE slug = 'madrid';

-- ===================== Bogota =====================
-- Motos: exentas (alta confianza, bogota.gov.co + @SectorMovilidad).
-- Carga: por antigüedad (>20 años), no por digito -> se documenta como nota, no como schedule.
-- Taxis: existe restriccion (Decreto 660/2001) pero no se encontro tabla de digitos/dia verificable -> se omite.
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
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
        JSON_OBJECT('key','transporte_carga', 'schedule', JSON_ARRAY(), 'note', 'Aplica a camiones de mas de 20 anios de antiguedad, sin importar el digito de la placa: lunes a viernes 6:00-8:00am y 5:00-8:00pm; sabados por digito par/impar 5:00am-9:00pm. No aplica domingos ni festivos.')
    ),
    'metro_area', NULL
)
WHERE c.slug = 'bogota' AND r.is_current = 1;

-- ===================== Medellin =====================
-- Motos: mismo horario/dias que particulares pero por el PRIMER digito de la placa (confirmado).
-- Taxis: rotacion quincenal por fechas especificas (no semanal) -> no cabe en el modelo, se omite.
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
        JSON_OBJECT(
            'key','particulares',
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
        JSON_OBJECT(
            'key','motos',
            'digit_position','first',
            'schedule', JSON_ARRAY(
                JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(1,7), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
                JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(0,3), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
                JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(4,6), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
                JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(5,9), 'hours', JSON_OBJECT('start','05:00','end','20:00')),
                JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(2,8), 'hours', JSON_OBJECT('start','05:00','end','20:00'))
            ),
            'exceptions', JSON_ARRAY('electric','hybrid','cng'),
            'holidays_suspended', true,
            'note', 'A diferencia de los carros, la restriccion para motos se aplica segun el PRIMER digito de la placa, no el ultimo.'
        )
    ),
    'metro_area', NULL
)
WHERE c.slug = 'medellin' AND r.is_current = 1;

-- ===================== Cali =====================
-- Motos y taxis: exentos (alta / media-alta confianza).
-- Transporte publico: existe con rotacion propia pero el horario exacto es contradictorio entre fuentes -> nota, sin horario.
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
        JSON_OBJECT(
            'key','particulares',
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
        JSON_OBJECT('key','motos', 'schedule', JSON_ARRAY(), 'note', 'Las motocicletas estan exentas del pico y placa en Cali.'),
        JSON_OBJECT('key','taxis', 'schedule', JSON_ARRAY(), 'note', 'Los taxis estan exentos del pico y placa en Cali.'),
        JSON_OBJECT('key','transporte_publico_colectivo', 'schedule', JSON_ARRAY(), 'note', 'El transporte publico colectivo tiene restriccion por digito con una rotacion distinta a la de particulares, pero el horario exacto no esta confirmado en fuentes oficiales — consulta a la Secretaria de Movilidad de Cali para el detalle vigente.')
    ),
    'metro_area', NULL
)
WHERE c.slug = 'cali' AND r.is_current = 1;

-- ===================== Barranquilla =====================
-- Particulares y taxis: sin restriccion (derogada por Decreto 0450/2025). Motos: sin restriccion en el distrito
-- (aclaracion importante: si aplica en otros municipios del Atlantico desde dic/2025).
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
        JSON_OBJECT('key','particulares', 'schedule', JSON_ARRAY(), 'holidays_suspended', false),
        JSON_OBJECT('key','motos', 'schedule', JSON_ARRAY(), 'note', 'Barranquilla (distrito) no tiene pico y placa vigente para motocicletas. Otros municipios del departamento del Atlantico si aplican esta restriccion desde diciembre de 2025.'),
        JSON_OBJECT('key','taxis', 'schedule', JSON_ARRAY(), 'note', 'La restriccion para taxis fue eliminada mediante el Decreto Distrital 0450 de 2025.')
    ),
    'metro_area', NULL
)
WHERE c.slug = 'barranquilla' AND r.is_current = 1;

-- ===================== Bucaramanga =====================
-- Motos: mismo horario/dias que particulares (confianza media).
-- Taxis y transporte publico: fuentes contradictorias sobre si estan exentos o tienen restriccion propia -> nota, sin horario.
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
        JSON_OBJECT(
            'key','particulares',
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
        JSON_OBJECT(
            'key','motos',
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
        JSON_OBJECT('key','taxis', 'schedule', JSON_ARRAY(), 'note', 'Las fuentes disponibles se contradicen: algunas indican que los taxis tienen una restriccion propia (aprox. 7:00am-9:00pm) y otras que estan exentos. No publicamos un horario especifico hasta confirmarlo con la Direccion de Transito de Bucaramanga.'),
        JSON_OBJECT('key','transporte_publico_colectivo', 'schedule', JSON_ARRAY(), 'note', 'Las fuentes disponibles se contradicen sobre si el transporte publico colectivo tiene restriccion propia o esta exento. No publicamos un horario especifico hasta confirmarlo con la Direccion de Transito de Bucaramanga.')
    ),
    'metro_area', NULL
)
WHERE c.slug = 'bucaramanga' AND r.is_current = 1;

-- ===================== Cartagena =====================
-- Motos: rotacion por digito 5am-11pm (misma rotacion que particulares) + toque de queda nocturno universal
-- y prohibicion 24/7 en el centro historico (se documentan como nota, no caben en el modelo de digitos).
-- Taxis: restriccion efectivamente de todo el dia (6am a 6am del dia siguiente) -> all_day:true.
UPDATE rules r
JOIN cities c ON c.id = r.city_id
SET r.payload_json = JSON_OBJECT(
    'categories', JSON_ARRAY(
        JSON_OBJECT(
            'key','particulares',
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
        JSON_OBJECT(
            'key','motos',
            'schedule', JSON_ARRAY(
                JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(9,0), 'hours', JSON_OBJECT('start','05:00','end','23:00')),
                JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(1,2), 'hours', JSON_OBJECT('start','05:00','end','23:00')),
                JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(3,4), 'hours', JSON_OBJECT('start','05:00','end','23:00')),
                JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(5,6), 'hours', JSON_OBJECT('start','05:00','end','23:00')),
                JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(7,8), 'hours', JSON_OBJECT('start','05:00','end','23:00'))
            ),
            'exceptions', JSON_ARRAY('electric','hybrid'),
            'holidays_suspended', true,
            'note', 'Ademas de esta rotacion por digito, todas las motocicletas -sin importar la placa- tienen toque de queda de 11:00pm a 5:00am todos los dias, y tienen prohibida la circulacion las 24 horas en el Centro Historico, San Diego, La Matuna y Getsemani.'
        ),
        JSON_OBJECT(
            'key','taxis',
            'all_day', true,
            'schedule', JSON_ARRAY(
                JSON_OBJECT('day','monday',    'digits', JSON_ARRAY(5,6)),
                JSON_OBJECT('day','tuesday',   'digits', JSON_ARRAY(7,8)),
                JSON_OBJECT('day','wednesday', 'digits', JSON_ARRAY(9,0)),
                JSON_OBJECT('day','thursday',  'digits', JSON_ARRAY(1,2)),
                JSON_OBJECT('day','friday',    'digits', JSON_ARRAY(3,4))
            ),
            'holidays_suspended', true,
            'note', 'La restriccion para taxis es efectivamente de todo el dia (6:00am a 6:00am del dia siguiente). La rotacion de digitos cambia aproximadamente cada mes — verifica la vigencia exacta antes de una fecha importante.'
        )
    ),
    'metro_area', NULL
)
WHERE c.slug = 'cartagena' AND r.is_current = 1;

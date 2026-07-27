-- legal_info por ciudad (ver migracion 005_legal_info.sql). Reemplaza el valor que antes
-- estaba hardcodeado en el frontend (messages/es.json -> legal.fine_value/citation) asumiendo
-- Colombia para TODAS las ciudades sin importar el pais. La sancion es la misma en las 6
-- ciudades colombianas porque proviene del codigo nacional de transito (Ley 769 de 2002,
-- art. 131-C.14, modificado por el art. 21 de la Ley 1383 de 2010), no de norma municipal.
-- Madrid (ES) queda sin legal_info por ahora — falta investigar la sancion de la DGT/Zona de
-- Bajas Emisiones especifica antes de publicarla; la seccion se oculta en el frontend si es NULL.

UPDATE cities SET legal_info = JSON_OBJECT(
    'fine_value', '15 SMLDV',
    'consequence', 'Inmovilizacion del vehiculo',
    'citation', 'Art. 131-C.14, Ley 769 de 2002 (mod. art. 21, Ley 1383 de 2010).'
) WHERE country_code = 'CO' AND slug IN ('bogota', 'medellin', 'cali', 'barranquilla', 'bucaramanga', 'cartagena');

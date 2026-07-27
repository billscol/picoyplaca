-- Sanciones/base legal por ciudad: antes vivian hardcodeadas en el frontend
-- (messages/es.json -> legal.fine_value/citation) asumiendo Colombia para
-- todas las ciudades. Cada pais/ciudad tiene su propia multa y norma, asi
-- que esto se modela igual que contact_channels: JSON opcional por ciudad,
-- la seccion se oculta si es null.
--
-- Forma esperada: {"fine_value":"15 SMLDV","fine_currency_note":null,"consequence":"Inmovilizacion del vehiculo","citation":"Art. 131-C.14, Ley 769 de 2002 (mod. art. 21, Ley 1383 de 2010)."}
ALTER TABLE cities
    ADD COLUMN legal_info JSON NULL AFTER contact_channels;

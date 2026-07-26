-- Metadata adicional por ciudad: departamento/region para agrupar ciudades hermanas,
-- y canales de contacto oficiales (Secretaria de Transito / equivalente) mostrados en la pagina de ciudad.
ALTER TABLE cities
    ADD COLUMN region VARCHAR(120) NULL AFTER country_name,
    ADD COLUMN contact_channels JSON NULL AFTER restriction_model;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable PostGIS Topology
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable PostGIS Tiger Geocoder
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Enable PostGIS SFCGAL
CREATE EXTENSION IF NOT EXISTS postgis_sfcgal;
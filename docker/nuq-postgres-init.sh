#!/bin/bash
set -e

# Create the firecrawl database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE firecrawl' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'firecrawl')\gexec
EOSQL

# Create the postgres superuser if it doesn't exist (for firecrawl-api compatibility)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
            CREATE ROLE postgres WITH SUPERUSER CREATEDB CREATEROLE LOGIN;
        END IF;
    END
    \$\$;
EOSQL

# Create pgcrypto extension in firecrawl database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "firecrawl" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
EOSQL

# Create pg_cron extension in firecrawl database (cron.database_name = 'firecrawl' per postgresql.conf)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "firecrawl" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS pg_cron;
EOSQL

# Run the NUQ schema in the firecrawl database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "firecrawl" -f /docker-entrypoint-initdb.d/010-nuq.sql


-- This migration drops all existing tables in the public schema
-- WARNING: This is a destructive operation and will delete all data

-- First disable all triggers to avoid foreign key constraint issues
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    END LOOP;
END$$;

-- Drop all tables in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE;';
    END LOOP;
END$$;

-- Also drop any sequences that might be leftover
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE;';
    END LOOP;
END$$;

-- This will effectively reset the database to a clean state
-- After running this migration, you'll need to run the other migrations again to recreate the schema


-- Check if category column exists in projects table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
    END IF;
END
$$;

-- Check if category column exists in portfolio_items table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_items' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.portfolio_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
    END IF;
END
$$;

-- Check if featured_image column exists in portfolio_items table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_items' 
        AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE public.portfolio_items ADD COLUMN featured_image TEXT;
    END IF;
END
$$;

-- Verify and update any constraints or indexes related to category columns
-- For projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'projects' 
        AND indexname = 'idx_projects_category'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
    END IF;
END
$$;

-- For portfolio_items table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'portfolio_items' 
        AND indexname = 'idx_portfolio_items_category'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category);
    END IF;
END
$$;

-- Also check for search_vector column in projects which uses category
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'search_vector'
    ) THEN
        -- Update existing records to populate the search vector including category
        UPDATE public.projects SET search_vector = 
            setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
            setweight(to_tsvector('portuguese', coalesce(category, '')), 'C');
    END IF;
END
$$;


-- Create portfolio_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'other',
    client TEXT NOT NULL,
    completed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    featured BOOLEAN NOT NULL DEFAULT false,
    featured_image TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to view portfolio items
CREATE POLICY "Allow anonymous read access to portfolio_items" 
    ON public.portfolio_items
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Create policy for authenticated users with admin role to manage portfolio items
CREATE POLICY "Allow admin users to manage portfolio_items" 
    ON public.portfolio_items
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    );

-- Create storage bucket for images if it doesn't exist
DO $$
BEGIN
    -- Check if bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'images'
    ) THEN
        -- Create bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('images', 'images', true);
        
        -- Create RLS policies for images bucket
        CREATE POLICY "Allow anonymous access to images" 
            ON storage.objects FOR SELECT
            TO anon, authenticated
            USING (bucket_id = 'images');
            
        CREATE POLICY "Allow authenticated users to upload images" 
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'images');
            
        CREATE POLICY "Allow authenticated users to update own images" 
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = 'images');
            
        CREATE POLICY "Allow authenticated users to delete own images" 
            ON storage.objects FOR DELETE
            TO authenticated
            USING (bucket_id = 'images');
    END IF;
END $$;

-- Update the search_vector function for portfolio_items if search is needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'portfolio_items_search_vector_update'
    ) THEN
        CREATE OR REPLACE FUNCTION portfolio_items_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector = 
                setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
                setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B') ||
                setweight(to_tsvector('portuguese', coalesce(NEW.category, '')), 'C') ||
                setweight(to_tsvector('portuguese', coalesce(NEW.client, '')), 'C');
            RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

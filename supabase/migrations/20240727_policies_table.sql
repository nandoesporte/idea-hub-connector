
-- Create policies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number text NOT NULL,
  insurer text NOT NULL,
  customer text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  coverage_amount text NOT NULL,
  premium_value text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'expired', 'pending', 'cancelled')),
  document_url text,
  file_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS if not already enabled
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Check if foreign key constraint exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'policies_user_id_fkey'
    ) THEN
        ALTER TABLE public.policies 
        ADD CONSTRAINT policies_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.policies'::regclass 
        AND polname = 'Users can view their own policies'
    ) THEN
        CREATE POLICY "Users can view their own policies"
          ON public.policies
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.policies'::regclass 
        AND polname = 'Users can insert their own policies'
    ) THEN
        CREATE POLICY "Users can insert their own policies"
          ON public.policies
          FOR INSERT
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.policies'::regclass 
        AND polname = 'Users can update their own policies'
    ) THEN
        CREATE POLICY "Users can update their own policies"
          ON public.policies
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'public.policies'::regclass 
        AND polname = 'Users can delete their own policies'
    ) THEN
        CREATE POLICY "Users can delete their own policies"
          ON public.policies
          FOR DELETE
          USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Create storage extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create policy_documents storage bucket
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    -- Check if the bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'policy_documents'
    ) INTO bucket_exists;
    
    -- Create the bucket if it doesn't exist
    IF NOT bucket_exists THEN
        -- Ensure the storage schema exists
        CREATE SCHEMA IF NOT EXISTS storage;
        
        -- Create the bucket
        INSERT INTO storage.buckets (id, name)
        VALUES ('policy_documents', 'policy_documents')
        ON CONFLICT (id) DO NOTHING;
        
        -- Set up bucket policies
        -- Allow public access for reading files
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read Access',
            jsonb_build_object(
                'statement', jsonb_build_object(
                    'effect', 'allow',
                    'actions', array['s3:GetObject'],
                    'principal', '*'
                )
            ),
            'policy_documents'
        )
        ON CONFLICT DO NOTHING;
        
        -- Allow authenticated users to upload files
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Auth Upload Access',
            jsonb_build_object(
                'statement', jsonb_build_object(
                    'effect', 'allow',
                    'actions', array['s3:PutObject'],
                    'principal', jsonb_build_object('id', 'authenticated')
                )
            ),
            'policy_documents'
        )
        ON CONFLICT DO NOTHING;
        
        -- Allow users to manage only their own folders
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'User Folder Access',
            jsonb_build_object(
                'statement', jsonb_build_object(
                    'effect', 'allow',
                    'actions', array['s3:*'],
                    'principal', jsonb_build_object('id', 'authenticated'),
                    'conditions', jsonb_build_object(
                        'resource_prefix', jsonb_build_object(
                            'prefix_match', array['policies/${auth.uid}/']
                        )
                    )
                )
            ),
            'policy_documents'
        )
        ON CONFLICT DO NOTHING;
    END IF;
END
$$;

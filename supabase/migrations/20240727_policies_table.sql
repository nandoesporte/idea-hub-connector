
-- Create policies table
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

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Check if policies for RLS exist before creating them
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

-- Create policy_documents storage bucket if it doesn't exist
-- Note: This assumes the storage extension is installed
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
        INSERT INTO storage.buckets (id, name, public, avif_autodetection)
        VALUES ('policy_documents', 'policy_documents', true, false);
        
        -- Bucket policies to allow users to manage their own files
        -- Allow users to read any file in the bucket (needed for downloading policies)
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read',
            '{"statement": {"effect": "allow", "actions": ["s3:GetObject"], "principal": "*"}}',
            'policy_documents'
        );
        
        -- Allow authenticated users to upload files
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Authenticated Upload',
            '{"statement": {"effect": "allow", "actions": ["s3:PutObject"], "principal": {"id": "authenticated"}}}',
            'policy_documents'
        );
        
        -- Allow users to manage their own folders
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Owner Access',
            '{"statement": {"effect": "allow", "actions": ["s3:*"], "principal": {"id": "authenticated"}, "conditions": {"resource_prefix": {"prefix_match": ["policies/${auth.uid}/"]}}}}',
            'policy_documents'
        );
    END IF;
END
$$;

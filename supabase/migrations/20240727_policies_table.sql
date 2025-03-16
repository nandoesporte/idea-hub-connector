
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
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'policy_documents'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('policy_documents', 'policy_documents', false)
        ON CONFLICT (id) DO NOTHING;
        
        -- Create policies for the bucket
        
        -- 1. Policy for public read access
        INSERT INTO storage.policies (id, name, bucket_id)
        SELECT 
            gen_random_uuid(), 
            'Policy Documents Public Read', 
            'policy_documents'
        WHERE NOT EXISTS (
            SELECT 1 FROM storage.policies 
            WHERE name = 'Policy Documents Public Read' AND bucket_id = 'policy_documents'
        );
        
        -- Update the policy definition
        UPDATE storage.policies 
        SET definition = jsonb_build_object(
            'id', id,
            'name', name,
            'statements', jsonb_build_array(
                jsonb_build_object(
                    'effect', 'allow',
                    'actions', ARRAY['s3:GetObject'],
                    'principal', '*',
                    'resources', ARRAY['policy_documents/*']
                )
            )
        )
        WHERE name = 'Policy Documents Public Read' AND bucket_id = 'policy_documents';
        
        -- 2. Policy for authenticated users to upload
        INSERT INTO storage.policies (id, name, bucket_id)
        SELECT 
            gen_random_uuid(), 
            'Policy Documents Auth Upload', 
            'policy_documents'
        WHERE NOT EXISTS (
            SELECT 1 FROM storage.policies 
            WHERE name = 'Policy Documents Auth Upload' AND bucket_id = 'policy_documents'
        );
        
        -- Update the policy definition
        UPDATE storage.policies 
        SET definition = jsonb_build_object(
            'id', id,
            'name', name,
            'statements', jsonb_build_array(
                jsonb_build_object(
                    'effect', 'allow',
                    'actions', ARRAY['s3:PutObject'],
                    'principal', jsonb_build_object('id', 'authenticated'),
                    'resources', ARRAY['policy_documents/*']
                )
            )
        )
        WHERE name = 'Policy Documents Auth Upload' AND bucket_id = 'policy_documents';
        
        -- 3. Policy for users to manage their own folders
        INSERT INTO storage.policies (id, name, bucket_id)
        SELECT 
            gen_random_uuid(), 
            'Policy Documents User Folder Access', 
            'policy_documents'
        WHERE NOT EXISTS (
            SELECT 1 FROM storage.policies 
            WHERE name = 'Policy Documents User Folder Access' AND bucket_id = 'policy_documents'
        );
        
        -- Update the policy definition
        UPDATE storage.policies 
        SET definition = jsonb_build_object(
            'id', id,
            'name', name,
            'statements', jsonb_build_array(
                jsonb_build_object(
                    'effect', 'allow',
                    'actions', ARRAY['s3:*'],
                    'principal', jsonb_build_object('id', 'authenticated'),
                    'resources', ARRAY['policy_documents/policies/${auth.uid}/*'],
                    'conditions', jsonb_build_object(
                        'StringLike', jsonb_build_object(
                            'resource.path', ARRAY['policies/${auth.uid}/*']
                        )
                    )
                )
            )
        )
        WHERE name = 'Policy Documents User Folder Access' AND bucket_id = 'policy_documents';
    END IF;
END
$$;

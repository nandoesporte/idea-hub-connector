
-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Enable Row Level Security
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can insert their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can update their own policies" ON public.policies;
DROP POLICY IF EXISTS "Users can delete their own policies" ON public.policies;

-- Create RLS policies
CREATE POLICY "Users can view their own policies"
  ON public.policies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policies"
  ON public.policies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policies"
  ON public.policies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own policies"
  ON public.policies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for policy documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'policy_documents', 'policy_documents', false
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE name = 'policy_documents'
);

-- Create storage policies for policy documents
BEGIN;
  -- Policy: Allow authenticated users to read their own files
  DELETE FROM storage.policies WHERE name = 'policy_documents_read';
  INSERT INTO storage.policies (name, definition)
  VALUES (
    'policy_documents_read',
    jsonb_build_object(
      'version', '1.0',
      'statements', jsonb_build_array(
        jsonb_build_object(
          'effect', 'allow',
          'principal', jsonb_build_object('id', 'authenticated'),
          'action', 'object:read',
          'resource', 'policy_documents/policies/${auth.uid}/*'
        )
      )
    )
  );

  -- Policy: Allow authenticated users to upload their own files
  DELETE FROM storage.policies WHERE name = 'policy_documents_create';
  INSERT INTO storage.policies (name, definition)
  VALUES (
    'policy_documents_create',
    jsonb_build_object(
      'version', '1.0',
      'statements', jsonb_build_array(
        jsonb_build_object(
          'effect', 'allow',
          'principal', jsonb_build_object('id', 'authenticated'),
          'action', 'object:create',
          'resource', 'policy_documents/policies/${auth.uid}/*'
        )
      )
    )
  );

  -- Policy: Allow authenticated users to delete their own files
  DELETE FROM storage.policies WHERE name = 'policy_documents_delete';
  INSERT INTO storage.policies (name, definition)
  VALUES (
    'policy_documents_delete',
    jsonb_build_object(
      'version', '1.0',
      'statements', jsonb_build_array(
        jsonb_build_object(
          'effect', 'allow',
          'principal', jsonb_build_object('id', 'authenticated'),
          'action', 'object:delete',
          'resource', 'policy_documents/policies/${auth.uid}/*'
        )
      )
    )
  );
COMMIT;

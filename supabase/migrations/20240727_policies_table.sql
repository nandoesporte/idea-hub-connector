
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

-- Create bucket policies for accessing policies
-- Note: We use a different approach that doesn't rely on the storage.policies table
DO $$
BEGIN
  -- Allow users to read their own policy documents
  EXECUTE format('
    CREATE POLICY "Users can read their own policy documents" ON storage.objects
    FOR SELECT
    USING (bucket_id = ''policy_documents'' AND (storage.foldername(name))[1] = ''policies'' AND (storage.foldername(name))[2] = auth.uid()::text);
  ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Allow users to insert their own policy documents
  EXECUTE format('
    CREATE POLICY "Users can insert their own policy documents" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = ''policy_documents'' AND (storage.foldername(name))[1] = ''policies'' AND (storage.foldername(name))[2] = auth.uid()::text);
  ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Allow users to update their own policy documents
  EXECUTE format('
    CREATE POLICY "Users can update their own policy documents" ON storage.objects
    FOR UPDATE
    USING (bucket_id = ''policy_documents'' AND (storage.foldername(name))[1] = ''policies'' AND (storage.foldername(name))[2] = auth.uid()::text);
  ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  -- Allow users to delete their own policy documents
  EXECUTE format('
    CREATE POLICY "Users can delete their own policy documents" ON storage.objects
    FOR DELETE
    USING (bucket_id = ''policy_documents'' AND (storage.foldername(name))[1] = ''policies'' AND (storage.foldername(name))[2] = auth.uid()::text);
  ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

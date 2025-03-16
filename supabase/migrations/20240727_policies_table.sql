
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

-- Create RLS policies
-- The syntax error was in these policy statements - removed "IF NOT EXISTS"
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

-- Create storage bucket for policy documents
DO $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'policy_documents'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('policy_documents', 'policy_documents', false);
    
    -- Create storage policy for authenticated users to read their own files
    INSERT INTO storage.policies (id, name, definition)
    VALUES (
      gen_random_uuid(),
      'Allow authenticated users to read their own policy documents',
      '{"version": "1.0", "statements": [{"effect": "allow", "principal": {"id": "authenticated"}, "action": "object:read", "resource": "policy_documents/policies/${auth.uid}/*"}]}'
    );
    
    -- Create storage policy for authenticated users to upload their own files
    INSERT INTO storage.policies (id, name, definition)
    VALUES (
      gen_random_uuid(),
      'Allow authenticated users to upload their own policy documents',
      '{"version": "1.0", "statements": [{"effect": "allow", "principal": {"id": "authenticated"}, "action": "object:create", "resource": "policy_documents/policies/${auth.uid}/*"}]}'
    );
    
    -- Create storage policy for authenticated users to delete their own files
    INSERT INTO storage.policies (id, name, definition)
    VALUES (
      gen_random_uuid(),
      'Allow authenticated users to delete their own policy documents',
      '{"version": "1.0", "statements": [{"effect": "allow", "principal": {"id": "authenticated"}, "action": "object:delete", "resource": "policy_documents/policies/${auth.uid}/*"}]}'
    );
  END IF;
END
$$;


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
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT policies_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
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


-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_number TEXT NOT NULL,
  customer TEXT NOT NULL,
  insurer TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  premium_value TEXT NOT NULL,
  document_url TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired')),
  whatsapp_message_id TEXT,
  processed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on policy_number
CREATE INDEX IF NOT EXISTS idx_insurance_policies_policy_number ON public.insurance_policies(policy_number);

-- Create index on customer
CREATE INDEX IF NOT EXISTS idx_insurance_policies_customer ON public.insurance_policies(customer);

-- Create index on insurer
CREATE INDEX IF NOT EXISTS idx_insurance_policies_insurer ON public.insurance_policies(insurer);

-- Create index on end_date for renewal checks
CREATE INDEX IF NOT EXISTS idx_insurance_policies_end_date ON public.insurance_policies(end_date);

-- Enable Row Level Security
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all insurance policies
DROP POLICY IF EXISTS "Authenticated users can view all insurance policies" ON public.insurance_policies;
CREATE POLICY "Authenticated users can view all insurance policies" 
ON public.insurance_policies 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy to allow users with 'admin' role to insert insurance policies
DROP POLICY IF EXISTS "Admin users can insert insurance policies" ON public.insurance_policies;
CREATE POLICY "Admin users can insert insurance policies" 
ON public.insurance_policies 
FOR INSERT 
WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow users with 'admin' role to update insurance policies
DROP POLICY IF EXISTS "Admin users can update insurance policies" ON public.insurance_policies;
CREATE POLICY "Admin users can update insurance policies" 
ON public.insurance_policies 
FOR UPDATE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow users with 'admin' role to delete insurance policies
DROP POLICY IF EXISTS "Admin users can delete insurance policies" ON public.insurance_policies;
CREATE POLICY "Admin users can delete insurance policies" 
ON public.insurance_policies 
FOR DELETE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Create policy reminder_logs table to track when reminders are sent
CREATE TABLE IF NOT EXISTS public.policy_reminder_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  recipient_phone TEXT NOT NULL,
  message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on policy_id
CREATE INDEX IF NOT EXISTS idx_policy_reminder_logs_policy_id ON public.policy_reminder_logs(policy_id);

-- Enable Row Level Security
ALTER TABLE public.policy_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all policy reminder logs
DROP POLICY IF EXISTS "Authenticated users can view all policy reminder logs" ON public.policy_reminder_logs;
CREATE POLICY "Authenticated users can view all policy reminder logs" 
ON public.policy_reminder_logs 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy to allow users with 'admin' role to insert policy reminder logs
DROP POLICY IF EXISTS "Admin users can insert policy reminder logs" ON public.policy_reminder_logs;
CREATE POLICY "Admin users can insert policy reminder logs" 
ON public.policy_reminder_logs 
FOR INSERT 
WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

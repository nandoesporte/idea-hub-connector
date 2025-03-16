
-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    insurer TEXT NOT NULL,
    coverage_amount NUMERIC NOT NULL,
    premium NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    type TEXT NOT NULL,
    attachment_url TEXT,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS insurance_policies_user_id_idx ON public.insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS insurance_policies_expiry_date_idx ON public.insurance_policies(expiry_date);

-- Set up RLS policies
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own policies
CREATE POLICY "Users can view their own policies"
ON public.insurance_policies
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own policies
CREATE POLICY "Users can insert their own policies"
ON public.insurance_policies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own policies
CREATE POLICY "Users can update their own policies"
ON public.insurance_policies
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own policies
CREATE POLICY "Users can delete their own policies"
ON public.insurance_policies
FOR DELETE
USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurance_policies TO authenticated;

-- Create a function to check for policies nearing expiration
CREATE OR REPLACE FUNCTION public.check_policy_expirations()
RETURNS VOID AS $$
DECLARE
    policy_record RECORD;
    notification_settings RECORD;
    days_before INTEGER;
BEGIN
    -- Loop through all active policies
    FOR policy_record IN 
        SELECT * FROM public.insurance_policies 
        WHERE status = 'active' AND reminder_sent = FALSE
    LOOP
        -- Get notification settings for the user
        SELECT * INTO notification_settings 
        FROM public.user_settings 
        WHERE user_id = policy_record.user_id;
        
        -- Default to 30 days if not set
        days_before := COALESCE(notification_settings.policy_reminder_days, 30);
        
        -- Check if policy is nearing expiration
        IF policy_record.expiry_date - INTERVAL '1 day' * days_before <= CURRENT_TIMESTAMP THEN
            -- Insert notification
            INSERT INTO public.notifications (
                user_id, 
                title, 
                message, 
                type, 
                is_read,
                related_entity_type,
                related_entity_id
            ) VALUES (
                policy_record.user_id,
                'Apólice próxima do vencimento',
                'A apólice ' || policy_record.policy_number || ' da ' || policy_record.insurer || ' vence em ' || 
                days_before || ' dias (' || to_char(policy_record.expiry_date, 'DD/MM/YYYY') || ').',
                'warning',
                FALSE,
                'policy',
                policy_record.id
            );
            
            -- Mark reminder as sent
            UPDATE public.insurance_policies 
            SET reminder_sent = TRUE, 
                reminder_date = CURRENT_TIMESTAMP
            WHERE id = policy_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the expiration check daily
SELECT cron.schedule(
    'daily-policy-check',
    '0 9 * * *',  -- Run at 9 AM every day
    $$SELECT public.check_policy_expirations()$$
);

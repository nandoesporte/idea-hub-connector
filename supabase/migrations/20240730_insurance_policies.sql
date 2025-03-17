
-- Create insurance_policies table if it doesn't exist
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

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'insurance_policies' AND policyname = 'Users can view their own policies'
    ) THEN
        DROP POLICY "Users can view their own policies" ON public.insurance_policies;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'insurance_policies' AND policyname = 'Users can insert their own policies'
    ) THEN
        DROP POLICY "Users can insert their own policies" ON public.insurance_policies;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'insurance_policies' AND policyname = 'Users can update their own policies'
    ) THEN
        DROP POLICY "Users can update their own policies" ON public.insurance_policies;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'insurance_policies' AND policyname = 'Users can delete their own policies'
    ) THEN
        DROP POLICY "Users can delete their own policies" ON public.insurance_policies;
    END IF;
END
$$;

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

-- First check if the UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Policy check function
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

-- Drop the cron job if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-policy-check') THEN
        PERFORM cron.unschedule('daily-policy-check');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If cron schema does not exist, ignore the error
        NULL;
END
$$;

-- Try to create cron job if cron extension is available
DO $$
BEGIN
    -- Check if cron extension exists before trying to schedule
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        PERFORM cron.schedule(
            'daily-policy-check',
            '0 9 * * *',  -- Run at 9 AM every day
            $$SELECT public.check_policy_expirations()$$
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If cron extension is not available, ignore the error
        RAISE NOTICE 'Cron extension not available, skipping cron job creation';
END
$$;

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create documents bucket
DO $$
BEGIN
    -- Create documents bucket with proper settings
    INSERT INTO storage.buckets (id, name, public, file_size_limit)
    VALUES ('documents', 'documents', true, 10485760)
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 10485760;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating bucket: %', SQLERRM;
END
$$;

-- Clear existing policies for the documents bucket
DO $$
BEGIN
    -- Delete policies for documents bucket if they exist
    DROP POLICY IF EXISTS "Documents User Access" ON storage.objects;
    DROP POLICY IF EXISTS "Documents Public Access" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping storage policies: %', SQLERRM;
END
$$;

-- Create new policies with proper error handling
DO $$
BEGIN
    -- Policy for authenticated users to manage their own files
    CREATE POLICY "Documents User Access"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'documents' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR owner = auth.uid())
    )
    WITH CHECK (
        bucket_id = 'documents' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR owner = auth.uid())
    );

    -- Policy for public access to read files
    CREATE POLICY "Documents Public Access"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
        bucket_id = 'documents'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating storage policies: %', SQLERRM;
END
$$;

-- Grant permissions with proper error handling
DO $$
BEGIN
    -- Grant usage on storage schema
    GRANT USAGE ON SCHEMA storage TO public;
    GRANT USAGE ON SCHEMA storage TO authenticated;
    GRANT USAGE ON SCHEMA storage TO anon;

    -- Grant permissions on objects to authenticated users
    GRANT ALL ON storage.objects TO authenticated;
    GRANT SELECT ON storage.objects TO public;
    GRANT SELECT ON storage.objects TO anon;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END
$$;

-- Ensure the buckets table exists and has proper permissions
DO $$
BEGIN
    -- Grant permissions on buckets table
    GRANT SELECT ON storage.buckets TO authenticated;
    GRANT SELECT ON storage.buckets TO public;
    GRANT SELECT ON storage.buckets TO anon;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting bucket permissions: %', SQLERRM;
END
$$;

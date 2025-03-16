
-- Drop table if it exists
DROP TABLE IF EXISTS public.insurance_policies CASCADE;

-- Also remove the documents bucket if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'documents'
    ) THEN
        DELETE FROM storage.objects WHERE bucket_id = 'documents';
        DELETE FROM storage.buckets WHERE id = 'documents';
    END IF;
END
$$;

-- Remove the policy check function and cron job
DROP FUNCTION IF EXISTS public.check_policy_expirations();

-- Drop the cron job if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-policy-check') THEN
        SELECT cron.unschedule('daily-policy-check');
    END IF;
END
$$;

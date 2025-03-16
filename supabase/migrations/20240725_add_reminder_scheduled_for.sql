
-- Add reminder_scheduled_for column to voice_command_events table
ALTER TABLE IF EXISTS public.voice_command_events 
ADD COLUMN IF NOT EXISTS reminder_scheduled_for TIMESTAMP WITH TIME ZONE;

-- Create index on reminder_scheduled_for
DROP INDEX IF EXISTS idx_voice_command_events_reminder;
CREATE INDEX IF NOT EXISTS idx_voice_command_events_reminder ON public.voice_command_events(reminder_scheduled_for);

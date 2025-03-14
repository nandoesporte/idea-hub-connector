
-- Create a table for voice command events
CREATE TABLE IF NOT EXISTS public.voice_command_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'deadline', 'task', 'other')),
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.voice_command_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own voice command events
DROP POLICY IF EXISTS "Users can view their own voice command events" ON public.voice_command_events;
CREATE POLICY "Users can view their own voice command events" 
ON public.voice_command_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own voice command events
DROP POLICY IF EXISTS "Users can insert their own voice command events" ON public.voice_command_events;
CREATE POLICY "Users can insert their own voice command events" 
ON public.voice_command_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own voice command events
DROP POLICY IF EXISTS "Users can update their own voice command events" ON public.voice_command_events;
CREATE POLICY "Users can update their own voice command events" 
ON public.voice_command_events 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own voice command events
DROP POLICY IF EXISTS "Users can delete their own voice command events" ON public.voice_command_events;
CREATE POLICY "Users can delete their own voice command events" 
ON public.voice_command_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_voice_command_events_user_id ON public.voice_command_events(user_id);

-- Create index on date
CREATE INDEX IF NOT EXISTS idx_voice_command_events_date ON public.voice_command_events(date);

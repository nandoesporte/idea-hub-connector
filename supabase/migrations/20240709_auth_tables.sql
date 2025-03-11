
-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  company TEXT,
  position TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a trigger to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a table for projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  features JSONB,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('baixa', 'normal', 'alta')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'approved', 'in-progress', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own projects
CREATE POLICY IF NOT EXISTS "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own projects
CREATE POLICY IF NOT EXISTS "Users can insert their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own projects
CREATE POLICY IF NOT EXISTS "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a table for project attachments
CREATE TABLE IF NOT EXISTS public.project_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view attachments of their own projects
CREATE POLICY IF NOT EXISTS "Users can view attachments of their own projects" 
ON public.project_attachments 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.projects WHERE id = project_id
));

-- Create policy to allow users to insert attachments to their own projects
CREATE POLICY IF NOT EXISTS "Users can insert attachments to their own projects" 
ON public.project_attachments 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.projects WHERE id = project_id
));

-- Create policy to allow users to delete attachments from their own projects
CREATE POLICY IF NOT EXISTS "Users can delete attachments from their own projects" 
ON public.project_attachments 
FOR DELETE 
USING (auth.uid() IN (
  SELECT user_id FROM public.projects WHERE id = project_id
));

-- Create a table for project status updates
CREATE TABLE IF NOT EXISTS public.project_status_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'under-review', 'approved', 'in-progress', 'completed', 'rejected')),
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.project_status_updates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view status updates of their own projects
CREATE POLICY IF NOT EXISTS "Users can view status updates of their own projects" 
ON public.project_status_updates 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM public.projects WHERE id = project_id
) OR auth.uid() = created_by);

-- Create policy to allow users to insert status updates to their own projects or by admins
CREATE POLICY IF NOT EXISTS "Users can insert status updates" 
ON public.project_status_updates 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.projects WHERE id = project_id
) OR auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a table for portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_name TEXT,
  category TEXT NOT NULL,
  technologies TEXT[],
  thumbnail_url TEXT,
  project_url TEXT,
  completion_date DATE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view portfolio items
CREATE POLICY IF NOT EXISTS "All users can view portfolio items" 
ON public.portfolio_items 
FOR SELECT 
USING (true);

-- Create policy to allow only admins to insert portfolio items
CREATE POLICY IF NOT EXISTS "Only admins can insert portfolio items" 
ON public.portfolio_items 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to update portfolio items
CREATE POLICY IF NOT EXISTS "Only admins can update portfolio items" 
ON public.portfolio_items 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to delete portfolio items
CREATE POLICY IF NOT EXISTS "Only admins can delete portfolio items" 
ON public.portfolio_items 
FOR DELETE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER IF NOT EXISTS update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a table for portfolio item images
CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolio_items(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view portfolio images
CREATE POLICY IF NOT EXISTS "All users can view portfolio images" 
ON public.portfolio_images 
FOR SELECT 
USING (true);

-- Create policy to allow only admins to insert portfolio images
CREATE POLICY IF NOT EXISTS "Only admins can insert portfolio images" 
ON public.portfolio_images 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to update portfolio images
CREATE POLICY IF NOT EXISTS "Only admins can update portfolio images" 
ON public.portfolio_images 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to delete portfolio images
CREATE POLICY IF NOT EXISTS "Only admins can delete portfolio images" 
ON public.portfolio_images 
FOR DELETE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a table for testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_position TEXT,
  client_company TEXT,
  client_avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view testimonials
CREATE POLICY IF NOT EXISTS "All users can view testimonials" 
ON public.testimonials 
FOR SELECT 
USING (true);

-- Create policy to allow only admins to insert testimonials
CREATE POLICY IF NOT EXISTS "Only admins can insert testimonials" 
ON public.testimonials 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to update testimonials
CREATE POLICY IF NOT EXISTS "Only admins can update testimonials" 
ON public.testimonials 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to delete testimonials
CREATE POLICY IF NOT EXISTS "Only admins can delete testimonials" 
ON public.testimonials 
FOR DELETE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER IF NOT EXISTS update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a table for contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow any user to insert a contact message
CREATE POLICY IF NOT EXISTS "Anyone can submit a contact message" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow only admins to view contact messages
CREATE POLICY IF NOT EXISTS "Only admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create policy to allow only admins to update contact messages
CREATE POLICY IF NOT EXISTS "Only admins can update contact messages" 
ON public.contact_messages 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER IF NOT EXISTS update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

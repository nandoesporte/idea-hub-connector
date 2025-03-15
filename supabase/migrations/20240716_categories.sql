
-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    link text NOT NULL,
    type text NOT NULL CHECK (type IN ('tech', 'insurance')),
    icon_color text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can read categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Only admins can insert/update/delete categories
CREATE POLICY "Only admins can insert categories" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update categories" 
ON public.categories 
FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete categories" 
ON public.categories 
FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Insert initial data
INSERT INTO public.categories (title, description, icon, link, type, icon_color)
VALUES
    ('Desenvolvimento Web', 'Sites, aplicações e portais personalizados', 'Cpu', '/submit-idea', 'tech', 'text-blue-500'),
    ('Apps Móveis', 'Aplicativos para iOS e Android', 'Code', '/submit-idea', 'tech', 'text-purple-500'),
    ('Sistemas de Gestão', 'ERPs e sistemas administrativos', 'Database', '/submit-idea', 'tech', 'text-green-500'),
    ('Soluções com IA', 'Inteligência artificial para seu negócio', 'BrainCircuit', '/submit-idea', 'tech', 'text-amber-500'),
    ('Seguro de Vida', 'Proteção financeira para você e sua família', 'Heart', '/submit-idea', 'insurance', 'text-pink-500'),
    ('Seguro Residencial', 'Proteção completa para seu lar', 'Home', '/submit-idea', 'insurance', 'text-blue-500'),
    ('Seguro Empresarial', 'Soluções para proteger seu negócio', 'Briefcase', '/submit-idea', 'insurance', 'text-purple-500'),
    ('Seguro Saúde', 'Cuidados médicos para você e sua família', 'Hospital', '/submit-idea', 'insurance', 'text-green-500')
ON CONFLICT (id) DO NOTHING;

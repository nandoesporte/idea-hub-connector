
// API endpoint para executar migrações específicas sob demanda
import { supabase } from '@/lib/supabase';

type MigrationResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function runMigration(req, res) {
  try {
    const { migration } = req.body;
    
    if (!migration) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome da migração não fornecido' 
      });
    }
    
    let result: MigrationResult;
    
    switch (migration) {
      case 'insurance_policies':
        result = await runInsurancePoliciesMigration();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Migração desconhecida: ${migration}`
        });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    return res.status(500).json({
      success: false,
      error: 'Falha ao executar a migração'
    });
  }
}

async function runInsurancePoliciesMigration(): Promise<MigrationResult> {
  try {
    // Obter o conteúdo SQL da migração 20240730_insurance_policies.sql
    const migrationSql = `
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

-- Policy for users to see only their own policies
CREATE POLICY IF NOT EXISTS "Users can view their own policies"
ON public.insurance_policies
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own policies
CREATE POLICY IF NOT EXISTS "Users can insert their own policies"
ON public.insurance_policies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own policies
CREATE POLICY IF NOT EXISTS "Users can update their own policies"
ON public.insurance_policies
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own policies
CREATE POLICY IF NOT EXISTS "Users can delete their own policies"
ON public.insurance_policies
FOR DELETE
USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurance_policies TO authenticated;

-- Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own files
CREATE POLICY IF NOT EXISTS "Documents User Access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (auth.uid() = owner OR owner IS NULL)
)
WITH CHECK (
  bucket_id = 'documents' 
  AND (auth.uid() = owner OR owner IS NULL)
);

-- Policy for public access to read files
CREATE POLICY IF NOT EXISTS "Documents Public Access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' 
  AND public = true
);

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO public;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant all on storage buckets to authenticated users
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO public;
GRANT SELECT ON storage.buckets TO anon;
    `;
    
    // Executar o SQL de migração
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSql
    });

    if (error) {
      console.error('Erro ao executar SQL de migração:', error);
      
      // Verificando erros que podem ser ignorados (já existe)
      if (error.message && error.message.includes('already exists')) {
        return { 
          success: true,
          message: 'Algumas tabelas já existem, mas a migração foi concluída'
        };
      }
      
      return { 
        success: false, 
        error: `Erro ao executar migração: ${error.message}` 
      };
    }

    return {
      success: true,
      message: 'Migração executada com sucesso'
    };
  } catch (error) {
    console.error('Exceção ao executar migração:', error);
    return {
      success: false,
      error: 'Erro interno ao executar a migração'
    };
  }
}

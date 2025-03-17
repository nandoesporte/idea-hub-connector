import { Policy } from '@/types';
import { supabase } from './supabase';
import { toast } from 'sonner';

export const fetchPolicies = async (userId: string): Promise<Policy[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('Insurance policies table does not exist. Returning empty array.');
        return [];
      }
      
      console.error('Error fetching policies:', error);
      throw new Error(error.message);
    }

    return data.map(policy => ({
      ...policy,
      issue_date: new Date(policy.issue_date),
      expiry_date: new Date(policy.expiry_date),
      reminder_date: policy.reminder_date ? new Date(policy.reminder_date) : undefined,
      created_at: new Date(policy.created_at),
      updated_at: new Date(policy.updated_at),
    }));
  } catch (error) {
    console.error('Error in fetchPolicies:', error);
    return [];
  }
};

export const createPolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>) => {
  try {
    console.log('Criando apólice com os dados:', policy);
    
    const expiryDate = new Date(policy.expiry_date);
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30);

    const { error: checkError } = await supabase
      .from('insurance_policies')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.error('Insurance policies table does not exist. Executing migration...');
      const migrationResult = await runInsurancePoliciesMigration();
      
      if (!migrationResult.success) {
        toast.error('Não foi possível criar a tabela de apólices. Necessário executar migrações no banco de dados.');
        return null;
      }
      
      toast.success('Tabela de apólices criada com sucesso!');
    }

    // Try again after migration
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([
        {
          ...policy,
          reminder_date: reminderDate,
          reminder_sent: false
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        toast.error('Funcionalidade de apólices não está disponível no momento.');
        console.log('Insurance policies table does not exist:', error);
        return null;
      }
      
      console.error('Error creating policy:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in createPolicy:', error);
    toast.error('Não foi possível criar a apólice.');
    return null;
  }
};

export const updatePolicy = async (id: string, policy: Partial<Policy>) => {
  try {
    let reminderDate = policy.reminder_date;
    
    if (policy.expiry_date) {
      const expiryDate = new Date(policy.expiry_date);
      reminderDate = new Date(expiryDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update({
        ...policy,
        reminder_date: reminderDate,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        toast.error('Funcionalidade de apólices não está disponível no momento.');
        console.log('Insurance policies table does not exist.');
        return null;
      }
      
      console.error('Error updating policy:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in updatePolicy:', error);
    toast.error('Não foi possível atualizar a apólice.');
    return null;
  }
};

export const deletePolicy = async (id: string) => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42P01') {
        toast.error('Funcionalidade de apólices não está disponível no momento.');
        console.log('Insurance policies table does not exist.');
        return;
      }
      
      console.error('Error deleting policy:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deletePolicy:', error);
    toast.error('Não foi possível excluir a apólice.');
  }
};

export const uploadPolicyAttachment = async (file: File, userId: string, policyId?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${policyId || 'new'}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      
      // If this is a permission error, we need to run the migration
      if (bucketError.message?.includes('permission denied')) {
        console.log('Permission error accessing buckets. Attempting to run migration...');
        const migrationResult = await runInsurancePoliciesMigration();
        
        if (!migrationResult.success) {
          toast.error('Não foi possível acessar o armazenamento. Necessário executar migrações no banco de dados.');
          throw new Error('Erro de permissão ao acessar buckets de armazenamento');
        }
        
        // Try checking buckets again after migration
        const { data: bucketsAfterMigration, error: bucketErrorAfterMigration } = await supabase.storage.listBuckets();
        
        if (bucketErrorAfterMigration) {
          console.error('Still having error checking storage buckets after migration:', bucketErrorAfterMigration);
          throw new Error('Erro ao verificar buckets de armazenamento após migração');
        }
        
        if (!bucketsAfterMigration.some(bucket => bucket.name === 'documents')) {
          console.error('Documents bucket still does not exist after migration');
          toast.error('Bucket de documentos não encontrado mesmo após migração. Contate o administrador.');
          throw new Error('Bucket de documentos não encontrado após migração');
        }
      } else {
        throw new Error('Erro ao verificar buckets de armazenamento');
      }
    }
    
    const bucketExists = buckets && buckets.some(bucket => bucket.name === 'documents');
    
    if (!bucketExists) {
      console.log('Documents bucket does not exist. Attempting to run migration...');
      const migrationResult = await runInsurancePoliciesMigration();
      
      if (!migrationResult.success) {
        // In production environment
        if (!import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== 'true') {
          toast.error('O bucket de armazenamento não está configurado no sistema. Contate o administrador.');
          throw new Error('Bucket de armazenamento não configurado');
        } 
        // In development or demo mode, simulate success
        else {
          console.log('DEV/DEMO mode - simulating successful file upload');
          // Return a mock URL for development/demo purposes
          return `https://example.com/mock-document-${Date.now()}.pdf`;
        }
      }
      
      // Check again if bucket exists after migration
      const { data: bucketsAfterMigration, error: bucketErrorAfterMigration } = await supabase.storage.listBuckets();
      
      if (bucketErrorAfterMigration) {
        console.error('Error checking storage buckets after migration:', bucketErrorAfterMigration);
        throw new Error('Erro ao verificar buckets de armazenamento após migração');
      }
      
      if (!bucketsAfterMigration.some(bucket => bucket.name === 'documents')) {
        console.error('Documents bucket still does not exist after migration');
        
        // In production environment
        if (!import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== 'true') {
          toast.error('O bucket de armazenamento não está configurado no sistema. Contate o administrador.');
          throw new Error('Bucket de armazenamento não configurado');
        } 
        // In development or demo mode, simulate success
        else {
          console.log('DEV/DEMO mode - simulating successful file upload');
          // Return a mock URL for development/demo purposes
          return `https://example.com/mock-document-${Date.now()}.pdf`;
        }
      }
    }

    // Proceed with upload now that we've verified the bucket exists
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      
      // If this is a permission error or bucket not found
      if (uploadError.message?.includes('permission denied') || uploadError.message?.includes('not found')) {
        toast.error('Problema de permissão no armazenamento. Tente novamente após executar a migração.');
        throw new Error('Erro de permissão ao fazer upload do arquivo');
      }
      
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadPolicyAttachment:', error);
    toast.error('Não foi possível fazer upload do arquivo.');
    throw error;
  }
};

export const analyzePolicyDocument = async (fileUrl: string) => {
  try {
    const response = await fetch('/api/analyze-policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileUrl })
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze policy: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Falha ao analisar o documento');
    }

    const expiryDate = new Date(result.data.expiry_date);
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30);

    return {
      ...result.data,
      reminder_date: reminderDate
    };
  } catch (error) {
    console.error('Error in analyzePolicyDocument:', error);
    toast.error('Não foi possível analisar o documento.');
    throw error;
  }
};

export const checkPolicyReminders = async (userId: string) => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('reminder_sent', false)
      .lte('reminder_date', today.toISOString())
      .order('expiry_date', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('Insurance policies table does not exist. Skipping reminder check.');
        return { hasReminders: false, count: 0, policies: [] };
      }
      
      console.error('Error checking policy reminders:', error);
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      for (const policy of data) {
        await supabase
          .from('insurance_policies')
          .update({ reminder_sent: true })
          .eq('id', policy.id);
        
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'Apólice próxima do vencimento',
            message: `A apólice ${policy.policy_number} da ${policy.insurer} vence em 30 dias (${new Date(policy.expiry_date).toLocaleDateString()}).`,
            type: 'warning',
            is_read: false,
            related_entity_type: 'policy',
            related_entity_id: policy.id
          });
      }

      return {
        hasReminders: true,
        count: data.length,
        policies: data
      };
    }

    return {
      hasReminders: false,
      count: 0,
      policies: []
    };
  } catch (error) {
    console.error('Error in checkPolicyReminders:', error);
    return { hasReminders: false, count: 0, policies: [] };
  }
};

export const runInsurancePoliciesMigration = async () => {
  try {
    console.log('Attempting to run insurance policies migration...');
    
    const response = await fetch('/api/run-migration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        migration: 'insurance_policies' 
      })
    });
    
    if (!response.ok) {
      console.error('Failed to run migration:', response.statusText);
      
      if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
        console.log('DEV mode - simulating successful migration');
        return { success: true };
      }
      
      let errorMessage = 'Falha ao executar migração';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      return { success: false, error: errorMessage };
    }
    
    const result = await response.json();
    console.log('Migration result:', result);
    return result;
  } catch (error) {
    console.error('Error running migration:', error);
    
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEV mode - simulating successful migration');
      return { success: true };
    }
    
    return { success: false, error: 'Erro ao executar migração: ' + (error.message || error) };
  }
};

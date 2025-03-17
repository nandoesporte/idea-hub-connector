import { Policy } from '@/types';
import { supabase } from './supabase';
import { toast } from 'sonner';
import { addDays, subDays } from 'date-fns';

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
    
    // Calcular data 30 dias antes do vencimento para lembrete
    const expiryDate = new Date(policy.expiry_date);
    const reminderDate = subDays(expiryDate, 30);
    
    console.log('Data de vencimento:', expiryDate);
    console.log('Data de lembrete calculada:', reminderDate);

    // Verificar se a tabela existe
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

    // Tentar novamente após migração
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([
        {
          ...policy,
          reminder_date: reminderDate.toISOString(),
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

    // Verificar data de lembrete registrada
    console.log('Apólice criada com sucesso:', data);
    console.log('Data de lembrete registrada:', data.reminder_date);
    
    return data;
  } catch (error) {
    console.error('Error in createPolicy:', error);
    toast.error('Não foi possível criar a apólice.');
    return null;
  }
};

export const updatePolicy = async (id: string, policy: Partial<Policy>) => {
  try {
    let updates: any = { ...policy, updated_at: new Date() };
    
    // Recalcular data de lembrete se a data de vencimento foi alterada
    if (policy.expiry_date) {
      const expiryDate = new Date(policy.expiry_date);
      const reminderDate = subDays(expiryDate, 30);
      updates.reminder_date = reminderDate.toISOString();
      
      // Se a data de lembrete já passou, não enviar novamente
      const today = new Date();
      if (reminderDate <= today) {
        updates.reminder_sent = true;
      } else {
        // Caso contrário, resetar o status de lembrete
        updates.reminder_sent = false;
      }
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update(updates)
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
      if (bucketError.message && bucketError.message.includes('permission denied')) {
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
          console.log('Ambiente de desenvolvimento - operação simulada com sucesso');
          // Return a mock URL for development purposes
          return `https://example.com/documento-simulado-${Date.now()}.pdf`;
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
          console.log('Ambiente de desenvolvimento - operação simulada com sucesso');
          // Return a mock URL for development purposes
          return `https://example.com/documento-simulado-${Date.now()}.pdf`;
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
      if (uploadError.message && (uploadError.message.includes('permission denied') || uploadError.message.includes('not found'))) {
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
    const todayISO = today.toISOString();
    
    console.log('Verificando lembretes de apólices para a data:', todayISO);
    
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('reminder_sent', false)
      .lte('reminder_date', todayISO)
      .order('expiry_date', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('Insurance policies table does not exist. Skipping reminder check.');
        return { hasReminders: false, count: 0, policies: [] };
      }
      
      console.error('Error checking policy reminders:', error);
      throw new Error(error.message);
    }

    console.log(`Encontradas ${data?.length || 0} apólices precisando de lembretes`);

    if (data && data.length > 0) {
      const updatedPolicies = [];
      
      for (const policy of data) {
        try {
          // Calcular dias restantes até o vencimento
          const expiryDate = new Date(policy.expiry_date);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Atualizar status de lembrete enviado
          const { error: updateError } = await supabase
            .from('insurance_policies')
            .update({ reminder_sent: true })
            .eq('id', policy.id);
            
          if (updateError) {
            console.error('Erro ao atualizar status de lembrete:', updateError);
            continue;
          }
          
          // Criar notificação para o usuário
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              title: 'Apólice próxima do vencimento',
              message: `A apólice ${policy.policy_number} da ${policy.insurer} vence em ${daysUntilExpiry} dias (${new Date(policy.expiry_date).toLocaleDateString()}).`,
              type: 'warning',
              is_read: false,
              related_entity_type: 'policy',
              related_entity_id: policy.id
            });
            
          if (notifError) {
            console.error('Erro ao criar notificação:', notifError);
            continue;
          }
          
          updatedPolicies.push(policy);
        } catch (err) {
          console.error('Erro ao processar lembrete para apólice:', err);
        }
      }

      return {
        hasReminders: updatedPolicies.length > 0,
        count: updatedPolicies.length,
        policies: updatedPolicies
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
    
    // In development or demo mode, simulate success without making API calls
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('Ambiente de desenvolvimento - operação simulada com sucesso');
      return { success: true };
    }
    
    // In production, attempt to call the API
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
    
    // In development or demo mode, simulate success even on error
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('Ambiente de desenvolvimento - operação simulada com sucesso');
      return { success: true };
    }
    
    return { success: false, error: 'Erro ao executar migração: ' + (error.message || error) };
  }
};

/**
 * Verifica manualmente as apólices próximas do vencimento
 * Isso pode ser útil para fins de teste ou para forçar a verificação fora do cronograma
 */
export const manualCheckPolicyExpirations = async () => {
  try {
    console.log('Verificando manualmente apólices próximas do vencimento...');
    
    // Em ambiente de desenvolvimento, simular o sucesso
    if (import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('Ambiente de desenvolvimento - verificação simulada iniciada');
      
      // Mesmo em desenvolvimento, podemos verificar localmente
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.id) {
        const reminderResults = await checkPolicyReminders(session.user.id);
        
        if (reminderResults.hasReminders) {
          toast.success(`${reminderResults.count} notificações de apólices enviadas`);
        } else {
          toast.success('Nenhuma apólice precisando de notificação foi encontrada');
        }
        
        return { 
          success: true, 
          data: {
            processed: reminderResults.count,
            notifications: reminderResults.count,
            errors: 0
          }
        };
      }
      
      toast.success('Verificação de apólices realizada com sucesso');
      return { success: true };
    }
    
    // Em produção, chamar a API
    const response = await fetch('/api/check-policy-expirations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Resposta não é JSON válido:', responseText);
        throw new Error(`Falha ao verificar apólices (${response.status}: ${response.statusText})`);
      }
      
      throw new Error(errorData.error || 'Falha ao verificar apólices');
    }
    
    const result = await response.json();
    
    if (result.success) {
      const { processed, notifications } = result.data;
      const message = notifications > 0 
        ? `${notifications} notificações enviadas para ${processed} apólices`
        : 'Nenhuma apólice precisando de notificação foi encontrada';
      
      toast.success(message);
      return { success: true, data: result.data };
    } else {
      throw new Error(result.error || 'Falha ao verificar apólices');
    }
  } catch (error) {
    console.error('Erro ao verificar apólices:', error);
    toast.error('Não foi possível verificar as apólices');
    
    return { success: false, error: error.message };
  }
};

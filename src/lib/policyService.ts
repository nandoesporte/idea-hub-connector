
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
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
        console.log('Insurance policies table does not exist. Returning empty array.');
        return [];
      }
      
      console.error('Error fetching policies:', error);
      throw new Error(error.message);
    }

    // Convertendo as datas de string para Date
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
    // Return empty array instead of throwing for better UX
    return [];
  }
};

export const createPolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>) => {
  try {
    // Definir a data de lembrete 30 dias antes do vencimento
    const expiryDate = new Date(policy.expiry_date);
    const reminderDate = new Date(expiryDate);
    reminderDate.setDate(reminderDate.getDate() - 30);

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
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
        toast.error('Funcionalidade de apólices não está disponível no momento.');
        console.log('Insurance policies table does not exist.');
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
    // Se a data de expiração foi atualizada, atualize também a data de lembrete
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
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
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
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
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

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
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

// Função para analisar documento de apólice com GPT-4
export const analyzePolicyDocument = async (fileUrl: string) => {
  try {
    // Aqui enviamos o URL do arquivo para nossa API que usará GPT-4 para análise
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

    // Adicionar data de lembrete 30 dias antes do vencimento
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

// Verificar lembretes de apólices que estão próximas do vencimento
export const checkPolicyReminders = async (userId: string) => {
  try {
    const today = new Date();
    
    // Buscar políticas ativas com lembretes para hoje ou no passado que ainda não foram enviados
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('reminder_sent', false)
      .lte('reminder_date', today.toISOString())
      .order('expiry_date', { ascending: true });

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') { // PostgreSQL code for "relation does not exist"
        console.log('Insurance policies table does not exist. Skipping reminder check.');
        return { hasReminders: false, count: 0, policies: [] };
      }
      
      console.error('Error checking policy reminders:', error);
      throw new Error(error.message);
    }

    // Processar apólices que precisam de lembretes
    if (data && data.length > 0) {
      for (const policy of data) {
        // Marcar como lembrete enviado
        await supabase
          .from('insurance_policies')
          .update({ reminder_sent: true })
          .eq('id', policy.id);
        
        // Enviar notificação
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
    // Return empty result instead of throwing
    return { hasReminders: false, count: 0, policies: [] };
  }
};


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
    throw error;
  }
};

export const createPolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'reminder_sent'>) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([
        {
          ...policy,
          reminder_sent: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating policy:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in createPolicy:', error);
    throw error;
  }
};

export const updatePolicy = async (id: string, policy: Partial<Policy>) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({
        ...policy,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in updatePolicy:', error);
    throw error;
  }
};

export const deletePolicy = async (id: string) => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting policy:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deletePolicy:', error);
    throw error;
  }
};

export const uploadPolicyAttachment = async (file: File, userId: string, policyId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${policyId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
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
    throw error;
  }
};

export const analyzePolicyDocument = async (file: File) => {
  try {
    // Esta função seria implementada para integrar com alguma API de análise de documentos
    // Por enquanto, retornamos um mock
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulando processamento
    
    return {
      success: true,
      data: {
        policy_number: `POL-${Math.floor(Math.random() * 10000)}`,
        issue_date: new Date(),
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 ano após
        insurer: "Seguradora Exemplo",
        customer_name: "Cliente Exemplo",
        coverage_amount: 150000,
        premium: 1200,
        type: "auto"
      }
    };
  } catch (error) {
    console.error('Error in analyzePolicyDocument:', error);
    return {
      success: false,
      error: 'Falha ao analisar o documento'
    };
  }
};

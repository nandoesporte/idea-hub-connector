
import { supabase } from './supabase';
import { InsurancePolicy } from '@/types';
import { createNotification } from './notificationService';
import { toast } from 'sonner';

export const fetchUserPolicies = async (userId: string): Promise<InsurancePolicy[]> => {
  try {
    console.log('Fetching policies for user:', userId);
    
    // Check if table exists before querying
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('insurance_policies')
      .select('count', { count: 'exact', head: true });

    if (tableCheckError) {
      console.error('Error checking if table exists:', tableCheckError);
      // Create table if it doesn't exist
      if (tableCheckError.message.includes('does not exist')) {
        toast.error('Tabela de apólices não configurada. Contate o administrador.');
        return [];
      }
      throw tableCheckError;
    }
    
    // Check if user_id column exists
    try {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        
        // Handle the specific case of user_id column not existing
        if (error.message.includes('user_id does not exist')) {
          toast.error('Sistema de apólices não está configurado corretamente. Contate o administrador.');
          return [];
        }
        
        throw error;
      }

      if (!data) return [];

      return data.map(policy => ({
        ...policy,
        id: policy.id,
        userId: policy.user_id,
        policyNumber: policy.policy_number,
        customerName: policy.customer_name,
        customerPhone: policy.customer_phone,
        issueDate: new Date(policy.issue_date),
        expiryDate: new Date(policy.expiry_date),
        createdAt: new Date(policy.created_at),
        updatedAt: new Date(policy.updated_at),
        attachmentUrl: policy.attachment_url,
        coverageAmount: policy.coverage_amount,
        premium: policy.premium,
        reminderSent: policy.reminder_sent,
        reminderDate: policy.reminder_date ? new Date(policy.reminder_date) : undefined
      })) as InsurancePolicy[];
    } catch (error) {
      console.error('Error in policy query:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in fetchUserPolicies:', error);
    throw error;
  }
};

export const uploadPolicyDocument = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Uploading policy document for user:', userId);
    
    // Check if documents bucket exists, try to create it if not
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      toast.error('Erro no sistema de armazenamento. Contate o administrador.');
      throw bucketsError;
    }
    
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
    
    if (!documentsBucketExists) {
      console.log('Documents bucket does not exist, attempting to create it');
      toast.error('O bucket de documentos não existe. Contate o administrador para configurar o armazenamento.');
      throw new Error('Storage bucket "documents" does not exist');
    }
    
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    // Upload directly to the documents bucket
    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading policy document:', uploadError);
      
      // Check specific error types and provide better messages
      if (uploadError.message?.includes('bucket not found')) {
        toast.error('Falha no sistema de armazenamento. Por favor, contate o suporte.');
        throw new Error('Storage bucket not found. Please contact admin to set up storage.');
      }
      
      if (uploadError.message?.includes('row-level security')) {
        toast.error('Erro de permissão. Por favor, tente fazer login novamente.');
        throw new Error('Permission denied due to RLS policy. Please check storage permissions.');
      }
      
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully, URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPolicyDocument:', error);
    
    // Provide a user-friendly error message
    if (!toast.dismiss()) {
      toast.error('Erro ao fazer upload do documento. Verifique sua conexão ou tente novamente mais tarde.');
    }
    
    throw error;
  }
};

interface AnalyzeResult {
  policyNumber: string;
  customerName: string;
  customerPhone?: string;
  issueDate: string;
  expiryDate: string;
  insurer: string;
  coverageAmount: number;
  premium: number;
  type: string;
}

export const analyzePolicyDocument = async (url: string): Promise<AnalyzeResult> => {
  try {
    console.log('Analyzing policy document:', url);
    
    const response = await fetch('/api/analyze-policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = await response.text();
      }
      
      console.error('Error response from analyze-policy:', errorDetails);
      
      let errorMessage = 'Não foi possível analisar o documento.';
      if (typeof errorDetails === 'object' && errorDetails.error) {
        errorMessage = errorDetails.error;
      }
      
      toast.error(errorMessage);
      throw new Error(`Error analyzing policy: ${response.statusText}. Details: ${JSON.stringify(errorDetails)}`);
    }

    const result = await response.json();
    console.log('Analysis result:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing policy document:', error);
    toast.error('Não foi possível analisar o documento. Por favor, verifique o formato e tente novamente.');
    throw error;
  }
};

export const createPolicy = async (policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<InsurancePolicy> => {
  const { data, error } = await supabase
    .from('insurance_policies')
    .insert({
      user_id: policy.userId,
      policy_number: policy.policyNumber,
      customer_name: policy.customerName,
      customer_phone: policy.customerPhone,
      issue_date: policy.issueDate.toISOString(),
      expiry_date: policy.expiryDate.toISOString(),
      insurer: policy.insurer,
      coverage_amount: policy.coverageAmount,
      premium: policy.premium,
      status: policy.status,
      type: policy.type,
      attachment_url: policy.attachmentUrl,
      notes: policy.notes,
      reminder_sent: false
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating policy:', error);
    throw error;
  }

  // Create notification for new policy
  await createNotification({
    userId: policy.userId,
    title: 'Nova Apólice de Seguro',
    message: `Apólice ${policy.policyNumber} da ${policy.insurer} foi adicionada com sucesso.`,
    type: 'success',
    relatedEntityType: 'policy',
    relatedEntityId: data.id
  });

  return {
    ...data,
    id: data.id,
    userId: data.user_id,
    policyNumber: data.policy_number,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    issueDate: new Date(data.issue_date),
    expiryDate: new Date(data.expiry_date),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    attachmentUrl: data.attachment_url,
    coverageAmount: data.coverage_amount,
    premium: data.premium,
    reminderSent: data.reminder_sent,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined
  } as InsurancePolicy;
};

export const deletePolicy = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('insurance_policies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting policy:', error);
    throw error;
  }
};

export const updatePolicy = async (id: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy> => {
  const updateData: Record<string, any> = {};
  
  if (updates.policyNumber) updateData.policy_number = updates.policyNumber;
  if (updates.customerName) updateData.customer_name = updates.customerName;
  if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
  if (updates.issueDate) updateData.issue_date = updates.issueDate.toISOString();
  if (updates.expiryDate) updateData.expiry_date = updates.expiryDate.toISOString();
  if (updates.insurer) updateData.insurer = updates.insurer;
  if (updates.coverageAmount !== undefined) updateData.coverage_amount = updates.coverageAmount;
  if (updates.premium !== undefined) updateData.premium = updates.premium;
  if (updates.status) updateData.status = updates.status;
  if (updates.type) updateData.type = updates.type;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.reminderSent !== undefined) updateData.reminder_sent = updates.reminderSent;
  if (updates.reminderDate !== undefined) updateData.reminder_date = updates.reminderDate?.toISOString();
  
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('insurance_policies')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating policy:', error);
    throw error;
  }

  return {
    ...data,
    id: data.id,
    userId: data.user_id,
    policyNumber: data.policy_number,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    issueDate: new Date(data.issue_date),
    expiryDate: new Date(data.expiry_date),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    attachmentUrl: data.attachment_url,
    coverageAmount: data.coverage_amount,
    premium: data.premium,
    reminderSent: data.reminder_sent,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : undefined
  } as InsurancePolicy;
};

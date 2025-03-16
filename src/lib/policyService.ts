import { supabase } from './supabase';
import { InsurancePolicy } from '@/types';
import { createNotification } from './notificationService';
import { toast } from 'sonner';

export const fetchUserPolicies = async (userId: string): Promise<InsurancePolicy[]> => {
  try {
    console.log('Fetching policies for user:', userId);
    
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching policies:', error);
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
    console.error('Error in fetchUserPolicies:', error);
    throw error;
  }
};

export const uploadPolicyDocument = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('Uploading policy document for user:', userId);
    
    // Check if the bucket exists, if not, create it
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }
    
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
    
    if (!documentsBucketExists) {
      console.log('Documents bucket does not exist, creating...');
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('documents', { public: true });
        
      if (createBucketError) {
        console.error('Error creating documents bucket:', createBucketError);
        throw createBucketError;
      }
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading policy document:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully, URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadPolicyDocument:', error);
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
      const errorText = await response.text();
      console.error('Error response from analyze-policy:', errorText);
      throw new Error(`Error analyzing policy: ${response.statusText}. Details: ${errorText}`);
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


import { supabase } from './supabase';
import { Policy } from '@/types';
import { toast } from 'sonner';

export const fetchPolicies = async (userId: string) => {
  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true });

  if (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }

  return data.map(policy => ({
    ...policy,
    issueDate: new Date(policy.issue_date),
    expiryDate: new Date(policy.expiry_date),
    coverageAmount: Number(policy.coverage_amount),
    premium: Number(policy.premium),
    attachmentUrl: policy.attachment_url,
    reminderSent: policy.reminder_sent,
    reminderDate: policy.reminder_date ? new Date(policy.reminder_date) : null,
    createdAt: new Date(policy.created_at),
    updatedAt: new Date(policy.updated_at)
  })) as Policy[];
};

export const fetchPolicy = async (policyId: string) => {
  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*')
    .eq('id', policyId)
    .single();

  if (error) {
    console.error('Error fetching policy:', error);
    throw error;
  }

  return {
    ...data,
    issueDate: new Date(data.issue_date),
    expiryDate: new Date(data.expiry_date),
    coverageAmount: Number(data.coverage_amount),
    premium: Number(data.premium),
    attachmentUrl: data.attachment_url,
    reminderSent: data.reminder_sent,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  } as Policy;
};

export const createPolicy = async (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt' | 'reminderSent' | 'reminderDate'>) => {
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
      notes: policy.notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating policy:', error);
    throw error;
  }

  return {
    ...data,
    issueDate: new Date(data.issue_date),
    expiryDate: new Date(data.expiry_date),
    coverageAmount: Number(data.coverage_amount),
    premium: Number(data.premium),
    attachmentUrl: data.attachment_url,
    reminderSent: data.reminder_sent,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  } as Policy;
};

export const updatePolicy = async (id: string, policy: Partial<Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const updates: Record<string, any> = {};
  
  if (policy.userId) updates.user_id = policy.userId;
  if (policy.policyNumber) updates.policy_number = policy.policyNumber;
  if (policy.customerName) updates.customer_name = policy.customerName;
  if (policy.customerPhone) updates.customer_phone = policy.customerPhone;
  if (policy.issueDate) updates.issue_date = policy.issueDate.toISOString();
  if (policy.expiryDate) updates.expiry_date = policy.expiryDate.toISOString();
  if (policy.insurer) updates.insurer = policy.insurer;
  if (policy.coverageAmount) updates.coverage_amount = policy.coverageAmount;
  if (policy.premium) updates.premium = policy.premium;
  if (policy.status) updates.status = policy.status;
  if (policy.type) updates.type = policy.type;
  if (policy.attachmentUrl !== undefined) updates.attachment_url = policy.attachmentUrl;
  if (policy.notes !== undefined) updates.notes = policy.notes;
  if (policy.reminderSent !== undefined) updates.reminder_sent = policy.reminderSent;
  if (policy.reminderDate) updates.reminder_date = policy.reminderDate.toISOString();

  const { data, error } = await supabase
    .from('insurance_policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating policy:', error);
    throw error;
  }

  return {
    ...data,
    issueDate: new Date(data.issue_date),
    expiryDate: new Date(data.expiry_date),
    coverageAmount: Number(data.coverage_amount),
    premium: Number(data.premium),
    attachmentUrl: data.attachment_url,
    reminderSent: data.reminder_sent,
    reminderDate: data.reminder_date ? new Date(data.reminder_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  } as Policy;
};

export const deletePolicy = async (id: string) => {
  const { error } = await supabase
    .from('insurance_policies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting policy:', error);
    throw error;
  }

  return true;
};

export const uploadPolicyAttachment = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Erro ao fazer upload do arquivo');
    throw error;
  }
};

export const analyzePolicyDocument = async (fileUrl: string, userId: string) => {
  try {
    // Call OpenAI function to analyze the policy document
    const response = await fetch('/api/analyze-policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileUrl,
        userId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao analisar documento');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing policy document:', error);
    toast.error('Erro ao analisar o documento');
    throw error;
  }
};

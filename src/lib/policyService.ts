import { supabase } from './supabase';
import { InsurancePolicy } from '@/types';
import { createNotification } from './notificationService';
import { toast } from 'sonner';

export const fetchUserPolicies = async (userId: string): Promise<InsurancePolicy[]> => {
  try {
    console.log('Fetching policies for user:', userId);
    
    // Check if table exists and has user_id column
    console.log('Checking if insurance_policies table exists with user_id column');
    
    // First, check if table exists
    const { data: tableInfo, error: schemaError } = await supabase
      .from('insurance_policies')
      .select('id')
      .limit(1);
      
    if (schemaError) {
      console.error('Error checking if table exists:', schemaError);
      
      if (schemaError.message.includes('does not exist')) {
        console.error('Table does not exist:', schemaError.message);
        toast.error('Tabela de apólices não existe. Contate o administrador.');
        return [];
      }
      
      throw schemaError;
    }
    
    console.log('Table exists, checking columns structure');
    
    try {
      console.log('Querying insurance_policies for user:', userId);
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        
        // Handle the specific case of user_id column not existing
        if (error.message.includes('user_id does not exist')) {
          console.error('Column user_id does not exist in table insurance_policies:', error.message);
          toast.error('Sistema de apólices não está configurado corretamente. Contate o administrador.');
          return [];
        }
        
        throw error;
      }

      if (!data) {
        console.log('No policies found for user:', userId);
        return [];
      }

      console.log(`Found ${data.length} policies for user:`, userId);
      
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
    console.log('Starting policy document upload for user:', userId);
    console.log('File details:', { name: file.name, type: file.type, size: file.size });
    
    // Check if documents bucket exists, try to create it if not
    console.log('Checking if documents bucket exists');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      toast.error('Erro no sistema de armazenamento. Contate o administrador.');
      throw bucketsError;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
    
    if (!documentsBucketExists) {
      console.error('Documents bucket does not exist');
      // Try to create the bucket
      try {
        console.log('Attempting to create documents bucket');
        const { data: newBucket, error: createError } = await supabase
          .storage
          .createBucket('documents', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
          });
          
        if (createError) {
          console.error('Error creating documents bucket:', createError);
          toast.error('Não foi possível criar o bucket de documentos. Contate o administrador.');
          throw new Error(`Failed to create storage bucket: ${createError.message}`);
        }
        
        console.log('Documents bucket created successfully:', newBucket);
        
        // Set bucket policy to allow public access
        const { error: policyError } = await supabase
          .storage
          .updateBucket('documents', {
            public: true
          });
          
        if (policyError) {
          console.error('Error setting bucket policy:', policyError);
        } else {
          console.log('Bucket policy updated successfully');
        }
      } catch (createBucketError) {
        console.error('Exception while creating bucket:', createBucketError);
        toast.error('O bucket de documentos não existe. Contate o administrador para configurar o armazenamento.');
        throw new Error('Storage bucket "documents" does not exist');
      }
    } else {
      console.log('Documents bucket exists');
    }
    
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `policies/${fileName}`;

    console.log('Uploading file to path:', filePath);

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
        console.error('Bucket not found error:', uploadError.message);
        toast.error('Falha no sistema de armazenamento. Por favor, contate o suporte.');
        throw new Error('Storage bucket not found. Please contact admin to set up storage.');
      }
      
      if (uploadError.message?.includes('row-level security')) {
        console.error('RLS policy error:', uploadError.message);
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

export const analyzePolicyDocument = async (url: string): Promise<any> => {
  try {
    console.log('Analyzing policy document:', url);
    
    console.log('Sending request to analyze-policy Edge Function');
    const response = await fetch('/api/analyze-policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('Received response from analyze-policy:', { 
      status: response.status, 
      statusText: response.statusText 
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
        console.error('Error response JSON from analyze-policy:', errorDetails);
      } catch (e) {
        errorDetails = await response.text();
        console.error('Error response text from analyze-policy:', errorDetails);
      }
      
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

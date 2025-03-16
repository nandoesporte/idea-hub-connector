
import { supabase } from './supabase';
import { PolicyData } from '@/types';
import { toast } from 'sonner';

// Get all insurance policies from Supabase
export const getAllPolicies = async (): Promise<PolicyData[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map data to match PolicyData interface
    return data as PolicyData[];
  } catch (error) {
    console.error('Failed to get policies:', error);
    throw new Error(`Failed to get policies: ${error}`);
  }
};

// Simulate receiving a WhatsApp message with policy information
export const simulateWhatsAppPolicyMessage = async (): Promise<PolicyData | null> => {
  try {
    // Generate a random policy
    const policy = {
      policy_number: `APL-${Math.floor(100000 + Math.random() * 900000)}`,
      customer: getRandomName(),
      insurer: getRandomInsurer(),
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      premium_amount: parseFloat((1000 + Math.random() * 9000).toFixed(2)),
      document_url: 'https://example.com/policy-document.pdf',
      whatsapp_message_id: `msg_${Math.random().toString(36).substring(2, 15)}`,
      status: 'active'
    };
    
    // Insert the new policy into Supabase
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([policy])
      .select()
      .single();
    
    if (error) throw error;
    
    return data as PolicyData;
  } catch (error) {
    console.error('Failed to simulate WhatsApp message:', error);
    throw error;
  }
};

// Register webhook URL for WhatsApp
export const registerWhatsAppWebhook = (url: string): void => {
  try {
    // In a real application, this would call your WhatsApp Business API
    // For the simulation, we'll just save to localStorage
    localStorage.setItem('whatsgw_webhook_url', url);
    console.log(`Webhook URL registered: ${url}`);
  } catch (error) {
    console.error('Failed to register webhook:', error);
    throw error;
  }
};

// Check if WhatsApp integration is configured
export const isWhatsAppConfigured = (): boolean => {
  return localStorage.getItem('whatsgw_webhook_url') !== null;
};

// Delete a policy
export const deletePolicy = async (policyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Failed to delete policy:', error);
    return false;
  }
};

// Helper functions to generate random data
const getRandomName = (): string => {
  const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Luiza', 'Rafael', 'Juliana'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Ferreira', 'Costa', 'Rodrigues'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const getRandomInsurer = (): string => {
  const insurers = ['Porto Seguro', 'Bradesco Seguros', 'SulAmérica', 'Liberty Seguros', 'Mapfre', 'Allianz', 'HDI Seguros', 'Tokio Marine'];
  
  return insurers[Math.floor(Math.random() * insurers.length)];
};

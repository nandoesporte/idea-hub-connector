import { supabase } from './supabase';

// Store API key in localStorage
const API_KEY_STORAGE_KEY = 'whatsgw_api_key';
const API_URL_STORAGE_KEY = 'whatsgw_api_url';
const LOGS_STORAGE_KEY = 'whatsgw_logs';

// Check if WhatsApp is configured
export const isWhatsAppConfigured = () => {
  try {
    // Use import.meta.env for Vite instead of process.env
    const envApiKey = import.meta.env.VITE_WHATSGW_API_KEY;
    const envApiUrl = import.meta.env.VITE_WHATSGW_API_URL;
    
    // First check for environment variables
    if (envApiKey && envApiUrl) {
      return true;
    }
    
    // Then check localStorage
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedApiUrl = localStorage.getItem(API_URL_STORAGE_KEY);
    
    return !!(storedApiKey && storedApiUrl);
  } catch (error) {
    console.error('Error checking WhatsApp configuration:', error);
    return false;
  }
};

// Set API key and URL
export const setApiKey = (apiKey: string, apiUrl: string) => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  localStorage.setItem(API_URL_STORAGE_KEY, apiUrl);
};

// Get API key
export const getApiKey = () => {
  // Try to get from environment first
  const envApiKey = import.meta.env.VITE_WHATSGW_API_KEY;
  const envApiUrl = import.meta.env.VITE_WHATSGW_API_URL;
  
  if (envApiKey && envApiUrl) {
    return { apiKey: envApiKey, apiUrl: envApiUrl };
  }
  
  // Fall back to localStorage
  return {
    apiKey: localStorage.getItem(API_KEY_STORAGE_KEY) || '',
    apiUrl: localStorage.getItem(API_URL_STORAGE_KEY) || ''
  };
};

// Add a log entry
export const addLogEntry = (entry: { action: string; status: 'success' | 'error'; message: string; timestamp: string; details?: any }) => {
  try {
    const logs = getLogHistory();
    logs.unshift(entry);
    
    // Keep only the last 100 logs
    const trimmedLogs = logs.slice(0, 100);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error adding log entry:', error);
  }
};

// Get log history
export const getLogHistory = () => {
  try {
    const logsJson = localStorage.getItem(LOGS_STORAGE_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error getting log history:', error);
    return [];
  }
};

// Clear log history
export const clearLogHistory = () => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([]));
};

// Send a test message
export const sendTestMessage = async () => {
  try {
    const { apiKey, apiUrl } = getApiKey();
    
    if (!apiKey || !apiUrl) {
      throw new Error('API key or URL not configured');
    }
    
    const response = await fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: '5511999999999', // Default test number
        message: 'Test message from WhatsGW integration',
        isGroup: false
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test message');
    }
    
    addLogEntry({
      action: 'TEST_MESSAGE',
      status: 'success',
      message: 'Test message sent successfully',
      timestamp: new Date().toISOString(),
      details: data
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending test message:', error);
    
    addLogEntry({
      action: 'TEST_MESSAGE',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error };
  }
};

// Send a test message to a specific number
export const sendTestToSpecificNumber = async (phoneNumber: string) => {
  try {
    const { apiKey, apiUrl } = getApiKey();
    
    if (!apiKey || !apiUrl) {
      throw new Error('API key or URL not configured');
    }
    
    // Format the phone number (remove any non-digit characters)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    const response = await fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: 'Test message from WhatsGW integration',
        isGroup: false
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test message');
    }
    
    addLogEntry({
      action: 'TEST_MESSAGE_SPECIFIC',
      status: 'success',
      message: `Test message sent successfully to ${phoneNumber}`,
      timestamp: new Date().toISOString(),
      details: data
    });
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending test message to ${phoneNumber}:`, error);
    
    addLogEntry({
      action: 'TEST_MESSAGE_SPECIFIC',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error };
  }
};

// Send a reminder message for an event
export const sendEventReminder = async (
  event: { 
    title: string; 
    description: string; 
    date: Date; 
    duration: number; 
    contactPhone: string; 
  }
) => {
  try {
    if (!isWhatsAppConfigured()) {
      console.log('WhatsApp not configured, skipping reminder');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const { apiKey, apiUrl } = getApiKey();
    
    // Format the date for the message
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(event.date);

    // Format the phone number (remove any non-digit characters)
    const formattedPhone = event.contactPhone.replace(/\D/g, '');
    
    // Create the message
    const message = `🔔 *Lembrete de Evento*\n\n*${event.title}*\n${event.description}\n\n📅 Data: ${formattedDate}\n⏱️ Duração: ${event.duration} minutos`;
    
    // Send the reminder via WhatsApp
    const response = await fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        isGroup: false
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reminder');
    }
    
    addLogEntry({
      action: 'EVENT_REMINDER',
      status: 'success',
      message: `Reminder sent for event "${event.title}" to ${formattedPhone}`,
      timestamp: new Date().toISOString(),
      details: { event, response: data }
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending event reminder:', error);
    
    addLogEntry({
      action: 'EVENT_REMINDER',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error };
  }
};

// Interface for policy data
export interface PolicyData {
  id?: string;
  user_id?: string;
  policy_number: string;
  policy_type: string;
  expiry_date: string;
  premium_amount: number;
  status: 'active' | 'expired' | 'pending';
  details?: any;
  created_at?: string;
  updated_at?: string;
}

// Save policy
export const savePolicy = async (policyData: PolicyData) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([{
        ...policyData,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving policy:', error);
    return { success: false, error };
  }
};

// Get policies for current user
export const getPolicies = async () => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching policies:', error);
    return { success: false, error, data: [] };
  }
};

// Delete policy
export const deletePolicy = async (policyId: string) => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting policy:', error);
    return { success: false, error };
  }
};

// Update policy
export const updatePolicy = async (policyId: string, updates: Partial<PolicyData>) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', policyId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating policy:', error);
    return { success: false, error };
  }
};

// Send policy information via WhatsApp
export const sendPolicyInfo = async (policy: PolicyData, phoneNumber: string) => {
  try {
    if (!isWhatsAppConfigured()) {
      console.log('WhatsApp not configured, skipping policy info');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const { apiKey, apiUrl } = getApiKey();
    
    // Format the expiry date
    const expiryDate = new Date(policy.expiry_date);
    const formattedExpiryDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(expiryDate);

    // Format the phone number (remove any non-digit characters)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Create the message
    const message = `📋 *Informações da Apólice*\n\n*Número da Apólice:* ${policy.policy_number}\n*Tipo:* ${policy.policy_type}\n*Validade:* ${formattedExpiryDate}\n*Valor do Prêmio:* R$ ${policy.premium_amount.toFixed(2)}\n*Status:* ${policy.status === 'active' ? 'Ativa' : policy.status === 'expired' ? 'Expirada' : 'Pendente'}`;
    
    // Send the policy info via WhatsApp
    const response = await fetch(`${apiUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        isGroup: false
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send policy information');
    }
    
    // Log the action
    addLogEntry({
      action: 'POLICY_INFO',
      status: 'success',
      message: `Policy information for "${policy.policy_number}" sent to ${formattedPhone}`,
      timestamp: new Date().toISOString(),
      details: { policy, response: data }
    });
    
    // Also save to the policy_reminder_logs table
    await supabase
      .from('policy_reminder_logs')
      .insert([{
        policy_id: policy.id,
        sent_at: new Date().toISOString(),
        sent_to: formattedPhone,
        message: message,
        status: 'success'
      }]);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending policy information:', error);
    
    // Log the error
    addLogEntry({
      action: 'POLICY_INFO',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Also save the error to the policy_reminder_logs table if we have a policy ID
    if (policy.id) {
      await supabase
        .from('policy_reminder_logs')
        .insert([{
          policy_id: policy.id,
          sent_at: new Date().toISOString(),
          sent_to: phoneNumber,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }]);
    }
    
    return { success: false, error };
  }
};

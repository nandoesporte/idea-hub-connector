
import { supabase } from './supabase';

// API Key Management
export const setApiKey = async (apiKey: string, apiUrl?: string): Promise<void> => {
  const url = apiUrl || 'https://app.whatsgw.com.br/api/v1';
  localStorage.setItem('whatsgw_api_key', apiKey);
  localStorage.setItem('whatsgw_api_url', url);
  console.log('Setting API key:', apiKey, 'and URL:', url);
  return Promise.resolve();
};

export const getApiKey = (): { apiKey: string; apiUrl: string } => {
  const apiKey = localStorage.getItem('whatsgw_api_key') || '';
  const apiUrl = localStorage.getItem('whatsgw_api_url') || 'https://app.whatsgw.com.br/api/v1';
  return { apiKey, apiUrl };
};

export const isWhatsAppConfigured = (): boolean => {
  const { apiKey } = getApiKey();
  return !!apiKey && apiKey.trim() !== '';
};

// Message Sending Functions
export const sendWhatsAppMessage = async (params: { phone: string; message: string }): Promise<boolean> => {
  const { phone, message } = params;
  console.log(`Sending WhatsApp message to ${phone}: ${message}`);
  
  try {
    // Just a placeholder for actual implementation
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

export const sendTestMessage = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  try {
    const success = await sendWhatsAppMessage({
      phone: phoneNumber,
      message: 'This is a test message'
    });
    return { 
      success, 
      message: success ? 'Message sent successfully' : 'Failed to send message'
    };
  } catch (error) {
    console.error("Error in sendTestMessage:", error);
    return { success: false, message: 'Error sending test message' };
  }
};

export const sendTestToSpecificNumber = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const success = await sendWhatsAppMessage({
      phone: '44988057213',
      message: 'This is a test message to a specific number'
    });
    return { 
      success, 
      message: success ? 'Message sent successfully to 44988057213' : 'Failed to send message'
    };
  } catch (error) {
    console.error("Error in sendTestToSpecificNumber:", error);
    return { success: false, message: 'Error sending test message' };
  }
};

// Event Notifications
export const sendEventReminder = async (event: any): Promise<boolean> => {
  try {
    if (!event.contactPhone) {
      console.log('No phone number provided for event reminder');
      return false;
    }
    
    const message = `Reminder: ${event.title} on ${new Date(event.date).toLocaleString()}`;
    return await sendWhatsAppMessage({
      phone: event.contactPhone,
      message: message
    });
  } catch (error) {
    console.error("Error sending event reminder:", error);
    return false;
  }
};

export const notifyAdminsAboutEvent = async (event: any): Promise<number> => {
  try {
    const message = `New event created: ${event.title} on ${new Date(event.date).toLocaleString()}`;
    
    // Get admin numbers from localStorage
    const adminNumbers = getAdminNumbers();
    if (adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      const success = await sendWhatsAppMessage({
        phone: number,
        message: message
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error("Error notifying admins:", error);
    return 0;
  }
};

export const notifyAdminsAboutSystemEvent = async (message: string): Promise<number> => {
  try {
    // Get admin numbers from localStorage
    const adminNumbers = getAdminNumbers();
    if (adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      const success = await sendWhatsAppMessage({
        phone: number,
        message: `System notification: ${message}`
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error("Error notifying admins about system event:", error);
    return 0;
  }
};

// Helper function to get admin numbers
const getAdminNumbers = (): string[] => {
  try {
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (savedNumbers) {
      const parsedNumbers = JSON.parse(savedNumbers);
      return Array.isArray(parsedNumbers) ? parsedNumbers.filter(num => num && num.trim() !== '') : [];
    }
  } catch (error) {
    console.error('Error parsing admin numbers from localStorage:', error);
  }
  return [];
};

// Log Management
export const getLogHistory = (): any[] => {
  try {
    const logs = localStorage.getItem('whatsgw_logs');
    if (logs) {
      return JSON.parse(logs);
    }
  } catch (error) {
    console.error("Error getting log history:", error);
  }
  return [];
};

export const clearLogHistory = (): void => {
  localStorage.removeItem('whatsgw_logs');
  console.log('Clearing WhatsApp log history');
};

// API Testing
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection');
    const { apiKey, apiUrl } = getApiKey();
    
    if (!apiKey) {
      console.log('No API key configured');
      return false;
    }
    
    // Placeholder for actual API testing
    // In a real implementation, this would make a request to the WhatsApp API
    return true;
  } catch (error) {
    console.error("Error testing API connection:", error);
    return false;
  }
};

// Policy Management functions
export const getAllPolicies = async (): Promise<any[]> => {
  try {
    // In a real implementation, this would fetch from Supabase
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching policies:", error);
      throw new Error("Failed to get policies: " + error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllPolicies:", error);
    throw error;
  }
};

export const simulateWhatsAppPolicyMessage = async (): Promise<any> => {
  try {
    // Simulate a policy being received and processed
    const newPolicy = {
      policy_number: `POL-${Math.floor(Math.random() * 10000)}`,
      customer: "Simulated Customer",
      insurer: "Example Insurance Company",
      start_date: new Date(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      premium_amount: Math.floor(Math.random() * 1000) + 500,
      document_url: "https://example.com/policy.pdf",
      status: "active"
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([newPolicy])
      .select();
      
    if (error) {
      console.error("Error inserting simulated policy:", error);
      throw error;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error("Error in simulateWhatsAppPolicyMessage:", error);
    throw error;
  }
};

export const registerWhatsAppWebhook = (webhookUrl: string): void => {
  localStorage.setItem('whatsgw_webhook_url', webhookUrl);
  console.log('Saved webhook URL:', webhookUrl);
};

export const deletePolicy = async (policyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);
      
    if (error) {
      console.error("Error deleting policy:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deletePolicy:", error);
    return false;
  }
};

export default {
  setApiKey,
  getApiKey,
  isWhatsAppConfigured,
  sendWhatsAppMessage,
  sendTestMessage,
  sendTestToSpecificNumber,
  sendEventReminder,
  notifyAdminsAboutEvent,
  notifyAdminsAboutSystemEvent,
  getLogHistory,
  clearLogHistory,
  testApiConnection,
  getAllPolicies,
  simulateWhatsAppPolicyMessage,
  registerWhatsAppWebhook,
  deletePolicy
};

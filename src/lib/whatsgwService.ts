import { supabase } from './supabase';
import { PolicyData, VoiceCommandEvent } from '@/types';
import { toast } from 'sonner';

// API Management
export const setApiKey = (apiKey: string, apiUrl: string = 'https://app.whatsgw.com.br/api/v1'): void => {
  localStorage.setItem('whatsgw_api_key', apiKey);
  localStorage.setItem('whatsgw_api_url', apiUrl);
};

export const getApiKey = (): { apiKey: string, apiUrl: string } => {
  return {
    apiKey: localStorage.getItem('whatsgw_api_key') || '',
    apiUrl: localStorage.getItem('whatsgw_api_url') || 'https://app.whatsgw.com.br/api/v1'
  };
};

// Log Management
export const logApiOperation = (operation: string, status: 'success' | 'error', details: any): void => {
  try {
    const logs = JSON.parse(localStorage.getItem('whatsgw_logs') || '[]');
    logs.unshift({
      timestamp: new Date().toISOString(),
      operation,
      status,
      details: typeof details === 'object' ? JSON.stringify(details) : details
    });
    
    // Keep only latest 100 logs
    const trimmedLogs = logs.slice(0, 100);
    localStorage.setItem('whatsgw_logs', JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error logging WhatsApp API operation:', error);
  }
};

export const getLogHistory = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('whatsgw_logs') || '[]');
  } catch (error) {
    console.error('Error getting log history:', error);
    return [];
  }
};

export const clearLogHistory = (): void => {
  localStorage.setItem('whatsgw_logs', '[]');
};

// WhatsApp API Methods
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const { apiKey, apiUrl } = getApiKey();
    if (!apiKey) return false;
    
    // Simple ping endpoint to check if API is available
    const response = await fetch(`${apiUrl}/ping`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    logApiOperation('test_connection', response.ok ? 'success' : 'error', {
      status: response.status,
      statusText: response.statusText
    });
    
    return response.ok;
  } catch (error) {
    logApiOperation('test_connection', 'error', error);
    console.error('Error testing API connection:', error);
    return false;
  }
};

export const sendWhatsAppMessage = async ({ phone, message }: { phone: string, message: string }): Promise<boolean> => {
  try {
    const { apiKey, apiUrl } = getApiKey();
    if (!apiKey) {
      logApiOperation('send_message', 'error', 'No API key configured');
      return false;
    }
    
    // Format phone number if needed
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 11 || formattedPhone.length === 10) {
      formattedPhone = `55${formattedPhone}`;
    }
    
    const response = await fetch(`${apiUrl}/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        isGroup: false
      })
    });
    
    const data = await response.json();
    
    logApiOperation('send_message', response.ok ? 'success' : 'error', {
      phone: formattedPhone,
      status: response.status,
      response: data
    });
    
    return response.ok;
  } catch (error) {
    logApiOperation('send_message', 'error', error);
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

export const sendTestMessage = async (phone: string): Promise<{ success: boolean, error?: string }> => {
  try {
    const message = `🧪 *Mensagem de Teste* 🧪\n\nEsta é uma mensagem de teste do sistema de gerenciamento. Se você está recebendo esta mensagem, a configuração da API do WhatsApp está funcionando corretamente!\n\n⏱️ ${new Date().toLocaleString('pt-BR')}`;
    
    const success = await sendWhatsAppMessage({ phone, message });
    
    return { success };
  } catch (error) {
    console.error('Error sending test message:', error);
    return { success: false, error: String(error) };
  }
};

export const sendTestToSpecificNumber = async (): Promise<{ success: boolean, error?: string }> => {
  try {
    const message = `🧪 *Mensagem de Teste Direta* 🧪\n\nEsta é uma mensagem de teste direta do sistema de gerenciamento. Se você está recebendo esta mensagem, a configuração da API do WhatsApp está funcionando corretamente!\n\n⏱️ ${new Date().toLocaleString('pt-BR')}`;
    
    const success = await sendWhatsAppMessage({ 
      phone: '44988057213', 
      message 
    });
    
    return { success };
  } catch (error) {
    console.error('Error sending direct test message:', error);
    return { success: false, error: String(error) };
  }
};

export const sendEventReminder = async (event: { 
  title: string;
  description: string;
  date: Date;
  duration: number;
  contactPhone: string;
}): Promise<boolean> => {
  try {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    }).format(event.date);
    
    const time = new Intl.DateTimeFormat('pt-BR', { 
      hour: '2-digit', minute: '2-digit' 
    }).format(event.date);
    
    const message = `🗓️ *Lembrete de Compromisso*\n\n` +
      `Olá! Este é um lembrete para o seu compromisso:\n\n` +
      `*${event.title}*\n` +
      `📅 Data: ${formattedDate}\n` +
      `⏰ Horário: ${time}\n` +
      `⏱️ Duração: ${event.duration} minutos\n\n` +
      `${event.description ? `📝 ${event.description}\n\n` : ''}` +
      `Para remarcar ou cancelar, entre em contato conosco.`;
    
    return await sendWhatsAppMessage({
      phone: event.contactPhone,
      message
    });
  } catch (error) {
    console.error('Error sending event reminder:', error);
    logApiOperation('send_event_reminder', 'error', error);
    return false;
  }
};

export const notifyAdminsAboutEvent = async (event: {
  title: string;
  description: string;
  date: Date;
  duration: number;
  contactPhone?: string;
}): Promise<number> => {
  try {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    }).format(event.date);
    
    const time = new Intl.DateTimeFormat('pt-BR', { 
      hour: '2-digit', minute: '2-digit' 
    }).format(event.date);
    
    const message = `🗓️ *Novo Evento Agendado*\n\n` +
      `Um novo evento foi marcado:\n\n` +
      `*${event.title}*\n` +
      `📅 Data: ${formattedDate}\n` +
      `⏰ Horário: ${time}\n` +
      `⏱️ Duração: ${event.duration} minutos\n` +
      `${event.description ? `📝 ${event.description}\n` : ''}` +
      `${event.contactPhone ? `📞 ${event.contactPhone}\n` : ''}\n` +
      `⏱️ ${new Date().toLocaleString('pt-BR')}`;
    
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (!savedNumbers) {
      return 0;
    }
    
    const adminNumbers = JSON.parse(savedNumbers);
    if (!Array.isArray(adminNumbers) || adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      if (!number || number.trim() === '') continue;
      
      const success = await sendWhatsAppMessage({
        phone: number,
        message
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error('Error notifying admins about event:', error);
    logApiOperation('notify_admins_event', 'error', error);
    return 0;
  }
};

export const notifyAdminsAboutSystemEvent = async (title: string, content: string): Promise<number> => {
  try {
    const now = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date());
    
    const message = `🔔 *${title || 'Notificação do Sistema'}*\n\n${content}\n\n⏱️ ${now}`;
    
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (!savedNumbers) {
      return 0;
    }
    
    const adminNumbers = JSON.parse(savedNumbers);
    if (!Array.isArray(adminNumbers) || adminNumbers.length === 0) {
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      if (!number || number.trim() === '') continue;
      
      const success = await sendWhatsAppMessage({
        phone: number,
        message
      });
      
      if (success) successCount++;
    }
    
    return successCount;
  } catch (error) {
    console.error('Error notifying admins about system event:', error);
    logApiOperation('notify_admins_system', 'error', error);
    return 0;
  }
};

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
  return localStorage.getItem('whatsgw_api_key') !== null;
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

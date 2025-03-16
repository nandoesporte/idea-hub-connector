import { supabase } from './supabase';

// Store API key in localStorage
export const setApiKey = (apiKey: string) => {
  localStorage.setItem('whatsgw_api_key', apiKey);
  console.log('API key saved');
};

// Get API key from localStorage
export const getApiKey = (): string => {
  return localStorage.getItem('whatsgw_api_key') || '';
};

// Log history management
interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

// Add a log entry
export const addLogEntry = (entry: LogEntry) => {
  try {
    const existingLogs = getLogHistory();
    const updatedLogs = [entry, ...existingLogs];
    localStorage.setItem('whatsgw_logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error adding log entry:', error);
  }
};

// Get log history
export const getLogHistory = (): LogEntry[] => {
  try {
    const savedLogs = localStorage.getItem('whatsgw_logs');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      return Array.isArray(parsedLogs) ? parsedLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })) : [];
    }
  } catch (error) {
    console.error('Error getting log history:', error);
  }
  return [];
};

// Clear log history
export const clearLogHistory = () => {
  localStorage.removeItem('whatsgw_logs');
};

// Test connection to the API
export const sendTestMessage = async (phone: string): Promise<boolean> => {
  try {
    const apiKey = getApiKey();
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      addLogEntry({
        timestamp: new Date(),
        type: 'error',
        operation: 'send-message',
        message: 'API key or URL not configured'
      });
      return false;
    }

    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    addLogEntry({
      timestamp: new Date(),
      type: 'info',
      operation: 'send-message',
      message: `Sending test message to ${formattedPhone}`
    });
    
    const response = await fetch(`${apiURL}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: "🔔 *Mensagem de Teste*\n\nEsta é uma mensagem automática para testar a integração com o WhatsApp. Se você está recebendo esta mensagem, a conexão foi estabelecida com sucesso!"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      addLogEntry({
        timestamp: new Date(),
        type: 'error',
        operation: 'send-message',
        message: `Failed to send test message: ${response.status} ${response.statusText}`,
        details: errorText
      });
      return false;
    }
    
    const data = await response.json();
    addLogEntry({
      timestamp: new Date(),
      type: 'info',
      operation: 'send-message',
      message: 'Test message sent successfully',
      details: data
    });
    return true;
  } catch (error) {
    addLogEntry({
      timestamp: new Date(),
      type: 'error',
      operation: 'send-message',
      message: 'Error sending test message',
      details: error
    });
    console.error('Error sending test message:', error);
    return false;
  }
};

// Send test to specific number for direct testing
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  try {
    const apiKey = getApiKey();
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      addLogEntry({
        timestamp: new Date(),
        type: 'error',
        operation: 'direct-test',
        message: 'API key or URL not configured'
      });
      return false;
    }
    
    const testNumber = '5544988057213'; // Hardcoded test number
    
    addLogEntry({
      timestamp: new Date(),
      type: 'info',
      operation: 'direct-test',
      message: `Sending direct test message to ${testNumber}`
    });
    
    const response = await fetch(`${apiURL}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: testNumber,
        message: "🔔 *Teste Direto*\n\nEsta é uma mensagem de teste direto para o número 44988057213. Se você está recebendo esta mensagem, a conexão foi estabelecida com sucesso!"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      addLogEntry({
        timestamp: new Date(),
        type: 'error',
        operation: 'direct-test',
        message: `Failed to send direct test message: ${response.status} ${response.statusText}`,
        details: errorText
      });
      return false;
    }
    
    const data = await response.json();
    addLogEntry({
      timestamp: new Date(),
      type: 'info',
      operation: 'direct-test',
      message: 'Direct test message sent successfully',
      details: data
    });
    return true;
  } catch (error) {
    addLogEntry({
      timestamp: new Date(),
      type: 'error',
      operation: 'direct-test',
      message: 'Error sending direct test message',
      details: error
    });
    console.error('Error sending direct test message:', error);
    return false;
  }
};

export const registerWhatsAppWebhook = (webhookUrl: string) => {
  localStorage.setItem('whatsgw_webhook_url', webhookUrl);
  console.log('Webhook URL saved:', webhookUrl);
};

export const isWhatsAppConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
  const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
  return !!apiKey && !!apiURL;
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      console.warn('WhatsApp API key or URL not configured.');
      return false;
    }
    
    const response = await fetch(`${apiURL}/health`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('API health check failed:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      console.warn('API health status not OK:', data.status);
      return false;
    }
    
    console.log('API health check successful');
    return true;
  } catch (error) {
    console.error('Error testing API connection:', error);
    return false;
  }
};

export const sendWhatsAppMessage = async ({ phone, message }: { phone: string; message: string; }): Promise<boolean> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      console.warn('WhatsApp API key or URL not configured.');
      return false;
    }
    
    const response = await fetch(`${apiURL}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone.startsWith('55') ? phone : `55${phone}`,
        message: message
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('WhatsApp message sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

export const sendEventReminder = async ({ phone, eventTitle, eventDate }: { phone: string; eventTitle: string; eventDate: Date; }): Promise<boolean> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      console.warn('WhatsApp API key or URL not configured.');
      return false;
    }
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    }).format(eventDate);
    
    const time = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;
    
    const message = `🗓️ *Lembrete de Compromisso*\n\n` +
      `Olá! Este é um lembrete para o seu compromisso:\n\n` +
      `*${eventTitle}*\n` +
      `📅 Data: ${formattedDate}\n` +
      `⏰ Horário: ${time}\n\n` +
      `Para mais detalhes ou para cancelar, entre em contato conosco.`;
    
    const response = await fetch(`${apiURL}/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone.startsWith('55') ? phone : `55${phone}`,
        message: message
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send WhatsApp reminder:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('WhatsApp reminder sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp reminder:', error);
    return false;
  }
};

export const notifyAdminsAboutEvent = async (event: { title: string; description: string; date: Date; duration: number; contactPhone: string; }): Promise<number> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      console.warn('WhatsApp API key or URL not configured.');
      return 0;
    }
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    }).format(event.date);
    
    const time = `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`;
    
    const message = `🔔 *Novo Evento Criado*\n\n` +
      `*${event.title}*\n` +
      `📅 Data: ${formattedDate}\n` +
      `⏰ Horário: ${time}\n` +
      `⏱️ Duração: ${event.duration || 60} minutos\n` +
      `📞 Contato: ${event.contactPhone || 'Não especificado'}\n` +
      `📝 Descrição: ${event.description || 'Nenhuma descrição'}`;
    
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (!savedNumbers) {
      console.warn('No admin numbers saved in localStorage.');
      return 0;
    }
    
    let adminNumbers: string[] = [];
    try {
      adminNumbers = JSON.parse(savedNumbers);
      if (!Array.isArray(adminNumbers)) {
        console.warn('Invalid admin numbers in localStorage.');
        return 0;
      }
    } catch (error) {
      console.error('Error parsing admin numbers from localStorage:', error);
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      if (!number || number.trim() === '') continue;
      
      const success = await sendWhatsAppMessage({
        phone: number,
        message: message
      });
      
      if (success) {
        successCount++;
      }
    }
    
    return successCount;
  } catch (error) {
    console.error('Error notifying admins about event:', error);
    return 0;
  }
};

export const notifyAdminsAboutSystemEvent = async (messageType: string, content: string): Promise<number> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WHATSGW_API_KEY;
    const apiURL = process.env.NEXT_PUBLIC_WHATSGW_API_URL;
    
    if (!apiKey || !apiURL) {
      console.warn('WhatsApp API key or URL not configured.');
      return 0;
    }
    
    const now = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date());
    
    const message = `🔔 *${messageType || 'Notificação do Sistema'}*\n\n${content}\n\n⏱️ ${now}`;
    
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (!savedNumbers) {
      console.warn('No admin numbers saved in localStorage.');
      return 0;
    }
    
    let adminNumbers: string[] = [];
    try {
      adminNumbers = JSON.parse(savedNumbers);
      if (!Array.isArray(adminNumbers)) {
        console.warn('Invalid admin numbers in localStorage.');
        return 0;
      }
    } catch (error) {
      console.error('Error parsing admin numbers from localStorage:', error);
      return 0;
    }
    
    let successCount = 0;
    for (const number of adminNumbers) {
      if (!number || number.trim() === '') continue;
      
      const success = await sendWhatsAppMessage({
        phone: number,
        message: message
      });
      
      if (success) {
        successCount++;
      }
    }
    
    return successCount;
  } catch (error) {
    console.error('Error notifying admins about system event:', error);
    return 0;
  }
};

export interface PolicyData {
  id?: string;
  policyNumber: string;
  customer: string;
  insurer: string;
  startDate: Date;
  endDate: Date;
  premiumValue: string;
  documentUrl?: string;
  whatsappMessageId?: string;
  status?: 'active' | 'pending' | 'expired';
  processedAt?: Date;
  processedByUserId?: string;
}

// Mock function to simulate processing a WhatsApp message with a policy document
export const simulateWhatsAppPolicyMessage = async (): Promise<PolicyData | null> => {
  try {
    console.log('[simulate-whatsapp] Simulating WhatsApp policy message...');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock policy
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const mockPolicy: PolicyData = {
      policyNumber: `AP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customer: `Cliente ${Math.floor(Math.random() * 100)}`,
      insurer: ['Porto Seguro', 'Bradesco Seguros', 'SulAmérica', 'Allianz', 'Mapfre'][Math.floor(Math.random() * 5)],
      startDate,
      endDate,
      premiumValue: `R$ ${(Math.random() * 10000).toFixed(2)}`,
      whatsappMessageId: `msg_${Math.random().toString(36).substring(7)}`,
      documentUrl: 'https://example.com/policy.pdf'
    };
    
    // Save to database
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert({
        policy_number: mockPolicy.policyNumber,
        customer: mockPolicy.customer,
        insurer: mockPolicy.insurer,
        start_date: mockPolicy.startDate.toISOString(),
        end_date: mockPolicy.endDate.toISOString(),
        premium_value: mockPolicy.premiumValue,
        document_url: mockPolicy.documentUrl,
        whatsapp_message_id: mockPolicy.whatsappMessageId,
        status: 'active',
        processed_at: new Date().toISOString(),
        processed_by_user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('[simulate-whatsapp] Error saving policy to database:', error);
      return null;
    }
    
    console.log('[simulate-whatsapp] Policy saved to database:', data);
    
    return {
      id: data.id,
      policyNumber: data.policy_number,
      customer: data.customer,
      insurer: data.insurer,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      premiumValue: data.premium_value,
      documentUrl: data.document_url,
      whatsappMessageId: data.whatsapp_message_id,
      status: data.status,
      processedAt: new Date(data.processed_at),
      processedByUserId: data.processed_by_user_id
    };
  } catch (error) {
    console.error('[simulate-whatsapp] Error simulating WhatsApp policy message:', error);
    return null;
  }
};

// Get all policies from the database
export const getAllPolicies = async (): Promise<PolicyData[]> => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[get-policies] Error fetching policies from database:', error);
      return [];
    }
    
    return data.map(policy => ({
      id: policy.id,
      policyNumber: policy.policy_number,
      customer: policy.customer,
      insurer: policy.insurer,
      startDate: new Date(policy.start_date),
      endDate: new Date(policy.end_date),
      premiumValue: policy.premium_value,
      documentUrl: policy.document_url,
      whatsappMessageId: policy.whatsapp_message_id,
      status: policy.status,
      processedAt: new Date(policy.processed_at),
      processedByUserId: policy.processed_by_user_id
    }));
  } catch (error) {
    console.error('[get-policies] Error retrieving policies:', error);
    return [];
  }
};

// Delete a policy from the database
export const deletePolicy = async (policyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', policyId);
    
    if (error) {
      console.error('[delete-policy] Error deleting policy from database:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[delete-policy] Error deleting policy:', error);
    return false;
  }
};

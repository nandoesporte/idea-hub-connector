
import { toast } from "sonner";

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

// Armazenamento de logs
const LOG_HISTORY_MAX_SIZE = 100;
const logHistory: LogEntry[] = [];

// Configurações da API WhatsGW
const WHATSGW_API_BASE_URL = "https://app.whatsgw.com.br/api/WhatsGw";
let API_KEY = "";

// Interfaces para mensagens
export interface WhatsAppMessage {
  phone: string;
  message: string;
  customId?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  mimetype?: string;
}

export interface EventReminder {
  title: string;
  date: Date;
  time: string;
  duration: number;
  contactPhone: string;
}

/**
 * Adiciona uma entrada no histórico de logs
 */
export const addLogEntry = (
  type: 'info' | 'error' | 'warning',
  operation: string,
  message: string,
  details?: any
): void => {
  const entry: LogEntry = {
    timestamp: new Date(),
    type,
    operation,
    message,
    details
  };
  
  // Adiciona no início do array (mais recente primeiro)
  logHistory.unshift(entry);
  
  // Limita o tamanho do array
  if (logHistory.length > LOG_HISTORY_MAX_SIZE) {
    logHistory.pop();
  }
  
  // Também registra no console
  const logMethod = type === 'error' ? console.error : 
                    type === 'warning' ? console.warn : console.log;
  
  logMethod(`[${entry.timestamp.toISOString()}] [${operation}] ${message}`, details || '');
};

/**
 * Retorna o histórico de logs
 */
export const getLogHistory = (): LogEntry[] => {
  return [...logHistory];
};

/**
 * Limpa o histórico de logs
 */
export const clearLogHistory = (): void => {
  logHistory.length = 0;
  addLogEntry('info', 'system', 'Log history cleared');
};

/**
 * Define a chave de API
 */
export const setApiKey = (apiKey: string): void => {
  API_KEY = apiKey;
  localStorage.setItem('whatsgw_api_key', apiKey);
  addLogEntry('info', 'configuration', "API key set successfully");
};

/**
 * Obtém a chave de API
 */
export const getApiKey = (): string => {
  if (!API_KEY) {
    const savedKey = localStorage.getItem('whatsgw_api_key');
    if (savedKey) {
      API_KEY = savedKey;
      addLogEntry('info', 'configuration', "API key loaded from localStorage");
    } else {
      addLogEntry('warning', 'configuration', "No API key found in localStorage");
    }
  }
  return API_KEY;
};

/**
 * Verifica se o WhatsApp está configurado
 */
export const isWhatsAppConfigured = (): boolean => {
  return Boolean(getApiKey());
};

/**
 * Formata o número de telefone para o formato aceito pela API
 * Garante que o número tenha código de país (adiciona 55 para Brasil se ausente)
 */
export const formatPhoneNumber = (phone: string): string | null => {
  // Remove caracteres não numéricos
  let numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 8) {
    addLogEntry('warning', 'format-phone', "Phone number too short", { phone, numericOnly });
    return null; // Número de telefone inválido
  }
  
  // Se tem 8-9 dígitos, provavelmente está faltando o DDD e o código do país
  if (numericOnly.length >= 8 && numericOnly.length <= 9) {
    addLogEntry('warning', 'format-phone', "Phone number missing area code, cannot automatically determine it", { phone, numericOnly });
    toast.warning("Número de telefone sem código de área (DDD). Por favor, inclua o DDD.");
    return null;
  }
  
  // Se tem 10-11 dígitos (com DDD mas sem código de país)
  if (numericOnly.length >= 10 && numericOnly.length <= 11) {
    numericOnly = `55${numericOnly}`;
    addLogEntry('info', 'format-phone', "Added Brazilian country code to phone number", { original: phone, formatted: numericOnly });
  }
  
  // Se o número não começa com o código de país 55 (Brasil), adiciona
  if (numericOnly.length >= 12 && !numericOnly.startsWith('55')) {
    addLogEntry('info', 'format-phone', "Phone number doesn't start with Brazilian country code, adding it", { original: phone });
    numericOnly = `55${numericOnly}`;
  }
  
  // Validação final - números brasileiros com código de país devem ter 12-13 dígitos
  if (numericOnly.length < 12 || numericOnly.length > 13) {
    addLogEntry('error', 'format-phone', "Invalid Brazilian phone number format", { phone, numericOnly, length: numericOnly.length });
    return null;
  }
  
  return numericOnly;
};

/**
 * Testa a conexão com a API
 */
export const testApiConnection = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'api-connection', "API key not set");
    return false;
  }
  
  try {
    const url = `${WHATSGW_API_BASE_URL}/Status?apikey=${encodeURIComponent(apiKey)}`;
    
    addLogEntry('info', 'api-connection', `Testing API connection to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result === 'success') {
      addLogEntry('info', 'api-connection', "API connection successful", data);
      return true;
    } else {
      addLogEntry('error', 'api-connection', "API connection failed", data);
      return false;
    }
  } catch (error) {
    addLogEntry('error', 'api-connection', "Error testing API connection", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
};

/**
 * Envia uma mensagem via WhatsApp usando a API da WhatsGW
 */
export const sendWhatsAppMessage = async (params: WhatsAppMessage): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'send-message', "API key not set");
    toast.error("Chave de API não configurada");
    return false;
  }
  
  try {
    // Formata o número de telefone
    const formattedPhone = formatPhoneNumber(params.phone);
    
    if (!formattedPhone) {
      addLogEntry('error', 'send-message', "Invalid phone number format", { phone: params.phone });
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    // Configura os parâmetros básicos da requisição
    const queryParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: '5544997270698', // número padrão de envio configurado na sua conta WhatsGW
      contact_phone_number: formattedPhone,
      message_custom_id: params.customId || `msg_${Date.now()}`,
      message_type: params.mediaUrl ? 'document' : 'text',
      message_body: params.message
    });
    
    // Adiciona parâmetros de mídia se necessário
    if (params.mediaUrl) {
      queryParams.append('message_caption', params.caption || '');
      queryParams.append('message_body_mimetype', params.mimetype || 'application/pdf');
      queryParams.append('message_body_filename', params.filename || 'file.pdf');
      queryParams.append('download', '1');
      queryParams.append('message_body', params.mediaUrl);
    }
    
    const url = `${WHATSGW_API_BASE_URL}/Send?${queryParams.toString()}`;
    
    addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone}`, { 
      url: url.substring(0, 100) + '...' // Trunca a URL no log por ser muito longa
    });
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.result === 'success') {
      addLogEntry('info', 'send-message', "WhatsApp message sent successfully", data);
      return true;
    } else {
      addLogEntry('error', 'send-message', "API returned error", data);
      toast.error(`Erro ao enviar mensagem: ${data.message || 'Erro desconhecido'}`);
      return false;
    }
  } catch (error) {
    addLogEntry('error', 'send-message', "Error sending WhatsApp message", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    toast.error(`Erro ao enviar mensagem: ${error.message}`);
    return false;
  }
};

/**
 * Envia uma mensagem de teste para um número específico
 */
export const sendTestMessage = async (phone: string): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone,
    message: "🔍 *Mensagem de Teste*\n\nOlá! Este é um teste de notificação via WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente."
  });
};

/**
 * Envia um lembrete de evento via WhatsApp
 */
export const sendEventReminder = async (event: EventReminder): Promise<boolean> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('error', 'event-reminder', "API key not set");
    toast.error("Chave de API não configurada");
    return false;
  }
  
  const { title, date, time, duration, contactPhone } = event;
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
  
  const message = `🗓️ *Lembrete de Compromisso*\n\n` +
    `Olá! Este é um lembrete para o seu compromisso:\n\n` +
    `*${title}*\n` +
    `📅 Data: ${formattedDate}\n` +
    `⏰ Horário: ${time}\n` +
    `⏱️ Duração: ${duration} minutos\n\n` +
    `Para remarcar ou cancelar, entre em contato conosco.`;
  
  addLogEntry('info', 'event-reminder', `Sending reminder for event "${title}" to ${contactPhone}`);
  
  return sendWhatsAppMessage({
    phone: contactPhone,
    message
  });
};

/**
 * Programa notificações para eventos futuros
 */
export const scheduleEventReminders = async (events: any[], hoursBeforeEvent = 24): Promise<void> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('warning', 'schedule-reminders', "API key not set, skipping event reminders");
    return;
  }
  
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + (hoursBeforeEvent * 60 * 60 * 1000));
  
  // Filtra eventos que precisam de lembretes
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > now && eventDate <= reminderThreshold;
  });
  
  addLogEntry('info', 'schedule-reminders', `Found ${upcomingEvents.length} events that need reminders`, { 
    totalEvents: events.length, 
    hoursBeforeEvent 
  });
  
  // Envia lembretes para cada evento próximo
  for (const event of upcomingEvents) {
    if (!event.contactPhone) {
      addLogEntry('warning', 'schedule-reminders', `Skipping reminder for event "${event.title}" - no contact phone`);
      continue;
    }
    
    const reminderSent = await sendEventReminder({
      title: event.title,
      date: new Date(event.date),
      time: `${new Date(event.date).getHours().toString().padStart(2, '0')}:${new Date(event.date).getMinutes().toString().padStart(2, '0')}`,
      duration: event.duration,
      contactPhone: event.contactPhone
    });
    
    if (reminderSent) {
      addLogEntry('info', 'schedule-reminders', `Reminder sent for event "${event.title}"`);
      toast.success(`Lembrete enviado para evento "${event.title}"`);
    } else {
      addLogEntry('error', 'schedule-reminders', `Failed to send reminder for event "${event.title}"`);
      toast.error(`Falha ao enviar lembrete para evento "${event.title}"`);
    }
  }
};

/**
 * Envia mensagem de teste direto para o número específico
 */
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone: "44988057213",
    message: "🔍 *Teste Direto da API*\n\nOlá! Este é um teste direto da API do WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente."
  });
};

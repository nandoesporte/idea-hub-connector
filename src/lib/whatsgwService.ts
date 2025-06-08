
import { toast } from "sonner";

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

// Log storage
const LOG_HISTORY_MAX_SIZE = 50;
const logHistory: LogEntry[] = [];

// WhatsGW API Configuration
const WHATSGW_API_BASE_URL = "https://app.whatsgw.com.br/api/WhatsGw";
let API_KEY = "";

// Message interfaces
export interface WhatsAppMessage {
  phone: string;
  message: string;
  customId?: string;
  filename?: string;
  mimetype?: string;
  caption?: string;
  mediaUrl?: string;
}

export interface ReceivedMessage {
  id: string;
  phone: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  mediaUrl?: string;
  fileName?: string;
}

export interface EventReminder {
  title: string;
  date: Date;
  time: string;
  duration: number;
  contactPhone: string;
}

/**
 * Adds an entry to the log history
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
  
  logHistory.unshift(entry);
  
  if (logHistory.length > LOG_HISTORY_MAX_SIZE) {
    logHistory.pop();
  }
  
  const logMethod = type === 'error' ? console.error : 
                    type === 'warning' ? console.warn : console.log;
  
  logMethod(`[${entry.timestamp.toISOString()}] [${operation}] ${message}`, details || '');
};

/**
 * Returns the log history
 */
export const getLogHistory = (): LogEntry[] => {
  return [...logHistory];
};

/**
 * Clears the log history
 */
export const clearLogHistory = (): void => {
  logHistory.length = 0;
  addLogEntry('info', 'system', 'Log history cleared');
};

/**
 * Sets the API key
 */
export const setApiKey = (apiKey: string): void => {
  API_KEY = apiKey.trim();
  localStorage.setItem('whatsgw_api_key', API_KEY);
  addLogEntry('info', 'configuration', "WhatsApp API key set successfully");
};

/**
 * Gets the API key
 */
export const getApiKey = (): string => {
  if (!API_KEY) {
    const savedKey = localStorage.getItem('whatsgw_api_key');
    if (savedKey) {
      API_KEY = savedKey.trim();
      addLogEntry('info', 'configuration', "API key loaded from localStorage");
    } else {
      addLogEntry('warning', 'configuration', "No API key found in localStorage");
    }
  }
  return API_KEY;
};

/**
 * Checks if WhatsApp is configured
 */
export const isWhatsAppConfigured = (): boolean => {
  return Boolean(getApiKey());
};

/**
 * Formats the phone number to the format accepted by the API
 */
export const formatPhoneNumber = (phone: string): string | null => {
  let numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 8) {
    addLogEntry('warning', 'format-phone', "Phone number too short", { phone, numericOnly });
    return null;
  }
  
  if (numericOnly.length >= 8 && numericOnly.length <= 9) {
    addLogEntry('warning', 'format-phone', "Phone number missing area code", { phone, numericOnly });
    toast.warning("Número de telefone sem código de área (DDD). Por favor, inclua o DDD.");
    return null;
  }
  
  if (numericOnly.length >= 10 && numericOnly.length <= 11) {
    numericOnly = `55${numericOnly}`;
    addLogEntry('info', 'format-phone', "Added Brazilian country code to phone number", { original: phone, formatted: numericOnly });
  }
  
  if (numericOnly.length >= 12 && !numericOnly.startsWith('55')) {
    addLogEntry('info', 'format-phone', "Phone number doesn't start with Brazilian country code, adding it", { original: phone });
    numericOnly = `55${numericOnly}`;
  }
  
  if (numericOnly.length < 12 || numericOnly.length > 13) {
    addLogEntry('error', 'format-phone', "Invalid Brazilian phone number format", { phone, numericOnly, length: numericOnly.length });
    return null;
  }
  
  return numericOnly;
};

/**
 * Handles specific API errors
 */
const handleApiError = (status: number, operation: string, responseData?: any): string => {
  switch (status) {
    case 401:
      addLogEntry('error', operation, "API authentication failed - invalid API key", responseData);
      return "Autenticação falhou. Verifique se sua chave de API está correta.";
    case 403:
      addLogEntry('error', operation, "API access forbidden", responseData);
      return "Acesso negado. Verifique se o domínio está autorizado no painel da WhatsGW.";
    case 404:
      addLogEntry('error', operation, "API endpoint not found", responseData);
      return "Endpoint da API não encontrado.";
    case 429:
      addLogEntry('error', operation, "Rate limit exceeded", responseData);
      return "Limite de requisições excedido. Tente novamente em alguns minutos.";
    case 500:
    case 502:
    case 503:
    case 504:
      addLogEntry('error', operation, `Server error (${status})`, responseData);
      return `Erro no servidor WhatsApp (${status}). Tente novamente mais tarde.`;
    default:
      addLogEntry('error', operation, `HTTP error ${status}`, responseData);
      return `Erro na API (${status}). Verifique os logs para mais detalhes.`;
  }
};

/**
 * Tests the API connection
 */
export const testApiConnection = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'connection-test', "API key not set");
    return false;
  }
  
  try {
    addLogEntry('info', 'connection-test', "Testing API connection");
    
    const testPhone = "5544997270698";
    const urlParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: "5544997270698",
      contact_phone_number: testPhone,
      message_custom_id: `test_${Date.now()}`,
      message_type: 'text',
      message_body: "test"
    });
    
    const apiUrl = `${WHATSGW_API_BASE_URL}/Send?${urlParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok || response.status === 400) {
      addLogEntry('info', 'connection-test', "API connection successful");
      return true;
    }
    
    addLogEntry('error', 'connection-test', `API connection failed with status ${response.status}`);
    return false;
  } catch (error) {
    addLogEntry('error', 'connection-test', "Error testing API connection", {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return false;
  }
};

/**
 * Sends a WhatsApp message using the WhatsGW API
 */
export const sendWhatsAppMessage = async (params: WhatsAppMessage): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'send-message', "API key not set");
    toast.error("Chave de API não configurada");
    return false;
  }
  
  try {
    const formattedPhone = formatPhoneNumber(params.phone);
    
    if (!formattedPhone) {
      addLogEntry('error', 'send-message', "Invalid phone number format", { phone: params.phone });
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    const urlParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: "5544997270698",
      contact_phone_number: formattedPhone,
      message_custom_id: params.customId || `msg_${Date.now()}`,
      message_type: params.mediaUrl ? (params.mimetype?.startsWith('image/') ? 'image' : 'document') : 'text',
      message_body: params.message
    });
    
    if (params.mediaUrl) {
      urlParams.set('message_body', params.mediaUrl);
      
      if (params.caption) {
        urlParams.set('message_caption', params.caption);
      }
      
      if (params.mimetype) {
        urlParams.set('message_body_mimetype', params.mimetype);
      }
      
      if (params.filename) {
        urlParams.set('message_body_filename', params.filename);
      }
      
      urlParams.set('download', '1');
    }
    
    const apiUrl = `${WHATSGW_API_BASE_URL}/Send?${urlParams.toString()}`;
    
    addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone}`);
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsGW-Client/1.0)',
      }
    });
    
    addLogEntry('info', 'send-message', `Response status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText || `HTTP error ${response.status}` };
        }
      } catch (e) {
        errorData = { message: `HTTP error ${response.status}` };
      }
      
      const errorMessage = handleApiError(response.status, 'send-message', errorData);
      throw new Error(errorMessage);
    }
    
    let data;
    try {
      const responseText = await response.text();
      console.log('Success response:', responseText);
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { result: 'success', message: responseText };
        }
      } else {
        data = { result: 'success' };
      }
    } catch (e) {
      data = { result: 'success' };
      addLogEntry('warning', 'send-message', "Could not parse response, assuming success");
    }
    
    const isSuccess = data.result === 'success' || 
                     data.status === 'success' || 
                     data.success === true ||
                     response.status === 200;
    
    if (isSuccess) {
      addLogEntry('info', 'send-message', "WhatsApp message sent successfully", data);
      toast.success("Mensagem enviada com sucesso!");
      return true;
    } else {
      addLogEntry('error', 'send-message', "API returned error", data);
      toast.error(`Erro ao enviar mensagem: ${data.message || data.error || 'Erro desconhecido'}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorDetails = {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    };
    
    addLogEntry('error', 'send-message', "Error sending WhatsApp message", errorDetails);
    
    console.error('WhatsApp send error:', error);
    
    if (errorMessage.includes("Failed to fetch")) {
      toast.error("Erro de conectividade. Verifique sua conexão com a internet.");
    } else if (errorMessage.includes("NetworkError")) {
      toast.error("Erro de rede. Tente novamente em alguns instantes.");
    } else {
      toast.error(`Erro ao enviar mensagem: ${errorMessage}`);
    }
    
    return false;
  }
};

/**
 * Retrieves received messages from WhatsApp using the WhatsGW API
 */
export const getReceivedMessages = async (limit = 50): Promise<ReceivedMessage[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'get-messages', "API key not set");
    return [];
  }
  
  try {
    addLogEntry('info', 'get-messages', `Retrieving received WhatsApp messages (limit: ${limit})`);
    
    const urlParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: "5544997270698",
      limit: limit.toString()
    });
    
    const apiUrl = `${WHATSGW_API_BASE_URL}/Receive?${urlParams.toString()}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsGW-Client/1.0)',
      }
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error ${response.status}` };
      }
      
      const errorMessage = handleApiError(response.status, 'get-messages', errorData);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data.messages)) {
      const messages: ReceivedMessage[] = data.messages.map((msg: any) => ({
        id: msg.id || `msg_${Date.now()}_${Math.random()}`,
        phone: msg.contact_phone_number || msg.phone,
        message: msg.message_body || msg.message,
        timestamp: new Date(msg.message_timestamp || msg.timestamp || Date.now()),
        type: msg.message_type || 'text',
        mediaUrl: msg.message_body_url || msg.mediaUrl,
        fileName: msg.message_body_filename || msg.fileName
      }));
      
      addLogEntry('info', 'get-messages', `Retrieved ${messages.length} messages successfully`);
      return messages;
    }
    
    addLogEntry('warning', 'get-messages', "No messages found in response", data);
    return [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    addLogEntry('error', 'get-messages', "Error retrieving WhatsApp messages", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    console.error('WhatsApp get messages error:', error);
    toast.error(`Erro ao recuperar mensagens: ${errorMessage}`);
    return [];
  }
};

/**
 * Polls for new messages periodically
 */
export const startMessagePolling = (
  onNewMessage: (message: ReceivedMessage) => void,
  intervalMs = 30000
): () => void => {
  let lastMessageId = '';
  
  const poll = async () => {
    try {
      const messages = await getReceivedMessages(10);
      
      if (messages.length > 0) {
        const newMessages = lastMessageId 
          ? messages.filter(msg => msg.id !== lastMessageId && new Date(msg.timestamp) > new Date())
          : messages.slice(0, 1); // Only get the latest message on first poll
        
        newMessages.forEach(onNewMessage);
        
        if (messages.length > 0) {
          lastMessageId = messages[0].id;
        }
      }
    } catch (error) {
      addLogEntry('warning', 'message-polling', "Error during message polling", error);
    }
  };
  
  // Initial poll
  poll();
  
  // Set up interval
  const intervalId = setInterval(poll, intervalMs);
  
  addLogEntry('info', 'message-polling', `Started message polling every ${intervalMs}ms`);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    addLogEntry('info', 'message-polling', "Stopped message polling");
  };
};

/**
 * Sends a test message to a specific number
 */
export const sendTestMessage = async (phone: string): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone,
    message: "🔍 *Mensagem de Teste*\n\nOlá! Este é um teste de notificação via WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente.",
    customId: `test_${Date.now()}`
  });
};

/**
 * Sends a test message directly to the specific number 44988057213
 */
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone: "44988057213",
    message: "🔍 *Teste Direto da API*\n\nOlá! Este é um teste direto da API do WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente.",
    customId: `direct_test_${Date.now()}`
  });
};

/**
 * Sends an event reminder via WhatsApp
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
    message,
    customId: `reminder_${Date.now()}`
  });
};

export const scheduleEventReminders = async (events: any[], hoursBeforeEvent = 24): Promise<void> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('warning', 'schedule-reminders', "API key not set, skipping event reminders");
    return;
  }
  
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + (hoursBeforeEvent * 60 * 60 * 1000));
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > now && eventDate <= reminderThreshold;
  });
  
  addLogEntry('info', 'schedule-reminders', `Found ${upcomingEvents.length} events that need reminders`, { 
    totalEvents: events.length, 
    hoursBeforeEvent 
  });
  
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

export const getAdminNumbers = (): string[] => {
  try {
    const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
    if (savedNumbers) {
      const parsedNumbers = JSON.parse(savedNumbers);
      return Array.isArray(parsedNumbers) ? parsedNumbers.filter(num => num && num.trim() !== '') : [];
    }
  } catch (error) {
    addLogEntry('error', 'get-admin-numbers', "Error parsing admin numbers from localStorage", error);
  }
  return [];
};

export const notifyAdminsAboutSystemEvent = async (
  eventType: string, 
  data: any
): Promise<number> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('error', 'system-notification', "API key not set");
    return 0;
  }
  
  const adminNumbers = getAdminNumbers();
  if (adminNumbers.length === 0) {
    addLogEntry('warning', 'system-notification', "No admin numbers configured");
    return 0;
  }
  
  addLogEntry('info', 'system-notification', `Sending system notification to ${adminNumbers.length} admin numbers`);
  
  let message = '';
  const now = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
  
  switch (eventType) {
    case 'daily-events':
      message = formatDailyEventsMessage(data.events);
      break;
    case 'weekly-events':
      message = formatWeeklyEventsMessage(data.events);
      break;
    case 'custom-message':
      message = `🔔 *${data.title || 'Notificação do Sistema'}*\n\n${data.message}\n\n⏱️ ${now}`;
      break;
    case 'new-event':
      message = formatNewEventMessage(data.event);
      break;
    default:
      message = `🔔 *Notificação do Sistema*\n\n${JSON.stringify(data)}\n\n⏱️ ${now}`;
  }
  
  let successCount = 0;
  
  for (const number of adminNumbers) {
    try {
      const success = await sendWhatsAppMessage({
        phone: number,
        message,
        customId: `system_notification_${Date.now()}_${number}`
      });
      
      if (success) {
        successCount++;
      }
    } catch (error) {
      addLogEntry('error', 'system-notification', `Failed to send notification to ${number}`, error);
    }
  }
  
  if (successCount === 0) {
    addLogEntry('warning', 'system-notification', "Failed to send any system notifications");
  } else {
    addLogEntry('info', 'system-notification', `Successfully sent notifications to ${successCount}/${adminNumbers.length} admin numbers`);
  }
  
  return successCount;
};

const formatDailyEventsMessage = (events: any[]): string => {
  if (!events || events.length === 0) {
    return "🗓️ *Agenda do Dia*\n\nNão há eventos programados para hoje.";
  }
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(events[0].date));
  
  let message = `🗓️ *Agenda do Dia - ${formattedDate}*\n\n`;
  
  events.forEach((event, index) => {
    const time = new Intl.DateTimeFormat('pt-BR', { 
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(event.date));
    
    message += `${index + 1}. *${event.title}*\n`;
    message += `⏰ ${time} - ${event.duration} min\n`;
    
    if (event.description) {
      message += `📝 ${event.description}\n`;
    }
    
    message += `📞 ${event.contactPhone || 'Sem contato'}\n\n`;
  });
  
  return message;
};

const formatWeeklyEventsMessage = (events: any[]): string => {
  if (!events || events.length === 0) {
    return "🗓️ *Agenda da Semana*\n\nNão há eventos programados para a próxima semana.";
  }
  
  const eventsByDate: Record<string, any[]> = {};
  
  events.forEach(event => {
    const dateKey = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(event.date));
    
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    
    eventsByDate[dateKey].push(event);
  });
  
  let message = `🗓️ *Agenda da Semana*\n\n`;
  
  Object.entries(eventsByDate).forEach(([date, dateEvents]) => {
    message += `*${date}*\n`;
    
    dateEvents.forEach((event, index) => {
      const time = new Intl.DateTimeFormat('pt-BR', { 
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(event.date));
      
      message += `${index + 1}. *${event.title}* - ⏰ ${time}\n`;
    });
    
    message += '\n';
  });
  
  return message;
};

const formatNewEventMessage = (event: any): string => {
  if (!event) {
    return "⚠️ *Erro*\n\nDados do evento não fornecidos.";
  }
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(event.date));
  
  const formattedTime = new Intl.DateTimeFormat('pt-BR', { 
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(event.date));
  
  const formattedTimestamp = new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date());
  
  let message = `🔔 *Novo ${event.type === 'meeting' ? 'Reunião' : 'Evento'} Criado*\n\n`;
  message += `📅 *${event.type === 'meeting' ? 'Nova Reunião' : 'Novo Evento'} Criado*\n\n`;
  message += `*Título:* ${event.title}\n`;
  
  if (event.description) {
    message += `*Descrição:* ${event.description}\n`;
  }
  
  message += `*Data e Hora:* ${formattedDate}, ${formattedTime}\n`;
  message += `*Duração:* ${event.duration} minutos\n\n`;
  
  message += `✅ Este evento foi adicionado ao sistema automaticamente.\n\n`;
  message += `⏱️ ${formattedTimestamp}`;
  
  return message;
};

export const notifyAdminsAboutEvent = async (event: any): Promise<number> => {
  return notifyAdminsAboutSystemEvent('new-event', { event });
};

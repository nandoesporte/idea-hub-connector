
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
  
  // Add to the beginning of the array (most recent first)
  logHistory.unshift(entry);
  
  // Limit the array size
  if (logHistory.length > LOG_HISTORY_MAX_SIZE) {
    logHistory.pop();
  }
  
  // Also log to console
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
  API_KEY = apiKey;
  localStorage.setItem('whatsgw_api_key', apiKey);
  addLogEntry('info', 'configuration', "WhatsApp API key set successfully");
};

/**
 * Gets the API key
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
 * Checks if WhatsApp is configured
 */
export const isWhatsAppConfigured = (): boolean => {
  return Boolean(getApiKey());
};

/**
 * Formats the phone number to the format accepted by the API
 * Ensures the number has a country code (adds 55 for Brazil if absent)
 */
export const formatPhoneNumber = (phone: string): string | null => {
  // Remove non-numeric characters
  let numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 8) {
    addLogEntry('warning', 'format-phone', "Phone number too short", { phone, numericOnly });
    return null; // Invalid phone number
  }
  
  // If it has 8-9 digits, it's probably missing the area code and country code
  if (numericOnly.length >= 8 && numericOnly.length <= 9) {
    addLogEntry('warning', 'format-phone', "Phone number missing area code, cannot automatically determine it", { phone, numericOnly });
    toast.warning("Número de telefone sem código de área (DDD). Por favor, inclua o DDD.");
    return null;
  }
  
  // If it has 10-11 digits (with area code but without country code)
  if (numericOnly.length >= 10 && numericOnly.length <= 11) {
    numericOnly = `55${numericOnly}`;
    addLogEntry('info', 'format-phone', "Added Brazilian country code to phone number", { original: phone, formatted: numericOnly });
  }
  
  // If the number doesn't start with country code 55 (Brazil), add it
  if (numericOnly.length >= 12 && !numericOnly.startsWith('55')) {
    addLogEntry('info', 'format-phone', "Phone number doesn't start with Brazilian country code, adding it", { original: phone });
    numericOnly = `55${numericOnly}`;
  }
  
  // Final validation - Brazilian numbers with country code should have 12-13 digits
  // (55 + 2-digit area code + 8-9 digit phone number)
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
      addLogEntry('error', operation, "API access forbidden - domain not authorized or wrong API key", responseData);
      return "Acesso negado (403). Verifique se o domínio está autorizado no painel da WhatsGW e se a chave de API está correta.";
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
 * Tests the API connection without sending a message
 */
export const testApiConnection = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'connection-test', "API key not set");
    toast.error("Chave de API não configurada");
    return false;
  }
  
  try {
    // Check if the status endpoint exists first
    addLogEntry('info', 'connection-test', "Testing API connection");
    
    // Use the Send endpoint with minimum parameters as a test (using an invalid phone will just return an error)
    const testPhone = "123"; // Invalid phone that will cause a validation error but still authenticate
    const urlParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: "5544997270698", // WhatsGW sender number
      contact_phone_number: testPhone,
      message_custom_id: `test_${Date.now()}`,
      message_type: 'text',
      message_body: "test"
    });
    
    const apiUrl = `${WHATSGW_API_BASE_URL}/Send?${urlParams.toString()}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Even if it returns a validation error for the phone, if we get a JSON response
    // it means our API key is valid and the domain is authorized
    if (response.ok || (data && typeof data === 'object')) {
      addLogEntry('info', 'connection-test', "API connection successful", data);
      return true;
    }
    
    // If we got a non-JSON response or HTTP error, the connection failed
    addLogEntry('error', 'connection-test', `API connection failed with status ${response.status}`, data);
    return false;
  } catch (error) {
    addLogEntry('error', 'connection-test', "Error testing API connection", {
      message: error.message,
      stack: error.stack,
      name: error.name
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
    // Format the phone number
    const formattedPhone = formatPhoneNumber(params.phone);
    
    if (!formattedPhone) {
      addLogEntry('error', 'send-message', "Invalid phone number format", { phone: params.phone });
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    // Set URL parameters
    const urlParams = new URLSearchParams({
      apikey: apiKey,
      phone_number: "5544997270698", // WhatsGW sender number (configured in WhatsGW)
      contact_phone_number: formattedPhone,
      message_custom_id: params.customId || `msg_${Date.now()}`,
      message_type: params.mediaUrl ? (params.mimetype?.startsWith('image/') ? 'image' : 'document') : 'text',
      message_body: params.message
    });
    
    // Add media parameters if provided
    if (params.mediaUrl) {
      urlParams.set('message_body', params.mediaUrl);
      
      if (params.caption) {
        urlParams.append('message_caption', params.caption);
      }
      
      if (params.mimetype) {
        urlParams.append('message_body_mimetype', params.mimetype);
      }
      
      if (params.filename) {
        urlParams.append('message_body_filename', params.filename);
      }
      
      urlParams.append('download', '1');
    }
    
    // Build the complete URL
    const apiUrl = `${WHATSGW_API_BASE_URL}/Send?${urlParams.toString()}`;
    
    addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone}`, { url: apiUrl });
    
    // Make the API request
    const response = await fetch(apiUrl);
    
    // Check if the response was successful
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If the response is not JSON, get the text instead
        const text = await response.text();
        errorData = { message: text && text.length < 200 ? text : `HTTP error ${response.status}` };
      }
      
      const errorMessage = handleApiError(response.status, 'send-message', errorData);
      throw new Error(errorMessage);
    }
    
    // Process the response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If the response is not JSON, get the text and try to parse it
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Unexpected response format: ${text && text.length < 200 ? text : 'Response too large'}`);
      }
    }
    
    if (data.result === 'success') {
      addLogEntry('info', 'send-message', "WhatsApp message sent successfully", data);
      toast.success("Mensagem enviada com sucesso!");
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
 * Sends a test message to a specific number
 */
export const sendTestMessage = async (phone: string): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone,
    message: "🔍 *Mensagem de Teste*\n\nOlá! Este é um teste de notificação via WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente."
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
    message
  });
};

/**
 * Schedules notifications for future events
 */
export const scheduleEventReminders = async (events: any[], hoursBeforeEvent = 24): Promise<void> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('warning', 'schedule-reminders', "API key not set, skipping event reminders");
    return;
  }
  
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + (hoursBeforeEvent * 60 * 60 * 1000));
  
  // Filter events that need reminders
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > now && eventDate <= reminderThreshold;
  });
  
  addLogEntry('info', 'schedule-reminders', `Found ${upcomingEvents.length} events that need reminders`, { 
    totalEvents: events.length, 
    hoursBeforeEvent 
  });
  
  // Send reminders for each upcoming event
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
 * Sends a test message directly to the specific number provided in the example
 */
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone: "44988057213",
    message: "🔍 *Teste Direto da API*\n\nOlá! Este é um teste direto da API do WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente."
  });
};

/**
 * Gets admin notification numbers from localStorage
 */
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

/**
 * Sends a notification to all admin numbers
 */
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
  
  // Create message based on event type
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
  
  // Send to all admin numbers
  for (const number of adminNumbers) {
    try {
      const success = await sendWhatsAppMessage({
        phone: number,
        message
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

/**
 * Formats a message for daily events
 */
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

/**
 * Formats a message for weekly events
 */
const formatWeeklyEventsMessage = (events: any[]): string => {
  if (!events || events.length === 0) {
    return "🗓️ *Agenda da Semana*\n\nNão há eventos programados para a próxima semana.";
  }
  
  // Group events by date
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

/**
 * Formats a message for a new event
 */
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

/**
 * Notifies admin numbers about a new event
 */
export const notifyAdminsAboutEvent = async (event: any): Promise<number> => {
  return notifyAdminsAboutSystemEvent('new-event', { event });
};

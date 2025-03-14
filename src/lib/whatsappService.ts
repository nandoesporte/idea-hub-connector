import { toast } from "sonner";

// WhatsApp API configuration based on documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku
const WHATSGW_API_URL = "https://app.whatsgw.com.br/api/v1";
// Proxy service URL for bypassing CORS - we'll use a proxy service that works for this purpose
const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/";
let WHATSGW_API_KEY = ""; // This will be set dynamically

// Add a log history array to keep track of recent operations
const LOG_HISTORY_MAX_SIZE = 50;
const logHistory: LogEntry[] = [];

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

interface WhatsAppMessage {
  phone: string;
  message: string;
  isGroup?: boolean;
}

export interface EventReminder {
  title: string;
  date: Date;
  time: string;
  duration: number;
  contactPhone: string;
}

/**
 * Add an entry to the log history
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
  
  // Add to the beginning of the array (newest first)
  logHistory.unshift(entry);
  
  // Keep the array size limited
  if (logHistory.length > LOG_HISTORY_MAX_SIZE) {
    logHistory.pop();
  }
  
  // Also log to console
  const logMethod = type === 'error' ? console.error : 
                    type === 'warning' ? console.warn : console.log;
  
  logMethod(`[${entry.timestamp.toISOString()}] [${operation}] ${message}`, details || '');
};

/**
 * Get the log history
 */
export const getLogHistory = (): LogEntry[] => {
  return [...logHistory];
};

/**
 * Clear the log history
 */
export const clearLogHistory = (): void => {
  logHistory.length = 0;
  addLogEntry('info', 'system', 'Log history cleared');
};

/**
 * Set WhatsApp API key
 */
export const setApiKey = (apiKey: string): void => {
  WHATSGW_API_KEY = apiKey;
  localStorage.setItem('whatsapp_api_key', apiKey);
  addLogEntry('info', 'configuration', "WhatsApp API key set successfully");
};

/**
 * Get the API key
 */
export const getApiKey = (): string => {
  if (!WHATSGW_API_KEY) {
    const savedKey = localStorage.getItem('whatsapp_api_key');
    if (savedKey) {
      WHATSGW_API_KEY = savedKey;
      addLogEntry('info', 'configuration', "WhatsApp API key loaded from localStorage");
    } else {
      addLogEntry('warning', 'configuration', "No WhatsApp API key found in localStorage");
    }
  }
  return WHATSGW_API_KEY;
};

/**
 * Check if WhatsApp is configured
 */
export const isWhatsAppConfigured = (): boolean => {
  return !!getApiKey();
};

/**
 * Send a test message to a specific number (44988057213)
 * This function bypasses the normal flow to test the direct API integration
 */
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'direct-test', "WhatsApp API key not set");
    toast.error("Chave de API do WhatsApp não configurada");
    return false;
  }
  
  try {
    // Hardcoded number for testing
    const testPhone = "44988057213";
    const formattedPhone = formatPhoneNumber(testPhone);
    
    if (!formattedPhone) {
      addLogEntry('error', 'direct-test', "Invalid phone number format", { phone: testPhone });
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    addLogEntry('info', 'direct-test', `Sending direct test WhatsApp message to ${formattedPhone}`);
    
    // Send directly to the API without the proxy for testing
    const requestBody = {
      number: formattedPhone,
      message: "🔍 *Teste Direto da API*\n\nOlá! Este é um teste direto da API do WhatsApp sem usar o proxy CORS. Se você recebeu esta mensagem, a integração está funcionando corretamente."
    };
    
    addLogEntry('info', 'direct-test', "Request body", requestBody);
    
    // Try direct API call first (may work in some environments)
    const apiUrl = `${WHATSGW_API_URL}/send-message`;
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      // Detailed logging of response
      const responseStatus = response.status;
      const responseHeaders = Object.fromEntries(response.headers.entries());
      
      addLogEntry('info', 'direct-test', `Response status: ${responseStatus}`, { headers: responseHeaders });
      
      // Check if the response was successful
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP error ${response.status}` };
        }
        
        addLogEntry('error', 'direct-test', `HTTP error ${response.status}`, errorData);
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: true };
        addLogEntry('warning', 'direct-test', "Could not parse response as JSON, assuming success");
      }
      
      addLogEntry('info', 'direct-test', "WhatsApp test message sent successfully", data);
      toast.success("Mensagem de teste enviada com sucesso para 44988057213!");
      return true;
    } catch (fetchError) {
      // Log the fetch error in detail
      addLogEntry('error', 'direct-test', "Fetch error in direct API call", {
        message: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name
      });
      
      // Re-throw to be caught by outer catch
      throw fetchError;
    }
  } catch (error) {
    addLogEntry('error', 'direct-test', "Error sending direct test WhatsApp message", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // More user-friendly error message
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      toast.error("Erro ao conectar com o serviço de WhatsApp. Verifique sua conexão ou tente novamente mais tarde.");
    } else {
      toast.error(`Erro ao enviar mensagem de teste direto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    return false;
  }
};

/**
 * Send a message via WhatsApp API
 * Based on documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku
 */
export const sendWhatsAppMessage = async ({ phone, message, isGroup = false }: WhatsAppMessage): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    addLogEntry('error', 'send-message', "WhatsApp API key not set");
    toast.error("Chave de API do WhatsApp não configurada");
    return false;
  }
  
  try {
    // Format phone number (remove non-numeric characters and ensure it has country code)
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      addLogEntry('error', 'send-message', "Invalid phone number format", { phone });
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone} via ${WHATSGW_API_URL}`);
    
    // According to API documentation, request should be in this format
    const requestBody = {
      number: formattedPhone,
      message: message,
      // Optional parameters for media messages can be added here if needed
    };
    
    addLogEntry('info', 'send-message', "Request body", requestBody);
    
    // Build the full URL with the CORS proxy
    const apiUrl = `${CORS_PROXY_URL}${WHATSGW_API_URL}/send-message`;
    
    // Send request through the CORS proxy
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey, // No "Bearer" prefix according to docs
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest" // Required by some CORS proxies
        },
        body: JSON.stringify(requestBody)
      });
      
      // Detailed logging of response
      const responseStatus = response.status;
      const responseHeaders = Object.fromEntries(response.headers.entries());
      
      addLogEntry('info', 'send-message', `Response status: ${responseStatus}`, { headers: responseHeaders });
      
      // Check if the response was successful
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP error ${response.status}` };
        }
        
        addLogEntry('error', 'send-message', `HTTP error ${response.status}`, errorData);
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { success: true };
        addLogEntry('warning', 'send-message', "Could not parse response as JSON, assuming success");
      }
      
      addLogEntry('info', 'send-message', "WhatsApp message sent successfully", data);
      toast.success("Mensagem enviada com sucesso!");
      return true;
    } catch (fetchError) {
      // Log the fetch error in detail
      addLogEntry('error', 'send-message', "Fetch error in API call", {
        message: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name
      });
      
      // Re-throw to be caught by outer catch
      throw fetchError;
    }
  } catch (error) {
    addLogEntry('error', 'send-message', "Error sending WhatsApp message", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // More user-friendly error message
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      toast.error("Erro ao conectar com o serviço de WhatsApp. Verifique sua conexão ou tente novamente mais tarde.");
    } else {
      toast.error(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
    
    return false;
  }
};

/**
 * Format phone number to WhatsApp API requirements
 * Ensures the number has country code (adds 55 for Brazil if missing)
 */
export const formatPhoneNumber = (phone: string): string | null => {
  // Remove non-numeric characters
  let numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 8) {
    addLogEntry('warning', 'format-phone', "Phone number too short", { phone, numericOnly });
    return null; // Invalid phone number
  }
  
  // Handle Brazilian phone numbers specifically:
  
  // If it has 8-9 digits, it's likely missing the area code and country code
  if (numericOnly.length >= 8 && numericOnly.length <= 9) {
    // Add default Brazilian country code (55) and assume area code is missing
    // This is just a fallback - proper phone numbers should include area code
    addLogEntry('warning', 'format-phone', "Phone number missing area code, cannot automatically determine it", { phone, numericOnly });
    toast.warning("Número de telefone sem código de área (DDD). Por favor, inclua o DDD.");
    return null;
  }
  
  // If it has 10-11 digits (with area code but no country code)
  // Brazilian numbers are typically 11 digits (with 9th digit) or 10 digits (without 9th digit)
  if (numericOnly.length >= 10 && numericOnly.length <= 11) {
    // Add Brazilian country code
    numericOnly = `55${numericOnly}`;
    addLogEntry('info', 'format-phone', "Added Brazilian country code to phone number", { original: phone, formatted: numericOnly });
  }
  
  // If number doesn't start with country code 55 (Brazil), add it
  // This assumes all numbers are from Brazil
  if (numericOnly.length >= 12 && !numericOnly.startsWith('55')) {
    addLogEntry('info', 'format-phone', "Phone number doesn't start with Brazilian country code, adding it", { original: phone });
    numericOnly = `55${numericOnly}`;
  }
  
  // Final validation - proper Brazilian numbers with country code should be 12-13 digits
  // (55 + 2 digit area code + 8-9 digit phone number)
  if (numericOnly.length < 12 || numericOnly.length > 13) {
    addLogEntry('error', 'format-phone', "Invalid Brazilian phone number format", { phone, numericOnly, length: numericOnly.length });
    return null;
  }
  
  return numericOnly;
};

/**
 * Send an event reminder via WhatsApp
 */
export const sendEventReminder = async (event: EventReminder): Promise<boolean> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('error', 'event-reminder', "WhatsApp API key not set");
    toast.error("Chave de API do WhatsApp não configurada");
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
 * Schedule notifications for upcoming events
 * This function can be called periodically to check for upcoming events and send reminders
 */
export const scheduleEventReminders = async (events: any[], hoursBeforeEvent = 24): Promise<void> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('warning', 'schedule-reminders', "WhatsApp API key not set, skipping event reminders");
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

import { toast } from "sonner";

// WhatsApp API configuration based on documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku
const WHATSGW_API_URL = "https://app.whatsgw.com.br/api/v1";
// Proxy service URL for bypassing CORS - we'll use a proxy service that works for this purpose
const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/";
// Alternative proxies if the primary one fails
const ALTERNATIVE_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/"
];
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
 * Handle specific API error responses
 */
const handleApiError = (status: number, operation: string, responseData?: any): string => {
  switch (status) {
    case 401:
      addLogEntry('error', operation, "API authentication failed - invalid API key", responseData);
      return "Autenticação falhou. Verifique se sua chave de API está correta.";
    case 403:
      addLogEntry('error', operation, "API access forbidden - your account may not have permission or the API key is wrong", responseData);
      return "Acesso negado (403). Você precisa autorizar o domínio no painel da WhatsGW ou sua chave de API pode estar incorreta.";
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
 * Attempts to send a request with different proxies if the first one fails
 */
const sendWithFallbackProxies = async (url: string, options: RequestInit): Promise<Response> => {
  try {
    // First try direct API call (may work in some environments or with CORS extensions)
    addLogEntry('info', 'api-request', `Attempting direct API call to: ${url}`);
    return await fetch(url, options);
  } catch (directError) {
    addLogEntry('warning', 'api-request', `Direct API call failed, trying with proxies`, { error: directError.message });
    
    // Try main proxy
    try {
      const proxyUrl = `${CORS_PROXY_URL}${url}`;
      addLogEntry('info', 'api-request', `Trying with primary proxy: ${CORS_PROXY_URL}`);
      return await fetch(proxyUrl, {
        ...options,
        headers: {
          ...options.headers,
          "X-Requested-With": "XMLHttpRequest" // Required by some CORS proxies
        }
      });
    } catch (primaryProxyError) {
      addLogEntry('warning', 'api-request', `Primary proxy failed, trying alternatives`, { error: primaryProxyError.message });
      
      // Try alternative proxies
      for (const proxy of ALTERNATIVE_PROXIES) {
        try {
          const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
          addLogEntry('info', 'api-request', `Trying with alternative proxy: ${proxy}`);
          return await fetch(proxyUrl, options);
        } catch (alternativeProxyError) {
          addLogEntry('warning', 'api-request', `Alternative proxy ${proxy} failed`, { error: alternativeProxyError.message });
          // Continue to next proxy
        }
      }
      
      // If all proxies fail, throw the original error
      throw directError;
    }
  }
};

/**
 * Send a test message to a specific number (44988057213)
 * This function attempts to use multiple connection methods to test the direct API integration
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
    
    const apiUrl = `${WHATSGW_API_URL}/send-message`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    };

    try {
      // Try multiple connection strategies
      const response = await sendWithFallbackProxies(apiUrl, options);
      
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
        
        // Use the specific error handler
        const errorMessage = handleApiError(response.status, 'direct-test', errorData);
        throw new Error(errorMessage);
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
      addLogEntry('error', 'direct-test', "All connection methods failed", {
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
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        toast.error("Erro de conectividade com o serviço de WhatsApp. Isso pode ser devido a bloqueios de CORS no navegador ou problemas na API.");
      } else if (error.message.includes("403")) {
        toast.error("Acesso negado (403). Verifique se o domínio está autorizado no painel da WhatsGW e se a chave de API está correta.");
      } else {
        toast.error(`Erro ao enviar mensagem de teste: ${error.message}`);
      }
    } else {
      toast.error("Erro desconhecido ao enviar mensagem de teste");
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
    
    const apiUrl = `${WHATSGW_API_URL}/send-message`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey, // No "Bearer" prefix according to docs
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    };
    
    try {
      // Try multiple connection strategies
      const response = await sendWithFallbackProxies(apiUrl, options);
      
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
        
        // Use the specific error handler
        const errorMessage = handleApiError(response.status, 'send-message', errorData);
        throw new Error(errorMessage);
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
      addLogEntry('error', 'send-message', "All connection methods failed", {
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
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        toast.error("Erro de conectividade com o serviço de WhatsApp. Isso pode ser devido a bloqueios de CORS no navegador ou problemas na API.");
      } else if (error.message.includes("403")) {
        toast.error("Acesso negado (403). Verifique se o domínio está autorizado no painel da WhatsGW e se a chave de API está correta.");
      } else {
        toast.error(`Erro ao enviar mensagem: ${error.message}`);
      }
    } else {
      toast.error("Erro desconhecido ao enviar mensagem");
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
 * Get system notification numbers from localStorage
 * @returns Array of phone numbers or empty array if none configured
 */
export const getSystemNotificationNumbers = (): string[] => {
  try {
    const savedNumbersStr = localStorage.getItem('whatsapp_notification_numbers');
    if (!savedNumbersStr) return [];
    
    const savedNumbers = JSON.parse(savedNumbersStr);
    if (!Array.isArray(savedNumbers)) return [];
    
    // Filter out empty strings
    return savedNumbers.filter(number => number && number.trim() !== '');
  } catch (error) {
    console.error('Error getting system notification numbers:', error);
    return [];
  }
};

/**
 * Send system notification to all configured admin numbers
 * @param title Notification title
 * @param message Message body
 * @returns Promise resolving to number of successful notifications
 */
export const sendSystemNotification = async (title: string, message: string): Promise<number> => {
  if (!isWhatsAppConfigured()) {
    addLogEntry('warning', 'system-notification', 'WhatsApp not configured, skipping system notification');
    return 0;
  }
  
  const adminNumbers = getSystemNotificationNumbers();
  if (adminNumbers.length === 0) {
    addLogEntry('warning', 'system-notification', 'No admin notification numbers configured');
    return 0;
  }
  
  addLogEntry('info', 'system-notification', `Sending system notification to ${adminNumbers.length} admin numbers`);
  
  // Format the message for WhatsApp (add emoji and formatting)
  const formattedMessage = `🔔 *${title}*\n\n${message}\n\n⏱️ ${new Date().toLocaleString('pt-BR')}`;
  
  // Send to each admin number
  const successfulSends = [];
  
  for (const phone of adminNumbers) {
    try {
      const success = await sendWhatsAppMessage({
        phone,
        message: formattedMessage
      });
      
      if (success) {
        successfulSends.push(phone);
      }
    } catch (error) {
      addLogEntry('error', 'system-notification', `Failed to send system notification to ${phone}`, error);
    }
  }
  
  if (successfulSends.length > 0) {
    addLogEntry('info', 'system-notification', `Successfully sent ${successfulSends.length} system notifications`);
  } else {
    addLogEntry('warning', 'system-notification', 'Failed to send any system notifications');
  }
  
  return successfulSends.length;
};

/**
 * Send notification about a new event to admin numbers
 * @param event The event to notify about
 * @returns Promise resolving to number of successful notifications
 */
export const notifyAdminsAboutEvent = async (event: any): Promise<number> => {
  if (!isWhatsAppConfigured()) {
    return 0;
  }
  
  const formattedDate = event.date instanceof Date 
    ? event.date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date(event.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  
  const typeMap = {
    'meeting': 'Reunião',
    'deadline': 'Prazo',
    'task': 'Tarefa',
    'other': 'Outro'
  };
  
  const eventType = typeMap[event.type as keyof typeof typeMap] || 'Evento';
  
  const message = `📅 *Novo ${eventType} Criado*\n\n` +
    `*Título:* ${event.title}\n` +
    `*Descrição:* ${event.description || 'Não especificada'}\n` +
    `*Data e Hora:* ${formattedDate}\n` +
    `*Duração:* ${event.duration || 60} minutos\n` +
    (event.contactPhone ? `*Contato:* ${event.contactPhone}\n` : '') +
    `\n✅ Este evento foi adicionado ao sistema automaticamente.`;
  
  return sendSystemNotification(`Novo ${eventType} Criado`, message);
};

/**
 * Notify admins about status changes, new projects, etc.
 * @param type The type of notification
 * @param data The data related to the notification
 * @returns Promise resolving to number of successful notifications
 */
export const notifyAdminsAboutSystemEvent = async (type: string, data: any): Promise<number> => {
  if (!isWhatsAppConfigured()) {
    return 0;
  }
  
  let title = '';
  let message = '';
  
  switch (type) {
    case 'new-project':
      title = 'Novo Projeto Submetido';
      message = `🚀 *Novo Projeto Submetido*\n\n` +
        `*Título:* ${data.title}\n` +
        `*Categoria:* ${data.category}\n` +
        `*Descrição:* ${data.description}\n` +
        `*Orçamento:* ${data.budget || 'Não especificado'}\n` +
        `*Prazo:* ${data.timeline || 'Não especificado'}\n` +
        (data.features?.length ? `*Funcionalidades:* ${data.features.join(', ')}\n` : '') +
        `\n✅ Este projeto foi adicionado ao sistema e está aguardando análise.`;
      break;
      
    case 'status-change':
      const statusMap = {
        'pending': 'Pendente',
        'under-review': 'Em Análise',
        'approved': 'Aprovado',
        'in-progress': 'Em Desenvolvimento',
        'completed': 'Concluído',
        'rejected': 'Rejeitado'
      };
      
      const newStatus = statusMap[data.newStatus as keyof typeof statusMap] || data.newStatus;
      
      title = `Status de Projeto Alterado: ${newStatus}`;
      message = `🔄 *Alteração de Status de Projeto*\n\n` +
        `*Projeto:* ${data.title}\n` +
        `*Novo Status:* ${newStatus}\n` +
        (data.message ? `*Mensagem:* ${data.message}\n` : '') +
        `\n✅ O status deste projeto foi atualizado no sistema.`;
      break;
      
    case 'new-message':
      title = 'Nova Mensagem Recebida';
      message = `💬 *Nova Mensagem Recebida*\n\n` +
        `*De:* ${data.name}\n` +
        `*Email:* ${data.email}\n` +
        `*Assunto:* ${data.subject || 'Não especificado'}\n` +
        `*Mensagem:* ${data.message}\n` +
        `\n✅ Esta mensagem foi registrada no sistema e aguarda resposta.`;
      break;
      
    case 'daily-events':
      const events = data.events || [];
      
      if (events.length === 0) {
        title = 'Agenda do Dia';
        message = `📅 *Agenda do Dia*\n\n` +
          `Não há eventos programados para hoje.`;
      } else {
        title = `Agenda do Dia: ${events.length} Evento(s)`;
        message = `📅 *Agenda do Dia*\n\n` +
          `Eventos programados para hoje (${new Date().toLocaleDateString('pt-BR')}):\n\n`;
          
        events.forEach((event: any, index: number) => {
          const eventTime = event.date instanceof Date 
            ? event.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
          message += `*${index + 1}. ${event.title}*\n` +
            `⏰ ${eventTime}\n` +
            `⏱️ ${event.duration || 60} minutos\n` +
            (event.description ? `📝 ${event.description}\n` : '') +
            (event.contactPhone ? `📞 ${event.contactPhone}\n` : '') +
            `\n`;
        });
      }
      break;
      
    default:
      title = 'Notificação do Sistema';
      message = `ℹ️ *Notificação do Sistema*\n\n${JSON.stringify(data, null, 2)}`;
  }
  
  return sendSystemNotification(title, message);
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

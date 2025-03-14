
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
const WHATSGW_API_V1_URL = "https://app.whatsgw.com.br/api/v1";
let API_KEY = "";
let DEFAULT_PHONE_NUMBER = "5544997270698"; // Número de WhatsApp configurado na conta

// Proxy servers for CORS issues
const CORS_PROXIES = [
  "https://cors-anywhere.herokuapp.com/",
  "https://api.allorigins.win/raw?url=",
];

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
 * Tenta executar uma requisição à API usando diferentes métodos para contornar CORS
 */
const tryApiRequest = async (url: string, options?: RequestInit): Promise<Response> => {
  // Tenta fazer a requisição direta primeiro
  try {
    addLogEntry('info', 'api-request', `Attempting direct API call to: ${url}`);
    const response = await fetch(url, options);
    return response;
  } catch (directError) {
    addLogEntry('warning', 'api-request', 'Direct API call failed, trying with proxies', directError);
    
    // Se falhar, tenta com os proxies
    for (const proxy of CORS_PROXIES) {
      try {
        addLogEntry('info', 'api-request', `Trying with ${proxy}`);
        const proxyUrl = `${proxy}${url}`;
        const proxyOptions = {
          ...options,
          headers: {
            ...options?.headers,
            'X-Requested-With': 'XMLHttpRequest', // Necessário para alguns proxies
          }
        };
        const response = await fetch(proxyUrl, proxyOptions);
        return response;
      } catch (proxyError) {
        addLogEntry('warning', 'api-request', `Failed with proxy ${proxy}`, proxyError);
      }
    }
    
    // Se tudo falhar, lança um erro
    throw new Error('Falha em todas as tentativas de conexão com a API. Verifique sua conexão ou tente mais tarde.');
  }
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
    // Tenta o endpoint Status primeiro (formato URL Query)
    const url = `${WHATSGW_API_BASE_URL}/Status?apikey=${encodeURIComponent(apiKey)}`;
    
    addLogEntry('info', 'api-connection', `Testing API connection`);
    
    // Usa o método V1 da API que é mais confiável para testes
    const v1Url = `${WHATSGW_API_V1_URL}/status`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      }
    };
    
    try {
      const response = await tryApiRequest(v1Url, options);
      
      // Verifica se o status da resposta é 200
      if (response.status === 200) {
        addLogEntry('info', 'api-connection', "API connection successful", { status: response.status });
        return true;
      } else {
        const text = await response.text();
        addLogEntry('error', 'api-connection', "API connection failed with status", { 
          status: response.status, 
          text: text 
        });
        return false;
      }
    } catch (error) {
      addLogEntry('error', 'api-connection', "Error testing API connection", error);
      return false;
    }
  } catch (error) {
    addLogEntry('error', 'api-connection', "Error in API connection test", {
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
    
    // Usa a API V1 que tem formato mais simples e confiável
    const url = `${WHATSGW_API_V1_URL}/send-message`;
    
    const requestBody = {
      number: formattedPhone,
      message: params.message
    };
    
    if (params.mediaUrl) {
      // Para envio de mídias, usa o endpoint tradicional com querystring
      const queryParams = new URLSearchParams({
        apikey: apiKey,
        phone_number: DEFAULT_PHONE_NUMBER,
        contact_phone_number: formattedPhone,
        message_custom_id: params.customId || `msg_${Date.now()}`,
        message_type: 'document',
        message_caption: params.caption || '',
        message_body_mimetype: params.mimetype || 'application/pdf',
        message_body_filename: params.filename || 'file.pdf',
        download: '1',
        message_body: params.mediaUrl
      });
      
      const mediaUrl = `${WHATSGW_API_BASE_URL}/Send?${queryParams.toString()}`;
      
      addLogEntry('info', 'send-message', `Sending WhatsApp media message to ${formattedPhone}`, { 
        url: 'URL omitted from logs due to length'
      });
      
      const response = await tryApiRequest(mediaUrl);
      const data = await response.json();
      
      if (data.result === 'success') {
        addLogEntry('info', 'send-message', "WhatsApp media message sent successfully", data);
        return true;
      } else {
        addLogEntry('error', 'send-message', "API returned error for media message", data);
        toast.error(`Erro ao enviar mídia: ${data.message || 'Erro desconhecido'}`);
        return false;
      }
    } else {
      // Para mensagens de texto simples, usa o endpoint V1
      addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone} via ${WHATSGW_API_V1_URL}`, {
        requestBody
      });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(requestBody)
      };
      
      try {
        const response = await tryApiRequest(url, options);
        
        addLogEntry('info', 'send-message', `Response status: ${response.status}`, {
          headers: Object.fromEntries([...response.headers.entries()].filter(entry => {
            return !['set-cookie', 'cookie'].includes(entry[0].toLowerCase());
          }))
        });
        
        if (response.status === 200 || response.status === 201) {
          addLogEntry('info', 'send-message', "WhatsApp message sent successfully");
          return true;
        } else if (response.status === 403) {
          addLogEntry('error', 'send-message', "API access forbidden - your account may not have permission or the API key is wrong", {
            message: `HTTP error ${response.status}`
          });
          throw new Error(`Acesso negado (403). Você precisa autorizar o domínio no painel da WhatsGW ou sua chave de API pode estar incorreta.`);
        } else {
          const errorText = await response.text();
          addLogEntry('error', 'send-message', `API returned error status ${response.status}`, {
            text: errorText
          });
          throw new Error(`Erro na API (${response.status}): ${errorText}`);
        }
      } catch (fetchError) {
        addLogEntry('error', 'send-message', "All connection methods failed", fetchError);
        throw fetchError;
      }
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

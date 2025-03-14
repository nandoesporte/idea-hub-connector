import { toast } from "sonner";

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'error' | 'warning';
  operation: string;
  message: string;
  details?: any;
}

// Armazenamento de logs
const LOG_HISTORY_MAX_SIZE = 100; // Aumentado para armazenar mais logs
const logHistory: LogEntry[] = [];

// Configurações da API WhatsGW
const WHATSGW_API_BASE_URL = "https://app.whatsgw.com.br/api/v1";
let API_KEY = "";

// Lista de servidores proxy CORS para tentar em caso de erros CORS
const CORS_PROXIES = [
  "https://cors-anywhere.herokuapp.com/",
  "https://corsproxy.io/?",
  "https://proxy.cors.sh/"
];

// Interfaces para mensagens
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
  // (55 + DDD de 2 dígitos + número de telefone de 8-9 dígitos)
  if (numericOnly.length < 12 || numericOnly.length > 13) {
    addLogEntry('error', 'format-phone', "Invalid Brazilian phone number format", { phone, numericOnly, length: numericOnly.length });
    return null;
  }
  
  return numericOnly;
};

/**
 * Tenta fazer uma requisição direta à API
 */
const directApiCall = async (url: string, options: RequestInit): Promise<Response> => {
  addLogEntry('info', 'api-request', `Attempting direct API call to: ${url}`);
  try {
    return await fetch(url, options);
  } catch (error) {
    addLogEntry('warning', 'api-request', `Direct API call failed, trying with proxies`, { error });
    throw error;
  }
};

/**
 * Tenta fazer uma requisição através de um servidor proxy CORS
 */
const proxiedApiCall = async (url: string, options: RequestInit): Promise<Response> => {
  // Primeiro, tenta o proxy primário
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    const proxiedUrl = `${proxy}${url}`;
    
    addLogEntry('info', 'api-request', `Trying with proxy ${i+1}/${CORS_PROXIES.length}: ${proxy}`);
    
    try {
      // Adiciona cabeçalho necessário para CORS Anywhere
      const proxiedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'X-Requested-With': 'XMLHttpRequest'
        }
      };
      
      const response = await fetch(proxiedUrl, proxiedOptions);
      
      if (response.ok) {
        addLogEntry('info', 'api-request', `Successfully connected via proxy ${i+1}`);
        return response;
      }
      
      addLogEntry('warning', 'api-request', `Proxy ${i+1} returned status ${response.status}`, {
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Se obtemos uma resposta, mesmo que não seja 2xx, retornamos para processamento posterior
      return response;
      
    } catch (error) {
      addLogEntry('error', 'api-request', `Error with proxy ${i+1}`, { error });
      // Continua para o próximo proxy se este falhar
    }
  }
  
  // Se todos os proxies falharem
  throw new Error("Todos os métodos de conexão falharam");
};

/**
 * Faz uma requisição à API do WhatsGW, tentando diferentes métodos
 * de contornar as restrições de CORS se necessário
 */
const makeApiRequest = async (url: string, options: RequestInit): Promise<Response> => {
  try {
    // Primeiro tenta uma requisição direta
    return await directApiCall(url, options);
  } catch (directError) {
    try {
      // Se falhar (provavelmente por CORS), tenta com proxy
      return await proxiedApiCall(url, options);
    } catch (proxyError) {
      // Se todos os métodos falharem
      addLogEntry('error', 'api-request', `All connection methods failed`, { 
        message: proxyError.message,
        stack: proxyError.stack,
        name: proxyError.name
      });
      throw new Error("Acesso negado (403). Você precisa autorizar o domínio no painel da WhatsGW ou sua chave de API pode estar incorreta.");
    }
  }
};

/**
 * Trata erros específicos da API
 */
const handleApiError = (status: number, operation: string, responseData?: any): string => {
  switch (status) {
    case 401:
      addLogEntry('error', operation, "API authentication failed - invalid API key", responseData);
      return "Autenticação falhou. Verifique se sua chave de API está correta.";
    case 403:
      addLogEntry('error', operation, "API access forbidden - your account may not have permission or the API key is wrong", responseData);
      return "Acesso negado (403). Verifique se sua chave de API está correta e se você tem permissões suficientes.";
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
    
    // Prepara o corpo da requisição
    const requestBody = {
      number: formattedPhone,
      message: params.message
    };

    // Adiciona campos de mídia se fornecidos
    if (params.mediaUrl) {
      Object.assign(requestBody, {
        media_url: params.mediaUrl,
        caption: params.caption || '',
        filename: params.filename || 'file',
        mimetype: params.mimetype || 'application/octet-stream'
      });
    }
    
    addLogEntry('info', 'send-message', `Sending WhatsApp message to ${formattedPhone} via ${WHATSGW_API_BASE_URL}`, { requestBody });
    
    // Opções da requisição
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(requestBody)
    };
    
    // Faz a requisição à API
    const response = await makeApiRequest(`${WHATSGW_API_BASE_URL}/send-message`, requestOptions);
    
    addLogEntry('info', 'send-message', `Response status: ${response.status}`, {
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      const errorMessage = handleApiError(response.status, 'send-message', errorData);
      throw new Error(errorMessage);
    }
    
    // Processa a resposta
    const data = await response.json();
    
    if (data.success) {
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
 * Envia mensagem de teste direto para o número específico fornecido no exemplo
 */
export const sendTestToSpecificNumber = async (): Promise<boolean> => {
  return sendWhatsAppMessage({
    phone: "44988057213",
    message: "🔍 *Teste Direto da API*\n\nOlá! Este é um teste direto da API do WhatsApp. Se você recebeu esta mensagem, a integração está funcionando corretamente."
  });
};

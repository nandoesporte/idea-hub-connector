import { toast } from "sonner";

// WhatsApp API configuration based on documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku
const WHATSGW_API_URL = "https://app.whatsgw.com.br/api/v1";
// Proxy service URL for bypassing CORS - we'll use a proxy service that works for this purpose
const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/";
let WHATSGW_API_KEY = ""; // This will be set dynamically

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
 * Set WhatsApp API key
 */
export const setApiKey = (apiKey: string): void => {
  WHATSGW_API_KEY = apiKey;
  localStorage.setItem('whatsapp_api_key', apiKey);
  console.log("WhatsApp API key set successfully");
};

/**
 * Get the API key
 */
export const getApiKey = (): string => {
  if (!WHATSGW_API_KEY) {
    const savedKey = localStorage.getItem('whatsapp_api_key');
    if (savedKey) {
      WHATSGW_API_KEY = savedKey;
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
 * Send a message via WhatsApp API
 * Based on documentation: https://documenter.getpostman.com/view/3741041/SztBa7ku
 */
export const sendWhatsAppMessage = async ({ phone, message, isGroup = false }: WhatsAppMessage): Promise<boolean> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("WhatsApp API key not set");
    toast.error("Chave de API do WhatsApp não configurada");
    return false;
  }
  
  try {
    // Format phone number (remove non-numeric characters and ensure it has country code)
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      console.error("Invalid phone number format");
      toast.error("Formato de número de telefone inválido");
      return false;
    }
    
    console.log(`Sending WhatsApp message to ${formattedPhone} via ${WHATSGW_API_URL}`);
    
    // According to API documentation, request should be in this format
    const requestBody = {
      number: formattedPhone,
      message: message,
      // Optional parameters for media messages can be added here if needed
    };
    
    console.log("Request body:", requestBody);
    
    // Build the full URL with the CORS proxy
    const apiUrl = `${CORS_PROXY_URL}${WHATSGW_API_URL}/send-message`;
    
    // Send request through the CORS proxy
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
    
    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }
    
    const data = await response.json().catch(() => ({ success: true }));
    
    console.log("WhatsApp message sent successfully:", data);
    toast.success("Mensagem enviada com sucesso!");
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    
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
    return null; // Invalid phone number
  }
  
  // Handle Brazilian phone numbers specifically:
  
  // If it has 8-9 digits, it's likely missing the area code and country code
  if (numericOnly.length >= 8 && numericOnly.length <= 9) {
    // Add default Brazilian country code (55) and assume area code is missing
    // This is just a fallback - proper phone numbers should include area code
    console.log("Warning: Phone number missing area code, cannot automatically determine it");
    toast.warning("Número de telefone sem código de área (DDD). Por favor, inclua o DDD.");
    return null;
  }
  
  // If it has 10-11 digits (with area code but no country code)
  // Brazilian numbers are typically 11 digits (with 9th digit) or 10 digits (without 9th digit)
  if (numericOnly.length >= 10 && numericOnly.length <= 11) {
    // Add Brazilian country code
    numericOnly = `55${numericOnly}`;
    console.log("Added Brazilian country code to phone number:", numericOnly);
  }
  
  // If number doesn't start with country code 55 (Brazil), add it
  // This assumes all numbers are from Brazil
  if (numericOnly.length >= 12 && !numericOnly.startsWith('55')) {
    console.log("Phone number doesn't start with Brazilian country code, adding it");
    numericOnly = `55${numericOnly}`;
  }
  
  // Final validation - proper Brazilian numbers with country code should be 12-13 digits
  // (55 + 2 digit area code + 8-9 digit phone number)
  if (numericOnly.length < 12 || numericOnly.length > 13) {
    console.error("Invalid Brazilian phone number format:", numericOnly);
    return null;
  }
  
  return numericOnly;
};

/**
 * Send an event reminder via WhatsApp
 */
export const sendEventReminder = async (event: EventReminder): Promise<boolean> => {
  if (!isWhatsAppConfigured()) {
    console.error("WhatsApp API key not set");
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
    console.error("WhatsApp API key not set");
    return;
  }
  
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + (hoursBeforeEvent * 60 * 60 * 1000));
  
  // Filter events that need reminders
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > now && eventDate <= reminderThreshold;
  });
  
  console.log(`Found ${upcomingEvents.length} events that need reminders`);
  
  // Send reminders for each upcoming event
  for (const event of upcomingEvents) {
    if (!event.contactPhone) {
      console.log(`Skipping reminder for event "${event.title}" - no contact phone`);
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
      toast.success(`Lembrete enviado para evento "${event.title}"`);
    } else {
      toast.error(`Falha ao enviar lembrete para evento "${event.title}"`);
    }
  }
};

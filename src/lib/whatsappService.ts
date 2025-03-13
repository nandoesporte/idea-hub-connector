
import { toast } from "sonner";

// WhatsApp API configuration
const WHATSGW_API_URL = "https://app.whatsgw.com.br/api/v1";
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
    
    const response = await fetch(`${WHATSGW_API_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
        isGroup
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to send WhatsApp message");
    }
    
    console.log("WhatsApp message sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    toast.error(`Erro ao enviar mensagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return false;
  }
}

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
 * Format phone number to WhatsApp API requirements
 * Ensures the number has country code (adds 55 for Brazil if missing)
 */
export const formatPhoneNumber = (phone: string): string | null => {
  // Remove non-numeric characters
  const numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 8) {
    return null; // Invalid phone number
  }
  
  // Check if country code is present, if not add Brazil's country code (55)
  if (numericOnly.length <= 11) {
    return `55${numericOnly}`;
  }
  
  return numericOnly;
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

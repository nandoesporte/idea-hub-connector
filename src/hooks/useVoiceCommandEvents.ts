
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  processVoiceCommand, 
  saveVoiceCommandEvent, 
  fetchVoiceCommandEvents,
  deleteVoiceCommandEvent
} from '@/lib/voiceCommandService';
import { VoiceCommandEvent } from '@/types';
import { 
  sendEventReminder, 
  isWhatsAppConfigured, 
  notifyAdminsAboutEvent,
  notifyAdminsAboutSystemEvent,
  testApiConnection
} from '@/lib/whatsgwService';

export function useVoiceCommandEvents() {
  const [events, setEvents] = useState<VoiceCommandEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [notificationSending, setNotificationSending] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const fetchedEvents = await fetchVoiceCommandEvents();
        // Convert date strings to Date objects
        const formattedEvents = fetchedEvents.map(event => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.created_at)
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error loading voice command events:', error);
        toast.error('Erro ao carregar eventos de comando de voz');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    // Check WhatsApp API connection if configured
    if (isWhatsAppConfigured()) {
      checkApiConnection();
    }
  }, [refreshKey]);

  // Function to check WhatsApp API connection
  const checkApiConnection = async () => {
    try {
      const connected = await testApiConnection();
      setApiConnected(connected);
      if (connected) {
        toast.success('Conexão com a API do WhatsApp estabelecida com sucesso');
      } else {
        toast.error('Falha na conexão com a API do WhatsApp. Verifique a chave e as configurações.');
      }
    } catch (error) {
      console.error('Error checking API connection:', error);
      setApiConnected(false);
      toast.error('Erro ao verificar conexão com a API do WhatsApp');
    }
  };

  // Function to send daily events to admin numbers
  const sendDailyEventsToAdmins = async () => {
    try {
      setNotificationSending(true);
      // Get today's events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
      
      // Send notification to admin numbers
      const sent = await notifyAdminsAboutSystemEvent('daily-events', { events: todaysEvents });
      
      if (sent > 0) {
        toast.success(`Agenda do dia enviada para ${sent} número(s) de administrador`);
        return true;
      } else {
        toast.warning('Não foi possível enviar a agenda do dia para administradores');
        return false;
      }
    } catch (error) {
      console.error('Error sending daily events to admins:', error);
      toast.error('Erro ao enviar agenda do dia para administradores');
      return false;
    } finally {
      setNotificationSending(false);
    }
  };

  // Function to send system notifications to all admin numbers
  const sendSystemNotification = async (messageType: string, content: string) => {
    try {
      setNotificationSending(true);
      
      if (!isWhatsAppConfigured()) {
        toast.error('WhatsApp não configurado. Configure nas configurações do sistema.');
        return false;
      }
      
      if (apiConnected === false) {
        // Try to reconnect first
        const connected = await testApiConnection();
        if (!connected) {
          toast.error('Falha na conexão com a API do WhatsApp. Verifique a chave e as configurações.');
          return false;
        }
        setApiConnected(true);
      }
      
      const sent = await notifyAdminsAboutSystemEvent('custom-message', { 
        title: messageType,
        message: content
      });
      
      if (sent > 0) {
        toast.success(`Notificação enviada para ${sent} número(s) de administrador`);
        return true;
      } else {
        toast.warning('Não foi possível enviar a notificação para administradores');
        return false;
      }
    } catch (error) {
      console.error('Error sending system notification:', error);
      toast.error('Erro ao enviar notificação para administradores');
      return false;
    } finally {
      setNotificationSending(false);
    }
  };
  
  // Function to send week's upcoming events to admin numbers
  const sendWeekEventsToAdmins = async () => {
    try {
      setNotificationSending(true);
      // Get current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get date 7 days from now
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Filter events occurring in the next 7 days
      const weekEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate < nextWeek;
      });
      
      if (weekEvents.length === 0) {
        toast.info('Não há eventos para os próximos 7 dias');
        return false;
      }
      
      // Send notification to admin numbers
      const sent = await notifyAdminsAboutSystemEvent('weekly-events', { events: weekEvents });
      
      if (sent > 0) {
        toast.success(`Agenda da semana enviada para ${sent} número(s) de administrador`);
        return true;
      } else {
        toast.warning('Não foi possível enviar a agenda da semana para administradores');
        return false;
      }
    } catch (error) {
      console.error('Error sending weekly events to admins:', error);
      toast.error('Erro ao enviar agenda da semana para administradores');
      return false;
    } finally {
      setNotificationSending(false);
    }
  };

  // Function to send reminder to a specific event participant
  const sendEventReminderManually = async (eventId: string) => {
    try {
      setNotificationSending(true);
      
      const event = events.find(e => e.id === eventId);
      if (!event) {
        toast.error('Evento não encontrado');
        return false;
      }
      
      if (!event.contactPhone) {
        toast.warning('Este evento não possui número de telefone para contato');
        return false;
      }
      
      if (apiConnected === false) {
        // Try to reconnect first
        const connected = await testApiConnection();
        if (!connected) {
          toast.error('Falha na conexão com a API do WhatsApp. Verifique a chave e as configurações.');
          return false;
        }
        setApiConnected(true);
      }
      
      const result = await sendEventReminder({
        title: event.title,
        date: event.date,
        time: `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`,
        duration: event.duration || 60,
        contactPhone: event.contactPhone
      });
      
      if (result) {
        toast.success('Lembrete enviado com sucesso!');
        return true;
      } else {
        toast.error('Falha ao enviar lembrete');
        return false;
      }
    } catch (error) {
      console.error('Error sending reminder manually:', error);
      toast.error('Erro ao enviar lembrete manualmente');
      return false;
    } finally {
      setNotificationSending(false);
    }
  };

  const refreshEvents = () => {
    setRefreshKey(prev => prev + 1);
  };

  const createEventFromVoiceCommand = async (transcript: string) => {
    // Don't process if empty or already processing
    if (!transcript || transcript.trim() === '' || processingCommand) {
      return false;
    }
    
    try {
      setProcessingCommand(true);
      console.log('Processing transcript:', transcript);
      
      const result = await processVoiceCommand(transcript);
      
      if (!result.success) {
        toast.error('Não foi possível processar o comando de voz');
        return false;
      }
      
      console.log('Voice command processed:', result);
      
      // Use default phone number if available and no phone is specified in the command
      const defaultPhone = localStorage.getItem('default_whatsapp_number');
      if (!result.contactPhone && defaultPhone) {
        result.contactPhone = defaultPhone;
        console.log('Using default phone number:', defaultPhone);
      }
      
      const saveResult = await saveVoiceCommandEvent(result);
      
      if (!saveResult.success) {
        toast.error(`Erro ao salvar evento: ${saveResult.error}`);
        return false;
      }
      
      console.log('Voice command event saved successfully');
      toast.success('Evento criado com sucesso!');

      // Format the event for notifications - using empty string for id since it's not returned from saveVoiceCommandEvent
      const eventForNotification: VoiceCommandEvent = {
        id: '', 
        userId: '', 
        title: result.title,
        description: result.description || '',
        date: result.date,
        duration: result.duration || 60,
        type: result.type,
        contactPhone: result.contactPhone,
        createdAt: new Date()
      };

      // Check WhatsApp connection before sending notifications
      if (isWhatsAppConfigured()) {
        if (apiConnected === null) {
          const connected = await testApiConnection();
          setApiConnected(connected);
          if (!connected) {
            toast.warning('WhatsApp configurado, mas a conexão falhou. Verifique as configurações.');
          }
        }
      }

      // Send WhatsApp notification to the event contact if specified
      if (result.contactPhone && isWhatsAppConfigured() && apiConnected !== false) {
        try {
          await sendEventReminder({
            title: result.title,
            date: result.date,
            time: `${result.date.getHours().toString().padStart(2, '0')}:${result.date.getMinutes().toString().padStart(2, '0')}`,
            duration: result.duration || 60,
            contactPhone: result.contactPhone
          });
          toast.success('Notificação enviada via WhatsApp!');
        } catch (error) {
          console.error('Error sending WhatsApp notification:', error);
          // Don't show error to user here as the event was still created successfully
        }
      }
      
      // Send notifications to all admin numbers about the new event
      if (isWhatsAppConfigured() && apiConnected !== false) {
        try {
          const adminNotifications = await notifyAdminsAboutEvent(eventForNotification);
          if (adminNotifications > 0) {
            toast.success(`Notificação enviada para ${adminNotifications} administrador(es)`);
          }
        } catch (error) {
          console.error('Error sending admin notifications:', error);
        }
      }
      
      refreshEvents();
      return true;
    } catch (error) {
      console.error('Error creating event from voice command:', error);
      toast.error('Erro ao criar evento a partir do comando de voz');
      return false;
    } finally {
      setProcessingCommand(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const result = await deleteVoiceCommandEvent(id);
      if (result.success) {
        toast.success('Evento excluído com sucesso!');
        refreshEvents();
        return true;
      } else {
        toast.error(`Erro ao excluir evento: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
      return false;
    }
  };

  return {
    events,
    loading,
    refreshEvents,
    createEventFromVoiceCommand,
    processingCommand,
    deleteEvent,
    sendDailyEventsToAdmins,
    sendWeekEventsToAdmins,
    sendSystemNotification,
    sendEventReminderManually,
    notificationSending,
    apiConnected,
    checkApiConnection
  };
}

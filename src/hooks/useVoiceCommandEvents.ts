
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
  notifyAdminsAboutSystemEvent
} from '@/lib/whatsappService';

export function useVoiceCommandEvents() {
  const [events, setEvents] = useState<VoiceCommandEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [processingCommand, setProcessingCommand] = useState(false);

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
  }, [refreshKey]);

  // Function to send daily events to admin numbers
  const sendDailyEventsToAdmins = async () => {
    try {
      // Check if WhatsApp is configured
      if (!isWhatsAppConfigured()) {
        toast.warning('WhatsApp não está configurado. Configure nas configurações de administração.');
        return false;
      }
      
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
        id: '', // Fixed: Using empty string instead of saveResult.id which doesn't exist
        userId: '', // This will be filled by the backend
        title: result.title,
        description: result.description || '',
        date: result.date,
        duration: result.duration || 60,
        type: result.type,
        contactPhone: result.contactPhone,
        createdAt: new Date() // Fixed: Using createdAt instead of created_at
      };

      // Check if WhatsApp is configured before sending notifications
      if (isWhatsAppConfigured()) {
        // Send WhatsApp notification to the event contact if specified
        if (result.contactPhone) {
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
        try {
          const adminNotifications = await notifyAdminsAboutEvent(eventForNotification);
          if (adminNotifications > 0) {
            toast.success(`Notificação enviada para ${adminNotifications} administrador(es)`);
          }
        } catch (error) {
          console.error('Error sending admin notifications:', error);
          toast.warning('Não foi possível enviar notificações aos administradores');
        }
      } else {
        toast.info('WhatsApp não está configurado. Configure nas configurações de administração para ativar notificações.');
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
        
        // Notify admins about deleted event if WhatsApp is configured
        if (isWhatsAppConfigured()) {
          try {
            const deletedEvent = events.find(event => event.id === id);
            if (deletedEvent) {
              await notifyAdminsAboutSystemEvent('event-deleted', { event: deletedEvent });
            }
          } catch (error) {
            console.error('Error notifying admins about deleted event:', error);
          }
        }
        
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
    sendDailyEventsToAdmins
  };
}

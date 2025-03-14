
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  processVoiceCommand, 
  saveVoiceCommandEvent, 
  fetchVoiceCommandEvents,
  deleteVoiceCommandEvent
} from '@/lib/voiceCommandService';
import { VoiceCommandEvent } from '@/types';
import { sendEventReminder, isWhatsAppConfigured } from '@/lib/whatsappService';

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

  const refreshEvents = () => {
    setRefreshKey(prev => prev + 1);
  };

  const sendWhatsAppNotificationsToAllNumbers = async (event: VoiceCommandEvent) => {
    if (!isWhatsAppConfigured()) {
      console.log('WhatsApp not configured, skipping notifications');
      return;
    }
    
    try {
      // Get system notification numbers from localStorage
      const savedNumbersStr = localStorage.getItem('whatsapp_notification_numbers');
      if (!savedNumbersStr) return;
      
      const savedNumbers = JSON.parse(savedNumbersStr);
      if (!Array.isArray(savedNumbers) || savedNumbers.length === 0) return;
      
      console.log('Sending WhatsApp notifications to system numbers:', savedNumbers);
      
      // Send notification to each saved number
      const successfulNotifications = [];
      
      for (const phone of savedNumbers) {
        if (!phone || phone.trim() === '') continue;
        
        try {
          await sendEventReminder({
            title: event.title,
            date: event.date,
            time: `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`,
            duration: event.duration || 60,
            contactPhone: phone
          });
          successfulNotifications.push(phone);
        } catch (error) {
          console.error(`Failed to send notification to ${phone}:`, error);
        }
      }
      
      if (successfulNotifications.length > 0) {
        toast.success(`${successfulNotifications.length} notificações de sistema enviadas via WhatsApp`);
      }
    } catch (error) {
      console.error('Error sending system WhatsApp notifications:', error);
    }
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

      // Send WhatsApp notification to the event contact if specified
      if (result.contactPhone && isWhatsAppConfigured()) {
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
      
      // Send notifications to all system notification numbers
      await sendWhatsAppNotificationsToAllNumbers(eventForNotification);
      
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
    deleteEvent
  };
}


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
      
      const saveResult = await saveVoiceCommandEvent(result);
      
      if (!saveResult.success) {
        toast.error(`Erro ao salvar evento: ${saveResult.error}`);
        return false;
      }
      
      console.log('Voice command event saved successfully');
      toast.success('Evento criado com sucesso!');

      // Send WhatsApp notification if possible
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

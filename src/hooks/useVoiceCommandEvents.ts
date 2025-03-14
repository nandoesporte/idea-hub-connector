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
  testApiConnection,
  sendWhatsAppMessage
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

    if (isWhatsAppConfigured()) {
      checkApiConnection();
    }
  }, [refreshKey]);

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

  const sendDailyEventsToAdmins = async () => {
    try {
      setNotificationSending(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
      
      const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric'
      }).format(today);
      
      let message = `🗓️ *Agenda do Dia - ${formattedDate}*\n\n`;
      
      if (todaysEvents.length === 0) {
        message += "Não há eventos programados para hoje.";
      } else {
        todaysEvents.forEach((event, index) => {
          const time = new Intl.DateTimeFormat('pt-BR', { 
            hour: '2-digit', minute: '2-digit'
          }).format(new Date(event.date));
          
          message += `${index + 1}. *${event.title}*\n`;
          message += `⏰ ${time} - ${event.duration || 60} min\n`;
          
          if (event.description) {
            message += `📝 ${event.description}\n`;
          }
          
          message += `📞 ${event.contactPhone || 'Sem contato'}\n\n`;
        });
      }
      
      const adminNumbers = getAdminNumbers();
      if (adminNumbers.length === 0) {
        toast.warning('Não há números de administradores configurados');
        setNotificationSending(false);
        return false;
      }
      
      let successCount = 0;
      for (const number of adminNumbers) {
        const success = await sendWhatsAppMessage({
          phone: number,
          message: message
        });
        
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Agenda do dia enviada para ${successCount} número(s) de administrador`);
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

  const sendSystemNotification = async (messageType: string, content: string) => {
    try {
      setNotificationSending(true);
      
      if (!isWhatsAppConfigured()) {
        toast.error('WhatsApp não configurado. Configure nas configurações do sistema.');
        return false;
      }
      
      if (apiConnected === false) {
        const connected = await testApiConnection();
        if (!connected) {
          toast.error('Falha na conexão com a API do WhatsApp. Verifique a chave e as configurações.');
          return false;
        }
        setApiConnected(true);
      }
      
      const now = new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(new Date());
      
      const message = `🔔 *${messageType || 'Notificação do Sistema'}*\n\n${content}\n\n⏱️ ${now}`;
      
      const adminNumbers = getAdminNumbers();
      if (adminNumbers.length === 0) {
        toast.warning('Não há números de administradores configurados');
        setNotificationSending(false);
        return false;
      }
      
      let successCount = 0;
      for (const number of adminNumbers) {
        const success = await sendWhatsAppMessage({
          phone: number,
          message: message
        });
        
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Notificação enviada para ${successCount} número(s) de administrador`);
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

  const sendWeekEventsToAdmins = async () => {
    try {
      setNotificationSending(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const weekEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate < nextWeek;
      });
      
      let message = `🗓��� *Agenda da Semana*\n\n`;
      
      if (weekEvents.length === 0) {
        message += "Não há eventos programados para a próxima semana.";
      } else {
        const eventsByDate: Record<string, any[]> = {};
        
        weekEvents.forEach(event => {
          const dateKey = new Intl.DateTimeFormat('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric'
          }).format(new Date(event.date));
          
          if (!eventsByDate[dateKey]) {
            eventsByDate[dateKey] = [];
          }
          
          eventsByDate[dateKey].push(event);
        });
        
        Object.entries(eventsByDate).forEach(([date, dateEvents]) => {
          message += `*${date}*\n`;
          
          dateEvents.forEach((event, index) => {
            const time = new Intl.DateTimeFormat('pt-BR', { 
              hour: '2-digit', minute: '2-digit'
            }).format(new Date(event.date));
            
            message += `${index + 1}. *${event.title}* - ⏰ ${time}\n`;
          });
          
          message += '\n';
        });
      }
      
      const adminNumbers = getAdminNumbers();
      if (adminNumbers.length === 0) {
        toast.warning('Não há números de administradores configurados');
        setNotificationSending(false);
        return false;
      }
      
      let successCount = 0;
      for (const number of adminNumbers) {
        const success = await sendWhatsAppMessage({
          phone: number,
          message: message
        });
        
        if (success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Agenda da semana enviada para ${successCount} número(s) de administrador`);
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
        const connected = await testApiConnection();
        if (!connected) {
          toast.error('Falha na conexão com a API do WhatsApp. Verifique a chave e as configurações.');
          return false;
        }
        setApiConnected(true);
      }
      
      const formattedDate = new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric' 
      }).format(event.date);
      
      const time = `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`;
      
      const message = `🗓️ *Lembrete de Compromisso*\n\n` +
        `Olá! Este é um lembrete para o seu compromisso:\n\n` +
        `*${event.title}*\n` +
        `📅 Data: ${formattedDate}\n` +
        `⏰ Horário: ${time}\n` +
        `⏱️ Duração: ${event.duration || 60} minutos\n\n` +
        `Para remarcar ou cancelar, entre em contato conosco.`;
      
      const result = await sendWhatsAppMessage({
        phone: event.contactPhone,
        message: message
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

  const getAdminNumbers = (): string[] => {
    try {
      const savedNumbers = localStorage.getItem('whatsapp_notification_numbers');
      if (savedNumbers) {
        const parsedNumbers = JSON.parse(savedNumbers);
        return Array.isArray(parsedNumbers) ? parsedNumbers.filter(num => num && num.trim() !== '') : [];
      }
    } catch (error) {
      console.error('Error parsing admin numbers from localStorage:', error);
    }
    return [];
  };

  const refreshEvents = () => {
    setRefreshKey(prev => prev + 1);
  };

  const createEventFromVoiceCommand = async (transcript: string) => {
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

      if (isWhatsAppConfigured()) {
        if (apiConnected === null) {
          const connected = await testApiConnection();
          setApiConnected(connected);
          if (!connected) {
            toast.warning('WhatsApp configurado, mas a conexão falhou. Verifique as configurações.');
          }
        }
      }

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
        }
      }
      
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

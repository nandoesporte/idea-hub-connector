import React from 'react';
import { VoiceCommandEvent } from '@/types';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, Clock, Trash2, MessageSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  isWhatsAppConfigured, 
  sendWhatsAppMessage 
} from '@/lib/whatsgwService';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventsListProps {
  events: VoiceCommandEvent[];
  loading: boolean;
  onDelete?: (id: string) => Promise<boolean>;
}

const EventsList = ({ events, loading, onDelete }: EventsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-primary/10 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-primary/10 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-primary/10 rounded"></div>
              <div className="h-4 bg-primary/10 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-muted/30 rounded-full p-6 mb-4">
          <CalendarCheck className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-2">Nenhum evento encontrado</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Use os comandos de voz para criar novos eventos e eles aparecerão aqui.
        </p>
      </div>
    );
  }

  const getEventCardStyle = (date: Date) => {
    if (isPast(date) && !isToday(date)) {
      return "bg-red-50 border-red-100 hover:border-red-200 text-red-700";
    } else if (isToday(date)) {
      return "bg-blue-50 border-blue-100 hover:border-blue-200 text-blue-700";
    } else {
      return "bg-green-50 border-green-100 hover:border-green-200 text-green-700";
    }
  };

  const getEventIcon = (date: Date) => {
    if (isPast(date) && !isToday(date)) {
      return <div className="absolute left-0 top-0 h-full w-1 bg-red-300 rounded-l-md"></div>;
    } else if (isToday(date)) {
      return <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-l-md"></div>;
    } else {
      return <div className="absolute left-0 top-0 h-full w-1 bg-green-400 rounded-l-md"></div>;
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (onDelete) {
      const success = await onDelete(id);
      if (success) {
        toast.success("Evento excluído com sucesso");
      }
    }
  };

  const handleSendWhatsAppReminder = async (event: VoiceCommandEvent) => {
    if (!event.contactPhone) {
      toast.error("Este evento não possui um número de telefone para notificação");
      return;
    }
    
    if (!isWhatsAppConfigured()) {
      toast.error("Configure a API do WhatsApp primeiro nas configurações");
      return;
    }
    
    try {
      const formattedDate = format(event.date, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(event.date, "HH:mm", { locale: ptBR });
      
      const message = `🗓️ *Lembrete de Compromisso*\n\n` +
        `Olá! Este é um lembrete para o seu compromisso:\n\n` +
        `*${event.title}*\n` +
        `📅 Data: ${formattedDate}\n` +
        `⏰ Horário: ${formattedTime}\n` +
        `⏱️ Duração: ${event.duration || 60} minutos\n\n` +
        `Para remarcar ou cancelar, entre em contato conosco.`;
      
      const success = await sendWhatsAppMessage({
        phone: event.contactPhone,
        message: message
      });
      
      if (success) {
        toast.success(`Lembrete enviado para o evento "${event.title}"`);
      } else {
        toast.error(`Falha ao enviar lembrete para o evento "${event.title}"`);
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Erro ao enviar lembrete");
    }
  };

  const handleSendToAllSystemNumbers = async (event: VoiceCommandEvent) => {
    if (!isWhatsAppConfigured()) {
      toast.error("Configure a API do WhatsApp primeiro nas configurações");
      return;
    }
    
    try {
      // Get system notification numbers from localStorage
      const savedNumbersStr = localStorage.getItem('whatsapp_notification_numbers');
      if (!savedNumbersStr) {
        toast.error("Configure os números de notificação do sistema nas configurações");
        return;
      }
      
      const savedNumbers: string[] = JSON.parse(savedNumbersStr);
      if (!Array.isArray(savedNumbers) || savedNumbers.length === 0) {
        toast.error("Nenhum número de notificação do sistema configurado");
        return;
      }
      
      const formattedDate = format(event.date, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(event.date, "HH:mm", { locale: ptBR });
      
      const message = `🗓️ *Lembrete de Compromisso*\n\n` +
        `Um evento foi agendado:\n\n` +
        `*${event.title}*\n` +
        `📅 Data: ${formattedDate}\n` +
        `⏰ Horário: ${formattedTime}\n` +
        `⏱️ Duração: ${event.duration || 60} minutos\n\n`;
      
      let successCount = 0;
      
      for (const phone of savedNumbers) {
        if (!phone || phone.trim() === '') continue;
        
        try {
          const success = await sendWhatsAppMessage({
            phone: phone,
            message: message
          });
          
          if (success) successCount++;
        } catch (error) {
          console.error(`Failed to send notification to ${phone}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Lembrete enviado para ${successCount} número(s) de notificação do sistema`);
      } else {
        toast.error("Falha ao enviar lembretes para os números do sistema");
      }
    } catch (error) {
      console.error("Error sending system reminders:", error);
      toast.error("Erro ao enviar lembretes para os números do sistema");
    }
  };

  const groupedEvents = events.reduce((acc, event) => {
    const dateStr = format(event.date, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, VoiceCommandEvent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([dateStr, dateEvents]) => {
        const date = new Date(dateStr);
        return (
          <div key={dateStr} className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                isPast(date) && !isToday(date) ? 'bg-red-400' : 
                isToday(date) ? 'bg-blue-400' : 'bg-green-400'
              }`}></div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {isToday(date) 
                  ? 'Hoje' 
                  : format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
            </div>
            
            <div className="space-y-2">
              {dateEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={`p-4 border rounded-lg shadow-sm relative overflow-hidden transition-all duration-300 ${getEventCardStyle(event.date)}`}
                >
                  {getEventIcon(event.date)}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 ml-2">
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center mt-2 text-xs opacity-70">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{format(event.date, "HH:mm", { locale: ptBR })}</span>
                        {event.duration && (
                          <span className="ml-2">{event.duration} min</span>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm opacity-75">{event.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {event.contactPhone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-white/50"
                          onClick={() => handleSendWhatsAppReminder(event)}
                          title="Enviar notificação WhatsApp para o contato do evento"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-white/50"
                        onClick={() => handleSendToAllSystemNumbers(event)}
                        title="Enviar notificação para todos os números do sistema"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full hover:bg-white/50"
                              title="Excluir evento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o evento "{event.title}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventsList;

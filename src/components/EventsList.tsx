
import React from 'react';
import { VoiceCommandEvent } from '@/types';
import { format } from 'date-fns';
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
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Carregando eventos...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Nenhum evento encontrado. Use os comandos de voz para criar eventos.
        </p>
      </div>
    );
  }

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
      
      const savedNumbers = JSON.parse(savedNumbersStr);
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

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="p-3 border rounded-md bg-card text-card-foreground shadow-sm relative"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium">{event.title}</div>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <CalendarCheck className="h-3 w-3 mr-1" />
                <span>
                  {format(event.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <span className="mx-2">•</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {format(event.date, "HH:mm", { locale: ptBR })}
                </span>
              </div>
              {event.description && (
                <p className="mt-2 text-sm">{event.description}</p>
              )}
            </div>
            <div className="flex space-x-1">
              {event.contactPhone && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-50"
                  onClick={() => handleSendWhatsAppReminder(event)}
                  title="Enviar notificação WhatsApp para o contato do evento"
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={() => handleSendToAllSystemNumbers(event)}
                title="Enviar notificação para todos os números do sistema"
              >
                <Bell className="h-3 w-3" />
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-red-50"
                      title="Excluir evento"
                    >
                      <Trash2 className="h-3 w-3" />
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
  );
};

export default EventsList;


import React from 'react';
import { VoiceCommandEvent } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, Clock, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendEventReminder, isWhatsAppConfigured } from '@/lib/whatsappService';

interface EventsListProps {
  events: VoiceCommandEvent[];
  loading: boolean;
  onDelete?: (id: string) => void;
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
      const success = await sendEventReminder({
        title: event.title,
        date: event.date,
        time: `${event.date.getHours().toString().padStart(2, '0')}:${event.date.getMinutes().toString().padStart(2, '0')}`,
        duration: event.duration || 60,
        contactPhone: event.contactPhone
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
                  title="Enviar notificação WhatsApp"
                >
                  <MessageSquare className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:text-destructive/90"
                  onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList;

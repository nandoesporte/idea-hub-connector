
import React from 'react';
import { VoiceCommandEvent } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, Clock } from 'lucide-react';

interface EventsListProps {
  events: VoiceCommandEvent[];
  loading: boolean;
}

const EventsList = ({ events, loading }: EventsListProps) => {
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

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="p-3 border rounded-md bg-card text-card-foreground shadow-sm"
        >
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
      ))}
    </div>
  );
};

export default EventsList;

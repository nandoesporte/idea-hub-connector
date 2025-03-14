import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, Plus, Clock, User, Edit, Trash2, CalendarIcon, 
  RefreshCw, MessageSquare, Mic, MicOff, Loader2, Square
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleLogin } from '@react-oauth/google';
import { useIsMobile } from "@/hooks/use-mobile";
import { sendEventReminder, setApiKey, isWhatsAppConfigured } from '@/lib/whatsappService';
import VoiceCommandHelp from './VoiceCommandHelp';
import { processVoiceCommand } from '@/lib/voiceCommandService';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number;
  type: 'meeting' | 'deadline' | 'task' | 'other' | 'google';
  contactPhone?: string;
  isGoogleEvent?: boolean;
}

const serializeEvents = (events: Event[]): any[] => {
  return events.map(event => ({
    ...event,
    date: event.date.toISOString()
  }));
};

const deserializeEvents = (events: any[]): Event[] => {
  return events.map(event => ({
    ...event,
    date: new Date(event.date)
  }));
};

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Reunião com cliente ABC',
    description: 'Discutir requisitos do projeto de e-commerce',
    date: new Date(2023, 10, 15, 10, 0),
    duration: 60,
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Entrega do projeto XYZ',
    description: 'Finalizar e enviar site institucional',
    date: new Date(2023, 10, 18, 14, 30),
    duration: 30,
    type: 'deadline',
  },
  {
    id: '3',
    title: 'Revisão de portfólio',
    description: 'Atualizar e revisar portfólio com projetos recentes',
    date: new Date(),
    duration: 120,
    type: 'task',
  },
];

const eventTypeColors = {
  meeting: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'border-blue-500/50' },
  deadline: { bg: 'bg-red-500/10', text: 'text-red-500', badge: 'border-red-500/50' },
  task: { bg: 'bg-green-500/10', text: 'text-green-500', badge: 'border-green-500/50' },
  other: { bg: 'bg-purple-500/10', text: 'text-purple-500', badge: 'border-purple-500/50' },
  google: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'border-amber-500/50' },
};

const eventTypeLabels = {
  meeting: 'Reunião',
  deadline: 'Prazo',
  task: 'Tarefa',
  other: 'Outro',
  google: 'Google Agenda',
};

const AdminAgenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description: string;
    date: Date;
    time: string;
    duration: number;
    type: string;
    contactPhone: string;
  }>({
    title: '',
    description: '',
    date: new Date(),
    time: '10:00',
    duration: 60,
    type: 'meeting',
    contactPhone: '',
  });
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [googleAuthToken, setGoogleAuthToken] = useState<string | null>(localStorage.getItem('googleAuthToken'));
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('whatsapp_api_key'));
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showVoiceCommandHelp, setShowVoiceCommandHelp] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    const apiKey = localStorage.getItem('whatsapp_api_key');
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  useEffect(() => {
    const savedEvents = localStorage.getItem('adminAgendaEvents');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(deserializeEvents(parsedEvents));
      } catch (error) {
        console.error('Error parsing saved events:', error);
        setEvents(initialEvents);
      }
    } else {
      setEvents(initialEvents);
    }
  }, []);

  useEffect(() => {
    if (googleAuthToken) {
      fetchGoogleEvents();
    }
  }, [googleAuthToken, selectedDate]);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('adminAgendaEvents', JSON.stringify(serializeEvents(events)));
    }
  }, [events]);

  const datesWithEvents = [...events.map(event => event.date), ...googleEvents.map(event => new Date(event.start.dateTime || event.start.date))];

  const filteredEvents = () => {
    if (!selectedDate) return [];
    
    let localEvents = events.filter(event => 
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
    );
    
    let gEvents = googleEvents.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    const formattedGoogleEvents: Event[] = gEvents.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description || "Evento do Google Calendar",
      date: new Date(event.start.dateTime || event.start.date),
      duration: event.start.dateTime && event.end.dateTime ? 
        (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000 : 60,
      type: 'google',
      isGoogleEvent: true,
    }));
    
    if (activeTab === "local") return localEvents;
    if (activeTab === "google") return formattedGoogleEvents;
    
    const combinedEvents = [...localEvents, ...formattedGoogleEvents];
    return combinedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const sortedEvents = filteredEvents();

  const fetchGoogleEvents = async () => {
    if (!googleAuthToken) return;
    
    setIsGoogleSyncing(true);
    try {
      console.log("Fetching Google Calendar events with token:", googleAuthToken);
      
      const mockEvents = [
        {
          id: 'google1',
          summary: 'Reunião com equipe de design',
          description: 'Revisar protótipos da nova interface',
          start: { dateTime: new Date(selectedDate?.setHours(15, 0) || new Date().setHours(15, 0)).toISOString() },
          end: { dateTime: new Date(selectedDate?.setHours(16, 0) || new Date().setHours(16, 0)).toISOString() },
        },
        {
          id: 'google2',
          summary: 'Call com cliente internacional',
          description: 'Discussão sobre cronograma do projeto',
          start: { dateTime: new Date(selectedDate?.setHours(18, 30) || new Date().setHours(18, 30)).toISOString() },
          end: { dateTime: new Date(selectedDate?.setHours(19, 30) || new Date().setHours(19, 30)).toISOString() },
        },
      ];
      
      setGoogleEvents(mockEvents);
      toast.success("Calendário do Google sincronizado com sucesso!");
    } catch (error) {
      console.error("Error fetching Google events:", error);
      toast.error("Erro ao sincronizar com o Google Calendar");
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const handleGoogleLogin = (credentialResponse: any) => {
    console.log("Google login successful:", credentialResponse);
    const token = credentialResponse.credential;
    setGoogleAuthToken(token);
    localStorage.setItem('googleAuthToken', token);
    fetchGoogleEvents();
    toast.success("Conectado ao Google Calendar com sucesso!");
  };

  const handleGoogleLogout = () => {
    setGoogleAuthToken(null);
    localStorage.removeItem('googleAuthToken');
    setGoogleEvents([]);
    toast.success("Desconectado do Google Calendar!");
  };

  const handleAddEvent = () => {
    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(newEvent.date);
    eventDate.setHours(hours, minutes);

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: eventDate,
      duration: Number(newEvent.duration),
      type: newEvent.type as 'meeting' | 'deadline' | 'task' | 'other',
      contactPhone: newEvent.contactPhone,
    };

    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    
    setIsAddEventOpen(false);
    resetNewEvent();
    
    toast.success('Evento adicionado com sucesso!');
    
    setSelectedDate(eventDate);
  };

  const handleUpdateEvent = (id: string) => {
    const eventToUpdate = events.find(e => e.id === id);
    if (!eventToUpdate) return;

    const [hours, minutes] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(newEvent.date);
    eventDate.setHours(hours, minutes);

    const updatedEvents = events.map(event => 
      event.id === id 
        ? {
            ...event,
            title: newEvent.title,
            description: newEvent.description,
            date: eventDate,
            duration: Number(newEvent.duration),
            type: newEvent.type as 'meeting' | 'deadline' | 'task' | 'other',
            contactPhone: newEvent.contactPhone,
          }
        : event
    );

    setEvents(updatedEvents);
    setEditingEvent(null);
    resetNewEvent();
    setIsAddEventOpen(false);
    
    setSelectedDate(eventDate);
    
    toast.success('Evento atualizado com sucesso!');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast.success('Evento removido com sucesso!');
  };

  const handleEditEvent = (id: string) => {
    const eventToEdit = events.find(e => e.id === id);
    if (!eventToEdit) return;

    setNewEvent({
      title: eventToEdit.title,
      description: eventToEdit.description,
      date: eventToEdit.date,
      time: `${eventToEdit.date.getHours().toString().padStart(2, '0')}:${eventToEdit.date.getMinutes().toString().padStart(2, '0')}`,
      duration: eventToEdit.duration,
      type: eventToEdit.type,
      contactPhone: eventToEdit.contactPhone || '',
    });

    setEditingEvent(id);
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate || new Date(),
      time: '10:00',
      duration: 60,
      type: 'meeting',
      contactPhone: '',
    });
  };

  const handleSendWhatsAppReminder = async (event: Event) => {
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
        duration: event.duration,
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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setNewEvent(prev => ({ ...prev, date }));
    }
  };

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    // Create a speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure speech recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    // Set up event handlers
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      console.log("Speech recognition result:", transcript);
      setTranscript(transcript);
    };

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended, isListening:", isListening);
      if (isListening) {
        // Store the final transcript before changing isListening state
        const finalTranscript = transcript;
        console.log("Final transcript:", finalTranscript);
        setIsListening(false);
        
        // Only process if we have a transcript
        if (finalTranscript && finalTranscript.trim() !== '') {
          handleVoiceCommand(finalTranscript);
        } else {
          toast.error('Nenhum comando de voz detectado');
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error('Erro no reconhecimento de voz. Tente novamente.');
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);  // Remove transcript dependency to avoid recreating recognition object

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    if (recognitionRef.current) {
      recognitionRef.current.start();
      toast.info('Escutando comando de voz. Diga o evento que deseja agendar...');
    } else {
      toast.error('Reconhecimento de voz não suportado neste navegador.');
    }
  };

  const stopListening = () => {
    console.log("Stop listening called, current transcript:", transcript);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // The onend event will handle processing the transcript
    }
  };

  const handleVoiceCommand = async (finalTranscript: string) => {
    console.log("Handling voice command with transcript:", finalTranscript);
    
    if (!finalTranscript || !finalTranscript.trim()) {
      toast.error('Nenhum comando detectado. Tente novamente.');
      return;
    }

    setIsProcessingVoice(true);
    try {
      console.log("Processing voice command:", finalTranscript);
      const result = await processVoiceCommand(finalTranscript);
      console.log("Voice command processing result:", result);
      
      if (result.success) {
        // Create a new event with parsed data
        const eventDate = new Date(result.date);
        console.log("Creating event with date:", eventDate);
        
        const event = {
          id: Date.now().toString(),
          title: result.title || 'Novo evento',
          description: result.description || '',
          date: eventDate,
          duration: result.duration || 60,
          type: result.type || 'other',
          contactPhone: result.contactPhone || '',
        };

        console.log("Adding new event:", event);
        setEvents(prevEvents => [...prevEvents, event]);
        setSelectedDate(eventDate);
        
        toast.success('Evento adicionado por comando de voz!', {
          description: `"${result.title}" agendado para ${format(eventDate, 'PPP', { locale: ptBR })} às ${format(eventDate, 'HH:mm')}`
        });
      } else {
        console.error("Voice command processing failed:", result);
        toast.error('Não foi possível processar o comando de voz. Tente novamente com mais detalhes.');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Erro ao processar comando de voz');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl">Agenda Administrativa</CardTitle>
            <CardDescription>Gerencie seus compromissos e tarefas</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className={`w-full sm:w-auto ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessingVoice}
              >
                {isProcessingVoice ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isListening ? (
                  <Square className="h-4 w-4 mr-2" />
                ) : (
                  <Mic className="h-4 w-4 mr-2" />
                )}
                {isListening ? 'Parar' : 'Comando de Voz'}
              </Button>
              
              <Dialog open={showVoiceCommandHelp} onOpenChange={setShowVoiceCommandHelp}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2"
                    title="Ajuda para comandos de voz"
                  >
                    ?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <VoiceCommandHelp />
                </DialogContent>
              </Dialog>
            </div>
            
            {!googleAuthToken ? (
              <div className="w-full sm:w-auto">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log('Login Failed');
                    toast.error("Falha ao conectar com o Google");
                  }}
                  theme="filled_blue"
                  text="signin_with"
                  size={isMobile ? "medium" : "large"}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchGoogleEvents} 
                  disabled={isGoogleSyncing}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGoogleSyncing ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGoogleLogout}
                  className="w-full sm:w-auto"
                >
                  Desconectar
                </Button>
              </div>
            )}
            
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={() => { resetNewEvent(); setEditingEvent(null); }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Editar Evento' : 'Adicionar Novo Evento'}</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do evento abaixo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title" 
                      value={newEvent.title} 
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Ex: Reunião com cliente"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      value={newEvent.description} 
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Detalhes do evento"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="justify-start text-left"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {format(newEvent.date, "PPP", { locale: ptBR })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newEvent.date}
                            onSelect={(date) => {
                              if (date) {
                                setNewEvent({...newEvent, date});
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Horário</Label>
                      <Input 
                        id="time" 
                        type="time"
                        value={newEvent.time} 
                        onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Input 
                        id="duration" 
                        type="number"
                        min={15}
                        step={15}
                        value={newEvent.duration} 
                        onChange={(e) => setNewEvent({...newEvent, duration: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo</Label>
                      <select 
                        id="type" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newEvent.type} 
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      >
                        <option value="meeting">Reunião</option>
                        <option value="deadline">Prazo</option>
                        <option value="task">Tarefa</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Telefone para Notificação (opcional)</Label>
                    <Input 
                      id="contactPhone" 
                      placeholder="Ex: (11) 98765-4321"
                      value={newEvent.contactPhone || ''}
                      onChange={(e) => setNewEvent({...newEvent, contactPhone: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Adicione um número de telefone para enviar lembretes por WhatsApp
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    if (editingEvent) {
                      setEditingEvent(null);
                    } else {
                      setIsAddEventOpen(false);
                    }
                    resetNewEvent();
                  }}>Cancelar</Button>
                  <Button onClick={() => {
                    if (editingEvent) {
                      handleUpdateEvent(editingEvent);
                    } else {
                      handleAddEvent();
                    }
                  }}>
                    {editingEvent ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isListening && (
          <Alert className="mt-2 bg-blue-50 border-blue-200">
            <Mic className="h-4 w-4 text-blue-500" />
            <AlertTitle>Ouvindo comando de voz</AlertTitle>
            <AlertDescription className="text-sm italic">
              "{transcript || 'Aguardando comando...'}"
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7 md:gap-6">
          <div className="rounded-lg border bg-card shadow-sm p-4 md:col-span-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                event: datesWithEvents,
              }}
              modifiersStyles={{
                event: { border: '2px solid var(--primary)', borderRadius: '100%' }
              }}
              className="mx-auto"
            />

            {googleAuthToken && (
              <Alert className="mt-4">
                <CalendarIcon className="h-4 w-4" />
                <AlertTitle>Google Calendar Conectado</AlertTitle>
                <AlertDescription>
                  Seus eventos do Google Calendar estão sendo exibidos junto com os eventos locais.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="rounded-lg border bg-card shadow-sm p-4 md:col-span-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <CalendarDays className="h-5 w-5 text-primary mr-2 hidden sm:inline" />
                  {selectedDate 
                    ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                    : "Selecione uma data"}
                </h3>
              </div>
              
              {googleAuthToken && (
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="local">Meus Eventos</TabsTrigger>
                    <TabsTrigger value="google">Google Calendar</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              {sortedEvents.length > 0 ? (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {sortedEvents.map((event: any) => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-lg border ${eventTypeColors[event.type].bg} ${eventTypeColors[event.type].text} relative`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge variant="outline" className={eventTypeColors[event.type].badge}>
                              {eventTypeLabels[event.type]}
                            </Badge>
                            {event.contactPhone && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
                                WhatsApp
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm opacity-90">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> 
                              {format(event.date, 'HH:mm')}
                            </span>
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" /> 
                              {event.isGoogleEvent ? 'Google Calendar' : 'Admin'}
                            </span>
                            <span>{event.duration} min</span>
                          </div>
                        </div>
                        {!event.isGoogleEvent && (
                          <div className="flex space-x-1">
                            {event.contactPhone && isWhatsAppConfigured() && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-50"
                                onClick={() => handleSendWhatsAppReminder(event)}
                                title="Enviar lembrete WhatsApp"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => {
                                handleEditEvent(event.id);
                                setIsAddEventOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive hover:text-destructive/90"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {selectedDate 
                    ? "Nenhum evento agendado para este dia"
                    : "Selecione uma data para ver os eventos"}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-xs text-muted-foreground">
          Agenda com {events.length} eventos locais {googleEvents.length > 0 ? `e ${googleEvents.length} eventos do Google Calendar` : ''}
        </p>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Exportar Agenda
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminAgenda;

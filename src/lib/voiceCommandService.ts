import { addDays, setHours, setMinutes, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from './supabase';

interface VoiceCommandResult {
  success: boolean;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  type: 'meeting' | 'deadline' | 'task' | 'other';
  contactPhone?: string;
  reminderScheduledFor?: Date | null;
}

/**
 * Processes a voice command to extract event details
 */
export async function processVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
  try {
    console.log('Processing voice command:', transcript);
    
    if (!transcript || transcript.trim() === '') {
      return {
        success: false,
        title: 'Erro no processamento',
        date: new Date(),
        type: 'other',
      };
    }
    
    const parsedResult = simulateGpt4Response(transcript);
    console.log("Parsed voice command result:", parsedResult);
    
    const eventDate = processDateTimeInfo(
      parsedResult.dateInfo,
      parsedResult.timeInfo
    );
    
    console.log("Processed event date:", eventDate);
    
    return {
      success: true,
      title: parsedResult.title || "Novo evento",
      description: parsedResult.description || "",
      date: eventDate,
      duration: parsedResult.duration || 60,
      type: validateEventType(parsedResult.type),
      contactPhone: parsedResult.contactPhone || "",
      reminderScheduledFor: parsedResult.reminderScheduledFor || null,
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    return {
      success: false,
      title: 'Erro no processamento',
      date: new Date(),
      type: 'other',
    };
  }
}

/**
 * Saves a voice command event to Supabase
 */
export async function saveVoiceCommandEvent(event: VoiceCommandResult): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    console.log('Saving voice command event:', event);
    
    const reminderScheduledFor = event.reminderScheduledFor 
      ? event.reminderScheduledFor.toISOString() 
      : null;
    
    console.log('Reminder scheduled for:', reminderScheduledFor);
    
    const { data, error } = await supabase
      .from('voice_command_events')
      .insert({
        user_id: session.user.id,
        title: event.title,
        description: event.description || '',
        date: event.date.toISOString(),
        duration: event.duration || 60,
        type: event.type,
        contact_phone: event.contactPhone || '',
        reminder_scheduled_for: reminderScheduledFor
      });
    
    if (error) {
      console.error('Error saving voice command event:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Voice command event saved successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error in saveVoiceCommandEvent:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Fetches voice command events for the current user
 */
export async function fetchVoiceCommandEvents(): Promise<any[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.error('No authenticated user found');
      return [];
    }
    
    const { data, error } = await supabase
      .from('voice_command_events')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching voice command events:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchVoiceCommandEvents:', error);
    return [];
  }
}

/**
 * Deletes a voice command event
 */
export async function deleteVoiceCommandEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    console.log('Deleting voice command event:', id);
    
    const { error } = await supabase
      .from('voice_command_events')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error deleting voice command event:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Voice command event deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteVoiceCommandEvent:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Validates and returns a proper event type
 */
function validateEventType(type: string): 'meeting' | 'deadline' | 'task' | 'other' {
  const validTypes = ['meeting', 'deadline', 'task', 'other'];
  
  if (!type) return 'other';
  
  if (type.includes('reuni') || type.includes('meet'))
    return 'meeting';
  if (type.includes('prazo') || type.includes('deadline') || type.includes('entrega'))
    return 'deadline';
  if (type.includes('tarefa') || type.includes('task'))
    return 'task';
  
  if (validTypes.includes(type as any)) {
    return type as 'meeting' | 'deadline' | 'task' | 'other';
  }
  
  return 'other';
}

/**
 * Process date and time information to create a Date object
 */
function processDateTimeInfo(dateInfo: string, timeInfo: string): Date {
  const now = new Date();
  let eventDate = new Date();
  
  if (!dateInfo || dateInfo.toLowerCase().includes('hoje')) {
    console.log("Date info indicates today");
  } else if (dateInfo.toLowerCase().includes('amanhã') || dateInfo.toLowerCase().includes('amanha')) {
    console.log("Date info indicates tomorrow");
    eventDate = addDays(now, 1);
  } else if (dateInfo.toLowerCase().includes('próxima') || dateInfo.toLowerCase().includes('proxima') || 
             dateInfo.toLowerCase().includes('próximo') || dateInfo.toLowerCase().includes('proximo')) {
    console.log("Date info indicates next week");
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    for (let i = 0; i < weekdays.length; i++) {
      if (dateInfo.toLowerCase().includes(weekdays[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7 || 7;
        eventDate = addDays(now, daysToAdd);
        console.log(`Found weekday ${weekdays[i]}, adding ${daysToAdd} days`);
        break;
      }
    }
  } else if (dateInfo.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)) {
    console.log("Date info contains DD/MM format");
    const dateParts = dateInfo.match(/\d+/g)?.map(Number);
    if (dateParts && dateParts.length >= 2) {
      const day = dateParts[0];
      const month = dateParts[1] - 1;
      const year = dateParts.length > 2 ? dateParts[2] : now.getFullYear();
      const fullYear = year < 100 ? 2000 + year : year;
      eventDate = new Date(fullYear, month, day);
      console.log(`Parsed date parts: day=${day}, month=${month}, year=${fullYear}`);
    }
  } else if (dateInfo.match(/\d{1,2} de [a-zç]+( de \d{2,4})?/i)) {
    console.log("Date info contains 'DD de Month' format");
    try {
      const dateFormat = dateInfo.includes(' de 20') ? 'dd\' de \'MMMM\' de \'yyyy' : 'dd\' de \'MMMM';
      const parsedDate = parse(dateInfo, dateFormat, new Date(), { locale: ptBR });
      console.log(`Attempted to parse date with format ${dateFormat}: ${parsedDate}`);
      if (isValid(parsedDate)) {
        eventDate = parsedDate;
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }
  
  if (timeInfo) {
    console.log("Processing time info:", timeInfo);
    if (timeInfo.toLowerCase().includes('manhã') || timeInfo.toLowerCase().includes('manha')) {
      eventDate = setHours(eventDate, 9);
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to morning (9:00)");
    } else if (timeInfo.toLowerCase().includes('tarde')) {
      eventDate = setHours(eventDate, 14);
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to afternoon (14:00)");
    } else if (timeInfo.toLowerCase().includes('noite')) {
      eventDate = setHours(eventDate, 19);
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to evening (19:00)");
    } else {
      const timeMatch = timeInfo.match(/(\d{1,2})[hH:](\d{1,2})?/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        eventDate = setHours(eventDate, hours);
        eventDate = setMinutes(eventDate, minutes);
        console.log(`Extracted specific time: ${hours}:${minutes}`);
      } else {
        const hoursMatch = timeInfo.match(/(\d{1,2})[hH]/);
        if (hoursMatch) {
          const hours = parseInt(hoursMatch[1]);
          eventDate = setHours(eventDate, hours);
          eventDate = setMinutes(eventDate, 0);
          console.log(`Extracted hours only: ${hours}:00`);
        } else {
          const numericTime = timeInfo.match(/(\d{1,2})(?:\s+horas?)?/);
          if (numericTime) {
            const hours = parseInt(numericTime[1]);
            if (hours >= 0 && hours <= 23) {
              eventDate = setHours(eventDate, hours);
              eventDate = setMinutes(eventDate, 0);
              console.log(`Extracted numeric time: ${hours}:00`);
            }
          }
        }
      }
    }
  } else {
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    eventDate = setHours(eventDate, currentHours);
    eventDate = setMinutes(eventDate, currentMinutes);
    console.log(`No time specified, using current time: ${currentHours}:${currentMinutes}`);
  }
  
  return eventDate;
}

/**
 * Simulates a response for demo purposes
 */
function simulateGpt4Response(transcript: string): any {
  console.log('Simulating response for:', transcript);
  
  let cleanedTranscript = transcript.trim();
  if (cleanedTranscript.toLowerCase().startsWith('guardando ')) {
    cleanedTranscript = cleanedTranscript.substring('guardando '.length);
  }
  
  const now = new Date();
  
  let title = '';
  let description = '';
  let dateInfo = 'hoje';
  let timeInfo = '';
  let duration = 60;
  let type = 'meeting';
  let contactPhone = '';
  let reminderScheduledFor = null;
  
  if (cleanedTranscript.toLowerCase().includes('reunião') || cleanedTranscript.toLowerCase().includes('meeting')) {
    type = 'meeting';
    title = cleanedTranscript.toLowerCase().includes('reunião com') ? 
      'Reunião com ' + cleanedTranscript.split('reunião com')[1].split(' às')[0].trim() :
      'Reunião';
  } else if (cleanedTranscript.toLowerCase().includes('prazo') || cleanedTranscript.toLowerCase().includes('deadline')) {
    type = 'deadline';
    title = cleanedTranscript.toLowerCase().includes('prazo para') ? 
      'Prazo: ' + cleanedTranscript.split('prazo para')[1].split(' em')[0].trim() :
      'Prazo de entrega';
  } else if (cleanedTranscript.toLowerCase().includes('tarefa') || cleanedTranscript.toLowerCase().includes('task')) {
    type = 'task';
    title = cleanedTranscript.toLowerCase().includes('tarefa de') ? 
      'Tarefa: ' + cleanedTranscript.split('tarefa de')[1].split(' para')[0].trim() :
      'Nova tarefa';
  } else if (cleanedTranscript.toLowerCase().includes('agendar')) {
    if (cleanedTranscript.toLowerCase().includes('agendar reunião')) {
      type = 'meeting';
      title = 'Reunião';
      const afterAgendar = cleanedTranscript.toLowerCase().split('agendar reunião')[1];
      if (afterAgendar && afterAgendar.includes('para')) {
        const titlePart = afterAgendar.split('para')[0].trim();
        if (titlePart) {
          title = 'Reunião: ' + titlePart;
        }
      }
    } else {
      const afterAgendar = cleanedTranscript.toLowerCase().split('agendar')[1];
      if (afterAgendar && afterAgendar.trim()) {
        title = 'Evento: ' + afterAgendar.split('para')[0].trim();
      } else {
        title = 'Novo evento agendado';
      }
    }
  } else {
    const potentialTitle = cleanedTranscript.split(' para ')[0].split(' às ')[0].split(' em ')[0];
    title = potentialTitle || 'Novo evento';
    
    if (cleanedTranscript.toLowerCase().includes('conversar') || cleanedTranscript.toLowerCase().includes('encontro') || 
        cleanedTranscript.toLowerCase().includes('call') || cleanedTranscript.toLowerCase().includes('entrevista')) {
      type = 'meeting';
    } else if (cleanedTranscript.toLowerCase().includes('entregar') || cleanedTranscript.toLowerCase().includes('finalizar') ||
               cleanedTranscript.toLowerCase().includes('completar')) {
      type = 'deadline';
    } else if (cleanedTranscript.toLowerCase().includes('fazer') || cleanedTranscript.toLowerCase().includes('completar') ||
               cleanedTranscript.toLowerCase().includes('revisar')) {
      type = 'task';
    }
  }
  
  if (!title && cleanedTranscript) {
    const words = cleanedTranscript.split(' ');
    title = words.slice(0, Math.min(5, words.length)).join(' ');
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
  }
  
  if (cleanedTranscript.toLowerCase().includes('amanhã') || cleanedTranscript.toLowerCase().includes('amanha')) {
    dateInfo = 'amanhã';
  } else if (cleanedTranscript.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)) {
    const dateMatch = cleanedTranscript.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/);
    if (dateMatch) {
      dateInfo = dateMatch[0];
    }
  } else if (cleanedTranscript.toLowerCase().includes('segunda')) {
    dateInfo = 'próxima segunda';
  } else if (cleanedTranscript.toLowerCase().includes('terça')) {
    dateInfo = 'próxima terça';
  } else if (cleanedTranscript.toLowerCase().includes('quarta')) {
    dateInfo = 'próxima quarta';
  } else if (cleanedTranscript.toLowerCase().includes('quinta')) {
    dateInfo = 'próxima quinta';
  } else if (cleanedTranscript.toLowerCase().includes('sexta')) {
    dateInfo = 'próxima sexta';
  } else if (cleanedTranscript.toLowerCase().includes('sábado') || cleanedTranscript.toLowerCase().includes('sabado')) {
    dateInfo = 'próximo sábado';
  } else if (cleanedTranscript.toLowerCase().includes('domingo')) {
    dateInfo = 'próximo domingo';
  } else if (cleanedTranscript.toLowerCase().includes(' dia ')) {
    const dayMatch = cleanedTranscript.match(/ dia (\d{1,2})/i);
    if (dayMatch && dayMatch[1]) {
      const day = parseInt(dayMatch[1]);
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      let month = currentMonth;
      
      if (day < currentDay) {
        month = (currentMonth + 1) % 12;
      }
      
      dateInfo = `${day}/${month + 1}`;
    }
  }
  
  const timeRegex = /\d{1,2}[hH:](\d{1,2})?/;
  const timeMatch = cleanedTranscript.match(timeRegex);
  if (timeMatch) {
    timeInfo = timeMatch[0];
  } else if (cleanedTranscript.toLowerCase().includes(' às ')) {
    const afterAs = cleanedTranscript.split(' às ')[1];
    if (afterAs) {
      const hourMatch = afterAs.match(/(\d{1,2})/);
      if (hourMatch && hourMatch[1]) {
        timeInfo = hourMatch[1] + 'h';
      } else if (afterAs.includes('manhã') || afterAs.includes('manha')) {
        timeInfo = 'manhã';
      } else if (afterAs.includes('tarde')) {
        timeInfo = 'tarde';
      } else if (afterAs.includes('noite')) {
        timeInfo = 'noite';
      }
    }
  } else if (cleanedTranscript.toLowerCase().includes('manhã')) {
    timeInfo = 'manhã';
  } else if (cleanedTranscript.toLowerCase().includes('tarde')) {
    timeInfo = 'tarde';
  } else if (cleanedTranscript.toLowerCase().includes('noite')) {
    timeInfo = 'noite';
  } else {
    const hoursMatch = cleanedTranscript.match(/(\d{1,2})\s*horas?/i);
    if (hoursMatch) {
      timeInfo = hoursMatch[1] + 'h';
    }
  }
  
  const durationMatch = cleanedTranscript.match(/duração de (\d+) (hora|minuto)/);
  if (durationMatch) {
    const durationValue = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2];
    
    if (durationUnit.includes('hora')) {
      duration = durationValue * 60;
    } else {
      duration = durationValue;
    }
  }
  
  const phoneRegex = /(\d{2})?[\s-]?(\d{8,9})|(\d{2})?[\s-]?(\d{4,5})[\s-]?(\d{4})/;
  const phoneMatch = cleanedTranscript.match(phoneRegex);
  let extractedContactPhone = '';
  if (phoneMatch) {
    extractedContactPhone = phoneMatch[0].replace(/\D/g, '');
    if (extractedContactPhone.length === 8 || extractedContactPhone.length === 9) {
      extractedContactPhone = '11' + extractedContactPhone;
    }
  }
  
  description = cleanedTranscript;
  
  return {
    title,
    description,
    dateInfo,
    timeInfo,
    duration,
    type,
    contactPhone: extractedContactPhone,
    reminderScheduledFor
  };
}

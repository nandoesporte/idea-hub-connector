import { addDays, setHours, setMinutes, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface for the result of processing a voice command
interface VoiceCommandResult {
  success: boolean;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  type: 'meeting' | 'deadline' | 'task' | 'other';
  contactPhone?: string;
}

/**
 * Processes a voice command to extract event details
 */
export async function processVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
  try {
    console.log('Processing voice command:', transcript);
    
    // For simulating NLP processing in this demo
    const parsedResult = simulateNlpProcessing(transcript);
    console.log('Parsed result:', parsedResult);
    
    // Process the date and time information
    const eventDate = processDateTimeInfo(
      parsedResult.dateInfo,
      parsedResult.timeInfo
    );
    
    // Return the processed command
    return {
      success: true,
      title: parsedResult.title,
      description: parsedResult.description,
      date: eventDate,
      duration: parsedResult.duration || 60,
      type: validateEventType(parsedResult.type),
      contactPhone: parsedResult.contactPhone,
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    // Return a default failed result
    return {
      success: false,
      title: 'Erro no processamento',
      date: new Date(),
      type: 'other',
    };
  }
}

/**
 * Validates and returns a proper event type
 */
function validateEventType(type: string): 'meeting' | 'deadline' | 'task' | 'other' {
  const validTypes = ['meeting', 'deadline', 'task', 'other'];
  
  // Try to determine type from Portuguese words
  if (type.includes('reuni') || type.includes('meet') || type.includes('call'))
    return 'meeting';
  if (type.includes('prazo') || type.includes('deadline') || type.includes('entrega'))
    return 'deadline';
  if (type.includes('tarefa') || type.includes('task'))
    return 'task';
  
  // Check if it's already a valid type
  if (validTypes.includes(type as any)) {
    return type as 'meeting' | 'deadline' | 'task' | 'other';
  }
  
  // Default to other
  return 'other';
}

/**
 * Process date and time information to create a Date object
 */
function processDateTimeInfo(dateInfo: string, timeInfo: string): Date {
  const now = new Date();
  let eventDate = new Date();
  
  // Process date information
  if (dateInfo.includes('hoje')) {
    // Today - keep the current date
  } else if (dateInfo.includes('amanhã') || dateInfo.includes('amanha')) {
    eventDate = addDays(now, 1);
  } else if (dateInfo.includes('próxima') || dateInfo.includes('proxima')) {
    // Handle "próxima [day of week]"
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    for (let i = 0; i < weekdays.length; i++) {
      if (dateInfo.includes(weekdays[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7 || 7; // If today, then next week
        eventDate = addDays(now, daysToAdd);
        break;
      }
    }
  } else if (dateInfo.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)) {
    // Handle date in format DD/MM or DD/MM/YYYY
    const dateParts = dateInfo.match(/\d+/g)?.map(Number);
    if (dateParts && dateParts.length >= 2) {
      const day = dateParts[0];
      const month = dateParts[1] - 1; // Month is 0-indexed in Date
      const year = dateParts[2] || now.getFullYear();
      eventDate = new Date(year, month, day);
    }
  } else if (dateInfo.match(/\d{1,2}\s+de\s+[a-zç]+(\s+de\s+\d{2,4})?/i)) {
    // Handle date in format "DD de Month [de YYYY]"
    try {
      const dateFormat = dateInfo.includes(' de 20') ? 'dd\' de \'MMMM\' de \'yyyy' : 'dd\' de \'MMMM';
      const parsedDate = parse(dateInfo, dateFormat, new Date(), { locale: ptBR });
      if (isValid(parsedDate)) {
        eventDate = parsedDate;
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  } else {
    // Check for day of week without "próxima"
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    for (let i = 0; i < weekdays.length; i++) {
      if (dateInfo.includes(weekdays[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        let daysToAdd = (targetDay - currentDay) % 7;
        if (daysToAdd <= 0) daysToAdd += 7; // If today or past, go to next week
        eventDate = addDays(now, daysToAdd);
        break;
      }
    }
  }
  
  // Process time information
  if (timeInfo) {
    if (timeInfo.includes('manhã') || timeInfo.includes('manha')) {
      eventDate = setHours(eventDate, 9); // Default morning time: 9 AM
      eventDate = setMinutes(eventDate, 0);
    } else if (timeInfo.includes('tarde')) {
      eventDate = setHours(eventDate, 14); // Default afternoon time: 2 PM
      eventDate = setMinutes(eventDate, 0);
    } else if (timeInfo.includes('noite')) {
      eventDate = setHours(eventDate, 19); // Default evening time: 7 PM
      eventDate = setMinutes(eventDate, 0);
    } else {
      // Try to extract hours and minutes
      const timeMatch = timeInfo.match(/(\d{1,2})[hH:](\d{1,2})?/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        eventDate = setHours(eventDate, hours);
        eventDate = setMinutes(eventDate, minutes);
      } else {
        // Try to extract just hours
        const hoursMatch = timeInfo.match(/(\d{1,2})[hH]/);
        if (hoursMatch) {
          const hours = parseInt(hoursMatch[1]);
          eventDate = setHours(eventDate, hours);
          eventDate = setMinutes(eventDate, 0);
        }
      }
    }
  }
  
  return eventDate;
}

/**
 * Simulates NLP processing for demo purposes
 */
function simulateNlpProcessing(transcript: string): any {
  console.log('Simulating NLP processing for:', transcript);
  
  const now = new Date();
  
  // Basic parsing logic to extract information
  let title = '';
  let description = transcript;
  let dateInfo = 'hoje';
  let timeInfo = '';
  let duration = 60;
  let type = 'meeting';
  let contactPhone = '';
  
  const lowerTranscript = transcript.toLowerCase();
  
  // Extract event type
  if (lowerTranscript.includes('reunião') || lowerTranscript.includes('reunir') || lowerTranscript.includes('meeting')) {
    type = 'meeting';
    if (lowerTranscript.includes('reunião com')) {
      const match = lowerTranscript.match(/reunião com\s+([^,\.]+)/i);
      if (match && match[1]) {
        title = 'Reunião com ' + match[1].trim();
      } else {
        title = 'Reunião';
      }
    } else {
      title = 'Reunião';
    }
  } else if (lowerTranscript.includes('prazo') || lowerTranscript.includes('deadline') || lowerTranscript.includes('entrega')) {
    type = 'deadline';
    if (lowerTranscript.includes('prazo para')) {
      const match = lowerTranscript.match(/prazo para\s+([^,\.]+)/i);
      if (match && match[1]) {
        title = 'Prazo: ' + match[1].trim();
      } else {
        title = 'Prazo de entrega';
      }
    } else {
      title = 'Prazo de entrega';
    }
  } else if (lowerTranscript.includes('tarefa') || lowerTranscript.includes('task')) {
    type = 'task';
    if (lowerTranscript.includes('tarefa de')) {
      const match = lowerTranscript.match(/tarefa de\s+([^,\.]+)/i);
      if (match && match[1]) {
        title = 'Tarefa: ' + match[1].trim();
      } else {
        title = 'Nova tarefa';
      }
    } else {
      title = 'Nova tarefa';
    }
  } else if (lowerTranscript.includes('agendar') || lowerTranscript.includes('marcar')) {
    if (lowerTranscript.includes('agendar') && lowerTranscript.includes('reunião')) {
      type = 'meeting';
      title = 'Reunião agendada';
    } else if (lowerTranscript.includes('agendar') && lowerTranscript.includes('prazo')) {
      type = 'deadline';
      title = 'Prazo agendado';
    } else if (lowerTranscript.includes('agendar') && lowerTranscript.includes('tarefa')) {
      type = 'task';
      title = 'Tarefa agendada';
    } else {
      // Try to extract what comes after "agendar" or "marcar"
      const match = lowerTranscript.match(/(agendar|marcar)\s+([^,\.]+)/i);
      if (match && match[2]) {
        title = match[2].trim();
        
        // Determine type based on extracted content
        if (title.includes('reunião') || title.includes('call')) {
          type = 'meeting';
        } else if (title.includes('prazo') || title.includes('entrega')) {
          type = 'deadline';
        } else if (title.includes('tarefa')) {
          type = 'task';
        }
      } else {
        title = 'Evento agendado';
      }
    }
  } else {
    // Default title if no specific pattern is found
    title = 'Evento: ' + transcript.substring(0, 30).trim();
  }
  
  // Extract date
  if (lowerTranscript.includes('amanhã') || lowerTranscript.includes('amanha')) {
    dateInfo = 'amanhã';
  } else if (lowerTranscript.includes('hoje')) {
    dateInfo = 'hoje';
  } else if (lowerTranscript.includes('próxima segunda') || lowerTranscript.includes('proxima segunda')) {
    dateInfo = 'próxima segunda';
  } else if (lowerTranscript.includes('próxima terça') || lowerTranscript.includes('proxima terca')) {
    dateInfo = 'próxima terça';
  } else if (lowerTranscript.includes('próxima quarta') || lowerTranscript.includes('proxima quarta')) {
    dateInfo = 'próxima quarta';
  } else if (lowerTranscript.includes('próxima quinta') || lowerTranscript.includes('proxima quinta')) {
    dateInfo = 'próxima quinta';
  } else if (lowerTranscript.includes('próxima sexta') || lowerTranscript.includes('proxima sexta')) {
    dateInfo = 'próxima sexta';
  } else if (lowerTranscript.includes('próximo sábado') || lowerTranscript.includes('proximo sabado')) {
    dateInfo = 'próxima sábado';
  } else if (lowerTranscript.includes('próximo domingo') || lowerTranscript.includes('proximo domingo')) {
    dateInfo = 'próxima domingo';
  } else if (lowerTranscript.includes('segunda')) {
    dateInfo = 'segunda';
  } else if (lowerTranscript.includes('terça') || lowerTranscript.includes('terca')) {
    dateInfo = 'terça';
  } else if (lowerTranscript.includes('quarta')) {
    dateInfo = 'quarta';
  } else if (lowerTranscript.includes('quinta')) {
    dateInfo = 'quinta';
  } else if (lowerTranscript.includes('sexta')) {
    dateInfo = 'sexta';
  } else if (lowerTranscript.includes('sábado') || lowerTranscript.includes('sabado')) {
    dateInfo = 'sábado';
  } else if (lowerTranscript.includes('domingo')) {
    dateInfo = 'domingo';
  }

  // Try to find date in format DD/MM or day of month
  const dateRegex = /(\d{1,2})\s*\/\s*(\d{1,2})/;
  const dateMatch = lowerTranscript.match(dateRegex);
  if (dateMatch) {
    dateInfo = dateMatch[0];
  }
  
  // Try to find date in format "DD de Month"
  const monthRegex = /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i;
  const monthMatch = lowerTranscript.match(monthRegex);
  if (monthMatch) {
    dateInfo = monthMatch[0];
  }
  
  // Extract time
  const timeRegex = /(\d{1,2})(h|:|hs|hora|horas)(\d{1,2})?\s*(da\s+)?(manhã|manha|tarde|noite)?/i;
  const timeMatch = lowerTranscript.match(timeRegex);
  
  if (timeMatch) {
    timeInfo = timeMatch[0];
  } else if (lowerTranscript.includes('manhã') || lowerTranscript.includes('manha')) {
    timeInfo = 'manhã';
  } else if (lowerTranscript.includes('tarde')) {
    timeInfo = 'tarde';
  } else if (lowerTranscript.includes('noite')) {
    timeInfo = 'noite';
  } else {
    // Try to find just hours mention
    const hourRegex = /\b(\d{1,2})\s*(h|hora|horas)\b/i;
    const hourMatch = lowerTranscript.match(hourRegex);
    if (hourMatch) {
      timeInfo = hourMatch[0];
    }
  }
  
  // Extract duration
  const durationRegex = /duração de (\d+)\s*(hora|horas|minuto|minutos)/i;
  const durationMatch = lowerTranscript.match(durationRegex);
  
  if (durationMatch) {
    const durationValue = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2].toLowerCase();
    
    if (durationUnit.includes('hora')) {
      duration = durationValue * 60;
    } else {
      duration = durationValue;
    }
  }
  
  // Extract phone number - various formats common in Brazil
  const phoneRegex = /(\d{2})[\s-]?(\d{4,5})[\s-]?(\d{4})|(\d{2})[\s-]?(\d{8,9})|(\d{8,9})/g;
  const phoneMatches = lowerTranscript.match(phoneRegex);
  
  if (phoneMatches && phoneMatches.length > 0) {
    // Clean up and format the phone number
    contactPhone = phoneMatches[0].replace(/\D/g, '');
    // Ensure it has area code (11 for São Paulo as default)
    if (contactPhone.length === 8 || contactPhone.length === 9) {
      contactPhone = '11' + contactPhone;
    }
  }
  
  return {
    title,
    description,
    dateInfo,
    timeInfo,
    duration,
    type,
    contactPhone
  };
}

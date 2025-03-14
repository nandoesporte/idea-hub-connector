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
 * Processes a voice command using GPT-4 to extract event details
 */
export async function processVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
  try {
    console.log('Processing voice command:', transcript);
    
    // Prepare prompt for GPT-4
    const prompt = `
      Extraia as informações de evento a partir do seguinte comando de voz em português:
      "${transcript}"
      
      Retorne apenas um objeto JSON com os seguintes campos:
      - title: título do evento
      - description: descrição do evento (opcional)
      - dateInfo: informações sobre a data (como "hoje", "amanhã", "próxima segunda", ou data específica)
      - timeInfo: horário do evento (como "9h", "14:30", "manhã", "tarde")
      - duration: duração em minutos (padrão: 60 se não especificado)
      - type: tipo do evento ("meeting" para reunião, "deadline" para prazo, "task" para tarefa, "other" para outros)
      - contactPhone: número de telefone mencionado, se houver (formato: apenas números)
      
      Não inclua explicações, apenas o objeto JSON.
    `;

    // For simulating GPT-4 response in this demo
    // In a real implementation, we would make an API call to GPT-4
    const fakeGptResponse = simulateGpt4Response(transcript);
    
    // Parse the GPT response
    const parsedResult = fakeGptResponse;
    
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
  if (type.includes('reuni') || type.includes('meet'))
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
  } else if (dateInfo.includes('amanhã')) {
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
  } else if (dateInfo.match(/\d{1,2} de [a-zç]+( de \d{2,4})?/i)) {
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
 * Simulates a GPT-4 response for demo purposes
 * In a real implementation, this would be replaced with an actual API call to GPT-4
 */
function simulateGpt4Response(transcript: string): any {
  console.log('Simulating GPT-4 response for:', transcript);
  
  const now = new Date();
  const tomorrow = addDays(now, 1);
  
  // Basic parsing logic to extract information
  let title = '';
  let description = '';
  let dateInfo = 'hoje';
  let timeInfo = '';
  let duration = 60;
  let type = 'meeting';
  let contactPhone = '';
  
  // Extract event type
  if (transcript.includes('reunião') || transcript.includes('meeting')) {
    type = 'meeting';
    title = transcript.includes('reunião com') ? 
      'Reunião com ' + transcript.split('reunião com')[1].split(' às')[0].trim() :
      'Reunião';
  } else if (transcript.includes('prazo') || transcript.includes('deadline')) {
    type = 'deadline';
    title = transcript.includes('prazo para') ? 
      'Prazo: ' + transcript.split('prazo para')[1].split(' em')[0].trim() :
      'Prazo de entrega';
  } else if (transcript.includes('tarefa') || transcript.includes('task')) {
    type = 'task';
    title = transcript.includes('tarefa de') ? 
      'Tarefa: ' + transcript.split('tarefa de')[1].split(' para')[0].trim() :
      'Nova tarefa';
  } else {
    title = 'Evento: ' + transcript.substring(0, 30);
  }
  
  // Extract date
  if (transcript.includes('amanhã')) {
    dateInfo = 'amanhã';
  } else if (transcript.includes('segunda')) {
    dateInfo = 'próxima segunda';
  } else if (transcript.includes('terça')) {
    dateInfo = 'próxima terça';
  } else if (transcript.includes('quarta')) {
    dateInfo = 'próxima quarta';
  } else if (transcript.includes('quinta')) {
    dateInfo = 'próxima quinta';
  } else if (transcript.includes('sexta')) {
    dateInfo = 'próxima sexta';
  } else if (transcript.includes('sábado') || transcript.includes('sabado')) {
    dateInfo = 'próxima sábado';
  } else if (transcript.includes('domingo')) {
    dateInfo = 'próxima domingo';
  }
  
  // Extract time
  const timeRegex = /\d{1,2}[hH:](\d{1,2})?/;
  const timeMatch = transcript.match(timeRegex);
  if (timeMatch) {
    timeInfo = timeMatch[0];
  } else if (transcript.includes('manhã')) {
    timeInfo = 'manhã';
  } else if (transcript.includes('tarde')) {
    timeInfo = 'tarde';
  } else if (transcript.includes('noite')) {
    timeInfo = 'noite';
  }
  
  // Extract duration
  const durationMatch = transcript.match(/duração de (\d+) (hora|minuto)/);
  if (durationMatch) {
    const durationValue = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2];
    
    if (durationUnit.includes('hora')) {
      duration = durationValue * 60;
    } else {
      duration = durationValue;
    }
  }
  
  // Extract phone number
  const phoneRegex = /(\d{2})?[\s-]?(\d{8,9})|(\d{2})?[\s-]?(\d{4,5})[\s-]?(\d{4})/;
  const phoneMatch = transcript.match(phoneRegex);
  if (phoneMatch) {
    // Clean up and format the phone number
    contactPhone = phoneMatch[0].replace(/\D/g, '');
    if (contactPhone.length === 8 || contactPhone.length === 9) {
      // Add area code if missing (using São Paulo as default)
      contactPhone = '11' + contactPhone;
    }
  }
  
  // Create description from the transcript
  description = transcript;
  
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

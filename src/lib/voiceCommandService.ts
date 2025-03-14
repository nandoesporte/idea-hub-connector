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
    
    // Simulate GPT-4 response for demo purposes
    const parsedResult = simulateGpt4Response(transcript);
    console.log("Parsed voice command result:", parsedResult);
    
    // Process the date and time information
    const eventDate = processDateTimeInfo(
      parsedResult.dateInfo,
      parsedResult.timeInfo
    );
    
    console.log("Processed event date:", eventDate);
    
    // Return the processed command
    return {
      success: true,
      title: parsedResult.title || "Novo evento",
      description: parsedResult.description || "",
      date: eventDate,
      duration: parsedResult.duration || 60,
      type: validateEventType(parsedResult.type),
      contactPhone: parsedResult.contactPhone || "",
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
  if (!type) return 'other';
  
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
  if (!dateInfo || dateInfo.toLowerCase().includes('hoje')) {
    // Today - keep the current date
    console.log("Date info indicates today");
  } else if (dateInfo.toLowerCase().includes('amanhã') || dateInfo.toLowerCase().includes('amanha')) {
    console.log("Date info indicates tomorrow");
    eventDate = addDays(now, 1);
  } else if (dateInfo.toLowerCase().includes('próxima') || dateInfo.toLowerCase().includes('proxima') || 
             dateInfo.toLowerCase().includes('próximo') || dateInfo.toLowerCase().includes('proximo')) {
    // Handle "próxima [day of week]"
    console.log("Date info indicates next week");
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    for (let i = 0; i < weekdays.length; i++) {
      if (dateInfo.toLowerCase().includes(weekdays[i])) {
        const targetDay = i;
        const currentDay = now.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7 || 7; // If today, then next week
        eventDate = addDays(now, daysToAdd);
        console.log(`Found weekday ${weekdays[i]}, adding ${daysToAdd} days`);
        break;
      }
    }
  } else if (dateInfo.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)) {
    // Handle date in format DD/MM or DD/MM/YYYY
    console.log("Date info contains DD/MM format");
    const dateParts = dateInfo.match(/\d+/g)?.map(Number);
    if (dateParts && dateParts.length >= 2) {
      const day = dateParts[0];
      const month = dateParts[1] - 1; // Month is 0-indexed in Date
      const year = dateParts.length > 2 ? dateParts[2] : now.getFullYear();
      const fullYear = year < 100 ? 2000 + year : year;
      eventDate = new Date(fullYear, month, day);
      console.log(`Parsed date parts: day=${day}, month=${month}, year=${fullYear}`);
    }
  } else if (dateInfo.match(/\d{1,2} de [a-zç]+( de \d{2,4})?/i)) {
    // Handle date in format "DD de Month [de YYYY]"
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
  
  // Process time information
  if (timeInfo) {
    console.log("Processing time info:", timeInfo);
    if (timeInfo.toLowerCase().includes('manhã') || timeInfo.toLowerCase().includes('manha')) {
      eventDate = setHours(eventDate, 9); // Default morning time: 9 AM
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to morning (9:00)");
    } else if (timeInfo.toLowerCase().includes('tarde')) {
      eventDate = setHours(eventDate, 14); // Default afternoon time: 2 PM
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to afternoon (14:00)");
    } else if (timeInfo.toLowerCase().includes('noite')) {
      eventDate = setHours(eventDate, 19); // Default evening time: 7 PM
      eventDate = setMinutes(eventDate, 0);
      console.log("Set time to evening (19:00)");
    } else {
      // Try to extract hours and minutes
      const timeMatch = timeInfo.match(/(\d{1,2})[hH:](\d{1,2})?/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        eventDate = setHours(eventDate, hours);
        eventDate = setMinutes(eventDate, minutes);
        console.log(`Extracted specific time: ${hours}:${minutes}`);
      } else {
        // Try to extract just hours
        const hoursMatch = timeInfo.match(/(\d{1,2})[hH]/);
        if (hoursMatch) {
          const hours = parseInt(hoursMatch[1]);
          eventDate = setHours(eventDate, hours);
          eventDate = setMinutes(eventDate, 0);
          console.log(`Extracted hours only: ${hours}:00`);
        } else {
          // Check for numeric time without h
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
    // Default to current time if no time specified
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
  
  const now = new Date();
  
  // Basic parsing logic to extract information
  let title = '';
  let description = '';
  let dateInfo = 'hoje';
  let timeInfo = '';
  let duration = 60;
  let type = 'meeting';
  let contactPhone = '';
  
  // Extract event type
  if (transcript.toLowerCase().includes('reunião') || transcript.toLowerCase().includes('meeting')) {
    type = 'meeting';
    title = transcript.toLowerCase().includes('reunião com') ? 
      'Reunião com ' + transcript.split('reunião com')[1].split(' às')[0].trim() :
      'Reunião';
  } else if (transcript.toLowerCase().includes('prazo') || transcript.toLowerCase().includes('deadline')) {
    type = 'deadline';
    title = transcript.toLowerCase().includes('prazo para') ? 
      'Prazo: ' + transcript.split('prazo para')[1].split(' em')[0].trim() :
      'Prazo de entrega';
  } else if (transcript.toLowerCase().includes('tarefa') || transcript.toLowerCase().includes('task')) {
    type = 'task';
    title = transcript.toLowerCase().includes('tarefa de') ? 
      'Tarefa: ' + transcript.split('tarefa de')[1].split(' para')[0].trim() :
      'Nova tarefa';
  } else {
    // If no specific type is mentioned, try to extract a title from the beginning of the transcript
    const potentialTitle = transcript.split(' para ')[0].split(' às ')[0].split(' em ')[0];
    title = potentialTitle || 'Novo evento';
    
    // Try to guess the type based on other keywords
    if (transcript.toLowerCase().includes('conversar') || transcript.toLowerCase().includes('encontro') || 
        transcript.toLowerCase().includes('call') || transcript.toLowerCase().includes('entrevista')) {
      type = 'meeting';
    } else if (transcript.toLowerCase().includes('entregar') || transcript.toLowerCase().includes('finalizar') ||
               transcript.toLowerCase().includes('completar')) {
      type = 'deadline';
    } else if (transcript.toLowerCase().includes('fazer') || transcript.toLowerCase().includes('completar') ||
               transcript.toLowerCase().includes('revisar')) {
      type = 'task';
    }
  }
  
  // If no title was extracted, create a basic one based on the transcript
  if (!title && transcript) {
    // Take first 5 words as title
    const words = transcript.split(' ');
    title = words.slice(0, Math.min(5, words.length)).join(' ');
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
  }
  
  // Extract date
  if (transcript.toLowerCase().includes('amanhã') || transcript.toLowerCase().includes('amanha')) {
    dateInfo = 'amanhã';
  } else if (transcript.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)) {
    // Match DD/MM or DD/MM/YYYY format
    dateInfo = transcript.match(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/)[0];
  } else if (transcript.toLowerCase().includes('segunda')) {
    dateInfo = 'próxima segunda';
  } else if (transcript.toLowerCase().includes('terça')) {
    dateInfo = 'próxima terça';
  } else if (transcript.toLowerCase().includes('quarta')) {
    dateInfo = 'próxima quarta';
  } else if (transcript.toLowerCase().includes('quinta')) {
    dateInfo = 'próxima quinta';
  } else if (transcript.toLowerCase().includes('sexta')) {
    dateInfo = 'próxima sexta';
  } else if (transcript.toLowerCase().includes('sábado') || transcript.toLowerCase().includes('sabado')) {
    dateInfo = 'próximo sábado';
  } else if (transcript.toLowerCase().includes('domingo')) {
    dateInfo = 'próximo domingo';
  }
  
  // Extract time
  const timeRegex = /\d{1,2}[hH:](\d{1,2})?/;
  const timeMatch = transcript.match(timeRegex);
  if (timeMatch) {
    timeInfo = timeMatch[0];
  } else if (transcript.toLowerCase().includes('manhã')) {
    timeInfo = 'manhã';
  } else if (transcript.toLowerCase().includes('tarde')) {
    timeInfo = 'tarde';
  } else if (transcript.toLowerCase().includes('noite')) {
    timeInfo = 'noite';
  } else {
    // Look for hour numbers followed by "horas"
    const hoursMatch = transcript.match(/(\d{1,2})\s*horas?/i);
    if (hoursMatch) {
      timeInfo = hoursMatch[1] + 'h';
    }
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

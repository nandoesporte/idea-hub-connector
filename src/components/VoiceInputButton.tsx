
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Edit, Loader2 } from 'lucide-react';
import { useVoiceCommandEvents } from '@/hooks/useVoiceCommandEvents';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

// Properly define the SpeechRecognition type to fix the error
type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

const VoiceInputButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const finalTranscriptRef = useRef('');
  const { createEventFromVoiceCommand, processingCommand } = useVoiceCommandEvents();
  const isMobile = useIsMobile();
  
  // New refs to track last transcript and prevent duplicates
  const lastTranscriptTimeRef = useRef<number>(0);
  const lastTranscriptValueRef = useRef<string>('');
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      
      // Clear any pending timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Function to prevent duplicate transcriptions
  const shouldUpdateTranscript = (newText: string): boolean => {
    const currentTime = Date.now();
    
    // If the same text was received within the timeframe, ignore it
    // Mobile needs a longer timeframe due to slower processing
    const timeThreshold = isMobile ? 1000 : 500;
    
    if (
      newText === lastTranscriptValueRef.current && 
      currentTime - lastTranscriptTimeRef.current < timeThreshold
    ) {
      return false;
    }
    
    // Update tracking refs
    lastTranscriptValueRef.current = newText;
    lastTranscriptTimeRef.current = currentTime;
    return true;
  };

  const startListening = () => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast.error('Reconhecimento de voz não suportado neste navegador');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      // Reset transcript and tracking refs
      setTranscript('');
      finalTranscriptRef.current = '';
      setEditedTranscript('');
      setEditMode(false);
      lastTranscriptValueRef.current = '';
      lastTranscriptTimeRef.current = 0;
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      recognitionRef.current.onresult = (event) => {
        // Debounce the transcript update to prevent rapidly changing values
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        // Adjust debounce timing for mobile devices
        const debounceTime = isMobile ? 300 : 100;
        
        debounceTimeoutRef.current = window.setTimeout(() => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            // Ajustado para ser mais tolerante em dispositivos móveis
            if (event.results[i].isFinal) {
              if (isMobile || shouldUpdateTranscript(transcript)) {
                finalTranscript += transcript;
                finalTranscriptRef.current += transcript;
              }
            } else {
              // Para dispositivos móveis, vamos ser mais liberais com resultados intermediários
              interimTranscript += transcript;
            }
          }

          // Only update UI if there's something meaningful to display
          if (finalTranscriptRef.current || interimTranscript) {
            const displayText = finalTranscriptRef.current + interimTranscript;
            // Remove common duplicate patterns - relaxed for mobile
            const cleanedText = isMobile 
              ? displayText 
              : displayText.replace(/(\b\w+\b)(\s+\1\b)+/g, '$1');
            setTranscript(cleanedText);
            console.log('Speech recognition result:', cleanedText);
          }
        }, debounceTime);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Erro no reconhecimento de voz: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // If we have a transcript, enter edit mode
        if (finalTranscriptRef.current && finalTranscriptRef.current.trim() !== '') {
          // Clean up any duplicates in the final transcript
          let cleanedFinalTranscript = finalTranscriptRef.current;
          
          // Don't apply aggressive cleaning on mobile
          if (!isMobile) {
            cleanedFinalTranscript = finalTranscriptRef.current.replace(/(\b\w+\b)(\s+\1\b)+/g, '$1');
          }
          
          finalTranscriptRef.current = cleanedFinalTranscript;
          
          setEditMode(true);
          setEditedTranscript(cleanedFinalTranscript);
        } else {
          toast.warning('Nenhum comando de voz detectado');
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Erro ao iniciar reconhecimento de voz');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      console.log('Stop listening called, current transcript:', finalTranscriptRef.current);
      recognitionRef.current.stop();
    }
  };
  
  const cancelEditing = () => {
    setEditMode(false);
    setTranscript('');
    finalTranscriptRef.current = '';
    setEditedTranscript('');
  };
  
  const saveCommand = async () => {
    if (!editedTranscript || editedTranscript.trim() === '') {
      toast.warning('O comando não pode estar vazio');
      return;
    }
    
    const success = await createEventFromVoiceCommand(editedTranscript);
    if (success) {
      // Reset transcript after successful processing
      setTranscript('');
      finalTranscriptRef.current = '';
      setEditedTranscript('');
      setEditMode(false);
    }
  };
  
  const redoCommand = () => {
    setEditMode(false);
    setTranscript('');
    finalTranscriptRef.current = '';
    setEditedTranscript('');
    startListening();
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md">
      {isListening ? (
        <>
          <div className="animate-pulse bg-red-100 text-red-800 px-4 py-2 rounded-md mb-2 text-sm font-medium w-full text-center">
            Gravando comando de voz...
          </div>
          <Button 
            onClick={stopListening} 
            disabled={processingCommand}
            className="bg-red-500 hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Square size={16} />
            <span>Parar</span>
          </Button>
        </>
      ) : editMode ? (
        <>
          <div className="w-full">
            <div className="bg-muted/50 p-3 rounded-md mb-3 w-full">
              <h3 className="text-sm font-medium mb-2">Editar comando:</h3>
              <Input
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full mb-3"
                placeholder="Edite seu comando de voz..."
              />
              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={cancelEditing}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={redoCommand}
                >
                  <Mic size={14} className="mr-1" />
                  Refazer
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveCommand}
                  disabled={processingCommand}
                >
                  {processingCommand ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Send size={14} className="mr-1" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Button 
          onClick={startListening} 
          className="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Mic size={16} />
          <span>Comando de Voz</span>
        </Button>
      )}
      
      {isListening && transcript && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md w-full">
          <p className="text-sm font-medium text-gray-500 mb-1">Transcrição:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;

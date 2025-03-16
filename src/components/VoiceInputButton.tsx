
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';
import { useVoiceCommandEvents } from '@/hooks/useVoiceCommandEvents';
import { toast } from 'sonner';

// Properly define the SpeechRecognition type to fix the error
type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

const VoiceInputButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const finalTranscriptRef = useRef('');
  const { createEventFromVoiceCommand, processingCommand } = useVoiceCommandEvents();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

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

      // Reset transcript
      setTranscript('');
      finalTranscriptRef.current = '';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            finalTranscriptRef.current += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const displayText = finalTranscriptRef.current + interimTranscript;
        setTranscript(displayText);
        console.log('Speech recognition result:', displayText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Erro no reconhecimento de voz: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Erro ao iniciar reconhecimento de voz');
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      console.log('Stop listening called, current transcript:', finalTranscriptRef.current || transcript);
      
      // First stop the recognition to prevent more updates
      recognitionRef.current.stop();
      
      // Use a combination of both refs to ensure we have text
      const finalText = finalTranscriptRef.current || transcript;
      
      // Process the command
      if (finalText && finalText.trim() !== '') {
        const success = await createEventFromVoiceCommand(finalText);
        if (success) {
          // Reset transcript after successful processing
          setTranscript('');
          finalTranscriptRef.current = '';
        }
      } else {
        toast.warning('Nenhum comando de voz detectado');
      }
      
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md">
      {isListening ? (
        <>
          <div className="animate-pulse bg-red-100 text-red-800 px-4 py-2 rounded-md mb-2 text-lg font-medium w-full text-center">
            Gravando comando de voz...
          </div>
          <Button 
            onClick={stopListening} 
            disabled={processingCommand}
            className="bg-red-500 hover:bg-red-600 transition-colors flex items-center space-x-2 text-lg py-6 px-5 w-full justify-center"
          >
            <Square size={24} />
            <span>Parar</span>
          </Button>
        </>
      ) : (
        <Button 
          onClick={startListening} 
          className="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center space-x-2 text-lg py-6 px-5 w-full justify-center"
        >
          <Mic size={24} />
          <span>Comando de Voz</span>
        </Button>
      )}
      
      {transcript && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md w-full">
          <p className="text-lg font-medium text-gray-500 mb-1">Transcrição:</p>
          <p className="text-lg">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;

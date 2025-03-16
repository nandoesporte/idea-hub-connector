
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
  const [isKeywordDetected, setIsKeywordDetected] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const finalTranscriptRef = useRef('');
  const { createEventFromVoiceCommand, processingCommand } = useVoiceCommandEvents();

  useEffect(() => {
    // Initialize speech recognition on component mount
    initializeSpeechRecognition();

    // Cleanup on unmount
    return () => {
      cleanupSpeechRecognition();
    };
  }, []);

  const initializeSpeechRecognition = () => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported in this browser');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = handleSpeechEnd;

      console.log('Speech recognition initialized');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
    }
  };

  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      if (isListening) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSpeechResult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.trim().toLowerCase();
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        finalTranscriptRef.current += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const currentTranscript = finalTranscriptRef.current + interimTranscript;
    setTranscript(currentTranscript);
    
    // Check for keyword in continuous mode
    if (isContinuousMode) {
      if (!isKeywordDetected && (currentTranscript.includes('vic') || interimTranscript.includes('vic'))) {
        console.log('Keyword "Vic" detected!');
        setIsKeywordDetected(true);
        // Clear previous transcripts to start fresh for the command
        setTranscript('');
        finalTranscriptRef.current = '';
        toast.success('Vic ativado! Aguardando comando...');
        
        // Play a sound or visual feedback could be added here
      } else if (isKeywordDetected && finalTranscript) {
        // If we already detected the keyword and now have a final transcript,
        // process it as a command
        console.log('Processing command after keyword:', finalTranscript);
        processCommand(finalTranscript);
        // Reset keyword detection to listen for the next command
        setIsKeywordDetected(false);
      }
    }
    
    console.log('Speech recognition result:', currentTranscript);
  };

  const handleSpeechError = (event: any) => {
    console.error('Speech recognition error', event.error);
    if (event.error === 'no-speech') {
      // This is common and not a critical error
      console.log('No speech detected');
    } else {
      toast.error(`Erro no reconhecimento de voz: ${event.error}`);
      setIsListening(false);
      
      // If in continuous mode, try to restart after a short delay
      if (isContinuousMode) {
        setTimeout(() => {
          if (recognitionRef.current && isContinuousMode) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              console.error('Failed to restart voice recognition');
            }
          }
        }, 1000);
      }
    }
  };

  const handleSpeechEnd = () => {
    console.log('Speech recognition ended');
    
    // In continuous mode, immediately restart listening
    if (isContinuousMode && !processingCommand) {
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log('Restarted continuous listening');
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
            setIsListening(false);
            setIsContinuousMode(false);
          }
        }
      }, 100);
    } else {
      setIsListening(false);
    }
  };

  const startListening = (continuous = false) => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast.error('Reconhecimento de voz não suportado neste navegador');
        return;
      }

      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      if (recognitionRef.current) {
        // Reset transcript
        setTranscript('');
        finalTranscriptRef.current = '';
        setIsKeywordDetected(false);
        
        // Set continuous mode
        setIsContinuousMode(continuous);
        
        recognitionRef.current.start();
        setIsListening(true);
        
        if (continuous) {
          toast.success('Assistente de voz "Vic" ativado. Diga "Vic" seguido do seu comando.');
        } else {
          toast.info('Escutando comando de voz...');
        }
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Erro ao iniciar reconhecimento de voz');
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      console.log('Stop listening called, current transcript:', finalTranscriptRef.current);
      
      // First stop the recognition to prevent more updates
      recognitionRef.current.stop();
      
      // Process any final command if not in continuous mode
      if (!isContinuousMode && finalTranscriptRef.current) {
        processCommand(finalTranscriptRef.current);
      }
      
      // Reset states
      setIsListening(false);
      setIsContinuousMode(false);
      setIsKeywordDetected(false);
      
      toast.info('Assistente de voz desativado');
    }
  };

  const processCommand = async (commandText: string) => {
    if (!commandText.trim()) {
      toast.warning('Nenhum comando de voz detectado');
      return;
    }

    // Process the command through the voice command service
    const success = await createEventFromVoiceCommand(commandText);
    
    if (success) {
      // Reset transcript after successful processing
      setTranscript('');
      finalTranscriptRef.current = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {isListening ? (
        <>
          <div className={`animate-pulse px-4 py-2 rounded-md mb-2 text-sm font-medium ${
            isContinuousMode 
              ? isKeywordDetected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isContinuousMode 
              ? isKeywordDetected 
                ? 'Ouvindo comando...' 
                : 'Aguardando a palavra "Vic"...'
              : 'Gravando comando de voz...'}
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
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => startListening(false)} 
            className="bg-blue-500 hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Mic size={16} />
            <span>Comando de Voz</span>
          </Button>
          
          <Button 
            onClick={() => startListening(true)} 
            className="bg-green-500 hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Mic size={16} />
            <span>Ativar "Vic"</span>
          </Button>
        </div>
      )}
      
      {transcript && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md w-full max-w-md">
          <p className="text-sm font-medium text-gray-500 mb-1">Transcrição:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;

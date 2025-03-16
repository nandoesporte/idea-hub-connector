
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from 'lucide-react';

const WhatsAppApiDocAlert: React.FC = () => {
  return (
    <Alert className="mt-2 bg-blue-500/10 text-blue-600 border-blue-200">
      <ExternalLink className="h-4 w-4" />
      <AlertTitle>Documentação API</AlertTitle>
      <AlertDescription>
        <a 
          href="https://documenter.getpostman.com/view/3741041/SztBa7ku" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-blue-700"
        >
          Consulte a documentação da API para mais informações
        </a>
      </AlertDescription>
    </Alert>
  );
};

export default WhatsAppApiDocAlert;

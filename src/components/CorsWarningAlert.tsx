
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CorsWarningAlert = () => {
  const handleOpenCorsDemo = () => {
    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
  };

  return (
    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 font-medium">Problema CORS Detectado</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          O navegador está bloqueando requisições para a API do WhatsApp devido à restrições CORS.
          Para resolver este problema, você tem algumas opções:
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Use o proxy CORS-Anywhere (temporário para testes)</li>
          <li>Configure um servidor proxy em seu próprio backend</li>
          <li>Adicione seu domínio à lista de permitidos no painel da API do WhatsApp</li>
        </ul>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
          onClick={handleOpenCorsDemo}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ativar CORS-Anywhere para testes
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default CorsWarningAlert;

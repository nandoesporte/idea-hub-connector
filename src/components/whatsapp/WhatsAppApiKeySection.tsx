
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Key } from 'lucide-react';

interface WhatsAppApiKeySectionProps {
  apiKey: string;
  setApiKeyState: (value: string) => void;
  apiUrl: string;
  setApiUrlState: (value: string) => void;
  handleSaveApiKey: () => void;
  isApiKeySet: boolean;
}

const WhatsAppApiKeySection: React.FC<WhatsAppApiKeySectionProps> = ({
  apiKey,
  setApiKeyState,
  apiUrl,
  setApiUrlState,
  handleSaveApiKey,
  isApiKeySet
}) => {
  return (
    <div className="space-y-2 pb-4 border-b">
      <Label htmlFor="api-key" className="flex items-center gap-2">
        <Key className="h-4 w-4" />
        Chave de API WhatsApp
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyState(e.target.value)}
          placeholder="Insira sua chave de API do WhatsApp"
          className="flex-1"
        />
        <Button 
          onClick={handleSaveApiKey} 
          variant="secondary"
          disabled={!apiKey.trim()}
        >
          Salvar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Esta chave é necessária para enviar mensagens através da API do WhatsApp (app.whatsgw.com.br)
      </p>
      
      {isApiKeySet && (
        <Alert className="mt-2 bg-green-500/10 text-green-600 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>API configurada</AlertTitle>
          <AlertDescription>
            Sua chave de API foi configurada e está pronta para uso
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WhatsAppApiKeySection;

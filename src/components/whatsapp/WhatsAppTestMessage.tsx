
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Phone, Info } from 'lucide-react';

interface WhatsAppTestMessageProps {
  testPhone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendTest: () => Promise<void>;
  isSending: boolean;
  isApiKeySet: boolean;
}

const WhatsAppTestMessage: React.FC<WhatsAppTestMessageProps> = ({
  testPhone,
  handlePhoneChange,
  handleSendTest,
  isSending,
  isApiKeySet
}) => {
  return (
    <div className="mt-6 space-y-2 border-t pt-4">
      <Label htmlFor="test-phone" className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Testar integração
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id="test-phone"
          type="tel"
          placeholder="Ex: (11) 98765-4321"
          value={testPhone}
          onChange={handlePhoneChange}
          className="flex-1"
        />
        <Button 
          onClick={handleSendTest} 
          disabled={isSending || !testPhone || !isApiKeySet}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar teste"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Digite um número completo com DDD, ex: 11987654321 (sem parênteses ou traços)
      </p>
      <Alert className="mt-2 bg-blue-500/10 text-blue-600 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Formato de telefone</AlertTitle>
        <AlertDescription>
          Para números brasileiros, certifique-se de incluir o DDD. O código do país (55) será adicionado automaticamente se necessário.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default WhatsAppTestMessage;

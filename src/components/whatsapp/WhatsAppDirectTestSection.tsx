
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from 'lucide-react';

interface WhatsAppDirectTestSectionProps {
  handleDirectTest: () => Promise<void>;
  isSending: boolean;
  isApiKeySet: boolean;
}

const WhatsAppDirectTestSection: React.FC<WhatsAppDirectTestSectionProps> = ({
  handleDirectTest,
  isSending,
  isApiKeySet
}) => {
  return (
    <div className="mt-4 space-y-2 border-t pt-4">
      <Label className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        Teste Direto para 44988057213
      </Label>
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleDirectTest} 
          disabled={isSending || !isApiKeySet}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Enviar teste para 44988057213
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Este botão envia uma mensagem de teste diretamente para o número 44988057213
      </p>
    </div>
  );
};

export default WhatsAppDirectTestSection;


import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock } from 'lucide-react';

interface WhatsAppReminderSettingsProps {
  remindBefore: number;
  handleRemindBeforeChange: (value: number) => void;
}

const WhatsAppReminderSettings: React.FC<WhatsAppReminderSettingsProps> = ({
  remindBefore,
  handleRemindBeforeChange
}) => {
  return (
    <>
      <div className="space-y-2 pt-2">
        <Label htmlFor="remind-before">Enviar lembrete (horas antes)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="remind-before"
            type="number"
            min={1}
            max={72}
            value={remindBefore}
            onChange={(e) => handleRemindBeforeChange(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">horas antes do evento</span>
        </div>
      </div>
      
      <Alert className="mt-4">
        <Clock className="h-4 w-4" />
        <AlertTitle>Envio automático</AlertTitle>
        <AlertDescription>
          Os lembretes serão enviados automaticamente {remindBefore} horas antes de cada evento que tenha um número de telefone associado.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default WhatsAppReminderSettings;

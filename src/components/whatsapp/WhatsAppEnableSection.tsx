
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface WhatsAppEnableSectionProps {
  isEnabled: boolean;
  handleToggleEnable: (checked: boolean) => void;
  isApiKeySet: boolean;
}

const WhatsAppEnableSection: React.FC<WhatsAppEnableSectionProps> = ({
  isEnabled,
  handleToggleEnable,
  isApiKeySet
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="whatsapp-notifications">Ativar notificações</Label>
        <p className="text-sm text-muted-foreground">
          Enviar lembretes automáticos para eventos agendados
        </p>
      </div>
      <Switch
        id="whatsapp-notifications"
        checked={isEnabled}
        onCheckedChange={handleToggleEnable}
        disabled={!isApiKeySet}
      />
    </div>
  );
};

export default WhatsAppEnableSection;

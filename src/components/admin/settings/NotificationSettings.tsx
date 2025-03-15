
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Phone } from 'lucide-react';

interface NotificationSettingsProps {
  whatsAppApiKey: string;
  notificationNumbers: string[];
  onApiKeyChange: (value: string) => void;
  onNumberChange: (index: number, value: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  whatsAppApiKey,
  notificationNumbers,
  onApiKeyChange,
  onNumberChange,
  onSave,
  isDirty,
  isSaving
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações WhatsApp
        </CardTitle>
        <CardDescription>
          Configure a integração com WhatsApp e números para notificações do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="whatsAppApiKey" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            API Key do WhatsApp
          </Label>
          <Input 
            id="whatsAppApiKey" 
            value={whatsAppApiKey} 
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Insira sua chave de API do WhatsApp"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Esta chave é necessária para enviar notificações via WhatsApp.
          </p>
        </div>
        
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Números para Notificações do Sistema
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Insira até 3 números que receberão notificações de todo o sistema.
          </p>
          
          {notificationNumbers.map((number, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground min-w-[20px]">
                {index + 1}.
              </span>
              <Input 
                value={number} 
                onChange={(e) => onNumberChange(index, e.target.value)}
                placeholder={`Número ${index + 1} (ex: 5511987654321)`}
              />
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Salvar Configurações de Notificação
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bell, Calendar, Clock, FileBarChart, Users, Briefcase } from 'lucide-react';

interface NotificationSettings {
  enabled: boolean;
  types: {
    events: boolean;
    newProjects: boolean;
    newUsers: boolean;
    dailyReport: boolean;
  };
  channels: {
    email: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  schedule: {
    dailyReportTime: string;
  };
}

interface SystemNotificationSettingsProps {
  notificationSettings: NotificationSettings;
  whatsAppApiKey: string;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleType: (type: keyof NotificationSettings['types']) => void;
  onToggleChannel: (channel: keyof NotificationSettings['channels']) => void;
  onTimeChange: (time: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const SystemNotificationSettings: React.FC<SystemNotificationSettingsProps> = ({
  notificationSettings,
  whatsAppApiKey,
  onToggleEnabled,
  onToggleType,
  onToggleChannel,
  onTimeChange,
  onSave,
  isDirty,
  isSaving
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações do Sistema
        </CardTitle>
        <CardDescription>
          Gerencie as notificações do sistema e defina quando e como você deseja recebê-las.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableAllNotifications">Ativar Notificações do Sistema</Label>
            <p className="text-sm text-muted-foreground">
              Ativa ou desativa todas as notificações do sistema
            </p>
          </div>
          <Switch 
            id="enableAllNotifications" 
            checked={notificationSettings.enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>
        
        <div className={notificationSettings.enabled ? "" : "opacity-50 pointer-events-none"}>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tipos de Notificações</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="notifyEvents" 
                  checked={notificationSettings.types.events}
                  onCheckedChange={() => onToggleType('events')}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="notifyEvents" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Eventos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre eventos agendados no sistema
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="notifyNewProjects" 
                  checked={notificationSettings.types.newProjects}
                  onCheckedChange={() => onToggleType('newProjects')}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="notifyNewProjects" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Novos Projetos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando novos projetos forem adicionados
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="notifyNewUsers" 
                  checked={notificationSettings.types.newUsers}
                  onCheckedChange={() => onToggleType('newUsers')}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="notifyNewUsers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Novos Usuários
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando novos usuários se registrarem
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="notifyDailyReport" 
                  checked={notificationSettings.types.dailyReport}
                  onCheckedChange={() => onToggleType('dailyReport')}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="notifyDailyReport" className="flex items-center gap-2">
                    <FileBarChart className="h-4 w-4" />
                    Relatório Diário
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um relatório diário resumindo as atividades do sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-6 ${notificationSettings.types.dailyReport ? "" : "opacity-50 pointer-events-none"}`}>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário do Relatório Diário
            </h3>
            <div className="w-full sm:w-1/2 md:w-1/3">
              <Input 
                type="time" 
                value={notificationSettings.schedule.dailyReportTime}
                onChange={(e) => onTimeChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Relatório será enviado todos os dias neste horário (Horário de Brasília)
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Canais de Notificação</h3>
            <div className="flex flex-wrap gap-3">
              <ToggleGroup type="multiple" className="justify-start">
                <ToggleGroupItem 
                  value="email" 
                  aria-label="Toggle email"
                  data-state={notificationSettings.channels.email ? "on" : "off"}
                  onClick={() => onToggleChannel('email')}
                >
                  Email
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="whatsapp" 
                  aria-label="Toggle WhatsApp"
                  data-state={notificationSettings.channels.whatsapp ? "on" : "off"}
                  onClick={() => onToggleChannel('whatsapp')}
                >
                  WhatsApp
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="inApp" 
                  aria-label="Toggle In-App"
                  data-state={notificationSettings.channels.inApp ? "on" : "off"}
                  onClick={() => onToggleChannel('inApp')}
                >
                  No Sistema
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selecione como deseja receber as notificações
            </p>
            
            {notificationSettings.channels.whatsapp && !whatsAppApiKey && (
              <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                <p className="font-medium">Atenção:</p>
                <p>Para receber notificações via WhatsApp, configure a API na aba "Notificações WhatsApp".</p>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
          className="flex items-center gap-2 mt-6"
        >
          <Bell className="h-4 w-4" />
          Salvar Configurações de Notificações
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemNotificationSettings;

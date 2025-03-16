
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlarmClock, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface DefaultReminderSettingsProps {
  reminderSettings: {
    enabled: boolean;
    sendBefore: {
      days: number;
      hours: number;
      minutes: number;
    };
    sendOnDay: boolean;
    reminderTime: string;
    defaultPhone?: string;
  };
  onSettingsChange: (settings: any) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const DefaultReminderSettings: React.FC<DefaultReminderSettingsProps> = ({
  reminderSettings,
  onSettingsChange,
  onSave,
  isDirty,
  isSaving
}) => {
  // Generate number options for select dropdowns
  const generateOptions = (max: number) => {
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlarmClock className="h-5 w-5" />
          Configurações Padrão de Lembretes
        </CardTitle>
        <CardDescription>
          Defina as configurações padrão para lembretes de compromissos criados por comando de voz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableReminders">Ativar Lembretes</Label>
            <p className="text-sm text-muted-foreground">
              Ativa ou desativa todos os lembretes automáticos
            </p>
          </div>
          <Switch 
            id="enableReminders" 
            checked={reminderSettings.enabled}
            onCheckedChange={(checked) => onSettingsChange({ 
              ...reminderSettings,
              enabled: checked 
            })}
          />
        </div>
        
        <div className={reminderSettings.enabled ? "" : "opacity-50 pointer-events-none"}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="reminderDays">Dias antes</Label>
              <Select 
                value={String(reminderSettings.sendBefore.days)}
                onValueChange={(value) => onSettingsChange({ 
                  ...reminderSettings,
                  sendBefore: { 
                    ...reminderSettings.sendBefore,
                    days: parseInt(value) 
                  } 
                })}
              >
                <SelectTrigger id="reminderDays">
                  <SelectValue placeholder="Dias" />
                </SelectTrigger>
                <SelectContent>
                  {generateOptions(7).map(num => (
                    <SelectItem key={`days-${num}`} value={String(num)}>
                      {num} {num === 1 ? 'dia' : 'dias'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reminderHours">Horas antes</Label>
              <Select 
                value={String(reminderSettings.sendBefore.hours)}
                onValueChange={(value) => onSettingsChange({ 
                  ...reminderSettings,
                  sendBefore: { 
                    ...reminderSettings.sendBefore,
                    hours: parseInt(value) 
                  } 
                })}
              >
                <SelectTrigger id="reminderHours">
                  <SelectValue placeholder="Horas" />
                </SelectTrigger>
                <SelectContent>
                  {generateOptions(23).map(num => (
                    <SelectItem key={`hours-${num}`} value={String(num)}>
                      {num} {num === 1 ? 'hora' : 'horas'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reminderMinutes">Minutos antes</Label>
              <Select 
                value={String(reminderSettings.sendBefore.minutes)}
                onValueChange={(value) => onSettingsChange({ 
                  ...reminderSettings,
                  sendBefore: { 
                    ...reminderSettings.sendBefore,
                    minutes: parseInt(value) 
                  } 
                })}
              >
                <SelectTrigger id="reminderMinutes">
                  <SelectValue placeholder="Minutos" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 15, 30, 45].map(num => (
                    <SelectItem key={`minutes-${num}`} value={String(num)}>
                      {num} {num === 1 ? 'minuto' : 'minutos'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-start gap-2 mt-4">
            <Checkbox 
              id="sendOnDayCheckbox" 
              checked={reminderSettings.sendOnDay}
              onCheckedChange={(checked) => 
                onSettingsChange({
                  ...reminderSettings,
                  sendOnDay: checked === true
                })
              }
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="sendOnDayCheckbox">Enviar no dia do evento em horário específico</Label>
              <p className="text-sm text-muted-foreground">
                Se marcado, enviará um lembrete adicional no dia do evento
              </p>
            </div>
          </div>
          
          {reminderSettings.sendOnDay && (
            <div className="w-full sm:w-1/2 md:w-1/3 mt-4">
              <Label htmlFor="reminderTime">Horário do lembrete no dia</Label>
              <Input 
                id="reminderTime"
                type="time" 
                value={reminderSettings.reminderTime}
                onChange={(e) => onSettingsChange({
                  ...reminderSettings,
                  reminderTime: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Horário para envio do lembrete no dia do evento
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <Label htmlFor="defaultPhone">Número de Telefone Padrão</Label>
            <Input 
              id="defaultPhone"
              type="text" 
              value={reminderSettings.defaultPhone || ""}
              onChange={(e) => onSettingsChange({
                ...reminderSettings,
                defaultPhone: e.target.value
              })}
              placeholder="Ex: 5511987654321"
              className="w-full sm:w-1/2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número padrão para envio de lembretes quando o contato não for especificado
            </p>
          </div>
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
          className="flex items-center gap-2 mt-6"
        >
          <Save className="h-4 w-4" />
          Salvar Configurações de Lembretes
        </Button>
      </CardContent>
    </Card>
  );
};

export default DefaultReminderSettings;

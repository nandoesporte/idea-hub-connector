
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, FileCheck } from 'lucide-react';

interface PolicyReminderSettingsProps {
  policySettings: {
    receiveViaWhatsApp: boolean;
    processWithAI: boolean;
    autoScheduleReminders: boolean;
    reminderDaysBefore: number;
  };
  onPolicySettingsChange: (settings: any) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const PolicyReminderSettings: React.FC<PolicyReminderSettingsProps> = ({
  policySettings,
  onPolicySettingsChange,
  onSave,
  isDirty,
  isSaving
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Configurações de Apólices de Seguro
        </CardTitle>
        <CardDescription>
          Configure as opções de gerenciamento de apólices e lembretes automáticos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="processWithAI">Processamento com IA</Label>
            <p className="text-sm text-muted-foreground">
              Ativa o processamento automático de PDFs de apólices com GPT-4
            </p>
          </div>
          <Switch 
            id="processWithAI" 
            checked={policySettings.processWithAI}
            onCheckedChange={(checked) => 
              onPolicySettingsChange({ ...policySettings, processWithAI: checked })
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoScheduleReminders">Lembretes Automáticos</Label>
            <p className="text-sm text-muted-foreground">
              Agendar lembretes automáticos para vencimentos de apólices
            </p>
          </div>
          <Switch 
            id="autoScheduleReminders" 
            checked={policySettings.autoScheduleReminders}
            onCheckedChange={(checked) => 
              onPolicySettingsChange({ ...policySettings, autoScheduleReminders: checked })
            }
          />
        </div>
        
        <div className={policySettings.autoScheduleReminders ? "" : "opacity-50 pointer-events-none"}>
          <div className="space-y-2">
            <Label htmlFor="reminderDaysBefore" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Dias antes do vencimento para enviar lembrete
            </Label>
            <Select 
              value={String(policySettings.reminderDaysBefore || 30)}
              onValueChange={(value) => 
                onPolicySettingsChange({ ...policySettings, reminderDaysBefore: parseInt(value) })
              }
            >
              <SelectTrigger id="reminderDaysBefore" className="w-full">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias antes</SelectItem>
                <SelectItem value="15">15 dias antes</SelectItem>
                <SelectItem value="30">30 dias antes</SelectItem>
                <SelectItem value="45">45 dias antes</SelectItem>
                <SelectItem value="60">60 dias antes</SelectItem>
                <SelectItem value="90">90 dias antes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="receiveViaWhatsApp">Lembretes via WhatsApp</Label>
            <p className="text-sm text-muted-foreground">
              Enviar lembretes de vencimento de apólices via WhatsApp
            </p>
          </div>
          <Switch 
            id="receiveViaWhatsApp" 
            checked={policySettings.receiveViaWhatsApp}
            onCheckedChange={(checked) => 
              onPolicySettingsChange({ ...policySettings, receiveViaWhatsApp: checked })
            }
          />
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
          className="flex items-center gap-2 mt-4"
        >
          <FileCheck className="h-4 w-4" />
          Salvar Configurações de Apólices
        </Button>
      </CardContent>
    </Card>
  );
};

export default PolicyReminderSettings;

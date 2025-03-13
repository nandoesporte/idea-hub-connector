
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { sendWhatsAppMessage } from "@/lib/whatsappService";
import { Loader2, MessageSquare, AlertCircle, Clock, CheckCircle } from "lucide-react";

const AdminWhatsAppSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [remindBefore, setRemindBefore] = useState(24);
  const [testPhone, setTestPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleToggleEnable = (checked: boolean) => {
    setIsEnabled(checked);
    toast.success(checked 
      ? "Notificações WhatsApp ativadas com sucesso!" 
      : "Notificações WhatsApp desativadas."
    );
  };
  
  const handleSendTest = async () => {
    if (!testPhone) {
      toast.error("Por favor, insira um número de telefone para teste");
      return;
    }
    
    setIsSending(true);
    
    try {
      const success = await sendWhatsAppMessage({
        phone: testPhone,
        message: "🔍 *Mensagem de Teste*\n\nOlá! Este é um teste de notificação via WhatsApp do sistema de agenda. Se você recebeu esta mensagem, a integração está funcionando corretamente."
      });
      
      if (success) {
        toast.success("Mensagem de teste enviada com sucesso!");
      } else {
        toast.error("Falha ao enviar mensagem de teste. Verifique o número e tente novamente.");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Notificações via WhatsApp
        </CardTitle>
        <CardDescription>
          Configure o envio automático de lembretes de agenda via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          />
        </div>
        
        {isEnabled && (
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
                  onChange={(e) => setRemindBefore(Number(e.target.value))}
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
            
            <div className="mt-6 space-y-2 border-t pt-4">
              <Label htmlFor="test-phone">Testar integração</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="test-phone"
                  type="tel"
                  placeholder="Ex: (11) 98765-4321"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendTest} 
                  disabled={isSending || !testPhone}
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
                Envie uma mensagem de teste para verificar a integração com o WhatsApp
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center text-sm">
          {isEnabled ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-2" />
              Notificações WhatsApp ativadas
            </div>
          ) : (
            <div className="flex items-center text-yellow-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              Notificações WhatsApp desativadas
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminWhatsAppSettings;

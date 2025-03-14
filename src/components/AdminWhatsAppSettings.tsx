
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { sendWhatsAppMessage, setApiKey, getApiKey, isWhatsAppConfigured } from "@/lib/whatsappService";
import { Loader2, MessageSquare, AlertCircle, Clock, CheckCircle, Key, Info } from "lucide-react";

const AdminWhatsAppSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [remindBefore, setRemindBefore] = useState(24);
  const [testPhone, setTestPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  
  // Carregar a API key do localStorage ao iniciar
  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
      setIsApiKeySet(true);
    }
    
    const savedEnabled = localStorage.getItem('whatsapp_enabled');
    if (savedEnabled === 'true') {
      setIsEnabled(true);
    }
    
    const savedRemindBefore = localStorage.getItem('whatsapp_remind_before');
    if (savedRemindBefore) {
      setRemindBefore(Number(savedRemindBefore));
    }
  }, []);
  
  const handleToggleEnable = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem('whatsapp_enabled', checked.toString());
    
    toast.success(checked 
      ? "Notificações WhatsApp ativadas com sucesso!" 
      : "Notificações WhatsApp desativadas."
    );
  };
  
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida");
      return;
    }
    
    // Salvar API key no localStorage e no serviço
    setApiKey(apiKey);
    setIsApiKeySet(true);
    
    toast.success("Chave de API do WhatsApp salva com sucesso!");
  };
  
  const handleRemindBeforeChange = (value: number) => {
    setRemindBefore(value);
    localStorage.setItem('whatsapp_remind_before', value.toString());
  };
  
  const handleSendTest = async () => {
    if (!testPhone) {
      toast.error("Por favor, insira um número de telefone para teste");
      return;
    }
    
    if (!isApiKeySet) {
      toast.error("Por favor, configure a chave de API primeiro");
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
        {/* API Key Configuration */}
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
        
        <Alert className="mt-2 bg-amber-500/10 text-amber-600 border-amber-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Nota sobre CORS</AlertTitle>
          <AlertDescription>
            Devido a restrições de CORS, você pode precisar usar uma extensão como "CORS Unblock" no navegador para testar a integração com o WhatsApp. Em produção, recomenda-se configurar um proxy para a API.
          </AlertDescription>
        </Alert>
        
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
                Envie uma mensagem de teste para verificar a integração com o WhatsApp
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center text-sm">
          {isApiKeySet ? (
            isEnabled ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-2" />
                Notificações WhatsApp ativadas
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <AlertCircle className="h-4 w-4 mr-2" />
                API configurada, mas notificações desativadas
              </div>
            )
          ) : (
            <div className="flex items-center text-amber-500">
              <Key className="h-4 w-4 mr-2" />
              Configure a chave de API para habilitar as notificações
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminWhatsAppSettings;

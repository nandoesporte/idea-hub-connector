
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  setApiKey, 
  getApiKey, 
  isWhatsAppConfigured,
  sendTestMessage,
  sendTestToSpecificNumber,
  testApiConnection
} from "@/lib/whatsgwService";
import { Loader2, MessageSquare, AlertCircle, Clock, CheckCircle, Key, Info, ExternalLink, Phone, Zap, ShieldAlert } from "lucide-react";
import WhatsAppLogs from './WhatsAppLogs';
import WhatsAppMessages from './WhatsAppMessages';

const AdminWhatsAppSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [remindBefore, setRemindBefore] = useState(24);
  const [testPhone, setTestPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
      setIsApiKeySet(true);
      // Test connection when component loads
      testConnection();
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
  
  const testConnection = async () => {
    try {
      const connected = await testApiConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };
  
  const handleToggleEnable = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem('whatsapp_enabled', checked.toString());
    
    toast.success(checked 
      ? "Notificações WhatsApp ativadas com sucesso!" 
      : "Notificações WhatsApp desativadas."
    );
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida");
      return;
    }
    
    setApiKey(apiKey);
    setIsApiKeySet(true);
    
    // Test connection after saving
    await testConnection();
    
    toast.success("Chave de API do WhatsApp salva com sucesso!");
  };
  
  const handleRemindBeforeChange = (value: number) => {
    setRemindBefore(value);
    localStorage.setItem('whatsapp_remind_before', value.toString());
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestPhone(e.target.value);
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
      const success = await sendTestMessage(testPhone);
      
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
  
  const handleDirectTest = async () => {
    if (!isApiKeySet) {
      toast.error("Por favor, configure a chave de API primeiro");
      return;
    }
    
    setIsSending(true);
    
    try {
      const success = await sendTestToSpecificNumber();
      
      if (success) {
        toast.success("Mensagem de teste enviada com sucesso para 44988057213!");
      } else {
        toast.error("Falha ao enviar mensagem de teste direta. Verifique a conexão e tente novamente.");
      }
    } catch (error) {
      console.error("Error sending direct test message:", error);
      toast.error("Erro ao enviar mensagem de teste direta");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            Configurações WhatsApp
          </CardTitle>
          <CardDescription>
            Configure a integração completa com WhatsApp para envio e recebimento de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuração</TabsTrigger>
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="space-y-4 mt-4">
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
                  Esta chave é necessária para enviar e receber mensagens através da API do WhatsApp (app.whatsgw.com.br)
                </p>
                
                {isApiKeySet && (
                  <Alert className={`mt-2 ${isConnected === true ? 'bg-green-500/10 text-green-600 border-green-200' : 
                    isConnected === false ? 'bg-red-500/10 text-red-600 border-red-200' : 
                    'bg-yellow-500/10 text-yellow-600 border-yellow-200'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>
                      {isConnected === true ? 'API Conectada' : 
                       isConnected === false ? 'Falha na Conexão' : 
                       'Testando Conexão...'}
                    </AlertTitle>
                    <AlertDescription>
                      {isConnected === true ? 'Sua chave de API foi configurada e testada com sucesso' : 
                       isConnected === false ? 'Não foi possível conectar com a API. Verifique sua chave' : 
                       'Verificando conexão com a API...'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <Alert className="mt-2 bg-blue-500/10 text-blue-600 border-blue-200">
                <ExternalLink className="h-4 w-4" />
                <AlertTitle>Documentação API</AlertTitle>
                <AlertDescription>
                  <a 
                    href="https://documenter.getpostman.com/view/3741041/SztBa7ku" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-700"
                  >
                    Consulte a documentação da API para mais informações
                  </a>
                </AlertDescription>
              </Alert>
              
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
                  <Button 
                    onClick={testConnection} 
                    variant="outline"
                    disabled={!isApiKeySet}
                  >
                    Testar Conexão
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este botão envia uma mensagem de teste diretamente para o número 44988057213
                </p>
              </div>
              
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
                </>
              )}
            </TabsContent>
            
            <TabsContent value="messages" className="mt-4">
              <WhatsAppMessages />
            </TabsContent>
            
            <TabsContent value="logs" className="mt-4">
              <WhatsAppLogs />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center text-sm">
            {isApiKeySet ? (
              isEnabled ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  WhatsApp configurado e ativo
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
                Configure a chave de API para habilitar o WhatsApp
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminWhatsAppSettings;

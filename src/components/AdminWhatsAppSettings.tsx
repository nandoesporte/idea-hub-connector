
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  setApiKey, 
  getApiKey, 
  isWhatsAppConfigured,
  sendTestMessage,
  sendTestToSpecificNumber 
} from "@/lib/whatsappService";
import { MessageSquare, AlertCircle, CheckCircle, Key } from 'lucide-react';
import WhatsAppLogs from './WhatsAppLogs';
import CorsWarningAlert from './CorsWarningAlert';

// Import individual components
import WhatsAppApiKeySection from './whatsapp/WhatsAppApiKeySection';
import WhatsAppDirectTestSection from './whatsapp/WhatsAppDirectTestSection';
import WhatsAppEnableSection from './whatsapp/WhatsAppEnableSection';
import WhatsAppReminderSettings from './whatsapp/WhatsAppReminderSettings';
import WhatsAppTestMessage from './whatsapp/WhatsAppTestMessage';
import WhatsAppApiDocAlert from './whatsapp/WhatsAppApiDocAlert';

const AdminWhatsAppSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [remindBefore, setRemindBefore] = useState(24);
  const [testPhone, setTestPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [apiUrl, setApiUrlState] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showCorsWarning, setShowCorsWarning] = useState(false);
  
  useEffect(() => {
    const { apiKey, apiUrl } = getApiKey();
    if (apiKey) {
      setApiKeyState(apiKey);
      setApiUrlState(apiUrl);
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
    
    // Check if we've had CORS errors in previous sessions
    const hasCorsErrors = localStorage.getItem('whatsapp_cors_errors');
    if (hasCorsErrors === 'true') {
      setShowCorsWarning(true);
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
    
    // Use default API URL if not provided
    const urlToUse = apiUrl.trim() || 'https://app.whatsgw.com.br/api/v1';
    
    setApiKey(apiKey, urlToUse);
    setIsApiKeySet(true);
    
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
      const result = await sendTestMessage(testPhone);
      
      if (result.success) {
        toast.success("Mensagem de teste enviada com sucesso!");
      } else {
        if (result.error?.includes('403')) {
          // If we get a 403 error, it's likely a CORS issue
          localStorage.setItem('whatsapp_cors_errors', 'true');
          setShowCorsWarning(true);
          toast.error("Falha ao enviar mensagem de teste. Erro de CORS (403) detectado.");
        } else {
          toast.error("Falha ao enviar mensagem de teste. Verifique o número e tente novamente.");
        }
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      if (error instanceof Error && error.message.includes('403')) {
        localStorage.setItem('whatsapp_cors_errors', 'true');
        setShowCorsWarning(true);
      }
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
      const result = await sendTestToSpecificNumber();
      
      if (result.success) {
        toast.success("Mensagem de teste enviada com sucesso para 44988057213!");
      } else {
        if (result.error?.includes('403')) {
          // If we get a 403 error, it's likely a CORS issue
          localStorage.setItem('whatsapp_cors_errors', 'true');
          setShowCorsWarning(true);
          toast.error("Falha ao enviar mensagem de teste. Erro de CORS (403) detectado.");
        } else {
          toast.error("Falha ao enviar mensagem de teste direta. Verifique a conexão e tente novamente.");
        }
      }
    } catch (error) {
      console.error("Error sending direct test message:", error);
      if (error instanceof Error && error.message.includes('403')) {
        localStorage.setItem('whatsapp_cors_errors', 'true');
        setShowCorsWarning(true);
      }
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
            Notificações via WhatsApp
          </CardTitle>
          <CardDescription>
            Configure o envio automático de lembretes de agenda via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCorsWarning && <CorsWarningAlert />}

          <WhatsAppApiKeySection 
            apiKey={apiKey}
            setApiKeyState={setApiKeyState}
            apiUrl={apiUrl}
            setApiUrlState={setApiUrlState}
            handleSaveApiKey={handleSaveApiKey}
            isApiKeySet={isApiKeySet}
          />
          
          <WhatsAppApiDocAlert />
          
          <WhatsAppDirectTestSection 
            handleDirectTest={handleDirectTest}
            isSending={isSending}
            isApiKeySet={isApiKeySet}
          />
          
          <WhatsAppEnableSection 
            isEnabled={isEnabled}
            handleToggleEnable={handleToggleEnable}
            isApiKeySet={isApiKeySet}
          />
          
          {isEnabled && (
            <>
              <WhatsAppReminderSettings 
                remindBefore={remindBefore}
                handleRemindBeforeChange={handleRemindBeforeChange}
              />
              
              <WhatsAppTestMessage 
                testPhone={testPhone}
                handlePhoneChange={handlePhoneChange}
                handleSendTest={handleSendTest}
                isSending={isSending}
                isApiKeySet={isApiKeySet}
              />
            </>
          )}
          
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowLogs(!showLogs)}
              className="w-full"
            >
              {showLogs ? "Ocultar logs" : "Mostrar logs de erros e operações"}
            </Button>
          </div>
          
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
      
      {showLogs && <WhatsAppLogs />}
    </div>
  );
};

export default AdminWhatsAppSettings;

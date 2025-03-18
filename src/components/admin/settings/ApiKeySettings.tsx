
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Save, Eye, EyeOff, RefreshCw, Check, X, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface ApiKeySettingsProps {
  openAiApiKey: string;
  onApiKeyChange: (value: string) => void;
  onSave: () => Promise<void>;
  isDirty: boolean;
  isSaving: boolean;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
  openAiApiKey,
  onApiKeyChange,
  onSave,
  isDirty,
  isSaving
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useTextarea, setUseTextarea] = useState(false);
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey && !openAiApiKey) {
      onApiKeyChange(savedApiKey);
      console.log('API key loaded from localStorage');
    }
  }, [openAiApiKey, onApiKeyChange]);
  
  const handleSave = async () => {
    try {
      // Clean the API key before saving
      const cleanedApiKey = cleanApiKey(openAiApiKey);
      
      // Validate the API key format
      if (!validateApiKey(cleanedApiKey)) {
        toast.error('Formato de chave API inválido');
        setConnectionStatus('error');
        setErrorMessage(
          'Formato de chave API inválido. A chave deve começar com "sk-" (e não com "sk-proj-"), ' +
          'não deve conter espaços ou caracteres especiais, e deve ter pelo menos 20 caracteres. ' +
          'Verifique se você está utilizando uma chave de API pessoal e não uma chave de projeto.'
        );
        return;
      }
      
      // Update the state with the cleaned key
      onApiKeyChange(cleanedApiKey);
      
      await onSave();
      
      // Save API key to localStorage for use in analyze-policy.ts
      localStorage.setItem('openai_api_key', cleanedApiKey);
      console.log('API key saved to localStorage');
      
      toast.success('Chave API do OpenAI salva com sucesso');
      setConnectionStatus('idle');
      setErrorMessage(null);
    } catch (error) {
      toast.error('Erro ao salvar a chave API');
      console.error('Error saving API key:', error);
    }
  };

  // Clean API key by removing whitespace and invisible characters
  const cleanApiKey = (apiKey: string): string => {
    if (!apiKey) return '';
    
    // Remove all whitespace, including invisible Unicode whitespace characters
    const cleanedKey = apiKey.replace(/\s+/g, '');
    
    // Remove any non-alphanumeric characters except for hyphens and underscores
    // which are valid in OpenAI API keys
    return cleanedKey.replace(/[^a-zA-Z0-9\-_]/g, '');
  };

  const validateApiKey = (apiKey: string): boolean => {
    if (!apiKey) return false;
    
    // Basic validation for OpenAI API key format
    // - Should start with "sk-" 
    // - Should not start with "sk-proj-" (project keys not allowed)
    // - Should not contain spaces or special characters
    // - Should be at least 20 characters long 
    const isStartingWithSk = apiKey.startsWith('sk-');
    const isProjectKey = apiKey.startsWith('sk-proj-');
    const hasInvalidChars = /[^a-zA-Z0-9\-_]/.test(apiKey);
    const isLongEnough = apiKey.length >= 20;
    
    return isStartingWithSk && !isProjectKey && !hasInvalidChars && isLongEnough;
  };

  const testConnection = async () => {
    if (!openAiApiKey) {
      toast.error('Insira uma chave API para testar a conexão');
      return;
    }
    
    // Clean the API key before testing
    const cleanedApiKey = cleanApiKey(openAiApiKey);
    
    if (!validateApiKey(cleanedApiKey)) {
      setConnectionStatus('error');
      setErrorMessage(
        'Formato de chave API inválido. A chave deve começar com "sk-" (e não com "sk-proj-"), ' +
        'não deve conter espaços ou caracteres especiais, e deve ter pelo menos 20 caracteres. ' +
        'Verifique se você está utilizando uma chave de API pessoal e não uma chave de projeto.'
      );
      toast.error('Formato de chave API inválido');
      return;
    }
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage(null);
    
    try {
      console.log('Testing API connection');
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanedApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success');
        toast.success('Conexão com a API do OpenAI estabelecida com sucesso!');
        console.log('API connection successful', data);
        
        // Since the connection test was successful, save the cleaned API key immediately
        localStorage.setItem('openai_api_key', cleanedApiKey);
        onApiKeyChange(cleanedApiKey); // Update the state with cleaned key
        console.log('API key automatically saved after successful connection test');
      } else {
        setConnectionStatus('error');
        setErrorMessage(data.error?.message || 'Erro desconhecido');
        toast.error(`Erro na conexão: ${data.error?.message || 'Erro desconhecido'}`);
        console.error('API connection error', data);
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      setConnectionStatus('error');
      setErrorMessage('Erro ao testar conexão com a API do OpenAI');
      toast.error('Erro ao testar conexão com a API do OpenAI');
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const toggleInputType = () => {
    setUseTextarea(!useTextarea);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const cleanedKey = cleanApiKey(pastedText);
    
    // Prevent default paste behavior and manually set the cleaned value
    e.preventDefault();
    onApiKeyChange(cleanedKey);
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText(
      "1. Acesse https://platform.openai.com/api-keys\n" +
      "2. Clique em 'Create new secret key'\n" +
      "3. Dê um nome à sua chave (ex: 'Sistema de Análise de Apólices')\n" +
      "4. Copie a chave gerada (começa com 'sk-')\n" +
      "5. Cole a chave aqui e clique em 'Salvar Chave de API'\n" +
      "6. Teste a conexão para verificar se a chave está funcionando"
    );
    toast.success('Instruções copiadas para a área de transferência');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configurações de API do OpenAI
        </CardTitle>
        <CardDescription>
          Configure a chave de API do OpenAI para permitir a análise de documentos e extração de dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectionStatus === 'error' && errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="openAiApiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Chave de API do OpenAI
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleInputType}
              className="text-xs"
            >
              {useTextarea ? 'Usar Campo Simples' : 'Usar Área de Texto'}
            </Button>
          </div>
          
          <div className="flex relative">
            {useTextarea ? (
              <Textarea
                id="openAiApiKeyTextarea"
                value={openAiApiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className="font-mono text-sm"
                rows={3}
                onPaste={handlePaste}
              />
            ) : (
              <>
                <Input 
                  id="openAiApiKey" 
                  value={openAiApiKey} 
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="sk-..."
                  type={showApiKey ? "text" : "password"}
                  className="pr-10 font-mono"
                  onPaste={handlePaste}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={toggleShowApiKey}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <p className="text-xs text-muted-foreground">
              Esta chave é necessária para análise de documentos com OpenAI. 
              A chave deve começar com "sk-" (não use chaves de projeto que começam com "sk-proj-").
              Obtenha sua chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a>
            </p>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2 self-start text-xs"
              onClick={copyInstructions}
            >
              <Copy className="h-3 w-3" />
              Copiar instruções de obtenção da chave
            </Button>
          </div>
          
          {connectionStatus === 'success' && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Conexão estabelecida com sucesso
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving || !openAiApiKey}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Chave de API
          </Button>
          
          <Button
            onClick={testConnection}
            disabled={!openAiApiKey || testingConnection}
            variant="outline"
            className="flex items-center gap-2"
          >
            {testingConnection ? 
              <RefreshCw className="h-4 w-4 animate-spin" /> : 
              <RefreshCw className="h-4 w-4" />
            }
            Testar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Save, Eye, EyeOff, RefreshCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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
      await onSave();
      
      // Save API key to localStorage for use in analyze-policy.ts
      if (openAiApiKey) {
        localStorage.setItem('openai_api_key', openAiApiKey);
        console.log('API key saved to localStorage');
      } else {
        localStorage.removeItem('openai_api_key');
        console.log('API key removed from localStorage');
      }
      
      toast.success('Chave API do OpenAI salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar a chave API');
      console.error('Error saving API key:', error);
    }
  };

  const testConnection = async () => {
    if (!openAiApiKey) {
      toast.error('Insira uma chave API para testar a conexão');
      return;
    }
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      console.log('Testing API connection');
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('success');
        toast.success('Conexão com a API do OpenAI estabelecida com sucesso!');
        console.log('API connection successful', data);
        
        // Since the connection test was successful, save the API key immediately
        localStorage.setItem('openai_api_key', openAiApiKey);
        console.log('API key automatically saved after successful connection test');
      } else {
        setConnectionStatus('error');
        toast.error(`Erro na conexão: ${data.error?.message || 'Erro desconhecido'}`);
        console.error('API connection error', data);
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      setConnectionStatus('error');
      toast.error('Erro ao testar conexão com a API do OpenAI');
    } finally {
      setTestingConnection(false);
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
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
        <div className="space-y-2">
          <Label htmlFor="openAiApiKey" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chave de API do OpenAI
          </Label>
          <div className="flex relative">
            <Input 
              id="openAiApiKey" 
              value={openAiApiKey} 
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-..."
              type={showApiKey ? "text" : "password"}
              className="pr-10"
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
          </div>
          <p className="text-xs text-muted-foreground">
            Esta chave é necessária para análise de documentos com OpenAI. 
            Obtenha sua chave em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a>
          </p>
          
          {connectionStatus === 'success' && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Conexão estabelecida com sucesso
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <X className="h-4 w-4" />
              Falha ao conectar com a API do OpenAI
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving}
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

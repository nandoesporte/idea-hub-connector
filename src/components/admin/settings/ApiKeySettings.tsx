
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Save, Eye, EyeOff } from 'lucide-react';
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
  
  const handleSave = async () => {
    try {
      await onSave();
      toast.success('Chave API do OpenAI salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar a chave API');
      console.error('Error saving API key:', error);
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
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!isDirty || isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar Chave de API
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;

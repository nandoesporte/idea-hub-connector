
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface GeneralSettingsProps {
  settings: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
  };
  onSettingsChange: (name: string, value: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  isDirty,
  isSaving
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onSettingsChange(name, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>
          Configure as informações básicas do seu site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Nome do Site</Label>
          <Input 
            id="siteName" 
            name="siteName" 
            value={settings.siteName} 
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteDescription">Descrição do Site</Label>
          <Textarea 
            id="siteDescription" 
            name="siteDescription" 
            value={settings.siteDescription} 
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email de Contato</Label>
          <Input 
            id="contactEmail" 
            name="contactEmail" 
            type="email" 
            value={settings.contactEmail} 
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefone</Label>
          <Input 
            id="phoneNumber" 
            name="phoneNumber" 
            value={settings.phoneNumber} 
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Textarea 
            id="address" 
            name="address" 
            value={settings.address} 
            onChange={handleChange}
            rows={2}
          />
        </div>
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;

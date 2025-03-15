
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface FeatureSettingsProps {
  features: {
    enableBlog: boolean;
    enableTestimonials: boolean;
    enableContactForm: boolean;
    enableNewsletter: boolean;
    enableUserRegistration: boolean;
  };
  onFeatureToggle: (feature: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const FeatureSettings: React.FC<FeatureSettingsProps> = ({
  features,
  onFeatureToggle,
  onSave,
  isDirty,
  isSaving
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funcionalidades do Site</CardTitle>
        <CardDescription>
          Ative ou desative funcionalidades específicas do site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableBlog">Blog</Label>
            <p className="text-sm text-muted-foreground">
              Permite a publicação de artigos e notícias no site.
            </p>
          </div>
          <Switch 
            id="enableBlog" 
            checked={features.enableBlog}
            onCheckedChange={() => onFeatureToggle('enableBlog')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableTestimonials">Depoimentos</Label>
            <p className="text-sm text-muted-foreground">
              Exibe depoimentos de clientes na página inicial.
            </p>
          </div>
          <Switch 
            id="enableTestimonials" 
            checked={features.enableTestimonials}
            onCheckedChange={() => onFeatureToggle('enableTestimonials')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableContactForm">Formulário de Contato</Label>
            <p className="text-sm text-muted-foreground">
              Permite que visitantes enviem mensagens através do site.
            </p>
          </div>
          <Switch 
            id="enableContactForm" 
            checked={features.enableContactForm}
            onCheckedChange={() => onFeatureToggle('enableContactForm')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableNewsletter">Newsletter</Label>
            <p className="text-sm text-muted-foreground">
              Adiciona um formulário de inscrição para newsletter.
            </p>
          </div>
          <Switch 
            id="enableNewsletter" 
            checked={features.enableNewsletter}
            onCheckedChange={() => onFeatureToggle('enableNewsletter')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableUserRegistration">Registro de Usuários</Label>
            <p className="text-sm text-muted-foreground">
              Permite que visitantes criem novas contas.
            </p>
          </div>
          <Switch 
            id="enableUserRegistration" 
            checked={features.enableUserRegistration}
            onCheckedChange={() => onFeatureToggle('enableUserRegistration')}
          />
        </div>
        
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureSettings;

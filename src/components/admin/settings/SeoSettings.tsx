
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SeoSettingsProps {
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string;
  };
  onSeoChange: (name: string, value: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const SeoSettings: React.FC<SeoSettingsProps> = ({
  seo,
  onSeoChange,
  onSave,
  isDirty,
  isSaving
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onSeoChange(name, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de SEO</CardTitle>
        <CardDescription>
          Otimize seu site para mecanismos de busca.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Título Meta (Meta Title)</Label>
          <Input 
            id="metaTitle" 
            name="metaTitle" 
            value={seo.metaTitle} 
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Descrição Meta (Meta Description)</Label>
          <Textarea 
            id="metaDescription" 
            name="metaDescription" 
            value={seo.metaDescription} 
            onChange={handleChange}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogImage">Imagem OG (para compartilhamento)</Label>
          <Input 
            id="ogImage" 
            name="ogImage" 
            value={seo.ogImage} 
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">URL da imagem (1200x630px recomendado)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Palavras-chave</Label>
          <Textarea 
            id="keywords" 
            name="keywords" 
            value={seo.keywords} 
            onChange={handleChange}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">Separadas por vírgula</p>
        </div>
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações de SEO'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeoSettings;

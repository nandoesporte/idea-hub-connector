
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SocialSettingsProps {
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  onSocialChange: (name: string, value: string) => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
}

const SocialSettings: React.FC<SocialSettingsProps> = ({
  socialMedia,
  onSocialChange,
  onSave,
  isDirty,
  isSaving
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSocialChange(name, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redes Sociais</CardTitle>
        <CardDescription>
          Configure os links para suas redes sociais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input 
            id="facebook" 
            name="facebook" 
            value={socialMedia.facebook} 
            onChange={handleChange}
            placeholder="https://facebook.com/suapagina"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input 
            id="instagram" 
            name="instagram" 
            value={socialMedia.instagram} 
            onChange={handleChange}
            placeholder="https://instagram.com/suapagina"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input 
            id="twitter" 
            name="twitter" 
            value={socialMedia.twitter} 
            onChange={handleChange}
            placeholder="https://twitter.com/suapagina"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input 
            id="linkedin" 
            name="linkedin" 
            value={socialMedia.linkedin} 
            onChange={handleChange}
            placeholder="https://linkedin.com/company/suapagina"
          />
        </div>
        <Button 
          onClick={onSave} 
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Redes Sociais'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialSettings;

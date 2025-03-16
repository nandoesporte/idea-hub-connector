
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceInputButton from '@/components/VoiceInputButton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoiceCommandHelp from '@/components/VoiceCommandHelp';
import { Button } from '@/components/ui/button';
import { Info, Mic } from 'lucide-react';

const VoiceCommandsSection = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <CardTitle>Assistente de Voz "Vic"</CardTitle>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info size={16} className="mr-2" />
                Ajuda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <VoiceCommandHelp />
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Crie eventos e execute comandos usando o assistente de voz. 
          Diga "Vic" para ativar e siga com seu comando.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <VoiceInputButton />
      </CardContent>
    </Card>
  );
};

export default VoiceCommandsSection;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceInputButton from '@/components/VoiceInputButton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoiceCommandHelp from '@/components/VoiceCommandHelp';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const VoiceCommandsSection = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">Comandos de Voz</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-base">
                <Info size={20} className="mr-2" />
                Ajuda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <VoiceCommandHelp />
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription className="text-lg">
          Crie eventos rapidamente usando comandos de voz
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-6">
        <VoiceInputButton />
      </CardContent>
    </Card>
  );
};

export default VoiceCommandsSection;

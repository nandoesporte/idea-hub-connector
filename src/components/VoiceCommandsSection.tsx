
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceInputButton from '@/components/VoiceInputButton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import VoiceCommandHelp from '@/components/VoiceCommandHelp';
import { Button } from '@/components/ui/button';
import { Info, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const VoiceCommandsSection = () => {
  const { user } = useUser();
  const userName = user?.user_metadata?.name || 'Usuário';

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
      <CardContent className="flex flex-col items-center p-6 space-y-4">
        <div className="bg-primary/10 rounded-lg p-4 w-full max-w-md flex items-center gap-3 mb-2">
          <div className="bg-white/80 dark:bg-black/20 p-2 rounded-full">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg">Bem-vindo, {userName.split(' ')[0]}!</h3>
            <p className="text-sm text-muted-foreground">Gerencie seus projetos facilmente</p>
          </div>
        </div>
        <VoiceInputButton />
      </CardContent>
    </Card>
  );
};

export default VoiceCommandsSection;

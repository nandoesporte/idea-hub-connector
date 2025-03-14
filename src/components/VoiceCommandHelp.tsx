
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const VoiceCommandHelp = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Ajuda para Comandos de Voz</DialogTitle>
        <DialogDescription>
          Utilize comandos de voz para agendar eventos rapidamente
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="max-h-[60vh] mt-4">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm">Como funciona:</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Clique no botão "Comando de Voz", fale o evento que deseja agendar e os detalhes serão 
              processados automaticamente.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm">Exemplos de comandos:</h3>
            <ul className="mt-1 space-y-2">
              <li className="text-sm border-l-2 border-primary pl-3 py-1">
                "Agendar uma reunião com a equipe de design amanhã às 14h com duração de 1 hora"
              </li>
              <li className="text-sm border-l-2 border-primary pl-3 py-1">
                "Marcar prazo de entrega para o projeto X na próxima segunda-feira"
              </li>
              <li className="text-sm border-l-2 border-primary pl-3 py-1">
                "Criar tarefa de revisão do portfólio hoje à tarde"
              </li>
              <li className="text-sm border-l-2 border-primary pl-3 py-1">
                "Agendar call com cliente para dia 15 de dezembro às 10 horas da manhã"
              </li>
              <li className="text-sm border-l-2 border-primary pl-3 py-1">
                "Reunião com João da empresa ABC na quinta-feira às 9h, telefone 11987654321"
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm">Elementos reconhecidos:</h3>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              <li>• Tipo de evento: reunião, prazo, tarefa</li>
              <li>• Data e hora: hoje, amanhã, dias da semana, datas específicas</li>
              <li>• Duração: tempo em horas ou minutos</li>
              <li>• Contatos: números de telefone para notificações</li>
              <li>• Descrição: detalhes adicionais sobre o evento</li>
            </ul>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Dica:</p>
            <p className="text-sm mt-1">
              Quanto mais detalhes você fornecer em seu comando de voz, mais 
              preciso será o evento criado. Sempre mencione o tipo de evento, 
              a data, o horário e qualquer informação adicional relevante.
            </p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default VoiceCommandHelp;

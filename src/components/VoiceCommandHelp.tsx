
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
              processados automaticamente. O sistema interpretará sua fala e criará um evento no calendário.
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
              <li>• <strong>Tipo de evento:</strong> reunião, prazo, tarefa</li>
              <li>• <strong>Data:</strong> hoje, amanhã, dias da semana, datas específicas</li>
              <li>• <strong>Hora:</strong> manhã, tarde, noite, horários específicos (14h, 15:30)</li>
              <li>• <strong>Duração:</strong> tempo em horas ou minutos</li>
              <li>• <strong>Contatos:</strong> números de telefone para notificações</li>
              <li>• <strong>Descrição:</strong> detalhes adicionais sobre o evento</li>
            </ul>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">Dicas para melhores resultados:</p>
            <ul className="mt-1 space-y-1 text-sm">
              <li>1. Mencione claramente o <strong>tipo de evento</strong> (reunião, tarefa, prazo)</li>
              <li>2. Especifique a <strong>data</strong> (hoje, amanhã, próxima quinta-feira)</li>
              <li>3. Indique o <strong>horário</strong> (manhã, 14h, 15:30)</li>
              <li>4. Forneça um <strong>título descritivo</strong> para o evento</li>
              <li>5. Para receber lembretes por WhatsApp, mencione um <strong>número de telefone</strong></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm font-medium text-blue-700">Solução de problemas:</p>
            <p className="text-sm mt-1 text-blue-600">
              Se o evento não for criado corretamente, tente falar mais devagar 
              e articular claramente as palavras. Certifique-se de mencionar os 
              elementos essenciais como tipo de evento, data e horário.
            </p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default VoiceCommandHelp;

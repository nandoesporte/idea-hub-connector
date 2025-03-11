
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import ProjectForm from '@/components/ProjectForm';
import { FileText, CheckSquare, MessageCircle, Clock } from 'lucide-react';

const ProcessStep = ({ 
  icon, 
  title, 
  description, 
  number 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  number: number 
}) => (
  <div className="flex space-x-3">
    <div className="flex-shrink-0">
      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
          {number}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const SubmitIdea = () => {
  return (
    <MainLayout className="max-w-5xl mx-auto">
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Envie sua ideia</h1>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo com os detalhes da sua ideia e nossa equipe entrará em contato em breve.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <ProjectForm />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Como funciona</h2>
              <div className="space-y-6">
                <ProcessStep 
                  icon={<FileText className="h-5 w-5" />}
                  title="Descreva sua ideia"
                  description="Conte-nos em detalhes o que você precisa"
                  number={1}
                />
                
                <ProcessStep 
                  icon={<CheckSquare className="h-5 w-5" />}
                  title="Análise"
                  description="Nossa equipe avalia a viabilidade do projeto"
                  number={2}
                />
                
                <ProcessStep 
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Proposta"
                  description="Receba um orçamento e cronograma detalhado"
                  number={3}
                />
                
                <ProcessStep 
                  icon={<Clock className="h-5 w-5" />}
                  title="Desenvolvimento"
                  description="Acompanhe o progresso em tempo real"
                  number={4}
                />
              </div>
            </div>
            
            <div className="rounded-xl border bg-primary/5 p-5 shadow-sm">
              <h3 className="font-medium mb-2">Dica</h3>
              <p className="text-sm text-muted-foreground">
                Quanto mais detalhes você fornecer sobre sua ideia, mais precisamente poderemos avaliar e implementar sua solução.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubmitIdea;

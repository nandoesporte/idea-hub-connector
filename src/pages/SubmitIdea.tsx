
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import ProjectForm from '@/components/ProjectForm';

const SubmitIdea = () => {
  return (
    <MainLayout className="max-w-3xl mx-auto">
      <div className="space-y-6 pb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Envie sua ideia</h1>
          <p className="text-muted-foreground">
            Preencha o formulário abaixo com os detalhes da sua ideia e nossa equipe entrará em contato em breve.
          </p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <ProjectForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default SubmitIdea;

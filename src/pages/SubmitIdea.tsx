
import React from 'react';
import ProjectForm from '@/components/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

const SubmitIdea = () => {
  return (
    <MainLayout className="max-w-4xl mx-auto">
      <div className="space-y-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/user-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Ideia</h1>
            <p className="text-muted-foreground">Descreva seu projeto para receber uma proposta personalizada</p>
          </div>
        </div>
        
        <ProjectForm />
      </div>
    </MainLayout>
  );
};

export default SubmitIdea;

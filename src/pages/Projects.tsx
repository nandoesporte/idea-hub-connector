
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Projects = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Projetos</h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-2">Explore nosso portfólio</h3>
              <p className="text-muted-foreground mb-4 flex-grow">
                Confira os projetos já realizados e veja como podemos ajudar seu negócio.
              </p>
              <Link to="/portfolio">
                <Button>Ver portfólio</Button>
              </Link>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-2">Envie sua ideia</h3>
              <p className="text-muted-foreground mb-4 flex-grow">
                Tem um projeto em mente? Compartilhe sua ideia e receba uma avaliação inicial.
              </p>
              <Link to="/submit-idea">
                <Button variant="outline">Enviar ideia</Button>
              </Link>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-2">Acompanhe seu projeto</h3>
              <p className="text-muted-foreground mb-4 flex-grow">
                Cliente com projeto em andamento? Acompanhe o progresso aqui.
              </p>
              <Link to="/project-tracking">
                <Button variant="secondary">Acompanhar projeto</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Projects;

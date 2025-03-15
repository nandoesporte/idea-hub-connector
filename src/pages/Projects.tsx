
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projetos</h1>
          <Link to="/project-ideas/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="archived">Arquivados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid gap-6">
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-muted-foreground">Nenhum projeto encontrado</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Você ainda não tem nenhum projeto criado.
                  </p>
                </CardContent>
                <CardFooter className="justify-center pt-0">
                  <Link to="/project-ideas/new">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar meu primeiro projeto
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="active">
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <p className="text-muted-foreground">
                Nenhum projeto ativo no momento.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <p className="text-muted-foreground">
                Nenhum projeto concluído.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="archived">
            <div className="p-6 border rounded-lg shadow-sm text-center">
              <p className="text-muted-foreground">
                Nenhum projeto arquivado.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Projects;

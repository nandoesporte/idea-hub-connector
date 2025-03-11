
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProjectIdea } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, AlertCircle, PlayCircle, RotateCcw, XCircle, ChevronRight } from 'lucide-react';

// Mock data - would come from an API in a real app
const mockProjects: ProjectIdea[] = [
  {
    id: '1',
    title: 'Website para minha loja de roupas',
    description: 'Preciso de um site para minha loja de roupas com catálogo de produtos e formulário de contato.',
    category: 'website',
    budget: 'R$ 5.000 - R$ 8.000',
    timeline: '1 mês',
    features: ['Catálogo de produtos', 'Formulário de contato', 'Responsivo'],
    userId: 'user123',
    status: 'approved',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-18'),
    urgency: 'normal',
  },
  {
    id: '2',
    title: 'Automatização de planilhas',
    description: 'Preciso automatizar o processamento de várias planilhas Excel da minha empresa.',
    category: 'automation',
    budget: 'R$ 3.000 - R$ 6.000',
    features: ['Importação de Excel', 'Processamento automático', 'Geração de relatórios'],
    userId: 'user123',
    status: 'in-progress',
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2023-11-10'),
    urgency: 'alta',
  },
  {
    id: '3',
    title: 'App de delivery para restaurante',
    description: 'Aplicativo para gerenciar pedidos de delivery do meu restaurante.',
    category: 'mobile-app',
    budget: 'R$ 15.000 - R$ 25.000',
    timeline: '3 meses',
    features: ['Cadastro de clientes', 'Gestão de pedidos', 'Pagamento online'],
    userId: 'user123',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 dias atrás
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
    urgency: 'baixa',
  }
];

const ProjectStatusIcon = ({ status }: { status: ProjectIdea['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'under-review':
      return <RotateCcw className="h-5 w-5 text-blue-500" />;
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <PlayCircle className="h-5 w-5 text-indigo-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

const ProjectStatusBadge = ({ status }: { status: ProjectIdea['status'] }) => {
  const statusMap = {
    'pending': { label: 'Pendente', variant: 'warning' as const },
    'under-review': { label: 'Em Análise', variant: 'info' as const },
    'approved': { label: 'Aprovado', variant: 'success' as const },
    'in-progress': { label: 'Em Desenvolvimento', variant: 'secondary' as const },
    'completed': { label: 'Concluído', variant: 'success' as const },
    'rejected': { label: 'Rejeitado', variant: 'destructive' as const }
  };

  const statusInfo = statusMap[status] || { label: 'Desconhecido', variant: 'outline' as const };

  return (
    <Badge variant={statusInfo.variant === 'info' ? 'outline' : statusInfo.variant} 
      className={statusInfo.variant === 'info' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : ''}>
      {statusInfo.label}
    </Badge>
  );
};

const ProjectCard = ({ project }: { project: ProjectIdea }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="mb-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border/60 overflow-hidden group">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/70 to-blue-400/70 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{project.title}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">
              Criado em {formatDate(project.createdAt)}
            </CardDescription>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/5 text-xs">
            {project.category === 'website' ? 'Website' : 
             project.category === 'e-commerce' ? 'E-commerce' : 
             project.category === 'mobile-app' ? 'App Mobile' : 
             project.category === 'desktop-app' ? 'App Desktop' : 
             project.category === 'automation' ? 'Automação' : 
             project.category === 'integration' ? 'Integração' : 
             project.category === 'ai-solution' ? 'Solução IA' : 'Outro'}
          </Badge>
          {project.urgency && (
            <Badge variant={project.urgency === 'alta' ? 'destructive' : 
                           project.urgency === 'normal' ? 'outline' : 
                           'secondary'} 
                   className={`text-xs ${project.urgency === 'normal' ? 'bg-gray-100' : ''}`}>
              Urgência: {project.urgency.charAt(0).toUpperCase() + project.urgency.slice(1)}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between border-t border-border/40 mt-2 py-3">
        <div className="text-sm text-muted-foreground">
          {project.budget && <div>Orçamento: {project.budget}</div>}
          {project.timeline && <div>Prazo: {project.timeline}</div>}
        </div>
        <Link to={`/projects/${project.id}`} className="flex items-center space-x-1 text-sm font-medium text-primary group/link">
          <span className="relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary after:origin-right after:scale-x-0 after:transition-transform after:duration-300 group-hover/link:after:origin-left group-hover/link:after:scale-x-100">Ver detalhes</span>
          <ChevronRight className="h-4 w-4 transform transition-transform duration-300 group-hover/link:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
};

const ProjectTracking = () => {
  const [projects] = useState(mockProjects);

  return (
    <MainLayout className="max-w-5xl mx-auto">
      <div className="space-y-8 pb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">Meus Projetos</span>
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o status e detalhes dos seus projetos submetidos.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-lg p-1 shadow-inner bg-muted/50">
            <TabsTrigger value="all" className="rounded-md data-[state=active]:shadow-sm">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-md data-[state=active]:shadow-sm">Pendentes</TabsTrigger>
            <TabsTrigger value="active" className="rounded-md data-[state=active]:shadow-sm">Ativos</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-md data-[state=active]:shadow-sm">Concluídos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 animate-fade-in">
            {projects.length > 0 ? (
              projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="text-center py-12 rounded-lg border border-dashed animate-pulse">
                <p className="text-muted-foreground">Você ainda não submeteu nenhum projeto.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6 animate-fade-in">
            {projects.filter(p => p.status === 'pending' || p.status === 'under-review').length > 0 ? (
              projects
                .filter(p => p.status === 'pending' || p.status === 'under-review')
                .map(project => <ProjectCard key={project.id} project={project} />)
            ) : (
              <div className="text-center py-12 rounded-lg border border-dashed animate-pulse">
                <p className="text-muted-foreground">Nenhum projeto pendente no momento.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-6 animate-fade-in">
            {projects.filter(p => p.status === 'approved' || p.status === 'in-progress').length > 0 ? (
              projects
                .filter(p => p.status === 'approved' || p.status === 'in-progress')
                .map(project => <ProjectCard key={project.id} project={project} />)
            ) : (
              <div className="text-center py-12 rounded-lg border border-dashed animate-pulse">
                <p className="text-muted-foreground">Nenhum projeto ativo no momento.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6 animate-fade-in">
            {projects.filter(p => p.status === 'completed' || p.status === 'rejected').length > 0 ? (
              projects
                .filter(p => p.status === 'completed' || p.status === 'rejected')
                .map(project => <ProjectCard key={project.id} project={project} />)
            ) : (
              <div className="text-center py-12 rounded-lg border border-dashed animate-pulse">
                <p className="text-muted-foreground">Nenhum projeto concluído no momento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProjectTracking;

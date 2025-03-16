
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ProjectIdea } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle, 
  RotateCcw, 
  XCircle, 
  ArrowLeft,
  Calendar,
  DollarSign,
  Tag,
  CheckSquare,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    contactName: 'João Silva',
    contactEmail: 'joao.silva@example.com',
    statusUpdates: [
      { date: new Date('2023-10-15'), status: 'pending', message: 'Projeto submetido' },
      { date: new Date('2023-10-16'), status: 'under-review', message: 'Projeto em análise pela equipe técnica' },
      { date: new Date('2023-10-18'), status: 'approved', message: 'Projeto aprovado. Aguardando início do desenvolvimento.' }
    ]
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
    contactName: 'Maria Oliveira',
    contactEmail: 'maria.oliveira@example.com',
    statusUpdates: [
      { date: new Date('2023-11-05'), status: 'pending', message: 'Projeto submetido' },
      { date: new Date('2023-11-07'), status: 'under-review', message: 'Projeto em análise pela equipe técnica' },
      { date: new Date('2023-11-09'), status: 'approved', message: 'Projeto aprovado' },
      { date: new Date('2023-11-10'), status: 'in-progress', message: 'Desenvolvimento iniciado. Estimativa de conclusão: 15 dias.' }
    ]
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
    contactName: 'Carlos Santos',
    contactEmail: 'carlos.santos@example.com',
    statusUpdates: [
      { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), status: 'pending', message: 'Projeto submetido. Em análise inicial.' }
    ]
  }
];

// Function to map status to icon and color
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

// Function to format dates consistently
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Component for the timeline of status updates
const ProjectTimeline = ({ statusUpdates }: { statusUpdates?: Array<{date: Date, status: ProjectIdea['status'], message: string}> }) => {
  if (!statusUpdates || statusUpdates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma atualização de status disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusUpdates.map((update, index) => (
        <div key={index} className="relative pl-6">
          {/* Line connecting timeline items */}
          {index < statusUpdates.length - 1 && (
            <div className="absolute left-[0.9375rem] top-6 bottom-0 w-px bg-border -translate-x-1/2"></div>
          )}
          
          <div className="flex items-start gap-4">
            <div className="absolute left-0 rounded-full bg-background p-1 shadow">
              <ProjectStatusIcon status={update.status} />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <ProjectStatusBadge status={update.status} />
                <time className="text-sm text-muted-foreground">{formatDate(update.date)}</time>
              </div>
              <p className="text-sm">{update.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Function to get category label
const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'website': return 'Website';
    case 'e-commerce': return 'E-commerce';
    case 'mobile-app': return 'App Mobile';
    case 'desktop-app': return 'App Desktop';
    case 'automation': return 'Automação';
    case 'integration': return 'Integração';
    case 'ai-solution': return 'Solução IA';
    default: return 'Outro';
  }
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const project = mockProjects.find(p => p.id === id);
  
  if (!project) {
    return (
      <MainLayout className="max-w-5xl mx-auto">
        <div className="space-y-6 pb-10">
          <div className="flex items-center space-x-2">
            <Link to="/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para projetos
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Projeto não encontrado</h1>
            <p className="text-muted-foreground">
              O projeto que você está procurando não existe ou foi removido.
            </p>
            <Link to="/projects" className="mt-6 inline-block">
              <Button>Ver todos os projetos</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout className="max-w-5xl mx-auto">
      <div className="space-y-6 pb-10">
        <div className="flex items-center space-x-2">
          <Link to="/projects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para projetos
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <ProjectStatusBadge status={project.status} />
              <span className="text-sm text-muted-foreground">
                ID: {project.id}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar mensagem
            </Button>
            <Button variant="destructive" size="sm">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar projeto
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="timeline">Linha do tempo</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                      <p>{project.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Categoria</h3>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        <span>{getCategoryLabel(project.category)}</span>
                      </div>
                    </div>
                    
                    {project.budget && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Orçamento</h3>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-primary" />
                          <span>{project.budget}</span>
                        </div>
                      </div>
                    )}
                    
                    {project.timeline && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Prazo</h3>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          <span>{project.timeline}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de criação</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Última atualização</h3>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                    
                    {project.urgency && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Urgência</h3>
                        <Badge 
                          variant={
                            project.urgency === 'alta' ? 'destructive' : 
                            project.urgency === 'normal' ? 'outline' : 
                            'secondary'
                          }
                        >
                          {project.urgency.charAt(0).toUpperCase() + project.urgency.slice(1)}
                        </Badge>
                      </div>
                    )}
                    
                    {project.features && project.features.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Funcionalidades</h3>
                        <ul className="space-y-1">
                          {project.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <CheckSquare className="h-4 w-4 mr-2 text-primary mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 px-6 py-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Status atual: <span className="font-medium">{
                    project.status === 'pending' ? 'Pendente' :
                    project.status === 'under-review' ? 'Em Análise' :
                    project.status === 'approved' ? 'Aprovado' :
                    project.status === 'in-progress' ? 'Em Desenvolvimento' :
                    project.status === 'completed' ? 'Concluído' :
                    project.status === 'rejected' ? 'Rejeitado' : 'Desconhecido'
                  }</span></span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectTimeline statusUpdates={project.statusUpdates} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="files" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Arquivos do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                {project.attachments && project.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {project.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-primary" />
                          <span>{file}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum arquivo anexado a este projeto.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProjectDetails;

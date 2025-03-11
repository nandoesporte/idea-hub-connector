import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { ProjectIdea } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, CheckCircle, AlertCircle, PlayCircle, 
  RotateCcw, XCircle, Search, Filter 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

const mockAdminProjects: ProjectIdea[] = [
  {
    id: '1',
    title: 'Website para loja de roupas',
    description: 'Preciso de um site para minha loja de roupas com catálogo de produtos e formulário de contato.',
    category: 'website',
    budget: 'R$ 5.000 - R$ 8.000',
    timeline: '1 mês',
    features: ['Catálogo de produtos', 'Formulário de contato', 'Responsivo'],
    userId: 'user123',
    status: 'pending',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-18'),
    urgency: 'normal',
  },
  {
    id: '2',
    title: 'E-commerce completo para joalheria',
    description: 'E-commerce de joias com sistema de pagamento integrado, gestão de estoque e área de cliente.',
    category: 'e-commerce',
    budget: 'R$ 20.000 - R$ 30.000',
    timeline: '3 meses',
    features: ['Pagamento online', 'Gestão de estoque', 'Painel administrativo'],
    userId: 'user456',
    status: 'under-review',
    createdAt: new Date('2023-11-05'),
    updatedAt: new Date('2023-11-10'),
    urgency: 'alta',
  },
  {
    id: '3',
    title: 'Aplicativo para gerenciamento de tarefas',
    description: 'App mobile para gerenciamento de tarefas com notificações e sincronização entre dispositivos.',
    category: 'mobile-app',
    budget: 'R$ 12.000 - R$ 18.000',
    timeline: '2 meses',
    features: ['Login e perfil', 'Notificações', 'Sincronização em nuvem'],
    userId: 'user789',
    status: 'approved',
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2023-09-25'),
    urgency: 'baixa',
  },
  {
    id: '4',
    title: 'Sistema de gestão financeira',
    description: 'Sistema para controle financeiro pessoal com importação de extratos bancários e relatórios.',
    category: 'desktop-app',
    budget: 'R$ 8.000 - R$ 15.000',
    timeline: '2 meses',
    features: ['Importação de extratos', 'Gráficos e relatórios', 'Categorização automática'],
    userId: 'user123',
    status: 'in-progress',
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2023-08-15'),
    urgency: 'normal',
  },
  {
    id: '5',
    title: 'Automação de processos de RH',
    description: 'Sistema de automação para processos de RH, incluindo recrutamento e gestão de funcionários.',
    category: 'automation',
    budget: 'R$ 15.000 - R$ 25.000',
    timeline: '3 meses',
    features: ['Recrutamento automatizado', 'Gestão de ponto', 'Avaliação de desempenho'],
    userId: 'user456',
    status: 'completed',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-07-05'),
    urgency: 'normal',
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

const AdminProjectCard = ({ project, onUpdateStatus }: { 
  project: ProjectIdea; 
  onUpdateStatus: (id: string, status: ProjectIdea['status']) => void;
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const categoryLabels: Record<string, string> = {
    'website': 'Website',
    'e-commerce': 'E-commerce',
    'mobile-app': 'App Mobile',
    'desktop-app': 'App Desktop',
    'automation': 'Automação',
    'integration': 'Integração',
    'ai-solution': 'Solução IA',
    'other': 'Outro'
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <ProjectStatusIcon status={project.status} />
              <ProjectStatusBadge status={project.status} />
              <span className="text-xs text-gray-500">
                ID: {project.id} • Usuário: {project.userId}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            {categoryLabels[project.category] || 'Outro'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-gray-700 mb-3">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Detalhes:</p>
            <ul className="list-disc list-inside text-muted-foreground">
              {project.budget && <li>Orçamento: {project.budget}</li>}
              {project.timeline && <li>Prazo: {project.timeline}</li>}
              {project.urgency && <li>Urgência: {project.urgency.charAt(0).toUpperCase() + project.urgency.slice(1)}</li>}
            </ul>
          </div>
          <div>
            <p className="font-medium">Funcionalidades:</p>
            <ul className="list-disc list-inside text-muted-foreground">
              {project.features && project.features.map((feature, index) => (
                <li key={index} className="truncate">{feature}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          Criado em {formatDate(project.createdAt)} • Atualizado em {formatDate(project.updatedAt)}
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t pt-4">
        <div>
          <Select 
            defaultValue={project.status}
            onValueChange={(value) => {
              onUpdateStatus(project.id, value as ProjectIdea['status']);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Atualizar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="under-review">Em Análise</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="in-progress">Em Desenvolvimento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Detalhes</Button>
          <Button size="sm">Responder</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const AdminPanel = () => {
  const [projects, setProjects] = useState<ProjectIdea[]>(mockAdminProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: ProjectIdea['status']) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { ...project, status, updatedAt: new Date() } 
        : project
    ));
    
    toast.success(`Status do projeto atualizado para "${status}"`);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery.trim() === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.userId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout className="max-w-6xl mx-auto">
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie e responda às solicitações de projetos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Exportar CSV
            </Button>
            <Button size="sm">
              Novo Projeto
            </Button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, usuário ou ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              onValueChange={(value) => setSelectedStatus(value || null)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="under-review">Em Análise</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="in-progress">Em Desenvolvimento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({projects.length})</TabsTrigger>
            <TabsTrigger value="new">
              Novos ({projects.filter(p => p.status === 'pending' || p.status === 'under-review').length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({projects.filter(p => p.status === 'approved' || p.status === 'in-progress').length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Encerrados ({projects.filter(p => p.status === 'completed' || p.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <AdminProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum projeto encontrado com os filtros atuais.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            {filteredProjects.filter(p => p.status === 'pending' || p.status === 'under-review').length > 0 ? (
              filteredProjects
                .filter(p => p.status === 'pending' || p.status === 'under-review')
                .map(project => (
                  <AdminProjectCard 
                    key={project.id} 
                    project={project} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum projeto novo encontrado.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            {filteredProjects.filter(p => p.status === 'approved' || p.status === 'in-progress').length > 0 ? (
              filteredProjects
                .filter(p => p.status === 'approved' || p.status === 'in-progress')
                .map(project => (
                  <AdminProjectCard 
                    key={project.id} 
                    project={project} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum projeto ativo encontrado.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="closed" className="mt-6">
            {filteredProjects.filter(p => p.status === 'completed' || p.status === 'rejected').length > 0 ? (
              filteredProjects
                .filter(p => p.status === 'completed' || p.status === 'rejected')
                .map(project => (
                  <AdminProjectCard 
                    key={project.id} 
                    project={project} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum projeto encerrado encontrado.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminPanel;


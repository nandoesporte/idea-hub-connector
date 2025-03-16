import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectIdea, ProjectCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, CheckCircle, AlertCircle, PlayCircle, 
  RotateCcw, XCircle, Search, Filter, Edit, Trash,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const ProjectStatusIcon = ({ status }: { status: ProjectIdea['status'] }) => {
  switch (status) {
    case 'submitted':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'reviewing':
      return <RotateCcw className="h-5 w-5 text-blue-500" />;
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in_progress':
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
    'submitted': { label: 'Pendente', variant: 'warning' as const },
    'reviewing': { label: 'Em Análise', variant: 'info' as const },
    'approved': { label: 'Aprovado', variant: 'success' as const },
    'in_progress': { label: 'Em Desenvolvimento', variant: 'secondary' as const },
    'completed': { label: 'Concluído', variant: 'success' as const },
    'rejected': { label: 'Rejeitado', variant: 'destructive' as const },
    'pending': { label: 'Pendente', variant: 'warning' as const },
    'under-review': { label: 'Em Análise', variant: 'info' as const },
    'in-progress': { label: 'Em Desenvolvimento', variant: 'secondary' as const }
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
                ID: {project.id} • Cliente: {project.clientName || project.user_id}
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
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>Criado: {new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
            {project.updated_at && (
              <>
                <span>•</span>
                <span>Atualizado: {new Date(project.updated_at).toLocaleDateString('pt-BR')}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/admin/projects/${project.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            </Link>
            <Link to={`/project-details/${project.id}`}>
              <Button variant="secondary" size="sm">
                Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminProjects = () => {
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
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
      (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.user_id && project.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Projetos</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todos os projetos submetidos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, cliente ou ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="submitted">Pendente</SelectItem>
                <SelectItem value="reviewing">Em Análise</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="in_progress">Em Desenvolvimento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link to="/submit-idea" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Novo Projeto
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="all">Todos ({projects.length})</TabsTrigger>
            <TabsTrigger value="new">
              Novos ({projects.filter(p => p.status === 'submitted' || p.status === 'reviewing').length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Ativos ({projects.filter(p => p.status === 'approved' || p.status === 'in_progress').length})
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Não há projetos cadastrados ou correspondentes aos filtros atuais.
                  </p>
                  <Link to="/submit-idea">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Criar novo projeto
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            {filteredProjects.filter(p => p.status === 'submitted' || p.status === 'reviewing').length > 0 ? (
              filteredProjects
                .filter(p => p.status === 'submitted' || p.status === 'reviewing')
                .map(project => (
                  <AdminProjectCard 
                    key={project.id} 
                    project={project} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum projeto novo</h3>
                  <p className="text-muted-foreground text-center">
                    Não há projetos pendentes ou em análise no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            {filteredProjects.filter(p => p.status === 'approved' || p.status === 'in_progress').length > 0 ? (
              filteredProjects
                .filter(p => p.status === 'approved' || p.status === 'in_progress')
                .map(project => (
                  <AdminProjectCard 
                    key={project.id} 
                    project={project} 
                    onUpdateStatus={handleUpdateStatus} 
                  />
                ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <PlayCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum projeto ativo</h3>
                  <p className="text-muted-foreground text-center">
                    Não há projetos aprovados ou em desenvolvimento no momento.
                  </p>
                </CardContent>
              </Card>
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum projeto encerrado</h3>
                  <p className="text-muted-foreground text-center">
                    Não há projetos concluídos ou rejeitados no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;

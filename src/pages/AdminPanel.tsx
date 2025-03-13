
import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Briefcase, MessageSquare, FileText, 
  TrendingUp, ArrowUpRight, Zap, BarChart3, Clock, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FeatureCard from '@/components/FeatureCard';
import { ProjectIdea } from '@/types';
import { Link } from 'react-router-dom';
import AdminAgenda from '@/components/AdminAgenda';

// Sample data for analytics
const analyticsData = {
  totalUsers: 583,
  totalProjects: 127,
  pendingProjects: 15,
  completedProjects: 78,
  inProgressProjects: 34,
  messagesCount: 42,
  unreadMessagesCount: 8,
  portfolioItemsCount: 22,
  weeklyProjectsIncrease: 24,
  revenueIncrease: 18
};

// Sample data for recent projects
const recentProjects: ProjectIdea[] = [
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
    status: 'in-progress',
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2023-09-25'),
    urgency: 'baixa',
  },
];

const statusColors = {
  'pending': 'bg-yellow-500/10 text-yellow-500',
  'under-review': 'bg-blue-500/10 text-blue-500',
  'approved': 'bg-green-500/10 text-green-500',
  'in-progress': 'bg-indigo-500/10 text-indigo-500',
  'completed': 'bg-green-600/10 text-green-600',
  'rejected': 'bg-red-500/10 text-red-500',
};

const getStatusLabel = (status: ProjectIdea['status']) => {
  const statusMap = {
    'pending': 'Pendente',
    'under-review': 'Em Análise',
    'approved': 'Aprovado',
    'in-progress': 'Em Desenvolvimento',
    'completed': 'Concluído',
    'rejected': 'Rejeitado'
  };
  
  return statusMap[status] || 'Desconhecido';
};

const AdminPanel = () => {
  return (
    <AdminLayout
      title="Painel Administrativo"
      description="Visão geral do sistema e atalhos importantes."
    >
      <div className="space-y-6 pb-10">
        {/* Admin Agenda - New component */}
        <AdminAgenda />
        
        {/* Analytics summary cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-green-500 flex items-center mr-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12%
                </span>
                desde o mês passado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalProjects}</div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 text-xs">
                  {analyticsData.pendingProjects} Pendentes
                </Badge>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 text-xs">
                  {analyticsData.inProgressProjects} Em Progresso
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.messagesCount}</div>
              {analyticsData.unreadMessagesCount > 0 && (
                <Badge className="mt-1 text-xs bg-primary/20 text-primary hover:bg-primary/30">
                  {analyticsData.unreadMessagesCount} não lidas
                </Badge>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.portfolioItemsCount}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="text-green-500 flex items-center mr-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> +{analyticsData.weeklyProjectsIncrease}%
                </span>
                Crescimento semanal
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick access cards */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <FeatureCard
            title="Gerenciar Usuários"
            description="Adicione, edite ou remova usuários do sistema."
            icon={<Users size={24} />}
            className="hover:border-blue-400"
            iconClassName="bg-blue-500/10 text-blue-500"
          />
          <FeatureCard
            title="Projetos Recentes"
            description="Veja e gerencie os últimos projetos submetidos."
            icon={<Briefcase size={24} />}
            className="hover:border-indigo-400"
            iconClassName="bg-indigo-500/10 text-indigo-500"
          />
          <FeatureCard
            title="Mensagens"
            description="Responda às mensagens dos clientes e usuários."
            icon={<MessageSquare size={24} />}
            className="hover:border-violet-400"
            iconClassName="bg-violet-500/10 text-violet-500"
          />
          <FeatureCard
            title="Portfólio"
            description="Gerencie projetos no portfólio da empresa."
            icon={<FileText size={24} />}
            className="hover:border-emerald-400"
            iconClassName="bg-emerald-500/10 text-emerald-500"
          />
          <FeatureCard
            title="Relatórios"
            description="Visualize e exporte relatórios de performance."
            icon={<BarChart3 size={24} />}
            className="hover:border-amber-400"
            iconClassName="bg-amber-500/10 text-amber-500"
          />
          <FeatureCard
            title="Configurações"
            description="Configure preferências e ajustes do sistema."
            icon={<Zap size={24} />}
            className="hover:border-pink-400"
            iconClassName="bg-pink-500/10 text-pink-500"
          />
        </div>
        
        {/* Recent projects */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>Últimos projetos submetidos no sistema</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="https://idea-hub-connector.lovable.app/projects">
                  Ver todos
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map(project => (
                <div key={project.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={statusColors[project.status]}
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Categoria: {project.category}</span>
                      <span>•</span>
                      <span>Orçamento: {project.budget}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/projects/${project.id}`}>
                      Detalhes
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>{analyticsData.pendingProjects} projetos pendentes aguardam análise</span>
            </div>
            <Button size="sm" asChild>
              <Link to="https://idea-hub-connector.lovable.app/projects?status=pending">
                Revisar pendentes
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;

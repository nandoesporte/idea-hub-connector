
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  Plus, 
  Settings,
  Check,
  X
} from 'lucide-react';

// Mock project data
const mockProjects = [
  {
    id: '1',
    title: 'Site para minha loja de roupas',
    category: 'website',
    status: 'under-review',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-09-16'),
  },
  {
    id: '2',
    title: 'Aplicativo de delivery para restaurante',
    category: 'mobile-app',
    status: 'approved',
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2023-09-01'),
  },
  {
    id: '3',
    title: 'Sistema de agendamento para clínica',
    category: 'desktop-app',
    status: 'in-progress',
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2023-09-10'),
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'under-review':
        return { label: 'Em Análise', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'approved':
        return { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'in-progress':
        return { label: 'Em Desenvolvimento', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'completed':
        return { label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'rejected':
        return { label: 'Rejeitado', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const { label, color } = getStatusDetails();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

// Category badge component
const CategoryBadge = ({ category }: { category: string }) => {
  const getCategoryDetails = () => {
    switch (category) {
      case 'website':
        return { label: 'Website', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'e-commerce':
        return { label: 'E-commerce', color: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'mobile-app':
        return { label: 'App Móvel', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'desktop-app':
        return { label: 'App Desktop', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'automation':
        return { label: 'Automação', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'integration':
        return { label: 'Integração', color: 'bg-violet-100 text-violet-800 border-violet-200' };
      case 'ai-solution':
        return { label: 'Solução IA', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: 'Outro', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const { label, color } = getCategoryDetails();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
};

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Meus Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe seus projetos em um só lugar
            </p>
          </div>
          
          <Link to="/submit-idea">
            <Button className="w-full sm:w-auto shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Projetos Recentes</h2>
              </div>
              
              <div className="divide-y">
                {mockProjects.length > 0 ? (
                  mockProjects.map((project) => (
                    <div key={project.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium">{project.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <CategoryBadge category={project.category} />
                            <StatusBadge status={project.status} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Mensagens
                          </Button>
                          <Button variant="ghost" size="sm">
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">Você ainda não possui projetos.</p>
                    <Link to="/submit-idea" className="mt-2 inline-block text-primary hover:underline">
                      Envie sua primeira ideia
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Status</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Projetos Ativos</span>
                  <span className="font-medium">3</span>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Em análise</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Aprovados</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Em desenvolvimento</span>
                    <span className="text-xs text-muted-foreground">1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Próximos passos</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-yellow-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reunião de alinhamento</p>
                    <p className="text-xs text-muted-foreground">20 de setembro, 15:00</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aprovação do layout</p>
                    <p className="text-xs text-muted-foreground">25 de setembro, 10:00</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-3.5 w-3.5 text-blue-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Início do desenvolvimento</p>
                    <p className="text-xs text-muted-foreground">01 de outubro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

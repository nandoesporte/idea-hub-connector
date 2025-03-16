
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { ProjectIdea } from '@/types';

const statusColors = {
  'open': 'bg-green-500/10 text-green-500',
  'in_progress': 'bg-blue-500/10 text-blue-500',
  'completed': 'bg-green-600/10 text-green-600',
  'on hold': 'bg-yellow-500/10 text-yellow-500',
  'pending': 'bg-gray-500/10 text-gray-500',
  'under-review': 'bg-purple-500/10 text-purple-500',
  'approved': 'bg-green-700/10 text-green-700',
  'in-progress': 'bg-blue-600/10 text-blue-600',
  'rejected': 'bg-red-500/10 text-red-500',
};

const projects: ProjectIdea[] = [
  {
    id: '1',
    title: 'Website Corporativo',
    description: 'Um website moderno e responsivo para a empresa ABC Inc.',
    category: 'website',
    status: 'approved',
    priority: 'high',
    user_id: 'user123',
    created_at: new Date('2023-05-15'),
    updated_at: new Date('2023-05-15'),
    budget: 'R$ 8.000 - R$ 12.000',
    timeline: '30 dias',
    urgency: 'média'
  },
  {
    id: '2',
    title: 'E-commerce de Moda',
    description: 'Loja virtual completa para venda de roupas e acessórios.',
    category: 'e-commerce',
    status: 'in_progress',
    priority: 'medium',
    user_id: 'user456',
    created_at: new Date('2023-06-01'),
    updated_at: new Date('2023-06-01'),
    budget: 'R$ 15.000 - R$ 20.000',
    timeline: '45 dias',
    urgency: 'alta'
  },
  {
    id: '3',
    title: 'Aplicativo de Delivery',
    description: 'Aplicativo mobile para entrega de comida com geolocalização e sistema de avaliação.',
    category: 'mobile-app',
    status: 'completed',
    priority: 'high',
    user_id: 'user789',
    created_at: new Date('2023-04-22'),
    updated_at: new Date('2023-04-22'),
    budget: 'R$ 25.000 - R$ 30.000',
    timeline: '60 dias',
    urgency: 'média'
  },
];

const ProjectTracking = () => {
  return (
    <MainLayout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Acompanhamento de Projetos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge className={statusColors[project.status]}>{project.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prioridade:</span>
                    <span>{project.priority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Orçamento:</span>
                    <span>{project.budget}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prazo:</span>
                    <span>{project.timeline}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectTracking;

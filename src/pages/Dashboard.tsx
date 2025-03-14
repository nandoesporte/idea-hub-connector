import React from 'react';
import VoiceCommandsSection from '@/components/VoiceCommandsSection';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, FileText, Lightbulb, ListChecks, Plus } from 'lucide-react';
import EventsList from '@/components/EventsList';
import { useVoiceCommandEvents } from '@/hooks/useVoiceCommandEvents';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { events, loading } = useVoiceCommandEvents();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/project-ideas/new')}>
          <Plus className="mr-2 h-4 w-4" /> Nova Ideia
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VoiceCommandsSection />
        
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.user_metadata?.name || 'Usuário'}</CardTitle>
            <CardDescription>
              Gerencie seus projetos e ideias em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="events">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="events">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Eventos</span>
                </TabsTrigger>
                <TabsTrigger value="ideas">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ideias</span>
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <ListChecks className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Tarefas</span>
                </TabsTrigger>
                <TabsTrigger value="docs">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="events">
                <EventsList events={events} loading={loading} />
              </TabsContent>
              
              <TabsContent value="ideas">
                <p className="text-sm text-muted-foreground">
                  Suas ideias de projeto aparecerão aqui.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/project-ideas/new')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Ideia
                </Button>
              </TabsContent>
              
              <TabsContent value="tasks">
                <p className="text-sm text-muted-foreground">
                  Suas tarefas aparecerão aqui.
                </p>
              </TabsContent>
              
              <TabsContent value="docs">
                <p className="text-sm text-muted-foreground">
                  Seus documentos aparecerão aqui.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

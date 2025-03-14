import React, { useEffect } from 'react';
import VoiceCommandsSection from '@/components/VoiceCommandsSection';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, FileText, Lightbulb, ListChecks, Plus, User, LayoutDashboard, Shield } from 'lucide-react';
import EventsList from '@/components/EventsList';
import { useVoiceCommandEvents } from '@/hooks/useVoiceCommandEvents';
import { isWhatsAppConfigured } from '@/lib/whatsgwService';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { events, loading, deleteEvent, checkApiConnection } = useVoiceCommandEvents();
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    // Check API connection when component mounts, but don't show success toast
    if (isWhatsAppConfigured()) {
      checkApiConnection(false);
    }
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie seus eventos, ideias e tarefas
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            onClick={() => navigate('/project-ideas/new')}
            className="gap-1.5 shadow-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" /> Nova Ideia
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={() => navigate('/admin')}
              className="gap-1.5 shadow-sm"
              size="sm"
              variant="outline"
            >
              <Shield className="h-4 w-4 text-primary" /> Admin
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <VoiceCommandsSection />
          
          <Card className="mt-6 shadow-sm border-none bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/80 dark:bg-black/20 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Bem-vindo, {user?.user_metadata?.name || 'Usuário'}</CardTitle>
                  <CardDescription className="text-xs">
                    Gerencie seus projetos facilmente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        <Card className="lg:col-span-3 shadow-sm border-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Agenda</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 bg-muted/30 p-1">
                <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Eventos</span>
                </TabsTrigger>
                <TabsTrigger value="ideas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ideias</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <ListChecks className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Tarefas</span>
                </TabsTrigger>
                <TabsTrigger value="docs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="events" className="mt-0">
                <EventsList events={events} loading={loading} onDelete={deleteEvent} />
              </TabsContent>
              
              <TabsContent value="ideas" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted/30 rounded-full p-6 mb-4">
                    <Lightbulb className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Sem ideias registradas</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    Suas ideias de projeto aparecerão aqui.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/project-ideas/new')}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Adicionar Ideia
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted/30 rounded-full p-6 mb-4">
                    <ListChecks className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Sem tarefas registradas</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Suas tarefas aparecerão aqui quando forem criadas.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="docs" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted/30 rounded-full p-6 mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Sem documentos</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Seus documentos aparecerão aqui quando forem adicionados.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

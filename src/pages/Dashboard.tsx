
import React, { useEffect } from 'react';
import VoiceCommandsSection from '@/components/VoiceCommandsSection';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, FileText, Lightbulb, ListChecks, Plus, User, LayoutDashboard, 
  Shield, FileCheck, Calendar, FileSpreadsheet 
} from 'lucide-react';
import EventsList from '@/components/EventsList';
import { useVoiceCommandEvents } from '@/hooks/useVoiceCommandEvents';
import { isWhatsAppConfigured } from '@/lib/whatsgwService';
import PolicyTab from '@/components/PolicyTab';

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
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pb-2 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Gerencie seus eventos, ideias e tarefas
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1 md:mt-0">
          <Button 
            onClick={() => navigate('/project-ideas/new')}
            className="gap-1.5 shadow-sm text-xs md:text-sm h-8 md:h-9"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> Nova Ideia
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={() => navigate('/admin')}
              className="gap-1.5 shadow-sm text-xs md:text-sm h-8 md:h-9"
              size="sm"
              variant="outline"
            >
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> Admin
            </Button>
          )}
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VoiceCommandsSection />
          
          <Card className="shadow-sm border-none bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/80 dark:bg-black/20 p-1.5 md:p-2 rounded-full">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm md:text-base">Bem-vindo, {user?.user_metadata?.name || 'Usuário'}</CardTitle>
                  <CardDescription className="text-xs">
                    Gerencie seus projetos facilmente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        {/* Agenda Card */}
        <Card className="lg:col-span-3 shadow-sm border-none">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base md:text-lg">Agenda</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-4">
            <Tabs defaultValue="events" className="w-full">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <TabsList className="bg-transparent h-auto p-0 md:w-56 flex flex-row md:flex-col overflow-x-auto scrollbar-none mb-2 md:mb-0 border-b md:border-b-0 md:border-r mx-4 md:mx-0 pb-2 md:pb-0 md:pr-4">
                  <TabsTrigger 
                    value="events" 
                    className="flex items-center gap-2 justify-start w-auto md:w-full p-2 text-left data-[state=active]:bg-muted whitespace-nowrap"
                  >
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-xs md:text-sm">Eventos</span>
                  </TabsTrigger>
                  
                  {isAdmin && (
                    <TabsTrigger 
                      value="policies" 
                      className="flex items-center gap-2 justify-start w-auto md:w-full p-2 text-left data-[state=active]:bg-muted whitespace-nowrap"
                    >
                      <FileCheck className="h-4 w-4 text-primary" />
                      <span className="text-xs md:text-sm">Apólices</span>
                    </TabsTrigger>
                  )}
                  
                  {!isAdmin && (
                    <TabsTrigger 
                      value="ideas" 
                      className="flex items-center gap-2 justify-start w-auto md:w-full p-2 text-left data-[state=active]:bg-muted whitespace-nowrap"
                    >
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-xs md:text-sm">Ideias</span>
                    </TabsTrigger>
                  )}
                  
                  <TabsTrigger 
                    value="tasks" 
                    className="flex items-center gap-2 justify-start w-auto md:w-full p-2 text-left data-[state=active]:bg-muted whitespace-nowrap"
                  >
                    <ListChecks className="h-4 w-4 text-primary" />
                    <span className="text-xs md:text-sm">Tarefas</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="docs" 
                    className="flex items-center gap-2 justify-start w-auto md:w-full p-2 text-left data-[state=active]:bg-muted whitespace-nowrap"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs md:text-sm">Docs</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 px-4 md:px-0 md:border-l-0 md:pl-0">
                  <TabsContent value="events" className="mt-0">
                    <EventsList events={events} loading={loading} onDelete={deleteEvent} />
                  </TabsContent>
                  
                  <TabsContent value="ideas" className="mt-0">
                    <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center">
                      <div className="bg-muted/30 rounded-full p-4 md:p-6 mb-4">
                        <Lightbulb className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-base md:text-lg mb-2">Sem ideias registradas</h3>
                      <p className="text-xs md:text-sm text-muted-foreground max-w-xs mb-4 md:mb-6">
                        Suas ideias de projeto aparecerão aqui.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/project-ideas/new')}
                        className="gap-1.5 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar Ideia
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="policies" className="mt-0">
                    <PolicyTab />
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="mt-0">
                    <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center">
                      <div className="bg-muted/30 rounded-full p-4 md:p-6 mb-4">
                        <ListChecks className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-base md:text-lg mb-2">Sem tarefas registradas</h3>
                      <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
                        Suas tarefas aparecerão aqui quando forem criadas.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="docs" className="mt-0">
                    <div className="flex flex-col items-center justify-center py-6 md:py-10 text-center">
                      <div className="bg-muted/30 rounded-full p-4 md:p-6 mb-4">
                        <FileText className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-base md:text-lg mb-2">Sem documentos</h3>
                      <p className="text-xs md:text-sm text-muted-foreground max-w-xs">
                        Seus documentos aparecerão aqui quando forem adicionados.
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

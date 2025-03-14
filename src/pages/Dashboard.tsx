
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { Link } from 'react-router-dom';
import { CalendarPlus, Plus, Shield } from 'lucide-react';
import AdminAgenda from '@/components/AdminAgenda';

const Dashboard = () => {
  const { user } = useUser();
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <div className="container mx-auto py-6 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {user?.user_metadata?.name || 'usuário'}
            {isAdmin && <Shield className="inline-block ml-2 text-primary h-5 w-5" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/submit-idea">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ideia
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/projects">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Meus Projetos
            </Link>
          </Button>
        </div>
      </div>

      {/* Admin Agenda - Only visible for admins */}
      {isAdmin && (
        <div className="mb-6">
          <AdminAgenda />
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Projetos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +2 desde o último mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ativo</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sua conta está em dia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground mt-1">
                  4 novas desde sua última visita
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Veja suas últimas interações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Ideia de projeto enviada</p>
                    <p className="text-sm text-muted-foreground">
                      Seu projeto "Aplicativo de Entrega" foi enviado para análise
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Há 2 dias
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Atualização de status</p>
                    <p className="text-sm text-muted-foreground">
                      O projeto "Website Corporativo" foi aprovado!
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Há 5 dias
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Perfil atualizado</p>
                    <p className="text-sm text-muted-foreground">
                      Você atualizou suas informações de perfil
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Há 1 semana
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Projetos</CardTitle>
              <CardDescription>
                Veja o status de todos os seus projetos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Aplicativo de Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      Em análise
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/projects/1">Ver Detalhes</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Website Corporativo</p>
                    <p className="text-sm text-muted-foreground">
                      Aprovado
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/projects/2">Ver Detalhes</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">E-commerce</p>
                    <p className="text-sm text-muted-foreground">
                      Em desenvolvimento
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/projects/3">Ver Detalhes</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projetos Sugeridos</CardTitle>
              <CardDescription>
                Baseado no seu perfil e histórico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Aplicativo Mobile</p>
                    <p className="text-sm text-muted-foreground">
                      Uma solução completa para sua empresa
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/submit-idea">Solicitar</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <div className="grid gap-2">
                  <h3 className="font-semibold">Nome</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.user_metadata?.name || 'Não configurado'}
                  </p>
                </div>
                <div className="grid gap-2">
                  <h3 className="font-semibold">Conta criada em</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Indisponível'}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline">Editar Perfil</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

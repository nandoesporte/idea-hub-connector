
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, FileText, Heart, Home, Shield, Briefcase, Hospital, ArrowRight, Phone, Mail } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/layouts/MainLayout';

const UserDashboard = () => {
  const { user } = useUser();
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for recent quotes - in a real app, this would come from Supabase
  useEffect(() => {
    const fetchRecentQuotes = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch real data from Supabase
        // const { data, error } = await supabase
        //   .from('quotes')
        //   .select('*')
        //   .eq('user_id', user?.id)
        //   .order('created_at', { ascending: false })
        //   .limit(3);
        
        // if (error) throw error;
        // setRecentQuotes(data || []);

        // For now, use mock data
        setRecentQuotes([
          {
            id: '1',
            insurance_type: 'life',
            status: 'pending',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            quote_amount: 'R$ 120,00/mês'
          },
          {
            id: '2',
            insurance_type: 'home',
            status: 'approved',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
            quote_amount: 'R$ 89,90/mês'
          }
        ]);
      } catch (error) {
        console.error('Error fetching quotes:', error);
        toast.error('Não foi possível carregar suas cotações recentes');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecentQuotes();
    }
  }, [user]);

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'life':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'home':
        return <Home className="h-5 w-5 text-blue-500" />;
      case 'business':
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      case 'health':
        return <Hospital className="h-5 w-5 text-green-500" />;
      default:
        return <Shield className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">Recusada</Badge>;
      default:
        return <Badge variant="outline">Desconhecida</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <MainLayout className="max-w-6xl mx-auto">
      <div className="space-y-8 py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.user_metadata?.name?.split(' ')[0] || 'Cliente'}!
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas apólices, cotações e informações de seguro em um só lugar.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Insurance Options */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Seguros Disponíveis</CardTitle>
              <CardDescription>Escolha o tipo de seguro que deseja cotar</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pb-6">
              <Link to="/submit-idea" className="group">
                <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-primary/5">
                  <Heart className="h-10 w-10 text-pink-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-medium text-center">Seguro de Vida</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">Proteção financeira para você e sua família</p>
                </div>
              </Link>
              
              <Link to="/submit-idea" className="group">
                <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-primary/5">
                  <Home className="h-10 w-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-medium text-center">Seguro Residencial</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">Proteção completa para seu lar</p>
                </div>
              </Link>
              
              <Link to="/submit-idea" className="group">
                <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-primary/5">
                  <Briefcase className="h-10 w-10 text-purple-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-medium text-center">Seguro Empresarial</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">Soluções para proteger seu negócio</p>
                </div>
              </Link>
              
              <Link to="/submit-idea" className="group">
                <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-primary/5">
                  <Hospital className="h-10 w-10 text-green-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-medium text-center">Seguro Saúde</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">Cuidados médicos para você e sua família</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>O que você precisa hoje?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <Link to="/submit-idea">
                <Button className="w-full justify-start shadow-sm hover:shadow-md transition-all duration-300" size="lg">
                  <Shield className="mr-2 h-5 w-5" /> Solicitar Nova Cotação
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" className="w-full justify-start hover:bg-primary/5 transition-all duration-300" size="lg">
                  <Clock className="mr-2 h-5 w-5" /> Ver Minhas Cotações
                </Button>
              </Link>
              <a href="tel:+5511999999999">
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-all duration-300" size="lg">
                  <Phone className="mr-2 h-5 w-5" /> Contato Telefônico
                </Button>
              </a>
              <a href="mailto:contato@idealhub.com.br">
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/5 transition-all duration-300" size="lg">
                  <Mail className="mr-2 h-5 w-5" /> Enviar E-mail
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Cotações Recentes</CardTitle>
                <CardDescription>Acompanhe o status das suas solicitações</CardDescription>
              </div>
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary/5">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 py-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-primary/10 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                      <div className="h-3 bg-primary/5 rounded w-1/2"></div>
                    </div>
                    <div className="w-20 h-6 bg-primary/10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentQuotes.length > 0 ? (
              <div className="space-y-4 divide-y divide-border">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-start justify-between pt-4 first:pt-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {getInsuranceIcon(quote.insurance_type)}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Seguro {quote.insurance_type === 'life' ? 'de Vida' : 
                                 quote.insurance_type === 'home' ? 'Residencial' : 
                                 quote.insurance_type === 'business' ? 'Empresarial' : 
                                 quote.insurance_type === 'health' ? 'de Saúde' : 'Personalizado'}
                        </h4>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Cotação #{quote.id}</span>
                          <span>{formatDate(quote.created_at)}</span>
                        </div>
                        {quote.quote_amount && (
                          <p className="text-sm font-medium text-primary mt-1">{quote.quote_amount}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(quote.status)}
                      <Link to={`/projects/${quote.id}`} className="text-xs text-primary hover:underline">
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-medium text-lg mb-2">Sem cotações recentes</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Você ainda não tem cotações de seguro. Solicite uma nova cotação para começar.
                </p>
                <Link to="/submit-idea">
                  <Button className="shadow-sm">Solicitar Cotação</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;

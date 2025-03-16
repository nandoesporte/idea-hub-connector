import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Clock, FileText, Heart, Home, Shield, Briefcase, Hospital, 
  ArrowRight, Phone, Mail, Cpu, Code, Database, ServerCog, BrainCircuit, 
  SendIcon, LayoutDashboard
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { getDashboardConfig } from '@/lib/dashboardService';
import { DashboardComponent, DashboardItem } from '@/types/dashboard';

const UserDashboard = () => {
  const { user } = useUser();
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardComponent[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = getDashboardConfig();
        setDashboardConfig(config.components.filter(comp => comp.enabled).sort((a, b) => a.order - b.order));
        
        setRecentQuotes([
          {
            id: '1',
            insurance_type: 'life',
            status: 'pending',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            quote_amount: 'R$ 120,00/mês'
          },
          {
            id: '2',
            insurance_type: 'home',
            status: 'approved',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            quote_amount: 'R$ 89,90/mês'
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Não foi possível carregar seus dados');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const renderIcon = (iconName: string | undefined, colorClass: string = 'text-primary', size: number = 10) => {
    if (!iconName) return <LayoutDashboard className={`h-${size} w-${size} ${colorClass}`} />;
    
    const icons: Record<string, React.ReactNode> = {
      Heart: <Heart className={`h-${size} w-${size} ${colorClass}`} />,
      Home: <Home className={`h-${size} w-${size} ${colorClass}`} />,
      Briefcase: <Briefcase className={`h-${size} w-${size} ${colorClass}`} />,
      Hospital: <Hospital className={`h-${size} w-${size} ${colorClass}`} />,
      Shield: <Shield className={`h-${size} w-${size} ${colorClass}`} />,
      Clock: <Clock className={`h-${size} w-${size} ${colorClass}`} />,
      Phone: <Phone className={`h-${size} w-${size} ${colorClass}`} />,
      Mail: <Mail className={`h-${size} w-${size} ${colorClass}`} />,
      Cpu: <Cpu className={`h-${size} w-${size} ${colorClass}`} />,
      Code: <Code className={`h-${size} w-${size} ${colorClass}`} />,
      Database: <Database className={`h-${size} w-${size} ${colorClass}`} />,
      BrainCircuit: <BrainCircuit className={`h-${size} w-${size} ${colorClass}`} />,
      SendIcon: <SendIcon className={`h-${size} w-${size} ${colorClass}`} />,
      FileText: <FileText className={`h-${size} w-${size} ${colorClass}`} />,
      CheckCircle: <CheckCircle className={`h-${size} w-${size} ${colorClass}`} />
    };
    
    return icons[iconName] || <LayoutDashboard className={`h-${size} w-${size} ${colorClass}`} />;
  };

  const getComponentSize = (size?: string) => {
    switch (size) {
      case 'small': return 'md:col-span-1';
      case 'medium': return 'md:col-span-1';
      case 'large': return 'md:col-span-2';
      case 'full': return 'md:col-span-3';
      default: return 'md:col-span-1';
    }
  };

  const renderTechSolutionsComponent = (component: DashboardComponent) => {
    if (!component.items || component.items.length === 0) return null;
    
    const enabledItems = component.items.filter(item => item.enabled);
    if (enabledItems.length === 0) return null;
    
    return (
      <Card className={`shadow-sm ${getComponentSize(component.size)}`}>
        <CardHeader className="pb-3">
          <CardTitle>{component.title}</CardTitle>
          <CardDescription>{component.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pb-6">
          {enabledItems.map((item) => (
            <Link to={item.link} key={item.id} className="group">
              <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-blue-500/5">
                {renderIcon(item.icon, `text-${item.color || 'blue'}-500`, 10)}
                <h3 className="font-medium text-center mt-3">{item.title}</h3>
                <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
            </Link>
          ))}
          
          <div className="col-span-2 flex justify-center mt-4">
            <Link to="/submit-idea">
              <Button className="shadow-sm hover:shadow-md transition-all duration-300">
                <SendIcon className="h-4 w-4 mr-2" /> Enviar Ideia
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderInsuranceComponent = (component: DashboardComponent) => {
    if (!component.items || component.items.length === 0) return null;
    
    const enabledItems = component.items.filter(item => item.enabled);
    if (enabledItems.length === 0) return null;
    
    return (
      <Card className={`shadow-sm ${getComponentSize(component.size)}`}>
        <CardHeader className="pb-3">
          <CardTitle>{component.title}</CardTitle>
          <CardDescription>{component.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pb-6">
          {enabledItems.map((item) => (
            <Link to={item.link} key={item.id} className="group">
              <div className="flex flex-col items-center p-5 rounded-lg border border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-transparent to-primary/5">
                {renderIcon(item.icon, `text-${item.color || 'blue'}-500`, 10)}
                <h3 className="font-medium text-center mt-3">{item.title}</h3>
                <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    );
  };
  
  const renderActionsComponent = (component: DashboardComponent) => {
    if (!component.items || component.items.length === 0) return null;
    
    const enabledItems = component.items.filter(item => item.enabled);
    if (enabledItems.length === 0) return null;
    
    return (
      <Card className={`shadow-sm ${getComponentSize(component.size)}`}>
        <CardHeader className="pb-3">
          <CardTitle>{component.title}</CardTitle>
          <CardDescription>{component.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          {enabledItems.map((item) => {
            const isExternalLink = item.link.startsWith('http') || 
                                  item.link.startsWith('tel:') || 
                                  item.link.startsWith('mailto:');
            
            if (isExternalLink) {
              return (
                <a href={item.link} key={item.id}>
                  <Button 
                    className="w-full justify-start shadow-sm hover:shadow-md transition-all duration-300" 
                    size="lg"
                    variant={item.color === 'primary' ? 'default' : 
                            item.color === 'secondary' ? 'outline' : 'ghost'}
                  >
                    {renderIcon(item.icon, undefined, 5)}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                </a>
              );
            }
            
            return (
              <Link to={item.link} key={item.id}>
                <Button 
                  className="w-full justify-start shadow-sm hover:shadow-md transition-all duration-300" 
                  size="lg"
                  variant={item.color === 'primary' ? 'default' : 
                          item.color === 'secondary' ? 'outline' : 'ghost'}
                >
                  {renderIcon(item.icon, undefined, 5)}
                  <span className="ml-2">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderQuotesComponent = (component: DashboardComponent) => {
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
      <Card className={`shadow-sm ${getComponentSize(component.size)}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{component.title}</CardTitle>
              <CardDescription>{component.description}</CardDescription>
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
    );
  };

  const renderComponent = (component: DashboardComponent) => {
    switch (component.type) {
      case 'tech':
        return renderTechSolutionsComponent(component);
      case 'insurance':
        return renderInsuranceComponent(component);
      case 'action':
        return renderActionsComponent(component);
      case 'quote':
        return renderQuotesComponent(component);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {user?.user_metadata?.name?.split(' ')[0] || 'Cliente'}!
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas apólices, cotações e informações de seguro em um só lugar.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="h-6 bg-primary/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-primary/5 rounded w-1/2 mt-2 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-24 bg-primary/5 rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardConfig.map((component) => (
            <React.Fragment key={component.id}>
              {renderComponent(component)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

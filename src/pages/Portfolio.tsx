
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/layouts/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortfolioItem, ProjectCategory } from '@/types';
import { getPortfolioItems } from '@/lib/portfolioService';

const PortfolioCard = ({ portfolioCase }: { portfolioCase: PortfolioItem }) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  };

  const categoryLabels: Record<string, string> = {
    'website': 'Website',
    'e-commerce': 'E-commerce',
    'mobile-app': 'App Mobile',
    'desktop-app': 'App Desktop',
    'automation': 'Automação',
    'integration': 'Integração',
    'ai-solution': 'Solução IA',
    'web-app': 'Aplicação Web',
    'other': 'Outro'
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img 
          src={portfolioCase.featuredImage || '/placeholder.svg'} 
          alt={portfolioCase.title} 
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{portfolioCase.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5">
            {categoryLabels[portfolioCase.category as string] || 'Outro'}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(portfolioCase.completed)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">{portfolioCase.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {portfolioCase.technologies.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link to={`/portfolio/${portfolioCase.id}`} className="w-full">
          <Button variant="outline" className="w-full justify-between">
            <span>Ver detalhes</span>
            {portfolioCase.link && (
              <ExternalLink className="h-4 w-4 ml-2" />
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const Portfolio = () => {
  const { data: portfolioItems = [], isLoading, error } = useQuery({
    queryKey: ['portfolioItems'],
    queryFn: getPortfolioItems
  });

  return (
    <MainLayout className="max-w-6xl mx-auto">
      <div className="space-y-8 pb-10">
        <div className="space-y-2 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossos Cases de Sucesso</h1>
          <p className="text-muted-foreground">
            Conheça alguns dos projetos que desenvolvemos e o impacto que causaram para nossos clientes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-destructive">Erro ao carregar projetos. Tente novamente mais tarde.</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="website">Websites</TabsTrigger>
                  <TabsTrigger value="e-commerce">E-commerce</TabsTrigger>
                  <TabsTrigger value="mobile-app">Apps</TabsTrigger>
                  <TabsTrigger value="web-app">Web Apps</TabsTrigger>
                  <TabsTrigger value="integration">Integração</TabsTrigger>
                  <TabsTrigger value="ai-solution">IA</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioItems.length > 0 ? (
                    portfolioItems.map(item => (
                      <PortfolioCard key={item.id} portfolioCase={item} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">Nenhum projeto cadastrado.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {['website', 'e-commerce', 'mobile-app', 'web-app', 'integration', 'ai-solution'].map((category) => (
                <TabsContent key={category} value={category} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <PortfolioCard key={item.id} portfolioCase={item} />
                      ))}
                  </div>
                  {portfolioItems.filter(item => item.category === category).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhum projeto nesta categoria.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="text-center mt-10">
              <h2 className="text-2xl font-bold mb-4">Vamos transformar sua ideia em realidade?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Nosso time de experts está pronto para criar uma solução sob medida para o seu negócio.
                Entre em contato ou submeta sua ideia para começarmos.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" className="px-8">Entre em contato</Button>
                <Button size="lg" variant="outline" className="px-8">Envie sua ideia</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Portfolio;

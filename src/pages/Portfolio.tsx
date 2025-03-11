
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCategory } from '@/types';

// Define a type for portfolio cases
interface PortfolioCase {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  clientName: string;
  completionDate: Date;
  features: string[];
  thumbnailUrl: string;
  testimonial?: {
    content: string;
    author: string;
    rating: number;
  };
  tags: string[];
  projectUrl?: string;
}

// Mock data for the portfolio cases
const mockPortfolioCases: PortfolioCase[] = [
  {
    id: '1',
    title: 'Portal Educacional Interativo',
    description: 'Desenvolvimento de uma plataforma educacional completa com recursos interativos, sistema de avaliação e área do aluno personalizada.',
    category: 'website',
    clientName: 'Instituto Educacional Brasil',
    completionDate: new Date('2023-06-15'),
    features: ['Sistema de matrícula online', 'Biblioteca digital', 'Fórum de discussão', 'Dashboard personalizado'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=Portal+Educacional',
    testimonial: {
      content: 'A plataforma superou todas as nossas expectativas. O sistema é intuitivo e os alunos adoraram a experiência.',
      author: 'Maria Silva, Diretora Pedagógica',
      rating: 5
    },
    tags: ['Educação', 'React', 'Node.js', 'MongoDB']
  },
  {
    id: '2',
    title: 'E-commerce de Produtos Orgânicos',
    description: 'Criação de um e-commerce completo para venda de produtos orgânicos, com sistema de pagamento integrado, gestão de estoque e área administrativa.',
    category: 'e-commerce',
    clientName: 'Natural Life',
    completionDate: new Date('2023-04-22'),
    features: ['Pagamento online', 'Gestão de estoque', 'Área do cliente', 'Filtros avançados de pesquisa'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=E-commerce+Orgânicos',
    testimonial: {
      content: 'Em menos de um mês após o lançamento, nossas vendas online ultrapassaram as vendas da loja física.',
      author: 'João Carlos, Proprietário',
      rating: 5
    },
    tags: ['E-commerce', 'React', 'Stripe', 'PostgreSQL']
  },
  {
    id: '3',
    title: 'Aplicativo de Agendamento de Consultas',
    description: 'Aplicativo mobile para agendamento de consultas médicas com calendário integrado, notificações e histórico de atendimentos.',
    category: 'mobile-app',
    clientName: 'Clínica Saúde Total',
    completionDate: new Date('2023-08-10'),
    features: ['Agendamento online', 'Notificações push', 'Histórico médico', 'Pagamento via app'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=App+Consultas',
    testimonial: {
      content: 'O aplicativo reduziu em 80% as faltas em consultas e melhorou significativamente a experiência dos nossos pacientes.',
      author: 'Dr. Rodrigo Menezes, Diretor Clínico',
      rating: 4
    },
    tags: ['Saúde', 'React Native', 'Firebase', 'iOS/Android']
  },
  {
    id: '4',
    title: 'Sistema de Automação Industrial',
    description: 'Implementação de um sistema de automação para controle de processos industriais, monitoramento em tempo real e geração de relatórios.',
    category: 'automation',
    clientName: 'Indústria Metalúrgica Avanço',
    completionDate: new Date('2023-02-05'),
    features: ['Monitoramento em tempo real', 'Controle de processos', 'Alertas e notificações', 'Relatórios avançados'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=Automação+Industrial',
    tags: ['Indústria 4.0', 'IoT', 'Python', 'Dashboard']
  },
  {
    id: '5',
    title: 'Integração de Sistemas Legados',
    description: 'Projeto de integração entre sistemas legados e novas plataformas cloud, possibilitando a migração gradual sem interrupção dos serviços.',
    category: 'integration',
    clientName: 'Banco Financeiro Nacional',
    completionDate: new Date('2023-07-20'),
    features: ['API Gateway', 'Sincronização em tempo real', 'Migração de dados', 'Sistema de fallback'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=Integração+Sistemas',
    testimonial: {
      content: 'A integração foi perfeita, sem qualquer interrupção nos serviços. Superou nossas expectativas.',
      author: 'Carlos Antunes, CTO',
      rating: 5
    },
    tags: ['Finanças', 'API REST', 'Microserviços', 'AWS']
  },
  {
    id: '6',
    title: 'Chatbot com IA para Atendimento',
    description: 'Desenvolvimento de um chatbot inteligente para atendimento ao cliente, com reconhecimento de linguagem natural e integração com CRM.',
    category: 'ai-solution',
    clientName: 'TechShop Electronics',
    completionDate: new Date('2023-09-12'),
    features: ['NLP avançado', 'Integração com CRM', 'Painel de análise', 'Treinamento contínuo'],
    thumbnailUrl: 'https://placehold.co/600x400/e9ecef/495057?text=Chatbot+IA',
    projectUrl: 'https://example.com/chatbot-demo',
    tags: ['Inteligência Artificial', 'Machine Learning', 'Atendimento', 'NLP']
  }
];

const PortfolioCard = ({ portfolioCase }: { portfolioCase: PortfolioCase }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const categoryLabels: Record<string, string> = {
    'website': 'Website',
    'e-commerce': 'E-commerce',
    'mobile-app': 'App Mobile',
    'desktop-app': 'App Desktop',
    'automation': 'Automação',
    'integration': 'Integração',
    'ai-solution': 'Solução IA',
    'other': 'Outro'
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img 
          src={portfolioCase.thumbnailUrl} 
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
            {categoryLabels[portfolioCase.category] || 'Outro'}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(portfolioCase.completionDate)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">{portfolioCase.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {portfolioCase.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {portfolioCase.testimonial && (
          <div className="mt-4 bg-muted/30 p-3 rounded-md relative">
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < portfolioCase.testimonial!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs italic line-clamp-3">"{portfolioCase.testimonial.content}"</p>
            <p className="text-xs font-medium mt-1">— {portfolioCase.testimonial.author}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full justify-between">
          <span>Ver detalhes</span>
          {portfolioCase.projectUrl && (
            <ExternalLink className="h-4 w-4 ml-2" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Portfolio = () => {
  return (
    <MainLayout className="max-w-6xl mx-auto">
      <div className="space-y-8 pb-10">
        <div className="space-y-2 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossos Cases de Sucesso</h1>
          <p className="text-muted-foreground">
            Conheça alguns dos projetos que desenvolvemos e o impacto que causaram para nossos clientes.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="website">Websites</TabsTrigger>
              <TabsTrigger value="e-commerce">E-commerce</TabsTrigger>
              <TabsTrigger value="mobile-app">Apps</TabsTrigger>
              <TabsTrigger value="automation">Automação</TabsTrigger>
              <TabsTrigger value="integration">Integração</TabsTrigger>
              <TabsTrigger value="ai-solution">IA</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPortfolioCases.map(portfolioCase => (
                <PortfolioCard key={portfolioCase.id} portfolioCase={portfolioCase} />
              ))}
            </div>
          </TabsContent>
          
          {['website', 'e-commerce', 'mobile-app', 'automation', 'integration', 'ai-solution'].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPortfolioCases
                  .filter(c => c.category === category)
                  .map(portfolioCase => (
                    <PortfolioCard key={portfolioCase.id} portfolioCase={portfolioCase} />
                  ))}
              </div>
              {mockPortfolioCases.filter(c => c.category === category).length === 0 && (
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
      </div>
    </MainLayout>
  );
};

export default Portfolio;

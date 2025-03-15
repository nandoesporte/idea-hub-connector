
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Star, Clock, Check, ExternalLink, Calendar } from 'lucide-react';
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
  detailImages?: string[];
  challenge?: string;
  solution?: string;
  results?: string;
  testimonial?: {
    content: string;
    author: string;
    rating: number;
  };
  tags: string[];
  projectUrl?: string;
}

// Mock data for the portfolio cases (same as in Portfolio.tsx for consistency)
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Dashboard',
      'https://placehold.co/800x500/e9ecef/495057?text=Forum',
      'https://placehold.co/800x500/e9ecef/495057?text=Biblioteca'
    ],
    challenge: 'O Instituto Educacional Brasil precisava de uma plataforma digital que integrasse todos os processos educacionais, desde a matrícula até a entrega de conteúdo e avaliações, eliminando processos manuais e melhorando a experiência de alunos e professores.',
    solution: 'Desenvolvemos uma plataforma completa baseada em React com backend em Node.js e MongoDB, implementando um sistema de autenticação seguro, área personalizada para cada perfil de usuário (alunos, professores, administradores), ferramentas de comunicação interna, e um robusto sistema de gestão de conteúdo educacional.',
    results: 'A implementação da plataforma resultou em uma redução de 70% no tempo gasto com processos administrativos, aumento de 35% na satisfação dos alunos conforme pesquisas internas, e melhoria significativa nos indicadores de engajamento e desempenho acadêmico.',
    testimonial: {
      content: 'A plataforma superou todas as nossas expectativas. O sistema é intuitivo e os alunos adoraram a experiência. A equipe de desenvolvimento foi extremamente profissional e atendeu a todas as nossas necessidades com rapidez e eficiência.',
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Produtos',
      'https://placehold.co/800x500/e9ecef/495057?text=Checkout',
      'https://placehold.co/800x500/e9ecef/495057?text=Admin'
    ],
    challenge: 'A Natural Life buscava expandir suas vendas para o ambiente online, mas necessitava de uma solução que refletisse seus valores de sustentabilidade e mantivesse a experiência personalizada que ofereciam na loja física.',
    solution: 'Criamos um e-commerce utilizando React e Node.js com PostgreSQL, implementando um design orgânico e sustentável, sistema de pagamento seguro via Stripe, gestão eficiente de estoque e logística, além de uma área administrativa completa para gerenciamento de produtos e pedidos.',
    results: 'Nas primeiras semanas após o lançamento, as vendas online já representavam 40% do faturamento total da empresa. Após três meses, esse número subiu para 65%, com um aumento de 30% na base de clientes.',
    testimonial: {
      content: 'Em menos de um mês após o lançamento, nossas vendas online ultrapassaram as vendas da loja física. A plataforma é exatamente o que imaginávamos, refletindo perfeitamente a identidade da nossa marca e proporcionando uma experiência excepcional aos nossos clientes.',
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Agendamento',
      'https://placehold.co/800x500/e9ecef/495057?text=Perfil',
      'https://placehold.co/800x500/e9ecef/495057?text=Histórico'
    ],
    challenge: 'A Clínica Saúde Total enfrentava problemas com faltas em consultas, dificuldades no gerenciamento da agenda e insatisfação dos pacientes com o processo manual de agendamento.',
    solution: 'Desenvolvemos um aplicativo mobile usando React Native com backend em Firebase, oferecendo agendamento em tempo real, sistema de lembretes e notificações, histórico médico digital, e integração com meios de pagamento.',
    results: 'O aplicativo reduziu em 80% as faltas em consultas através do sistema de lembretes, aumentou a eficiência do atendimento em 50% e elevou a satisfação dos pacientes, que agora podem agendar e reagendar consultas com apenas alguns toques.',
    testimonial: {
      content: 'O aplicativo reduziu em 80% as faltas em consultas e melhorou significativamente a experiência dos nossos pacientes. Nossa equipe médica também notou uma melhora considerável na organização e eficiência dos atendimentos.',
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Dashboard',
      'https://placehold.co/800x500/e9ecef/495057?text=Monitoramento',
      'https://placehold.co/800x500/e9ecef/495057?text=Relatórios'
    ],
    challenge: 'A Indústria Metalúrgica Avanço operava com processos industriais defasados e pouco eficientes, enfrentando problemas de qualidade, desperdício de recursos e dificuldades no monitoramento da produção.',
    solution: 'Implementamos um sistema de automação industrial integrado, utilizando tecnologias IoT, sensores inteligentes e uma interface web responsiva para monitoramento em tempo real, controle de processos e geração de relatórios analíticos.',
    results: 'A implementação do sistema resultou em um aumento de 25% na eficiência produtiva, redução de 30% no consumo de energia e matéria-prima, e diminuição significativa de falhas no processo industrial.',
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Arquitetura',
      'https://placehold.co/800x500/e9ecef/495057?text=Migração',
      'https://placehold.co/800x500/e9ecef/495057?text=Dashboard'
    ],
    challenge: 'O Banco Financeiro Nacional precisava modernizar sua infraestrutura tecnológica sem interromper os serviços essenciais que atendiam milhões de clientes diariamente, migrando gradualmente de sistemas legados para plataformas cloud.',
    solution: 'Desenvolvemos uma solução de integração utilizando arquitetura de microserviços, API Gateway e sistemas de sincronização em tempo real, permitindo a coexistência e comunicação eficiente entre sistemas legados e novas plataformas.',
    results: 'A integração foi concluída sem qualquer interrupção nos serviços bancários, com migração gradual de 100% dos dados e funcionalidades para a nova plataforma em um período de 8 meses, resultando em uma redução de 60% nos custos de manutenção de TI.',
    testimonial: {
      content: 'A integração foi perfeita, sem qualquer interrupção nos serviços. Superou nossas expectativas e permitiu que realizássemos a transição tecnológica sem impactos para nossos clientes.',
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
    detailImages: [
      'https://placehold.co/800x500/e9ecef/495057?text=Interface',
      'https://placehold.co/800x500/e9ecef/495057?text=Análise',
      'https://placehold.co/800x500/e9ecef/495057?text=Configuração'
    ],
    challenge: 'A TechShop Electronics enfrentava dificuldades no atendimento ao cliente, com longos tempos de espera, respostas inconsistentes e baixa satisfação dos clientes, afetando diretamente as vendas e a reputação da marca.',
    solution: 'Criamos um chatbot inteligente utilizando tecnologias de processamento de linguagem natural (NLP) e machine learning, com capacidade de aprendizado contínuo, integração com o sistema de CRM existente e painel administrativo para análise de desempenho.',
    results: 'O chatbot passou a resolver 70% das solicitações dos clientes sem intervenção humana, reduziu o tempo médio de atendimento em 65% e aumentou a satisfação do cliente em 40%, liberando a equipe de suporte para lidar com casos mais complexos.',
    projectUrl: 'https://example.com/chatbot-demo',
    tags: ['Inteligência Artificial', 'Machine Learning', 'Atendimento', 'NLP']
  }
];

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

const PortfolioDetails = () => {
  const { id } = useParams<{ id: string }>();
  const portfolioCase = mockPortfolioCases.find(item => item.id === id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Function to handle opening the project URL in a new tab
  const handleVisitProject = () => {
    if (portfolioCase?.projectUrl) {
      window.open(portfolioCase.projectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!portfolioCase) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <h1 className="text-2xl font-bold">Projeto não encontrado</h1>
          <p className="text-muted-foreground">O projeto que você está procurando não existe ou foi removido.</p>
          <Link to="/portfolio">
            <Button>Voltar para o portfólio</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout className="max-w-6xl mx-auto">
      <div className="space-y-8 pb-16">
        {/* Navigation */}
        <div className="flex items-center mb-8">
          <Link to="/portfolio" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Voltar para o portfólio</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="outline" className="bg-primary/10">
              {categoryLabels[portfolioCase.category] || 'Outro'}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Concluído em {formatDate(portfolioCase.completionDate)}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{portfolioCase.title}</h1>
          <p className="text-lg text-muted-foreground">{portfolioCase.description}</p>
        </div>

        {/* Main Image */}
        <div className="w-full overflow-hidden rounded-lg">
          <img 
            src={portfolioCase.thumbnailUrl} 
            alt={portfolioCase.title} 
            className="w-full object-cover aspect-video"
          />
        </div>

        {/* Project URL Button (if available) */}
        {portfolioCase.projectUrl && (
          <div className="flex justify-center">
            <Button 
              onClick={handleVisitProject}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Visitar o Projeto
            </Button>
          </div>
        )}

        {/* Client and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Challenge */}
            {portfolioCase.challenge && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">O Desafio</h2>
                <p className="text-gray-700">{portfolioCase.challenge}</p>
              </section>
            )}

            {/* Solution */}
            {portfolioCase.solution && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Nossa Solução</h2>
                <p className="text-gray-700">{portfolioCase.solution}</p>
              </section>
            )}

            {/* Results */}
            {portfolioCase.results && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Resultados</h2>
                <p className="text-gray-700">{portfolioCase.results}</p>
              </section>
            )}

            {/* Detail Images */}
            {portfolioCase.detailImages && portfolioCase.detailImages.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Imagens do Projeto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioCase.detailImages.map((img, index) => (
                    <div key={index} className="overflow-hidden rounded-lg">
                      <img 
                        src={img} 
                        alt={`${portfolioCase.title} screenshot ${index+1}`} 
                        className="w-full aspect-video object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Client Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informações do Cliente</h3>

                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{portfolioCase.clientName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-medium">{categoryLabels[portfolioCase.category]}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                    <p className="font-medium">{formatDate(portfolioCase.completionDate)}</p>
                  </div>

                  {portfolioCase.projectUrl && (
                    <div>
                      <a 
                        href={portfolioCase.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        Ver projeto online
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Recursos Principais</h3>
                <ul className="space-y-2">
                  {portfolioCase.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Tecnologias Utilizadas</h3>
                <div className="flex flex-wrap gap-2">
                  {portfolioCase.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial */}
            {portfolioCase.testimonial && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < portfolioCase.testimonial!.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="italic">"{portfolioCase.testimonial.content}"</p>
                    <p className="font-medium">— {portfolioCase.testimonial.author}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <Separator className="my-8" />

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Você tem um projeto semelhante?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nossa equipe especializada está pronta para transformar sua ideia em realidade. Entre em contato
            hoje mesmo para uma consulta personalizada.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/submit-idea">
              <Button size="lg" className="px-8">Enviar minha ideia</Button>
            </Link>
            <Link to="/#contact">
              <Button size="lg" variant="outline" className="px-8">Fale conosco</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PortfolioDetails;

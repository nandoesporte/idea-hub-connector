
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Settings,
  Database,
  Check,
  Shield,
  LineChart,
  BarChart,
  Layers,
  FileText,
  Lightbulb,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Clock,
  PenLine,
  Car,
  Bike,
  Heart,
  Home,
  Phone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Describe Your Idea Section */}
      <section className="py-12 bg-muted/30">
        <div className="container space-y-6">
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Descreva Sua Ideia</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Conte-nos sobre sua necessidade – seja um aplicativo, site, sistema ou uma solução específica para o setor de seguros – e nós transformaremos sua ideia em um produto digital de alta performance, com desenvolvimento profissional e suporte personalizado.
            </p>
            <div className="pt-4">
              <Link to="/submit-idea">
                <Button size="lg" className="shadow-md">
                  Enviar Minha Ideia
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section id="how-it-works" className="py-12">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como Funciona</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Transformamos sua ideia em realidade em quatro etapas simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <PenLine className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">1</div>
              </div>
              <h3 className="text-lg font-semibold">Envie Sua Ideia</h3>
              <p className="text-sm text-muted-foreground">Preencha nosso formulário detalhado com todos os requisitos do seu projeto, especificando se deseja incluir soluções para produtos de seguros.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:200ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">2</div>
              </div>
              <h3 className="text-lg font-semibold">Receba uma Proposta Personalizada</h3>
              <p className="text-sm text-muted-foreground">Nossa equipe especializada analisa sua ideia e elabora uma proposta customizada, combinando estratégias digitais inovadoras e soluções seguras para o setor de seguros.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:400ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">3</div>
              </div>
              <h3 className="text-lg font-semibold">Acompanhe o Desenvolvimento</h3>
              <p className="text-sm text-muted-foreground">Monitore o progresso do seu projeto em tempo real através da nossa plataforma, com atualizações e relatórios detalhados que garantem total transparência.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:600ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">4</div>
              </div>
              <h3 className="text-lg font-semibold">Receba o Produto Finalizado</h3>
              <p className="text-sm text-muted-foreground">Entregamos sua solução digital pronta para uso, com suporte contínuo para garantir que seu negócio evolua de forma segura e prática.</p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link to="/submit-idea">
              <Button size="lg" className="shadow-md">
                Enviar Minha Ideia Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-12 bg-muted/20">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Por Que Escolher a Idealhub</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Unimos inovação digital com profundo conhecimento do mercado de seguros
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard 
              title="Expertise Comprovada" 
              description="Resultado da fusão entre Kefer Soluções em Tecnologia e Vhm Seguros, unimos inovação digital com profundo conhecimento do mercado." 
              icon={<Shield className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Processo Simplificado" 
              description="Envie sua ideia de forma rápida e intuitiva, sem complicações técnicas." 
              icon={<Lightbulb className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Equipe Especializada" 
              description="Contamos com desenvolvedores experientes e profissionais de diversos segmentos, prontos para entregar soluções personalizadas – inclusive para o setor de seguros." 
              icon={<Users className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Gestão Transparente" 
              description="Acompanhe cada etapa do desenvolvimento com relatórios detalhados e atualizações frequentes, garantindo total visibilidade sobre seu projeto." 
              icon={<Clock className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Soluções Personalizadas" 
              description="Cada projeto é único e desenvolvido de acordo com suas necessidades específicas, seja para apps de bem-estar, e-commerces, sistemas corporativos ou plataformas de seguros." 
              icon={<Settings className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Tecnologia de Ponta" 
              description="Utilizamos as mais modernas tecnologias para entregar produtos digitais com alta qualidade, segurança e performance." 
              icon={<Database className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Suporte Contínuo" 
              description="Oferecemos suporte técnico e manutenção mesmo após a entrega do projeto, assegurando a evolução constante do seu negócio." 
              icon={<MessageSquare className="h-6 w-6" />} 
            />
          </div>
        </div>
      </section>
      
      {/* Insurance Solutions Section */}
      <section className="py-12">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos e Soluções para o Setor de Seguros</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Além de oferecer soluções digitais para diversos segmentos, também disponibilizamos:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Plataformas de Vendas de Seguros</h3>
                <p className="text-muted-foreground">
                  Sistemas completos para a venda online de seguros, com cotações, simulações e gerenciamento de apólices.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Apólices e Sinistros</h3>
                <p className="text-muted-foreground">
                  Soluções que otimizam a administração de seguros, facilitando o acompanhamento de sinistros e o relacionamento com os clientes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Comparadores de Seguros</h3>
                <p className="text-muted-foreground">
                  Ferramentas que auxiliam seus clientes a comparar diferentes opções de seguros, permitindo escolhas seguras e práticas.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* New Insurance Types Grid */}
          <div className="mt-12">
            <h3 className="text-xl md:text-2xl font-semibold text-center mb-6">Tipos de Seguros Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-pink-100 mb-3">
                    <Heart className="h-6 w-6 text-pink-500" />
                  </div>
                  <h4 className="font-medium">Seguro de Vida</h4>
                  <p className="text-xs text-muted-foreground mt-1">Proteção financeira para você e sua família</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-100 mb-3">
                    <Home className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium">Seguro Residencial</h4>
                  <p className="text-xs text-muted-foreground mt-1">Proteção completa para seu lar</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-emerald-100 mb-3">
                    <Car className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h4 className="font-medium">Seguro Veicular</h4>
                  <p className="text-xs text-muted-foreground mt-1">Proteção para seu automóvel</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-100 mb-3">
                    <Phone className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-medium">Seguro de Celular</h4>
                  <p className="text-xs text-muted-foreground mt-1">Proteção para seu dispositivo móvel</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center bg-amber-100 mb-3">
                    <Bike className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="font-medium">Seguro para Bike</h4>
                  <p className="text-xs text-muted-foreground mt-1">Proteção para sua bicicleta</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center mt-8">
              <Link to="/submit-idea">
                <Button className="shadow-md">
                  Solicitar Cotação <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-blue-400/10">
        <div className="container text-center space-y-6">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pronto para Transformar Sua Ideia em Realidade?</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Junte-se a centenas de empreendedores que já impulsionaram seus negócios com a Idealhub. Descubra como nossa plataforma pode elevar sua presença digital e oferecer a segurança e facilidade que os novos tempos exigem – inclusive no setor de seguros.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/submit-idea">
              <Button size="lg" className="w-full sm:w-auto px-6 shadow-md">
                Enviar Minha Ideia
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6">
                Criar Uma Conta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;

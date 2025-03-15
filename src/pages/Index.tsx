
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
  Heart,
  Home,
  Briefcase,
  Hospital,
  Truck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Insurance Options Section */}
      <section id="insurance-options" className="py-12 bg-muted/30">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nossas soluções em seguros</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Proteção completa para você, sua família e seu patrimônio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro de Vida</h3>
                <p className="text-muted-foreground">
                  Proteção financeira para sua família em caso de imprevistos, garantindo tranquilidade para quem você ama.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro Residencial</h3>
                <p className="text-muted-foreground">
                  Proteja seu lar contra incêndios, roubos, danos e outras eventualidades, com coberturas personalizadas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro Empresarial</h3>
                <p className="text-muted-foreground">
                  Soluções completas para proteger seu negócio, funcionários, patrimônio e operações contra diversos riscos.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Hospital className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro Saúde</h3>
                <p className="text-muted-foreground">
                  Planos completos para cuidar da saúde de você e sua família, com ampla rede de atendimento médico.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro Auto</h3>
                <p className="text-muted-foreground">
                  Proteção completa para seu veículo com coberturas contra acidentes, roubo, terceiros e assistência 24h.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
                  <img 
                    src="/lovable-uploads/7e72b76c-70f4-4d0e-a01f-d4559c7530fb.png" 
                    alt="Agro Icon" 
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguro Agrícola</h3>
                <p className="text-muted-foreground">
                  Proteção para produtores rurais contra perdas por eventos climáticos, pragas e outros riscos da atividade.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link to="/submit-idea">
              <Button size="lg" className="shadow-md">
                Solicitar cotação agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How it Works */}
      <section id="how-it-works" className="py-12">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como funciona</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Contrate seu seguro de forma simples e rápida em quatro etapas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">1</div>
              </div>
              <h3 className="text-lg font-semibold">Solicite sua cotação</h3>
              <p className="text-sm text-muted-foreground">Preencha nosso formulário detalhando suas necessidades de proteção e cobertura.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:200ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">2</div>
              </div>
              <h3 className="text-lg font-semibold">Receba uma proposta personalizada</h3>
              <p className="text-sm text-muted-foreground">Nossa equipe especializada elabora uma proposta que atende suas necessidades específicas.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:400ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">3</div>
              </div>
              <h3 className="text-lg font-semibold">Aprovação e contratação digital</h3>
              <p className="text-sm text-muted-foreground">Aprove a proposta e assine digitalmente os documentos necessários com total segurança.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:600ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">4</div>
              </div>
              <h3 className="text-lg font-semibold">Gerencie seu seguro online</h3>
              <p className="text-sm text-muted-foreground">Acompanhe e gerencie seu seguro através de nossa plataforma digital, com suporte 24h.</p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link to="/submit-idea">
              <Button size="lg" className="shadow-md">
                Solicitar cotação agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-12 bg-muted/20">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Por que escolher a Idealhub</h2>
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
              title="Atendimento Personalizado" 
              description="Entendemos que cada cliente tem necessidades únicas. Nossa equipe está pronta para oferecer a proteção ideal para você." 
              icon={<Users className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Contratação 100% Digital" 
              description="Todo o processo de cotação, contratação e gestão da sua apólice pode ser feito online, com segurança e praticidade." 
              icon={<Database className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Suporte 24 horas" 
              description="Conte com nossa central de atendimento 24h para resolver qualquer problema ou dúvida sobre seu seguro." 
              icon={<MessageSquare className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Tecnologia de Ponta" 
              description="Utilizamos as mais modernas tecnologias para garantir segurança, agilidade e transparência em todos os processos." 
              icon={<Settings className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Gestão Transparente" 
              description="Acompanhe todas as informações da sua apólice de forma clara e detalhada através da nossa plataforma digital." 
              icon={<Calendar className="h-6 w-6" />} 
            />
          </div>
        </div>
      </section>
      
      {/* Insurance Solutions Section */}
      <section className="py-12">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Plataformas e Soluções Tecnológicas</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta a serviço da sua proteção e tranquilidade
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
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-blue-400/10">
        <div className="container text-center space-y-6">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pronto para proteger o que é importante para você?</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Descubra como nossos seguros podem oferecer proteção completa com a segurança e facilidade que os novos tempos exigem.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/submit-idea">
              <Button size="lg" className="w-full sm:w-auto px-6 shadow-md">
                Solicitar cotação
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-6">
                Criar uma conta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;

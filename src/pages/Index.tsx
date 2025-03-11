
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
  Check
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout fullWidth>
      {/* Hero Section */}
      <HeroSection />
      
      {/* How it Works */}
      <section id="how-it-works" className="py-12 bg-muted/30">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como funciona</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Transformamos sua ideia em realidade em quatro etapas simples
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
              <h3 className="text-lg font-semibold">Envie sua ideia</h3>
              <p className="text-sm text-muted-foreground">Descreva sua ideia ou necessidade em nosso formulário detalhado.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:200ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">2</div>
              </div>
              <h3 className="text-lg font-semibold">Receba uma proposta</h3>
              <p className="text-sm text-muted-foreground">Nossa equipe analisa sua ideia e envia uma proposta personalizada.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:400ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">3</div>
              </div>
              <h3 className="text-lg font-semibold">Acompanhe o desenvolvimento</h3>
              <p className="text-sm text-muted-foreground">Acompanhe o progresso do seu projeto em tempo real em nossa plataforma.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3 p-4 animate-fade-in [animation-delay:600ms]">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">4</div>
              </div>
              <h3 className="text-lg font-semibold">Receba o produto finalizado</h3>
              <p className="text-sm text-muted-foreground">Obtenha sua solução digital pronta para uso, com suporte contínuo.</p>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <Link to="/submit-idea">
              <Button size="lg" className="shadow-md">
                Enviar minha ideia agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-12">
        <div className="container space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Por que escolher nossa plataforma</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Oferecemos tudo o que você precisa para transformar sua ideia em um produto digital de sucesso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard 
              title="Processo simplificado" 
              description="Envie sua ideia de forma fácil e intuitiva, sem complicações técnicas." 
              icon={<MessageSquare className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Equipe especializada" 
              description="Contamos com desenvolvedores experientes em diversas tecnologias e segmentos." 
              icon={<Users className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Gestão transparente" 
              description="Acompanhe cada etapa do desenvolvimento com relatórios detalhados e atualizações frequentes." 
              icon={<Calendar className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Soluções personalizadas" 
              description="Cada projeto é único e desenvolvido de acordo com suas necessidades específicas." 
              icon={<Settings className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Tecnologia de ponta" 
              description="Utilizamos as mais modernas tecnologias para garantir um produto final de alta qualidade." 
              icon={<Database className="h-6 w-6" />} 
            />
            
            <FeatureCard 
              title="Suporte contínuo" 
              description="Oferecemos suporte técnico e manutenção mesmo após a entrega do projeto." 
              icon={<Check className="h-6 w-6" />} 
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-blue-400/10">
        <div className="container text-center space-y-6">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pronto para transformar sua ideia em realidade?</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Junte-se a centenas de empreendedores que já realizaram seus projetos com nossa plataforma
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/submit-idea">
              <Button size="lg" className="w-full sm:w-auto px-6 shadow-md">
                Enviar minha ideia
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

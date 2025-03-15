
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  popular = false 
}: { 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  buttonText: string; 
  popular?: boolean; 
}) => {
  return (
    <Card className={`w-full ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Mais popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Personalizado' && <span className="text-muted-foreground ml-1">/mês</span>}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={popular ? "default" : "outline"} className="w-full">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para o seu negócio. Todos os planos incluem suporte técnico e atualizações regulares.
          </p>
        </div>

        <Tabs defaultValue="monthly" className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="annual">Anual (20% desconto)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="grid md:grid-cols-3 gap-8">
              <PricingCard
                title="Básico"
                price="R$ 99"
                description="Ideal para pequenas empresas e profissionais autônomos."
                features={[
                  "Até 3 projetos",
                  "Acesso a recursos básicos",
                  "Suporte por email",
                  "Atualizações de segurança",
                  "1 usuário"
                ]}
                buttonText="Começar agora"
              />
              
              <PricingCard
                title="Profissional"
                price="R$ 249"
                description="Perfeito para negócios em crescimento com necessidades mais complexas."
                features={[
                  "Até 10 projetos",
                  "Todos os recursos básicos",
                  "Acesso a recursos avançados",
                  "Suporte prioritário",
                  "5 usuários",
                  "Relatórios avançados"
                ]}
                buttonText="Escolher plano"
                popular={true}
              />
              
              <PricingCard
                title="Empresarial"
                price="Personalizado"
                description="Soluções personalizadas para grandes empresas com necessidades específicas."
                features={[
                  "Projetos ilimitados",
                  "Todos os recursos profissionais",
                  "Recursos personalizados",
                  "Gerente de conta dedicado",
                  "Usuários ilimitados",
                  "API completa",
                  "Suporte 24/7"
                ]}
                buttonText="Fale conosco"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="annual">
            <div className="grid md:grid-cols-3 gap-8">
              <PricingCard
                title="Básico"
                price="R$ 79"
                description="Ideal para pequenas empresas e profissionais autônomos."
                features={[
                  "Até 3 projetos",
                  "Acesso a recursos básicos",
                  "Suporte por email",
                  "Atualizações de segurança",
                  "1 usuário"
                ]}
                buttonText="Começar agora"
              />
              
              <PricingCard
                title="Profissional"
                price="R$ 199"
                description="Perfeito para negócios em crescimento com necessidades mais complexas."
                features={[
                  "Até 10 projetos",
                  "Todos os recursos básicos",
                  "Acesso a recursos avançados",
                  "Suporte prioritário",
                  "5 usuários",
                  "Relatórios avançados"
                ]}
                buttonText="Escolher plano"
                popular={true}
              />
              
              <PricingCard
                title="Empresarial"
                price="Personalizado"
                description="Soluções personalizadas para grandes empresas com necessidades específicas."
                features={[
                  "Projetos ilimitados",
                  "Todos os recursos profissionais",
                  "Recursos personalizados",
                  "Gerente de conta dedicado",
                  "Usuários ilimitados",
                  "API completa",
                  "Suporte 24/7"
                ]}
                buttonText="Fale conosco"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Dúvidas frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-bold mb-2">Posso mudar de plano?</h3>
              <p className="text-muted-foreground">Sim, você pode atualizar ou fazer downgrade do seu plano a qualquer momento.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Como funciona o período de teste?</h3>
              <p className="text-muted-foreground">Oferecemos 14 dias de teste gratuito para todos os planos, sem necessidade de cartão de crédito.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Quais métodos de pagamento são aceitos?</h3>
              <p className="text-muted-foreground">Aceitamos cartões de crédito, boleto bancário e transferência bancária.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Preciso assinar contrato?</h3>
              <p className="text-muted-foreground">Não há contrato de fidelidade. Você pode cancelar sua assinatura a qualquer momento.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;


import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const Pricing = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu projeto. Oferecemos soluções flexíveis para diferentes necessidades e orçamentos.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Plano Básico */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Básico</CardTitle>
              <CardDescription>Para projetos pequenos e simples</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ 4.000</span>
                <span className="text-muted-foreground"> / projeto</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Site com até 5 páginas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Design responsivo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Formulário de contato</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>SEO básico</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Entrega em 30 dias</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Solicitar orçamento</Button>
            </CardFooter>
          </Card>
          
          {/* Plano Profissional */}
          <Card className="flex flex-col relative border-primary">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <CardHeader>
              <CardTitle>Profissional</CardTitle>
              <CardDescription>Para projetos de médio porte</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ 8.000</span>
                <span className="text-muted-foreground"> / projeto</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Site com até 10 páginas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Design personalizado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Blog integrado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>SEO avançado</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Otimização de performance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Entrega em 45 dias</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Solicitar orçamento</Button>
            </CardFooter>
          </Card>
          
          {/* Plano Empresarial */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Empresarial</CardTitle>
              <CardDescription>Para projetos complexos</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">R$ 15.000+</span>
                <span className="text-muted-foreground"> / projeto</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Site com páginas ilimitadas</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>E-commerce completo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Integrações com APIs</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Painel administrativo</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Suporte premium por 6 meses</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Prazo personalizado</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Solicitar orçamento</Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Precisa de uma solução personalizada? Entre em contato para discutir seu projeto.
          </p>
          <Button variant="outline">Contato</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;

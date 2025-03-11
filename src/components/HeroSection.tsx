
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>
      
      <div className="container flex flex-col items-center text-center py-16 md:py-24 space-y-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium bg-muted/50 backdrop-blur-sm animate-fade-in">
          <span className="mr-1 h-2 w-2 rounded-full bg-primary"></span>
          <span>Transforme suas ideias em realidade digital</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up [animation-delay:200ms]">
          Conectando <span className="text-gradient">ideias</span> a <span className="text-gradient">desenvolvedores</span> extraordinários
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-slide-up [animation-delay:400ms]">
          Descreva sua ideia de projeto e nós a transformamos em um produto digital excepcional, 
          com desenvolvimento profissional e suporte personalizado.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-slide-up [animation-delay:600ms]">
          <Link to="/submit-idea">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-md">
              Enviar minha ideia
            </Button>
          </Link>
          <Link to="/#how-it-works">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Como funciona
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full mt-16 animate-fade-in [animation-delay:800ms]">
          <div className="flex flex-col items-center">
            <p className="text-3xl md:text-4xl font-bold text-gradient">100+</p>
            <p className="text-sm text-muted-foreground">Projetos Entregues</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-3xl md:text-4xl font-bold text-gradient">98%</p>
            <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
          </div>
          <div className="flex flex-col items-center col-span-2 md:col-span-1">
            <p className="text-3xl md:text-4xl font-bold text-gradient">4.9/5</p>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, CheckCircle, MessageCircle } from 'lucide-react';
import heroImage from '@/assets/hero-tech.jpg';

const HeroSales = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da IdealHub.', '_blank');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with mesh gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-mesh" />
      
      {/* Animated orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] animate-float"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-20 left-[5%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[80px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      
      <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Trust badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card"
            >
              <div className="flex -space-x-1">
                {[1,2,3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                ))}
              </div>
              <span className="text-sm font-medium">+500 clientes satisfeitos</span>
              <div className="flex items-center gap-0.5 text-yellow-500">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            >
              Transforme Suas{' '}
              <span className="text-gradient-hero">Ideias</span>
              {' '}em{' '}
              <span className="text-gradient-hero">Soluções Digitais</span>
              {' '}que Vendem
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              Desenvolvemos aplicativos, sistemas e soluções digitais personalizadas 
              que impulsionam seu negócio. <strong className="text-foreground">Do conceito ao lançamento em semanas, não meses.</strong>
            </motion.p>
            
            {/* Benefits list */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {[
                'Entrega rápida e profissional',
                'Suporte técnico contínuo',
                'Tecnologia de ponta',
                'Preços competitivos'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/submit-idea">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-base bg-gradient-to-r from-primary to-primary/80 btn-glow rounded-xl group"
                >
                  Solicitar Orçamento Grátis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleWhatsApp}
                className="w-full sm:w-auto px-8 py-6 text-base rounded-xl border-2 hover:bg-accent/10 hover:border-accent group"
              >
                <MessageCircle className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Falar no WhatsApp
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right Content - Hero Image with Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/20">
                <img 
                  src={heroImage} 
                  alt="Transformação Digital e Inovação Tecnológica" 
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              
              {/* Floating stats on image */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-3"
              >
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-hero">100+</p>
                  <p className="text-xs text-muted-foreground">Projetos</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-hero">98%</p>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-hero">5+</p>
                  <p className="text-xs text-muted-foreground">Anos</p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Floating badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -top-4 -right-4 glass-card px-4 py-3 rounded-xl animate-float"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disponível agora</p>
                  <p className="text-sm font-semibold">Consultoria Gratuita</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSales;

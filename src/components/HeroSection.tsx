
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const HeroSection = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // You can fetch testimonials from Supabase when you have created the table
        // const { data } = await supabase.from('testimonials').select('*').limit(3);
        // if (data) setTestimonials(data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };
    
    fetchTestimonials();
  }, []);

  return (
    <section className="relative overflow-hidden py-20">
      {/* Modern Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(105,115,245,0.1),transparent_45%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(25,205,245,0.1),transparent_45%)]"></div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[80px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute -bottom-[10%] -left-[5%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px]" 
        />
      </div>
      
      <div className="container flex flex-col items-center text-center py-16 md:py-24 space-y-12 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center rounded-full border px-5 py-2 text-sm font-medium bg-background/50 backdrop-blur-sm shadow-sm"
        >
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          <span>Transforme suas ideias em realidade digital</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight"
        >
          Conectando <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">ideias</span> a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-primary">desenvolvedores</span> extraordinários
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed"
        >
          Descreva sua ideia de projeto e nós a transformamos em um produto digital excepcional, 
          com desenvolvimento profissional e suporte personalizado.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 w-full justify-center"
        >
          <Link to="/submit-idea">
            <Button size="lg" className="w-full sm:w-auto px-8 bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 rounded-xl">
              Enviar minha ideia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/#how-it-works">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 hover:bg-secondary/80 transition-all duration-300 border-2 rounded-xl">
              Como funciona
            </Button>
          </Link>
        </motion.div>
        
        {/* Modern Stats with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full mt-16"
        >
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm shadow-lg border border-muted/20 hover:border-primary/20 transition-all duration-300"
          >
            <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">100+</p>
            <p className="text-sm text-muted-foreground mt-2">Projetos Entregues</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm shadow-lg border border-muted/20 hover:border-primary/20 transition-all duration-300"
          >
            <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">98%</p>
            <p className="text-sm text-muted-foreground mt-2">Clientes Satisfeitos</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex flex-col items-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm shadow-lg border border-muted/20 hover:border-primary/20 transition-all duration-300 col-span-2 md:col-span-1"
          >
            <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">4.9/5</p>
            <p className="text-sm text-muted-foreground mt-2">Avaliação Média</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

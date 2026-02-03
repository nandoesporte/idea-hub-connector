import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Carlos Eduardo',
    role: 'CEO',
    company: 'TechVentures',
    content: 'A IdealHub transformou completamente nossa operação digital. O sistema desenvolvido aumentou nossa eficiência em 40% e a equipe foi extremamente profissional durante todo o processo.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ana Paula Martins',
    role: 'Diretora Comercial',
    company: 'Seguros Prime',
    content: 'Excelente parceria! Desenvolveram uma plataforma de gestão de apólices que revolucionou nosso atendimento ao cliente. Recomendo fortemente.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Roberto Santos',
    role: 'Fundador',
    company: 'StartupX',
    content: 'Do conceito ao lançamento em apenas 6 semanas. A qualidade do código e a atenção aos detalhes superaram todas as expectativas. Time muito competente!',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-gradient-mesh relative overflow-hidden">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            O Que Nossos <span className="text-gradient-hero">Clientes</span> Dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Confiança construída através de resultados reais e parcerias duradouras
          </p>
        </motion.div>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full glass-card card-hover border-0 group">
                <CardContent className="p-6 space-y-4">
                  {/* Quote icon */}
                  <Quote className="w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
                  
                  {/* Rating */}
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Trust indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">4.9/5</p>
            <p className="text-sm">Avaliação média</p>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">+500</p>
            <p className="text-sm">Clientes atendidos</p>
          </div>
          <div className="w-px h-12 bg-border hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">98%</p>
            <p className="text-sm">Taxa de retenção</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

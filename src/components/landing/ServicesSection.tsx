import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Monitor, 
  Shield, 
  Lightbulb, 
  Code, 
  Cloud,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const services: Service[] = [
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Aplicativos Mobile',
    description: 'Apps nativos e híbridos para iOS e Android com design moderno e alta performance.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'Sistemas Web',
    description: 'Plataformas web escaláveis, painéis administrativos e e-commerces completos.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Soluções em Seguros',
    description: 'Sistemas especializados para corretoras, gestão de apólices e automação.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: 'APIs & Integrações',
    description: 'Desenvolvimento de APIs robustas e integrações com sistemas existentes.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <Cloud className="w-8 h-8" />,
    title: 'Cloud & DevOps',
    description: 'Infraestrutura na nuvem, CI/CD e monitoramento para alta disponibilidade.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Consultoria Tech',
    description: 'Análise de requisitos, arquitetura de software e planejamento estratégico.',
    color: 'from-yellow-500 to-orange-500',
  },
];

const ServicesSection = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-muted/30">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Nossos Serviços
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Soluções <span className="text-gradient-hero">Completas</span> para Seu Negócio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do conceito à entrega, oferecemos tudo que você precisa para sua transformação digital
          </p>
        </motion.div>
        
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full group border-0 glass-card card-hover">
                <CardContent className="p-6 space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Link */}
                  <Link 
                    to="/submit-idea"
                    className="inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Saiba mais
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link to="/submit-idea">
            <Button size="lg" className="btn-glow rounded-xl group">
              Solicitar Orçamento
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;

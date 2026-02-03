import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Smartphone, Monitor, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image?: string;
  technologies: string[];
  icon: React.ReactNode;
  color: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Plataforma de Gestão de Seguros',
    category: 'Sistema Web',
    description: 'Sistema completo para gestão de apólices, sinistros e relacionamento com clientes para corretoras de seguros.',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    icon: <Shield className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'App de Delivery Personalizado',
    category: 'Aplicativo Mobile',
    description: 'Aplicativo completo de delivery com rastreamento em tempo real, pagamentos integrados e painel administrativo.',
    technologies: ['React Native', 'Firebase', 'Stripe'],
    icon: <Smartphone className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'E-commerce B2B',
    category: 'Plataforma Web',
    description: 'Plataforma de vendas B2B com catálogo personalizado, gestão de pedidos e integração com ERP.',
    technologies: ['Next.js', 'Supabase', 'Tailwind'],
    icon: <Monitor className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
  },
];

const PortfolioShowcase = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Portfólio
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Projetos que <span className="text-gradient-hero">Entregamos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Conheça alguns dos projetos que desenvolvemos para nossos clientes
            </p>
          </div>
          <Link to="/portfolio">
            <Button variant="outline" className="group">
              Ver todos os projetos
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
        
        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full group overflow-hidden border-0 glass-card card-hover">
                {/* Project Image/Icon */}
                <div className={`aspect-video bg-gradient-to-br ${project.color} flex items-center justify-center text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  {project.icon}
                  <div className="absolute top-4 right-4">
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  {/* Category */}
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.technologies.map((tech) => (
                      <span 
                        key={tech}
                        className="px-2 py-1 rounded-md bg-muted text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioShowcase;

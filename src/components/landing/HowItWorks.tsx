import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileSearch, Rocket, HeartHandshake } from 'lucide-react';

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Conte sua Ideia',
    description: 'Preencha nosso formulário ou fale conosco pelo WhatsApp. Conte sobre seu projeto e objetivos.',
  },
  {
    number: '02',
    icon: <FileSearch className="w-6 h-6" />,
    title: 'Análise e Proposta',
    description: 'Nossa equipe analisa sua demanda e elabora uma proposta personalizada com cronograma e investimento.',
  },
  {
    number: '03',
    icon: <Rocket className="w-6 h-6" />,
    title: 'Desenvolvimento Ágil',
    description: 'Desenvolvemos seu projeto com metodologia ágil, mantendo você atualizado a cada etapa.',
  },
  {
    number: '04',
    icon: <HeartHandshake className="w-6 h-6" />,
    title: 'Entrega e Suporte',
    description: 'Entregamos seu projeto funcionando e oferecemos suporte contínuo para garantir seu sucesso.',
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding relative overflow-hidden">
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
            Processo Simples
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Como <span className="text-gradient-hero">Funciona</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do primeiro contato à entrega em 4 passos simples
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-center space-y-4">
                  {/* Step number & icon */}
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg glow-primary">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                      {step.number}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

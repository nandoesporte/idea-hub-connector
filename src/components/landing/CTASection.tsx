import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5544988057213?text=Olá! Gostaria de agendar uma consultoria gratuita.', '_blank');
  };

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent -z-10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      {/* Floating elements */}
      <motion.div 
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-white/10 blur-xl"
      />
      <motion.div 
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-white/10 blur-xl"
      />
      
      <div className="container max-w-5xl mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white space-y-8"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Agende uma consultoria gratuita e descubra como podemos ajudar 
            a impulsionar seu negócio com soluções digitais sob medida.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/submit-idea">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto px-8 py-6 text-base bg-white text-primary hover:bg-white/90 rounded-xl group shadow-xl"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Agendar Consultoria Gratuita
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto px-8 py-6 text-base border-2 border-white/30 text-white hover:bg-white/10 rounded-xl group"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Falar no WhatsApp
            </Button>
          </div>
          
          {/* Contact options */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 pt-8 text-white/70"
          >
            <a 
              href="tel:+5511999999999" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>(11) 99999-9999</span>
            </a>
            <a 
              href="mailto:contato@idealhub.com.br" 
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>contato@idealhub.com.br</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

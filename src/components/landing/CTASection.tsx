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
      {/* Background - Brand gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent -z-10" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] -z-10" />
      
      {/* Floating decorative elements */}
      <motion.div 
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] w-32 h-32 rounded-full bg-white/10 blur-3xl"
      />
      <motion.div 
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[15%] w-40 h-40 rounded-full bg-white/5 blur-3xl"
      />
      
      <div className="container max-w-5xl mx-auto relative">
        {/* Glass card background for better readability */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8 bg-black/20 backdrop-blur-md rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10 shadow-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium text-white">Consultoria Gratuita</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Agende uma consultoria gratuita e descubra como podemos ajudar 
            a impulsionar seu negócio com soluções digitais sob medida.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/submit-idea">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-base bg-white hover:bg-white/90 text-primary font-semibold rounded-xl group shadow-xl shadow-black/20"
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
              className="w-full sm:w-auto px-8 py-6 text-base border-2 border-white/40 text-white hover:bg-green-500/20 hover:border-green-400 rounded-xl group"
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
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            <a 
              href="tel:+5544988057213" 
              className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <span>(44) 98805-7213</span>
            </a>
            <a 
              href="mailto:contato@idealhub.com.br" 
              className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <span>contato@idealhub.com.br</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

import React from 'react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Instagram, Facebook } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const MainLayout = ({ children, className, fullWidth = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col antialiased overflow-x-hidden bg-background">
      <Navbar />
      <main className={cn(
        "flex-1 flex flex-col",
        !fullWidth && "container py-3 md:py-4",
        className
      )}>
        {children}
      </main>
      
      {/* Modern Footer */}
      <footer className="bg-foreground text-background">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="text-2xl font-bold">
                Ideal<span className="text-accent">Hub</span>
              </Link>
              <p className="text-background/70 text-sm leading-relaxed">
                Transformamos ideias em soluções digitais de alta performance. 
                Inovação tecnológica aliada à expertise em negócios.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
                <li><Link to="/portfolio" className="hover:text-accent transition-colors">Portfólio</Link></li>
                <li><Link to="/submit-idea" className="hover:text-accent transition-colors">Solicitar Orçamento</Link></li>
                <li><Link to="/contact" className="hover:text-accent transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            {/* Services */}
            <div className="space-y-4">
              <h4 className="font-semibold">Serviços</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><span className="hover:text-accent transition-colors cursor-pointer">Aplicativos Mobile</span></li>
                <li><span className="hover:text-accent transition-colors cursor-pointer">Sistemas Web</span></li>
                <li><span className="hover:text-accent transition-colors cursor-pointer">Soluções em Seguros</span></li>
                <li><span className="hover:text-accent transition-colors cursor-pointer">Consultoria Tech</span></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contato</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <span>contato@idealhub.com.br</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent mt-0.5" />
                  <span>São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-background/10">
          <div className="container py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-background/50">
            <p>© {new Date().getFullYear()} IdealHub Connector. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-4">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacidade</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Termos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

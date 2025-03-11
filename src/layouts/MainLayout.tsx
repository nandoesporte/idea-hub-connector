
import React from 'react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

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
      <footer className="py-3 md:py-4 border-t backdrop-blur-sm bg-background/80">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-1 md:gap-2">
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} IdeaHub Connector. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-2 md:space-x-3">
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termos de Serviço
            </a>
            <a href="#" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';
import UserProfile from './UserProfile';
import { motion } from 'framer-motion';
import logoIcon from '@/assets/logo-icon.png';

const navigationItems: NavigationItem[] = [
  { title: 'Início', path: '/' },
  { title: 'Serviços', path: '/#services' },
  { title: 'Portfólio', path: '/portfolio' },
  { title: 'Como Funciona', path: '/#how-it-works' },
  { title: 'Contato', path: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border/50' 
          : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center space-x-2 group">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <img 
              src={logoIcon} 
              alt="IdealHub Logo" 
              className="h-8 w-8 md:h-9 md:w-9 object-contain"
            />
            <span className="text-xl font-bold tracking-tight">
              Ideal<span className="text-gradient-hero">Hub</span>
            </span>
          </motion.div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <ul className="flex items-center space-x-1">
            {navigationItems.map((item, index) => (
              <motion.li 
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
                    location.pathname === item.path 
                      ? 'text-primary bg-primary/5' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              </motion.li>
            ))}
          </ul>
          <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-border">
            {user ? (
              <UserProfile />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link to="/submit-idea">
                  <Button size="sm" className="btn-glow rounded-lg">
                    Começar Agora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col space-y-1.5 w-6">
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 transform origin-center ${
                mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
              }`}
            />
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 transform origin-center ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <motion.div 
          initial={false}
          animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
        >
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                      ? 'text-primary bg-primary/10' 
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {user ? (
                <div className="py-2">
                  <UserProfile />
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full justify-center">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/submit-idea">
                    <Button className="w-full btn-glow">
                      Começar Agora
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;

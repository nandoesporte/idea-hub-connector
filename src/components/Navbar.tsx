import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationItem } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/contexts/UserContext';
import UserProfile from './UserProfile';

const navigationItems: NavigationItem[] = [
  { title: 'Início', path: '/' },
  { title: 'Como Funciona', path: '/#how-it-works' },
  { title: 'Projetos', path: '/projects' },
  { title: 'Portfolio', path: '/portfolio' },
  { title: 'Preços', path: '/#pricing' },
  { title: 'Contato', path: '/#contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-background/70 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between h-14 md:h-16">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold tracking-tight text-foreground animate-fade-in">
            Ideal<span className="text-gradient">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4">
          <ul className="flex items-center space-x-4">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`text-sm font-medium transition-all duration-300 hover:text-primary relative after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-0 after:left-0 after:scale-x-0 after:origin-right after:transition-transform hover:after:scale-x-100 hover:after:origin-left ${
                    location.pathname === item.path ? 'text-primary after:scale-x-100' : 'text-muted-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-3">
            {user ? (
              <UserProfile />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/5 transition-colors duration-300">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">Criar Conta</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col space-y-1 w-5">
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 transform ${
                mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            ></span>
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            ></span>
            <span 
              className={`block h-0.5 bg-foreground transition-all duration-300 transform ${
                mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            ></span>
          </div>
        </button>
      </div>

      {isMobile && (
        <div 
          className={`md:hidden absolute w-full backdrop-blur-md bg-background/90 border-b shadow-sm transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          } overflow-hidden`}
        >
          <div className="container py-3 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === item.path ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              {user ? (
                <div className="py-1">
                  <UserProfile />
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="w-full justify-start">Entrar</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="w-full">Criar Conta</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

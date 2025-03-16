
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare, FileText, 
  Settings, Plus, Folder, Grid3x3, ChevronDown, Home, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Projetos',
    href: '/admin/projects',
    icon: Briefcase,
  },
  {
    title: 'Mensagens',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Portfolio',
    href: '/admin/portfolio',
    icon: FileText,
  },
  {
    title: 'Categorias',
    href: '/admin/categories',
    icon: Folder,
  },
  {
    title: 'Interface Dashboard',
    href: '/admin/dashboard',
    icon: Grid3x3,
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
];

const AdminLayout = ({ 
  children, 
  title, 
  description, 
  actionLabel = "Novo item",
  onAction 
}: AdminLayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  // Separate items into primary and secondary navigation
  const primaryNav = navItems.slice(0, 4);  // First 4 items for main nav
  const secondaryNav = navItems.slice(4);   // Rest for dropdown

  return (
    <div className="min-h-screen flex flex-col antialiased bg-background">
      <Navbar />
      
      {/* Admin Top Navigation */}
      <div className="border-b bg-card sticky top-14 z-30">
        <div className="container flex items-center h-14 px-4">
          <div className="flex items-center gap-2 mr-2 md:mr-6">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden mr-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[280px] pt-16">
                  <div className="flex flex-col gap-2 mt-2">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md",
                          pathname === item.href 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <Link to="/admin" className="font-medium flex items-center whitespace-nowrap">
              <Home className="h-5 w-5 text-primary hidden xs:block mr-2" />
              <span>Admin</span>
            </Link>
          </div>
          
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {primaryNav.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link 
                    to={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === item.href && "bg-accent text-accent-foreground",
                      "gap-1.5"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </NavigationMenuItem>
              ))}
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-1.5">
                  <Folder className="h-4 w-4" />
                  <span>Mais</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-1 p-2">
                    {secondaryNav.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link 
                            to={item.href}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
                              pathname === item.href && "bg-accent text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="ml-auto flex items-center gap-2">
            {onAction && (
              <Button onClick={onAction} size="sm" className="gap-1.5 hidden sm:flex">
                <Plus className="h-4 w-4" />
                {actionLabel}
              </Button>
            )}
            
            {/* Mobile only action button */}
            {onAction && isMobile && (
              <Button onClick={onAction} size="icon" className="sm:hidden" variant="ghost">
                <Plus className="h-5 w-5" />
              </Button>
            )}
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || 'Avatar'} />
              <AvatarFallback>{(user?.user_metadata?.name || 'A').charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu - Bottom Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t flex items-center justify-around px-4">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link to={item.href} key={item.href} className="flex flex-col items-center">
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span className={cn(
                  "text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
      
      {/* Page Header and Content */}
      <main className={cn(
        "flex-1 overflow-y-auto bg-background",
        isMobile && "pb-16" // Add padding at bottom for mobile to prevent content being hidden behind footer
      )}>
        <div className="container py-4 px-4 md:py-6">
          {/* Page header with title and action button */}
          {(title || onAction) && (
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div>
                {title && <h1 className="text-xl md:text-2xl font-bold">{title}</h1>}
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              
              {/* Mobile floating action button */}
              {onAction && isMobile && (
                <Button 
                  onClick={onAction} 
                  size="icon" 
                  className="fixed right-4 bottom-20 z-50 h-12 w-12 rounded-full shadow-lg sm:hidden"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

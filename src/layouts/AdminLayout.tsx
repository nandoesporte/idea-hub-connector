
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare, FileText, 
  Settings, ChevronLeft, ChevronRight, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser } from '@/contexts/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  // Start with collapsed sidebar by default
  const [collapsed, setCollapsed] = useState(true);
  // Start with hidden sidebar - can be toggled to show
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const isMobile = useIsMobile();

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const toggleSidebar = () => {
    setSidebarHidden(!sidebarHidden);
  };

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href;
    const linkContent = (
      <>
        <item.icon className={cn("h-4 w-4 shrink-0")} />
        {!collapsed && <span>{item.title}</span>}
      </>
    );

    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {linkContent}
        </a>
      );
    }

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        {linkContent}
      </Link>
    );
  };

  // Mobile Footer Navigation
  const MobileFooterNav = () => (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t flex items-center justify-around px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        const FooterLink = ({ children }: { children: React.ReactNode }) => {
          if (item.external) {
            return (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                {children}
              </a>
            );
          }
          return (
            <Link to={item.href} className="flex flex-col items-center">
              {children}
            </Link>
          );
        };
        
        return (
          <FooterLink key={item.href}>
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
          </FooterLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 ml-2" 
          onClick={toggleSidebar}
        >
          {sidebarHidden ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </Navbar>
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && !sidebarHidden && (
          <aside 
            className={cn(
              "bg-card border-r shrink-0 overflow-y-auto flex flex-col transition-all duration-300 h-[calc(100vh-4rem)]",
              collapsed ? "w-[60px]" : "w-[220px]"
            )}
          >
            <div className="flex-1 py-4">
              <div className="px-2 mb-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
              </div>
              <nav className="grid gap-1 px-2">
                {navItems.map((item) => (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {renderNavLink(item)}
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </nav>
            </div>
          </aside>
        )}
        
        {/* Main content */}
        <main className={cn(
          "flex-1 overflow-y-auto bg-background",
          isMobile ? "h-[calc(100vh-4rem-4rem)]" : "h-[calc(100vh-4rem)]",
          isMobile && "pb-16" // Add padding at bottom for mobile to prevent content being hidden behind footer
        )}>
          <div className="container py-4 px-4 lg:px-6">
            {/* Page header with title and action button */}
            {(title || onAction) && (
              <div className="flex justify-between items-center mb-4">
                <div>
                  {title && <h1 className="text-2xl font-bold">{title}</h1>}
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
                {onAction && (
                  <Button onClick={onAction} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {actionLabel}
                  </Button>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Footer Navigation */}
      {isMobile && <MobileFooterNav />}
    </div>
  );
};

export default AdminLayout;

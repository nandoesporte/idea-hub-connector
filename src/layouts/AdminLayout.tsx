
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
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground", 
                            collapsed && "justify-center px-2"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0")} />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background h-[calc(100vh-4rem)]">
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
    </div>
  );
};

export default AdminLayout;

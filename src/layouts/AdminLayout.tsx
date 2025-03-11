
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare, FileText, 
  Settings, ChevronLeft, ChevronRight, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdminLayoutProps {
  children: React.ReactNode;
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

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-card border-r shrink-0 overflow-y-auto flex flex-col transition-all duration-300",
            collapsed ? "w-[70px]" : "w-[240px]"
          )}
        >
          <div className="flex-1 py-6">
            <div className="px-3 mb-6 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
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
                          <item.icon className={cn("h-5 w-5 shrink-0")} />
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
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

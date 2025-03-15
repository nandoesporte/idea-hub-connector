
import { DashboardComponent, DashboardConfig, DashboardItem } from '@/types/dashboard';

// Configuração real do dashboard
const defaultDashboardConfig: DashboardConfig = {
  components: [
    {
      id: 'quick-actions',
      title: 'Ações Rápidas',
      description: 'O que você precisa hoje?',
      type: 'action',
      enabled: true,
      order: 1,
      size: 'medium',
      layout: 'list',
      items: [
        {
          id: 'new-quote',
          title: 'Novo Projeto',
          icon: 'PlusCircle',
          link: '/project-ideas/new',
          color: 'primary',
          enabled: true
        },
        {
          id: 'view-quotes',
          title: 'Meus Projetos',
          icon: 'LayoutGrid',
          link: '/projects',
          color: 'secondary',
          enabled: true
        },
        {
          id: 'settings',
          title: 'Configurações',
          icon: 'Settings',
          link: '/dashboard/settings',
          color: 'muted',
          enabled: true
        },
        {
          id: 'help',
          title: 'Ajuda',
          icon: 'HelpCircle',
          link: '/contact',
          color: 'muted',
          enabled: true
        }
      ]
    },
    {
      id: 'recent-projects',
      title: 'Projetos Recentes',
      description: 'Seus projetos em andamento',
      type: 'project',
      enabled: true,
      order: 2,
      size: 'large',
      layout: 'grid'
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Salvar a configuração no localStorage para persistência
const saveConfig = (config: DashboardConfig) => {
  localStorage.setItem('dashboard_config', JSON.stringify(config));
  return config;
};

// Obter a configuração do localStorage ou usar o padrão
export const getDashboardConfig = (): DashboardConfig => {
  const savedConfig = localStorage.getItem('dashboard_config');
  return savedConfig ? JSON.parse(savedConfig) : defaultDashboardConfig;
};

// Atualizar toda a configuração
export const updateDashboardConfig = (config: DashboardConfig): DashboardConfig => {
  return saveConfig({
    ...config,
    lastUpdated: new Date().toISOString()
  });
};

// Atualizar um componente específico
export const updateDashboardComponent = (componentId: string, updates: Partial<DashboardComponent>): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedComponents = config.components.map(component => 
    component.id === componentId ? { ...component, ...updates } : component
  );
  
  return saveConfig({
    ...config,
    components: updatedComponents,
    lastUpdated: new Date().toISOString()
  });
};

// Adicionar um novo componente
export const addDashboardComponent = (component: DashboardComponent): DashboardConfig => {
  const config = getDashboardConfig();
  return saveConfig({
    ...config,
    components: [...config.components, component],
    lastUpdated: new Date().toISOString()
  });
};

// Remover um componente
export const removeDashboardComponent = (componentId: string): DashboardConfig => {
  const config = getDashboardConfig();
  return saveConfig({
    ...config,
    components: config.components.filter(component => component.id !== componentId),
    lastUpdated: new Date().toISOString()
  });
};

// Atualizar um item específico dentro de um componente
export const updateDashboardItem = (
  componentId: string, 
  itemId: string, 
  updates: Partial<DashboardItem>
): DashboardConfig => {
  const config = getDashboardConfig();
  const updatedComponents = config.components.map(component => {
    if (component.id !== componentId || !component.items) return component;
    
    const updatedItems = component.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    
    return { ...component, items: updatedItems };
  });
  
  return saveConfig({
    ...config,
    components: updatedComponents,
    lastUpdated: new Date().toISOString()
  });
};

// Resetar a configuração para o padrão
export const resetDashboardConfig = (): DashboardConfig => {
  return saveConfig(defaultDashboardConfig);
};

import { DashboardComponent, DashboardConfig, DashboardItem } from '@/types/dashboard';

// Mock data - em uma aplicação real, isso viria do Supabase
const defaultDashboardConfig: DashboardConfig = {
  components: [
    {
      id: 'tech-solutions',
      title: 'Soluções Tecnológicas',
      description: 'Transforme suas ideias em soluções digitais',
      type: 'tech',
      enabled: true,
      order: 1,
      size: 'large',
      layout: 'grid',
      items: [
        {
          id: 'web-dev',
          title: 'Desenvolvimento Web',
          description: 'Sites, aplicações e portais personalizados',
          icon: 'Cpu',
          link: '/submit-idea',
          color: 'blue',
          enabled: true
        },
        {
          id: 'mobile-apps',
          title: 'Apps Móveis',
          description: 'Aplicativos para iOS e Android',
          icon: 'Code',
          link: '/submit-idea',
          color: 'purple',
          enabled: true
        },
        {
          id: 'management-systems',
          title: 'Sistemas de Gestão',
          description: 'ERPs e sistemas administrativos',
          icon: 'Database',
          link: '/submit-idea',
          color: 'green',
          enabled: true
        },
        {
          id: 'ai-solutions',
          title: 'Soluções com IA',
          description: 'Inteligência artificial para seu negócio',
          icon: 'BrainCircuit',
          link: '/submit-idea',
          color: 'amber',
          enabled: true
        }
      ]
    },
    {
      id: 'insurance-options',
      title: 'Seguros Disponíveis',
      description: 'Escolha o tipo de seguro que deseja cotar',
      type: 'insurance',
      enabled: true,
      order: 2,
      size: 'medium',
      layout: 'grid',
      items: [
        {
          id: 'life-insurance',
          title: 'Seguro de Vida',
          description: 'Proteção financeira para você e sua família',
          icon: 'Heart',
          link: '/submit-idea',
          color: 'pink',
          enabled: true
        },
        {
          id: 'home-insurance',
          title: 'Seguro Residencial',
          description: 'Proteção completa para seu lar',
          icon: 'Home',
          link: '/submit-idea',
          color: 'blue',
          enabled: true
        },
        {
          id: 'business-insurance',
          title: 'Seguro Empresarial',
          description: 'Soluções para proteger seu negócio',
          icon: 'Briefcase',
          link: '/submit-idea',
          color: 'purple',
          enabled: true
        },
        {
          id: 'health-insurance',
          title: 'Seguro Saúde',
          description: 'Cuidados médicos para você e sua família',
          icon: 'Hospital',
          link: '/submit-idea',
          color: 'green',
          enabled: true
        }
      ]
    },
    {
      id: 'quick-actions',
      title: 'Ações Rápidas',
      description: 'O que você precisa hoje?',
      type: 'action',
      enabled: true,
      order: 3,
      size: 'full',
      layout: 'list',
      items: [
        {
          id: 'new-quote',
          title: 'Solicitar Nova Cotação',
          icon: 'Shield',
          link: '/submit-idea',
          color: 'primary',
          enabled: true
        },
        {
          id: 'view-quotes',
          title: 'Ver Minhas Cotações',
          icon: 'Clock',
          link: '/projects',
          color: 'secondary',
          enabled: true
        },
        {
          id: 'phone',
          title: 'Contato Telefônico',
          icon: 'Phone',
          link: 'tel:+5511999999999',
          color: 'muted',
          enabled: true
        },
        {
          id: 'email',
          title: 'Enviar E-mail',
          icon: 'Mail',
          link: 'mailto:contato@idealhub.com.br',
          color: 'muted',
          enabled: true
        }
      ]
    },
    {
      id: 'recent-quotes',
      title: 'Cotações Recentes',
      description: 'Acompanhe o status das suas solicitações',
      type: 'quote',
      enabled: true,
      order: 4,
      size: 'full',
      layout: 'card'
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


export interface DashboardComponent {
  id: string;
  title: string;
  description?: string;
  type: 'insurance' | 'tech' | 'action' | 'quote';
  enabled: boolean;
  order: number;
  icon?: string;
  items?: DashboardItem[];
  size?: 'small' | 'medium' | 'large' | 'full';
  layout?: 'grid' | 'list' | 'card';
}

export interface DashboardItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  link: string;
  color?: string;
  enabled: boolean;
}

export interface DashboardConfig {
  components: DashboardComponent[];
  lastUpdated: string;
}


export type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
};

// Atualizando o tipo ProjectIdea para resolver os erros
export type ProjectIdea = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in progress' | 'completed' | 'on hold' | 'pending' | 'under-review' | 'approved' | 'in-progress' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at?: string;
  budget?: string;
  timeline?: string;
  urgency?: string;
  features?: string[];
  clientName?: string;
  userId?: string;
  statusUpdates?: any[];
  attachments?: any[];
};

export type ProjectCategory = 'website' | 'e-commerce' | 'mobile-app' | 'desktop-app' | 'automation' | 'integration' | 'ai-solution' | 'web-app' | 'other';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export type CategoryItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  link: string;
  type: 'tech' | 'insurance';
  order: number;
};

export type Policy = {
  id: string;
  userId: string;
  policyNumber: string;
  customerName: string;
  customerPhone?: string;
  issueDate: Date;
  expiryDate: Date;
  insurer: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'expired' | 'cancelled';
  type: 'auto' | 'life' | 'health' | 'home' | 'business' | 'other';
  attachmentUrl?: string;
  notes?: string;
  reminderSent: boolean;
  reminderDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardItem = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  link: string;
  enabled: boolean;
};

export type DashboardComponent = {
  id: string;
  title: string;
  description: string;
  type: 'tech' | 'insurance' | 'action' | 'quote';
  size?: 'small' | 'medium' | 'large' | 'full';
  order: number;
  enabled: boolean;
  items?: DashboardItem[];
};

export type VoiceCommandEvent = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  contactName?: string;
  contactPhone?: string;
  type: 'appointment' | 'reminder' | 'task' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NavigationItem = {
  id: string;
  title: string;
  href: string;
  icon?: string;
  external?: boolean;
  submenu?: NavigationItem[];
  roles?: ('admin' | 'user')[];
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  completed: Date;
  technologies: string[];
  featured: boolean;
  featuredImage?: string;
  images: string[];
  link?: string;
};

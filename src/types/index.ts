
export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  link: string;
  type?: 'tech';
}

export type ProjectCategory = 
  | 'website' 
  | 'e-commerce' 
  | 'mobile-app' 
  | 'desktop-app' 
  | 'automation' 
  | 'integration' 
  | 'ai-solution' 
  | 'web-app' 
  | 'other';

export interface VoiceCommandEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  duration?: number;
  type: string;
  contactPhone?: string;
  createdAt: Date;
  reminderScheduledFor?: Date;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  budget?: string;
  timeline?: string;
  features?: string[];
  userId: string;
  clientName?: string;
  status: 'pending' | 'under-review' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  urgency: 'baixa' | 'normal' | 'alta';
  statusUpdates?: Array<{
    date: Date;
    status: 'pending' | 'under-review' | 'approved' | 'in-progress' | 'completed' | 'rejected';
    message: string;
  }>;
  attachments?: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  featuredImage?: string;
  images?: string[];
  link?: string;
  client?: string;
  completed: Date;
  challenge?: string;
  solution?: string;
  results?: string;
  featured?: boolean;
  testimonial?: {
    text: string;
    author: string;
    position?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  link?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}


export type ProjectCategory = 
  | 'automation'
  | 'website'
  | 'e-commerce'
  | 'mobile-app'
  | 'desktop-app'
  | 'integration'
  | 'ai-solution'
  | 'other';

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  budget?: string;
  timeline?: string;
  features?: string[];
  userId: string;
  status: 'pending' | 'under-review' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  urgency?: 'baixa' | 'normal' | 'alta';
  attachments?: string[];
  statusUpdates?: Array<{
    date: Date;
    status: 'pending' | 'under-review' | 'approved' | 'in-progress' | 'completed' | 'rejected';
    message: string;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: Date;
}

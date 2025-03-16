
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
  clientName?: string; // Added clientName property as optional
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

export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  type: 'tech' | 'insurance';
  iconColor: string;
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

export interface PortfolioItem {
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
}

export interface VoiceCommandEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  duration?: number;
  type: 'meeting' | 'deadline' | 'task' | 'other';
  contactPhone?: string;
  createdAt: Date;
}

export interface PolicyData {
  id?: string;
  user_id?: string;
  policy_number: string;
  policy_type: string;
  expiry_date: string;
  premium_amount: number;
  status: 'active' | 'expired' | 'pending';
  details?: any;
  created_at?: string;
  updated_at?: string;
  
  // Adding the missing properties used in PolicyTab
  policyNumber?: string;
  customer?: string;
  insurer?: string;
  startDate?: Date;
  endDate?: Date;
  premiumValue?: string;
  documentUrl?: string;
}
